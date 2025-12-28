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
          className={`inline-block px-2 py-1 rounded-anthropic transition-opacity cursor-pointer select-none font-mono text-sm ${
            isSelected
              ? 'bg-anthropic-accent text-white'
              : 'bg-anthropic-surface border border-anthropic-border text-anthropic-text hover:opacity-70'
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
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-normal text-anthropic-text mb-4">
          Text Input
        </label>
        
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onSelect={handleSelectionChange}
          placeholder="Type your text here..."
          className="w-full min-h-[200px] px-4 py-3 border border-anthropic-border rounded-anthropic focus:outline-none focus:border-anthropic-accent resize-none text-anthropic-text bg-anthropic-surface font-mono text-sm leading-relaxed transition-colors"
        />
      </div>
      
      {tokens.length > 0 && (
        <div className="pt-8 border-t border-anthropic-divider">
          <div className="text-xs font-normal text-anthropic-text-secondary mb-6">
            {selectedTokenIndex !== null 
              ? `Selected: Token ${selectedTokenIndex + 1} of ${tokens.length}`
              : `Click a token to see conditional probabilities (${tokens.length} tokens)`}
          </div>
          <div className="flex flex-wrap gap-2">
            {tokenizedDisplay}
          </div>
        </div>
      )}
    </div>
  )
}

export default TextEditor
