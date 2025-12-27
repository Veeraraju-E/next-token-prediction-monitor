#!/usr/bin/env python3
"""
Script to download GPT-2 small model from Hugging Face.
This will cache the model locally for offline use.
"""

from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

def download_gpt2_small():
    """Download GPT-2 small model and tokenizer from Hugging Face"""
    model_name = "gpt2"  # GPT-2 small is the default "gpt2" model
    
    print(f"Downloading GPT-2 small model ({model_name}) from Hugging Face...")
    print("This may take a few minutes depending on your internet connection...")
    
    try:
        # Download tokenizer
        print("\n[1/2] Downloading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        print("✓ Tokenizer downloaded successfully")
        
        # Download model
        print("\n[2/2] Downloading model...")
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float32,  # Use float32 for download (can be converted later)
        )
        print("✓ Model downloaded successfully")
        
        print(f"\n✓ GPT-2 small model downloaded and cached successfully!")
        print(f"Model will be available at: {model.config.name_or_path}")
        print(f"Tokenizer vocab size: {len(tokenizer)}")
        print(f"Model parameters: ~{sum(p.numel() for p in model.parameters()):,}")
        
        return model, tokenizer
        
    except Exception as e:
        print(f"\n✗ Error downloading model: {str(e)}")
        raise


if __name__ == "__main__":
    download_gpt2_small()
    print("\nDone! The model is now cached and ready to use.")

