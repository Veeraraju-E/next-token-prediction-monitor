import React, { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function ModelLoader({ onModelLoaded }) {
  const [modelPath, setModelPath] = useState('gpt2')
  const [customWeightsPath, setCustomWeightsPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleLoad = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Set a 10 minute timeout for model loading (models can take time to download/load)
      const response = await axios.post(
        `${API_BASE}/api/load-model`,
        {
          model_path: modelPath,
          custom_weights_path: customWeightsPath || null
        },
        {
          timeout: 600000, // 10 minutes in milliseconds
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.status === 'success') {
        setSuccess(true)
        setTimeout(() => {
          onModelLoaded()
        }, 500)
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Request timed out. Model loading is taking longer than expected. Please check if the model path is correct and try again.')
      } else if (err.response) {
        setError(err.response.data?.detail || err.response.data?.message || 'Failed to load model')
      } else if (err.request) {
        setError('Unable to connect to the server. Please ensure the backend is running.')
      } else {
        setError(err.message || 'Failed to load model')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium text-anthropic-text mb-2">
          Load Model
        </h2>
      </div>
      
      <form onSubmit={handleLoad} className="space-y-8">
        <div>
          <label className="block text-sm font-normal text-anthropic-text mb-3">
            Model Path (HuggingFace model ID or local path)
          </label>
          <input
            type="text"
            value={modelPath}
            onChange={(e) => setModelPath(e.target.value)}
            placeholder="e.g., gpt2, microsoft/DialoGPT-small, or /path/to/model"
            className="w-full px-4 py-3 border border-anthropic-border rounded-anthropic focus:outline-none focus:border-anthropic-accent transition-colors text-anthropic-text bg-anthropic-surface"
            disabled={loading}
          />
          <p className="mt-3 text-xs text-anthropic-text-secondary">
            Examples: gpt2, distilgpt2, microsoft/DialoGPT-small
          </p>
        </div>

        <div>
          <label className="block text-sm font-normal text-anthropic-text mb-3">
            Custom Weights Path (Optional)
          </label>
          <input
            type="text"
            value={customWeightsPath}
            onChange={(e) => setCustomWeightsPath(e.target.value)}
            placeholder="e.g., /path/to/custom_weights.pt"
            className="w-full px-4 py-3 border border-anthropic-border rounded-anthropic focus:outline-none focus:border-anthropic-accent transition-colors text-anthropic-text bg-anthropic-surface"
            disabled={loading}
          />
          <p className="mt-3 text-xs text-anthropic-text-secondary">
            Path to custom .pt weights file (will be loaded into the model)
          </p>
        </div>

        {error && (
          <div className="p-4 bg-anthropic-surface border border-red-300 rounded-anthropic text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-anthropic-surface border border-green-300 rounded-anthropic text-green-700 text-sm">
            Model loaded successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !modelPath.trim()}
          className="w-full px-4 py-2.5 bg-anthropic-accent text-white rounded-anthropic hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity font-normal border border-anthropic-accent"
        >
          {loading ? 'Loading Model...' : 'Load Model'}
        </button>
      </form>
    </div>
  )
}

export default ModelLoader
