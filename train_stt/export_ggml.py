"""
Nook — Export & Quantize Fine-Tuned Whisper Model to GGML / GGUF
Prepares the fine-tuned checkpoint for ultra-fast, local-first inference
in Whisper.cpp with Apple Metal or Windows DirectML acceleration.
"""

import os
import sys
import argparse
import subprocess


def export_to_ggml(
    model_dir: str,
    output_ggml_path: str = "./ggml-model-nook-custom.bin",
    quantization: str = "q5_1"
):
    print("\n==========================================")
    print("🛠️ Converting HuggingFace Whisper to GGML")
    print(f"Source Model: {model_dir}")
    print(f"Target Binary: {output_ggml_path}")
    print(f"Target Quantization: {quantization}")
    print("==========================================\n")

    if not os.path.exists(model_dir):
        raise FileNotFoundError(f"Model directory does not exist: {model_dir}")

    # Step 1: Ensure whisper.cpp converter is available or clone repo shallowly
    whisper_cpp_dir = "./whisper.cpp"
    if not os.path.exists(whisper_cpp_dir):
        print("Cloning whisper.cpp for official conversion tools...")
        subprocess.run(
            ["git", "clone", "--depth", "1", "https://github.com/ggerganov/whisper.cpp.git", whisper_cpp_dir],
            check=True
        )

    converter_script = os.path.join(whisper_cpp_dir, "models", "convert-h5-to-ggml.py")

    # Step 2: Convert Hugging Face weights to GGML Float16
    temp_fp16_bin = "./ggml-model-f16.bin"
    print(f"Executing conversion to Float16 GGML via {converter_script}...")
    cmd = [
        sys.executable,
        converter_script,
        model_dir,
        "./whisper.cpp",
        os.path.dirname(temp_fp16_bin)
    ]
    subprocess.run(cmd, check=True)

    # Step 3: Quantize Float16 down to Q5_1 or Q4_0 for <500MB memory footprint
    quantize_binary = os.path.join(whisper_cpp_dir, "quantize")
    if os.path.exists(quantize_binary) or os.path.exists(f"{quantize_binary}.exe"):
        print(f"Applying {quantization} quantization...")
        subprocess.run(
            [quantize_binary, temp_fp16_bin, output_ggml_path, quantization],
            check=True
        )
        if os.path.exists(temp_fp16_bin):
            os.remove(temp_fp16_bin)
    else:
        print(f"Quantize tool not compiled; moving unquantized float16 model to {output_ggml_path}")
        if os.path.exists(temp_fp16_bin):
            os.rename(temp_fp16_bin, output_ggml_path)

    print(f"\n✅ Successfully exported GGML model: {output_ggml_path}")
    print("Place this file into Nook's models directory for immediate offline use!\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export fine-tuned Whisper model to GGML")
    parser.add_argument("--model_dir", type=str, default="./output_model/merged_full_model", help="Path to merged HuggingFace model")
    parser.add_argument("--output_path", type=str, default="./ggml-nook-custom.bin", help="Output GGML binary file path")
    parser.add_argument("--quantization", type=str, default="q5_1", choices=["q4_0", "q4_1", "q5_0", "q5_1", "q8_0"], help="Quantization type")

    args = parser.parse_args()
    export_to_ggml(args.model_dir, args.output_path, args.quantization)
