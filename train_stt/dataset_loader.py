"""
Nook — Custom Meeting Audio Dataset Processor for Whisper Fine-Tuning
Resamples audio to 16kHz mono, extracts 80-channel log-mel spectrograms,
and prepares HuggingFace Dataset splits for training and evaluation.
"""

import os
import csv
import torch
import torchaudio
import librosa
from datasets import Dataset, DatasetDict
from transformers import WhisperProcessor


def load_custom_meeting_dataset(data_dir: str, val_split_ratio: float = 0.15) -> DatasetDict:
    """
    Loads custom audio-transcript pairs from a directory.
    Expected directory structure:
      data_dir/
        metadata.csv (columns: audio_filename, transcript)
        audio/ (contains .wav, .mp3, or .m4a files)
    """
    metadata_csv = os.path.join(data_dir, "metadata.csv")
    audio_dir = os.path.join(data_dir, "audio")

    if not os.path.exists(metadata_csv):
        raise FileNotFoundError(f"Metadata file not found: {metadata_csv}")

    records = []
    with open(metadata_csv, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            audio_path = os.path.join(audio_dir, row["audio_filename"])
            if os.path.exists(audio_path):
                records.append({
                    "audio_path": audio_path,
                    "sentence": row["transcript"].strip()
                })
            else:
                print(f"Warning: Audio file not found, skipping: {audio_path}")

    if len(records) == 0:
        raise ValueError(f"No valid audio records found in {data_dir}")

    # Convert to HuggingFace Dataset
    full_dataset = Dataset.from_list(records)
    split_dataset = full_dataset.train_test_split(test_size=val_split_ratio, seed=42)

    return DatasetDict({
        "train": split_dataset["train"],
        "validation": split_dataset["test"]
    })


def prepare_dataset_for_whisper(batch, processor: WhisperProcessor):
    """
    Extracts log-mel spectrogram and tokenizes reference transcription.
    """
    audio_path = batch["audio_path"]

    # Load and resample to 16kHz mono
    try:
        speech_array, sampling_rate = torchaudio.load(audio_path)
        if sampling_rate != 16000:
            resampler = torchaudio.transforms.Resample(sampling_rate, 16000)
            speech_array = resampler(speech_array)
        if speech_array.shape[0] > 1:
            speech_array = torch.mean(speech_array, dim=0, keepdim=True)
        speech_array = speech_array.squeeze().numpy()
    except Exception:
        # Fallback to librosa if torchaudio fails on specific codec
        speech_array, _ = librosa.load(audio_path, sr=16000, mono=True)

    # Compute 80-channel log-mel spectrogram features
    batch["input_features"] = processor.feature_extractor(
        speech_array,
        sampling_rate=16000
    ).input_features[0]

    # Tokenize transcription
    batch["labels"] = processor.tokenizer(batch["sentence"]).input_ids
    return batch
