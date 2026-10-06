# Nook Mascot LLM Gesture Training & Protocol

This folder contains the complete training pipeline and system prompt configuration for teaching local LLMs (Llama 3, Qwen 2.5, Mistral) to trigger real physical mascot animations, facial expressions, and vocal responses when chatting.

---

## 🌟 How the Gesture Protocol Works

When chatting, the LLM prefixes every response with an explicit gesture tag:
- `[gesture:celebrate]` -> Triggered by `"hii"`, `"hello"`, `"hey"`, celebrations, or wins. Triggers a double-bounce victory jump, joyful arc eyes, and audio chime.
- `[gesture:love]` -> Triggered by `"love you"`, `"thanks"`, `"thank you"`. Triggers Heart Eyes (`❤️`), blushing cheeks, and happy chime.
- `[gesture:blush]` -> Triggered by `"you're cute"`, `"adorable"`. Triggers deep pink blush cheeks and shy smile.
- `[gesture:alert]` -> Triggered by `"urgent"`, `"deadline"`, surprises. Triggers wide surprise eyes (`O_O`) and attention hop.
- `[gesture:think]` -> Triggered by questions, summarization, analysis. Triggers pondering eye gaze.
- `[gesture:sleep]` -> Triggered by `"goodnight"`, `"bye"`, `"sleep"`. Triggers closed crescent eyes and floating `Zzz`.
- `[gesture:dizzy]` -> Triggered by `"spin"`, `"dizzy"`, jokes. Triggers cartoon spiral pupils.

---

## 🚀 Option 1: Instant Ollama Setup (Recommended - 1 Command)

If you have [Ollama](https://ollama.com) installed:

```bash
cd train_llm_gestures
ollama create nook-mascot -f ./Modelfile
```

Then test it in the terminal:
```bash
ollama run nook-mascot "hii"
# Output: [gesture:celebrate] Hiii there! 👋 Super happy to see you! How's your day going?
```

Nook's local companion will automatically detect `nook-mascot` on `http://localhost:11434`.

---

## 🏋️ Option 2: Full PyTorch / LoRA Fine-Tuning

To train a custom LoRA adapter using HuggingFace `transformers` and `peft`:

1. Install requirements:
```bash
pip install torch transformers peft datasets trl accelerate
```

2. Run training on your local GPU:
```bash
python train_lora.py --base_model "meta-llama/Llama-3.2-3B-Instruct" --epochs 3
```

3. Test gesture responses:
```bash
python test_gesture_runner.py
```
