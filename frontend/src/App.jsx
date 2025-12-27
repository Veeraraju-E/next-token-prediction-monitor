import React, { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import ModelLoader from './components/ModelLoader'
import TextEditor from './components/TextEditor'
import ProbabilityChart from './components/ProbabilityChart'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function App() {
  const [modelLoaded, setModelLoaded] = useState(false)
  const [text, setText] = useState('')
  const [tokens, setTokens] = useState([])
  const [predictions, setPredictions] = useState({})
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(null)
  const [loading, setLoading] = useState(false)
  const debounceTimer = useRef(null)
  const tokenizeTimer = useRef(null)

  const fetchConditionalPredictions = useCallback(async (textToPredict, tokenIndex) => {
    if (!modelLoaded || !textToPredict.trim() || tokenIndex === null) {
      setPredictions({})
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE}/api/predict-conditional`, {
        text: textToPredict,
        token_index: tokenIndex
      })
      setPredictions(response.data.conditional_predictions || {})
      
      if (response?.data?.tokens) {
        setTokens(response.data.tokens)
      }
    } catch (error) {
      console.error('Error fetching predictions:', error)
      setPredictions({})
    } finally {
      setLoading(false)
    }
  }, [modelLoaded])

  const handleTextChange = useCallback((newText) => {
    setText(newText)
    // Clear predictions when text changes
    setPredictions({})
    setSelectedTokenIndex(null)
  }, [])

  const handleTokenClick = useCallback((tokenIndex) => {
    // Toggle selection - if clicking the same token, deselect it
    if (selectedTokenIndex === tokenIndex) {
      setSelectedTokenIndex(null)
      setPredictions({})
    } else {
      setSelectedTokenIndex(tokenIndex)
      fetchConditionalPredictions(text, tokenIndex)
    }
  }, [text, fetchConditionalPredictions, selectedTokenIndex])

  // Memoize token fetching to avoid unnecessary calls
  useEffect(() => {
    const fetchTokens = async () => {
      if (!modelLoaded || !text.trim()) {
        setTokens([])
        return
      }

      try {
        const response = await axios.post(`${API_BASE}/api/tokenize`, { text })
        setTokens(response.data)
      } catch (error) {
        console.error('Error tokenizing:', error)
      }
    }

    // Clear previous timer
    if (tokenizeTimer.current) {
      clearTimeout(tokenizeTimer.current)
    }
    
    // Debounce tokenization
    tokenizeTimer.current = setTimeout(fetchTokens, 300)
    
    return () => {
      if (tokenizeTimer.current) {
        clearTimeout(tokenizeTimer.current)
      }
    }
  }, [text, modelLoaded])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      if (tokenizeTimer.current) {
        clearTimeout(tokenizeTimer.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-anthropic-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold text-anthropic-text mb-3 tracking-tight">
            Next Token Prediction Monitor
          </h1>
          <p className="text-base text-anthropic-text-secondary leading-relaxed">
            Type text and click on tokens to see conditional probability distributions
          </p>
        </header>

        {!modelLoaded ? (
          <ModelLoader onModelLoaded={() => setModelLoaded(true)} />
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-end">
              <button
                onClick={() => {
                  setModelLoaded(false)
                  setText('')
                  setTokens([])
                  setPredictions({})
                  setSelectedTokenIndex(null)
                }}
                className="px-4 py-2 text-sm font-medium text-anthropic-text-secondary hover:text-anthropic-text transition-colors rounded-md hover:bg-anthropic-surface"
              >
                Change Model
              </button>
            </div>

            <TextEditor
              text={text}
              tokens={tokens}
              selectedTokenIndex={selectedTokenIndex}
              onTextChange={handleTextChange}
              onTokenClick={handleTokenClick}
            />

            <ProbabilityChart
              predictions={predictions}
              loading={loading}
              selectedTokenIndex={selectedTokenIndex}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
