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
      const response = await axios.post(`${API_BASE}/api/load-model`, {
        model_path: modelPath,
        custom_weights_path: customWeightsPath || null
      })

      if (response.data.status === 'success') {
        setSuccess(true)
        setTimeout(() => {
          onModelLoaded()
        }, 500)
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load model')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-anthropic-surface border border-anthropic-border rounded-lg shadow-anthropic p-8">
      <h2 className="text-xl font-semibold text-anthropic-text mb-6">
        Load Model
      </h2>
      
      <form onSubmit={handleLoad} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-anthropic-text mb-2">
            Model Path (HuggingFace model ID or local path)
          </label>
          <input
            type="text"
            value={modelPath}
            onChange={(e) => setModelPath(e.target.value)}
            placeholder="e.g., gpt2, microsoft/DialoGPT-small, or /path/to/model"
            className="w-full px-4 py-2.5 border border-anthropic-border rounded-md focus:outline-none focus:ring-2 focus:ring-anthropic-accent focus:border-anthropic-accent transition-all text-anthropic-text bg-white"
            disabled={loading}
          />
          <p className="mt-2 text-xs text-anthropic-text-secondary">
            Examples: gpt2, distilgpt2, microsoft/DialoGPT-small
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-anthropic-text mb-2">
            Custom Weights Path (Optional)
          </label>
          <input
            type="text"
            value={customWeightsPath}
            onChange={(e) => setCustomWeightsPath(e.target.value)}
            placeholder="e.g., /path/to/custom_weights.pt"
            className="w-full px-4 py-2.5 border border-anthropic-border rounded-md focus:outline-none focus:ring-2 focus:ring-anthropic-accent focus:border-anthropic-accent transition-all text-anthropic-text bg-white"
            disabled={loading}
          />
          <p className="mt-2 text-xs text-anthropic-text-secondary">
            Path to custom .pt weights file (will be loaded into the model)
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            Model loaded successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !modelPath.trim()}
          className="w-full px-4 py-2.5 bg-anthropic-accent text-white rounded-md hover:bg-anthropic-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-anthropic"
        >
          {loading ? 'Loading Model...' : 'Load Model'}
        </button>
      </form>
    </div>
  )
}

export default ModelLoader
