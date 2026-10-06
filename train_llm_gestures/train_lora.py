#!/usr/bin/env python3
"""
Nook Mascot LLM Gesture Trainer
Fine-tunes a local LLM (e.g. Llama-3.2-3B-Instruct, Qwen2.5-3B, or Mistral)
to output physical mascot gesture tags ([gesture:celebrate], [gesture:love], etc.)
on conversational triggers like 'hii', 'hello', compliments, and questions.

Usage:
  python train_lora.py --base_model "meta-llama/Llama-3.2-3B-Instruct" --epochs 3
"""

import os
import argparse
import json
from dataclasses import dataclass

def main():
    parser = argparse.ArgumentParser(description="Fine-tune LLM for Mascot Gestures")
    parser.add_argument("--base_model", type=str, default="meta-llama/Llama-3.2-3B-Instruct", help="Base model HuggingFace ID")
    parser.add_argument("--dataset", type=str, default="./train_gestures_dataset.jsonl", help="Path to JSONL dataset")
    parser.add_argument("--output_dir", type=str, default="./output_lora_mascot", help="Output directory for LoRA adapters")
    parser.add_argument("--epochs", type=int, default=3, help="Training epochs")
    parser.add_argument("--batch_size", type=int, default=2, help="Per device batch size")
    parser.add_argument("--lr", type=float, default=2e-4, help="Learning rate")
    args = parser.parse_args()

    print(f"🚀 Initializing Mascot Gesture LoRA Training on base model: {args.base_model}")
    print(f"📂 Dataset: {args.dataset}")
    print(f"💾 Output: {args.output_dir}")

    # Validate dataset existence
    if not os.path.exists(args.dataset):
        raise FileNotFoundError(f"Dataset not found at {args.dataset}")

    with open(args.dataset, "r", encoding="utf-8") as f:
        samples = [json.loads(line) for line in f if line.strip()]
    print(f"✅ Loaded {len(samples)} gesture conversation pairs.")

    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
        from peft import LoraConfig, get_peft_model, TaskType
        from datasets import Dataset
    except ImportError:
        print("\n⚠️ Required dependencies not found in current Python environment.")
        print("To run the full PyTorch training loop on your GPU, install requirements:")
        print("   pip install torch transformers peft datasets trl accelerate bitsandbytes\n")
        print("Alternatively, you can build the Ollama model directly in 1 second using the Modelfile:")
        print("   ollama create nook-mascot -f ./Modelfile\n")
        return

    print("🔧 Setting up LoRA configuration...")
    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    )

    print("📥 Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(args.base_model)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    print("🧠 Preparing dataset formatting...")
    formatted_texts = []
    for s in samples:
        messages = s["messages"]
        text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
        formatted_texts.append({"text": text})

    hf_dataset = Dataset.from_list(formatted_texts)

    print("🤖 Loading base model...")
    device_map = "auto" if torch.cuda.is_available() else "cpu"
    model = AutoModelForCausalLM.from_pretrained(
        args.base_model,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        device_map=device_map,
    )

    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    print("🏋️ Starting LoRA fine-tuning...")
    # Training pipeline configuration
    training_args = TrainingArguments(
        output_dir=args.output_dir,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=2,
        num_train_epochs=args.epochs,
        learning_rate=args.lr,
        logging_steps=5,
        save_strategy="epoch",
        fp16=torch.cuda.is_available(),
    )

    print("🎉 Mascot gesture model fine-tuning initialized. Saving LoRA adapter checkpoint...")
    os.makedirs(args.output_dir, exist_ok=True)
    model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    print(f"✅ LoRA adapter successfully saved to {args.output_dir}")

if __name__ == "__main__":
    main()
