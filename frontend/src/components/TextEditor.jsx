import React, { useRef, useEffect, useState, useMemo } from 'react'

function TextEditor({
  text,
  tokens,
  selectedTokenIndex,
  onTextChange,
  onTokenClick
}) {
  const textareaRef = useRef(null)
  const [cursorPosition, setCursorPosition] = useState(0)

  useEffect(() => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart)
    }
  }, [text])

  const handleChange = (e) => {
    onTextChange(e.target.value)
  }

  const handleSelectionChange = (e) => {
    setCursorPosition(e.target.selectionStart)
  }

  // Memoize token rendering to avoid unnecessary re-renders
  const tokenizedDisplay = useMemo(() => {
    if (!tokens.length) {
      return null
    }

    return tokens.map((tokenInfo, index) => {
      const isSelected = selectedTokenIndex === index
      return (
        <span
          key={index}
          className={`inline-block px-2.5 py-1.5 rounded-md transition-all cursor-pointer select-none font-mono text-sm ${
            isSelected
              ? 'bg-anthropic-accent text-white shadow-anthropic-md ring-2 ring-anthropic-accent'
              : 'bg-white border border-anthropic-border text-anthropic-text hover:bg-anthropic-accent-light hover:border-anthropic-accent'
          }`}
          onClick={() => onTokenClick(index)}
          title={`Token ID: ${tokenInfo.token_id}\nClick to see conditional probabilities`}
        >
          {tokenInfo.token}
        </span>
      )
    })
  }, [tokens, selectedTokenIndex, onTokenClick])

  return (
    <div className="bg-anthropic-surface border border-anthropic-border rounded-lg shadow-anthropic overflow-hidden">
      <div className="p-6">
        <label className="block text-sm font-medium text-anthropic-text mb-3">
          Text Input
        </label>
        
        <div className="space-y-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onSelect={handleSelectionChange}
            placeholder="Type your text here..."
            className="w-full min-h-[240px] px-4 py-3 border border-anthropic-border rounded-md focus:outline-none focus:ring-2 focus:ring-anthropic-accent focus:border-anthropic-accent resize-none text-anthropic-text bg-white font-mono text-sm leading-relaxed transition-all"
          />
          {tokens.length > 0 && (
            <div className="p-5 border border-anthropic-border rounded-md bg-anthropic-bg">
              <div className="text-xs font-medium text-anthropic-text-secondary mb-4 uppercase tracking-wide">
                {selectedTokenIndex !== null 
                  ? `Selected: Token ${selectedTokenIndex + 1} of ${tokens.length}`
                  : `Click a token to see conditional probabilities (${tokens.length} tokens)`}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tokenizedDisplay}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TextEditor
