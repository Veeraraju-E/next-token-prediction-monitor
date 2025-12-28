from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from contextlib import asynccontextmanager
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import os

# Global model and tokenizer storage
model = None
tokenizer = None
device = "cuda" if torch.cuda.is_available() else "cpu"

# Default model to load on startup
DEFAULT_MODEL = "gpt2"

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Auto-load default model on startup"""
    global model, tokenizer
    try:
        print(f"Auto-loading default model: {DEFAULT_MODEL}...")
        # Load tokenizer
        tokenizer = AutoTokenizer.from_pretrained(DEFAULT_MODEL)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        # Load base model
        model = AutoModelForCausalLM.from_pretrained(DEFAULT_MODEL, torch_dtype=torch.float16 if device == "cuda" else torch.float32, device_map="auto" if device == "cuda" else None)
        
        model.eval()
        if device == "cpu":
            model = model.to(device)
        
        print(f"[INFO] Default model '{DEFAULT_MODEL}' loaded successfully on {device}")
    except Exception as e:
        print(f"[ERROR] Could not auto-load default model: {str(e)}")
        print("\n[INFO] You can still load a model manually via the /api/load-model endpoint")
    
    yield
    
app = FastAPI(title="Next Token Prediction Monitor", lifespan=lifespan)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ModelLoadRequest(BaseModel):
    model_path: str
    custom_weights_path: Optional[str] = None


class TextRequest(BaseModel):
    text: str


class TokenPredictionRequest(BaseModel):
    text: str
    token_index: Optional[int] = None


class TokenInfo(BaseModel):
    token: str
    token_id: int
    start_pos: int
    end_pos: int


class PredictionResponse(BaseModel):
    tokens: List[TokenInfo]
    next_token_predictions: Optional[Dict[str, float]] = None
    conditional_predictions: Optional[Dict[str, float]] = None


@app.get("/")
async def root():
    return {"status": "Next Token Prediction Monitor API", "model_loaded": model is not None}


@app.post("/api/load-model")
async def load_model(request: ModelLoadRequest):
    """Load a model from HuggingFace or custom path with optional custom weights"""
    global model, tokenizer
    
    try:
        print(f"Loading model: {request.model_path}")
        
        # Load tokenizer
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(request.model_path)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        print("Tokenizer loaded successfully")
        
        # Load base model
        print("Loading model (this may take a while, especially on first download)...")
        model = AutoModelForCausalLM.from_pretrained(request.model_path, 
            torch_dtype=torch.float16 if device == "cuda" else torch.float32, 
            device_map="auto" if device == "cuda" else None
        )
        print("Model loaded successfully")
        
        # Load custom weights if provided
        if request.custom_weights_path and os.path.exists(request.custom_weights_path):
            print(f"Loading custom weights from {request.custom_weights_path}...")
            custom_weights = torch.load(request.custom_weights_path, map_location=device)
            model.load_state_dict(custom_weights, strict=False)
            print(f"Custom weights loaded successfully")
        
        model.eval()
        if device == "cpu":
            model = model.to(device)
        
        print(f"Model '{request.model_path}' ready on {device}")
        return {
            "status": "success",
            "model_path": request.model_path,
            "device": device,
            "vocab_size": len(tokenizer)
        }
    except Exception as e:
        error_msg = f"Error loading model: {str(e)}"
        print(f"ERROR: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/tokenize", response_model=List[TokenInfo])
async def tokenize_text(request: TextRequest):
    """Tokenize text and return token information"""
    if tokenizer is None:
        raise HTTPException(status_code=400, detail="Model not loaded")
    
    try:
        # Use tokenizer's encoding to get proper positions with offset mapping
        encoding = tokenizer(request.text, return_offsets_mapping=True, add_special_tokens=False)
        input_ids = encoding["input_ids"]
        offsets = encoding["offset_mapping"]
        
        token_infos = []
        for token_id, (start_pos, end_pos) in zip(input_ids, offsets):
            # Decode
            token = tokenizer.decode([token_id])
            # Clean up the token
            if token.startswith(" ") and len(token) > 1:
                token = token[1:]
            
            token_infos.append(TokenInfo(token=token, token_id=token_id, start_pos=start_pos, end_pos=end_pos))
        
        return token_infos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error tokenizing: {str(e)}")


@app.post("/api/predict-next-token", response_model=PredictionResponse)
async def predict_next_token(request: TextRequest):
    """Get next token predictions for the given text"""
    if model is None or tokenizer is None:
        raise HTTPException(status_code=400, detail="Model not loaded")
    
    try:
        token_infos = await tokenize_text(request) # Tokenize
        inputs = tokenizer(request.text, return_tensors="pt").to(device) # Get model predictions
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits[0, -1, :]  # Get last token's logits
            probs = torch.softmax(logits, dim=-1)
        
        top_k = 50  # Show top 50 tokens from vocabulary
        top_probs, top_indices = torch.topk(probs, top_k)
        predictions = {}
        for prob, idx in zip(top_probs, top_indices):
            token = tokenizer.decode([idx.item()])
            predictions[token] = prob.item()
        
        return PredictionResponse(tokens=token_infos, next_token_predictions=predictions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting: {str(e)}")


@app.post("/api/predict-conditional", response_model=PredictionResponse)
async def predict_conditional(request: TokenPredictionRequest):
    """Get conditional probability distribution for a specific token position"""
    if model is None or tokenizer is None:
        raise HTTPException(status_code=400, detail="Model not loaded")
    
    try:
        token_infos = await tokenize_text(TextRequest(text=request.text)) # Tokenize
        if request.token_index is None or request.token_index >= len(token_infos):
            raise HTTPException(status_code=400, detail="Invalid token index")
        
        target_token = token_infos[request.token_index]
        context_text = request.text[:target_token.start_pos]
        
        if not context_text:
            return PredictionResponse(tokens=token_infos, conditional_predictions={})
        
        inputs = tokenizer(context_text, return_tensors="pt").to(device) # Get model predictions for the context
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits[0, -1, :]  # Last token's logits
            probs = torch.softmax(logits, dim=-1)
        
        top_k = 50
        top_probs, top_indices = torch.topk(probs, top_k)
        
        predictions = {}
        for prob, idx in zip(top_probs, top_indices):
            token = tokenizer.decode([idx.item()])
            predictions[token] = prob.item()
        
        return PredictionResponse(tokens=token_infos, conditional_predictions=predictions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting conditional: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)