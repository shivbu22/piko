# Nook STT — Custom Whisper Model Training & Fine-Tuning Pipeline

This directory provides the end-to-end pipeline to **fine-tune OpenAI Whisper** on meeting audio, specialized company terminology, technical acronyms, and custom speaker voices, then export the model into **quantized GGML** for Nook's offline desktop engine (`whisper.cpp`).

---

## Architecture Overview

```
Meeting Audio (.wav / .mp3) + Transcripts (.csv)
                   │
                   ▼
       16kHz Resampling & Log-Mel Spectrograms
                   │
                   ▼
     Whisper Base Model (tiny.en / base.en / small)
                   │
                   ▼
    PEFT / LoRA Fine-Tuning (q_proj & v_proj adapters)
                   │  (Trains in <15 mins on consumer GPU)
                   ▼
       Merged Full Model Weights
                   │
                   ▼
    GGML / GGUF Quantization (Q5_1 / Q4_0)
                   │
                   ▼
    Nook Desktop Notch Engine (Whisper.cpp Metal / DirectML)
    Sub-150ms latency, <250MB RAM, 100% Offline
```

---

## 1. Prerequisites & Installation

Create a clean virtual environment and install the dependencies:

```bash
cd train_stt
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### Hardware Requirements
- **NVIDIA GPU**: RTX 3060 / 4060 / 4070 / 4080 / 4090 (4GB to 8GB VRAM is plenty with LoRA).
- **Apple Silicon**: M1 / M2 / M3 / M4 Macs (uses MPS acceleration).
- **Free Google Colab**: Runs on standard T4 GPU in ~10 minutes.
- **CPU**: Supported for small datasets (<50 clips).

---

## 2. Dataset Preparation

Organize your training data inside a directory (e.g. `data/`):

```
data/
├── metadata.csv
└── audio/
    ├── meeting_clip_01.wav
    ├── meeting_clip_02.wav
    └── meeting_clip_03.wav
```

### `metadata.csv` Format:
```csv
audio_filename,transcript
meeting_clip_01.wav,"Thanks for jumping on everyone. Today we're reviewing the local-first AI notch architecture."
meeting_clip_02.wav,"Action item assigned to Alex: benchmark sqlite-vec cosine similarity latency."
```

> **Tip:** You can extract meeting audio clips directly from Zoom, Google Meet, or Loom recordings using `ffmpeg -i input.mp4 -vn -ar 16000 -ac 1 output.wav`.

---

## 3. Run Fine-Tuning

Execute the LoRA training script:

```bash
python train_whisper_lora.py \
  --base_model openai/whisper-tiny.en \
  --data_dir ./sample_data \
  --output_dir ./output_model \
  --epochs 5 \
  --batch_size 8 \
  --lr 1e-3
```

### Supported Base Models:
- `openai/whisper-tiny.en`: 39M params (Fastest, ~75MB footprint, ideal for notch).
- `openai/whisper-base.en`: 74M params (Balanced accuracy & speed, ~140MB).
- `openai/whisper-small.en`: 244M params (Highest accuracy for multi-speaker meetings).

---

## 4. Export to GGML for Nook's Offline Engine

After training finishes, convert and quantize the model into binary format:

```bash
python export_ggml.py \
  --model_dir ./output_model/merged_full_model \
  --output_path ./ggml-nook-custom.bin \
  --quantization q5_1
```

Copy the generated `ggml-nook-custom.bin` into Nook's local model folder.

---

## 5. Live In-App Speech-to-Text

The browser app in `src/audio/AudioEngine.ts` is already wired with **live microphone Speech-to-Text recognition**:
- When you click **Record** in Nook and speak into your microphone, your spoken words are converted into text in real time.
- If no speech is detected or microphone access is denied, Nook seamlessly falls back to simulated meeting audio streams.
