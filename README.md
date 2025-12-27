# Next Token Prediction Monitor

A minimalist, fast web application for monitoring next-token-prediction probability distributions of LLMs. Built with a clean, Anthropic-inspired UI.

## Features

- **Model Loading**: Load any HuggingFace model or custom models with modified weights (.pt files)
- **Token Visualization**: Clear token demarcation using the model's tokenizer
- **Conditional Probabilities**: Click on tokens to see conditional probability distributions
- **Probability Charts**: Interactive bar charts showing top token predictions
- **Fast Performance**: Optimized for models <1.5B parameters

## Project Structure

```
monitor-ntp/
├── backend/          # FastAPI backend
│   ├── main.py      # API endpoints and model loading
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ModelLoader.jsx
│   │   │   ├── TextEditor.jsx
│   │   │   └── ProbabilityChart.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

1. **Load a Model**:
   - Enter a HuggingFace model ID (e.g., `gpt2`, `distilgpt2`, `microsoft/DialoGPT-small`)
   - Optionally provide a path to custom weights (.pt file)
   - Click "Load Model"

2. **Using the Application**:
   - Type or paste text into the text field
   - Tokens will be automatically tokenized and displayed below the text area
   - Click on any token to see the conditional probability distribution
   - The chart shows what the model predicted at that position given the previous context
   - Click the same token again to deselect it

## API Endpoints

- `POST /api/load-model`: Load a model from HuggingFace or local path
- `POST /api/tokenize`: Tokenize text and return token information
- `POST /api/predict-conditional`: Get conditional probabilities for a token at a specific position

## Custom Models

To use custom modified models:

1. Save your modified model weights as a `.pt` file
2. When loading the model, provide:
   - **Model Path**: The base HuggingFace model ID
   - **Custom Weights Path**: Path to your `.pt` file

The system will load the base model and then apply your custom weights.

## Performance

- Optimized for models <1.5B parameters
- Debounced API calls to prevent excessive requests
- GPU acceleration when available
- Fast tokenization and inference

## Technology Stack

- **Backend**: FastAPI, PyTorch, Transformers
- **Frontend**: React, Vite, Tailwind CSS, Recharts
- **Styling**: Anthropic-inspired minimalist design

## Notes

- Ensure you have CUDA available if using GPU acceleration
- Models are loaded in float16 on GPU for better performance
- The frontend proxies API requests to the backend automatically

