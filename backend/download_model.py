from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

def download_gpt2_small():
    model_name = "gpt2"
    
    print(f"Downloading GPT-2 small model ({model_name}) from Hugging Face...")
    
    try:
        print("\n[1/2] Downloading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        print("[INFO] Tokenizer downloaded successfully")
        
        print("\n[2/2] Downloading model...")
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float32,  # Use float32 for download (can be converted later)
        )
        print("[INFO] Model downloaded successfully")
        
        print(f"\n[INFO] GPT-2 small model downloaded and cached successfully!")
        print(f"Model will be available at: {model.config.name_or_path}")
        print(f"Tokenizer vocab size: {len(tokenizer)}")
        print(f"Model parameters: ~{sum(p.numel() for p in model.parameters()):,}")
        
        return model, tokenizer
        
    except Exception as e:
        print(f"\n[ERROR] Error downloading model: {str(e)}")
        raise


if __name__ == "__main__":
    download_gpt2_small()
    print("\n[INFO] Done!")

