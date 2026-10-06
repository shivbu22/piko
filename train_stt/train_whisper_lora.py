"""
Nook — LoRA / QLoRA Fine-Tuning Pipeline for OpenAI Whisper STT
Fine-tunes Whisper on custom meeting audio, technical jargon, and domain transcripts.
Memory-efficient: trains on consumer GPUs (RTX 3060/4060) or CPU with <5GB VRAM.
"""

import os
import argparse
from dataclasses import dataclass
from typing import Any, Dict, List, Union
import torch
import evaluate
from transformers import (
    WhisperForConditionalGeneration,
    WhisperProcessor,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
)
from peft import LoraConfig, get_peft_model, PeftModel

from dataset_loader import load_custom_meeting_dataset, prepare_dataset_for_whisper


@dataclass
class DataCollatorSpeechSeq2SeqWithPadding:
    processor: Any

    def __call__(self, features: List[Dict[str, Union[List[int], torch.Tensor]]]) -> Dict[str, torch.Tensor]:
        # Split inputs and labels since they have different lengths and padding needs
        input_features = [{"input_features": feature["input_features"]} for feature in features]
        batch = self.processor.feature_extractor.pad(input_features, return_tensors="pt")

        label_features = [{"input_ids": feature["labels"]} for feature in features]
        labels_batch = self.processor.tokenizer.pad(label_features, return_tensors="pt")

        # Replace padding with -100 so cross-entropy loss ignores it
        labels = labels_batch["input_ids"].masked_fill(labels_batch.attention_mask.ne(1), -100)

        # If bos token is prepended in previous steps, truncate
        if (labels[:, 0] == self.processor.tokenizer.bos_token_id).all().cpu().item():
            labels = labels[:, 1:]

        batch["labels"] = labels
        return batch


def compute_metrics_builder(processor):
    metric = evaluate.load("wer")

    def compute_metrics(pred):
        pred_ids = pred.predictions
        label_ids = pred.label_ids

        # Replace -100 with pad_token_id
        label_ids[label_ids == -100] = processor.tokenizer.pad_token_id

        # Decode tokens to strings
        pred_str = processor.tokenizer.batch_decode(pred_ids, skip_special_tokens=True)
        label_str = processor.tokenizer.batch_decode(label_ids, skip_special_tokens=True)

        wer = 100 * metric.compute(predictions=pred_str, references=label_str)
        return {"wer": wer}

    return compute_metrics


def train(
    base_model: str = "openai/whisper-tiny.en",
    data_dir: str = "./data",
    output_dir: str = "./output_model",
    num_epochs: int = 5,
    batch_size: int = 8,
    learning_rate: float = 1e-3,
    lora_r: int = 32,
    lora_alpha: int = 64,
):
    print(f"\n==========================================")
    print(f"🚀 Nook STT Fine-Tuning Pipeline Starting")
    print(f"Base Model: {base_model}")
    print(f"Data Directory: {data_dir}")
    print(f"Output Directory: {output_dir}")
    print(f"==========================================\n")

    # 1. Load Processor & Base Model
    processor = WhisperProcessor.from_pretrained(base_model, language="english", task="transcribe")
    model = WhisperForConditionalGeneration.from_pretrained(base_model)

    # Disable cache for gradient checkpointing
    model.config.use_cache = False
    model.config.forced_decoder_ids = None
    model.config.suppress_tokens = []

    # 2. Configure PEFT / LoRA
    peft_config = LoraConfig(
        r=lora_r,
        lora_alpha=lora_alpha,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.05,
        bias="none",
    )
    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    # 3. Load & Preprocess Custom Meeting Dataset
    print("\n📂 Loading and preparing meeting dataset...")
    raw_datasets = load_custom_meeting_dataset(data_dir)

    train_data = raw_datasets["train"].map(
        lambda b: prepare_dataset_for_whisper(b, processor),
        remove_columns=raw_datasets["train"].column_names,
        num_proc=1,
    )
    val_data = raw_datasets["validation"].map(
        lambda b: prepare_dataset_for_whisper(b, processor),
        remove_columns=raw_datasets["validation"].column_names,
        num_proc=1,
    )

    data_collator = DataCollatorSpeechSeq2SeqWithPadding(processor=processor)

    # 4. Training Arguments
    use_fp16 = torch.cuda.is_available()
    training_args = Seq2SeqTrainingArguments(
        output_dir=output_dir,
        per_device_train_batch_size=batch_size,
        gradient_accumulation_steps=2,
        learning_rate=learning_rate,
        warmup_steps=50,
        num_train_epochs=num_epochs,
        eval_strategy="epoch",
        save_strategy="epoch",
        fp16=use_fp16,
        logging_steps=10,
        report_to=["tensorboard"],
        load_best_model_at_end=True,
        metric_for_best_model="wer",
        greater_is_better=False,
        save_total_limit=2,
    )

    # 5. Initialize Trainer
    trainer = Seq2SeqTrainer(
        args=training_args,
        model=model,
        train_dataset=train_data,
        eval_dataset=val_data,
        data_collator=data_collator,
        compute_metrics=compute_metrics_builder(processor),
        tokenizer=processor.feature_extractor,
    )

    # 6. Run Training
    print("\n🔥 Training in progress...")
    trainer.train()

    # 7. Save Adapter & Processor
    print(f"\n💾 Saving fine-tuned LoRA model weights to {output_dir}...")
    model.save_pretrained(output_dir)
    processor.save_pretrained(output_dir)

    # 8. Merge LoRA back to base model for standalone export
    print("\n🔗 Merging LoRA weights into base model for standalone export...")
    base = WhisperForConditionalGeneration.from_pretrained(base_model)
    merged_model = PeftModel.from_pretrained(base, output_dir).merge_and_unload()
    merged_dir = os.path.join(output_dir, "merged_full_model")
    merged_model.save_pretrained(merged_dir)
    processor.save_pretrained(merged_dir)

    print(f"\n✅ Fine-tuning complete!")
    print(f"Merged model ready for GGML export at: {merged_dir}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train custom Whisper STT model for Nook")
    parser.add_argument("--base_model", type=str, default="openai/whisper-tiny.en", help="Base Whisper model (tiny.en, base.en, small)")
    parser.add_argument("--data_dir", type=str, default="./data", help="Directory containing metadata.csv and audio/ folder")
    parser.add_argument("--output_dir", type=str, default="./output_model", help="Where to save fine-tuned weights")
    parser.add_argument("--epochs", type=int, default=5, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=8, help="Batch size per device")
    parser.add_argument("--lr", type=float, default=1e-3, help="Learning rate")

    args = parser.parse_args()

    train(
        base_model=args.base_model,
        data_dir=args.data_dir,
        output_dir=args.output_dir,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
    )
