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
      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-20">
        <header className="mb-16">
          <h1 className="text-2xl sm:text-3xl font-medium text-anthropic-text mb-4 tracking-tight">
            Next Token Prediction Monitor
          </h1>
          <p className="text-base text-anthropic-text-secondary leading-relaxed">
            Type text and click on tokens to see conditional probability distributions. <br/>
            {/* Pro tip: Type a phrase and finish with an extra space to see the distribution for the next token. */}
          </p>
        </header>

        {!modelLoaded ? (
          <ModelLoader onModelLoaded={() => setModelLoaded(true)} />
        ) : (
          <div className="space-y-12">
            <div className="flex items-center justify-end">
              <button
                onClick={() => {
                  setModelLoaded(false)
                  setText('')
                  setTokens([])
                  setPredictions({})
                  setSelectedTokenIndex(null)
                }}
                className="px-3 py-1.5 text-sm font-normal text-anthropic-text-secondary hover:text-anthropic-text transition-opacity rounded-anthropic border border-anthropic-border bg-anthropic-surface hover:opacity-70"
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
