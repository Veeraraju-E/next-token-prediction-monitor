import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function ProbabilityChart({ predictions, loading, selectedTokenIndex }) {
  const chartData = useMemo(() => {
    if (!predictions || Object.keys(predictions).length === 0) {
      return []
    }

    // Convert predictions to array and sort by probability
    const data = Object.entries(predictions)
      .map(([token, prob]) => ({
        token: token.length > 25 ? token.substring(0, 25) + '...' : token,
        fullToken: token,
        probability: prob,
        percentage: (prob * 100).toFixed(2)
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 30) // Show top 30

    return data
  }, [predictions])

  const getColor = (index) => {
    // Muted, understated colors
    const colors = [
      '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd',
      '#bfdbfe', '#dbeafe', '#eff6ff'
    ]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="pt-12 pb-16">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border border-anthropic-border border-t-anthropic-accent mb-4"></div>
            <div className="text-anthropic-text-secondary text-sm">Loading predictions...</div>
          </div>
        </div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="pt-12 pb-16">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-anthropic-text-secondary text-sm">
              Click on a token above to see conditional probabilities
            </div>
          </div>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-anthropic-surface border border-anthropic-border rounded-anthropic shadow-anthropic-subtle p-3">
          <p className="font-mono text-sm font-normal mb-1 text-anthropic-text">{data.fullToken}</p>
          <p className="text-xs text-anthropic-text-secondary">
            Probability: <span className="font-normal text-anthropic-text">{data.percentage}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="pt-8 border-t border-anthropic-divider">
      <div className="mb-8">
        <h3 className="text-lg font-medium text-anthropic-text mb-2">
          Conditional Probabilities{selectedTokenIndex !== null ? ` (Token ${selectedTokenIndex + 1})` : ''}
        </h3>
        <p className="text-sm text-anthropic-text-secondary">
          Top {chartData.length} most likely tokens
        </p>
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 100, bottom: 5 }}
        >
          <XAxis 
            type="number" 
            domain={[0, 'dataMax']}
            tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
            stroke="#d1d5db"
            fontSize={11}
            tick={{ fill: '#6b7280' }}
            axisLine={false}
          />
          <YAxis 
            type="category" 
            dataKey="token"
            width={90}
            stroke="#d1d5db"
            fontSize={11}
            tick={{ fill: '#6b7280' }}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="probability" radius={[0, 2, 2, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(index)} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-10 pt-8 border-t border-anthropic-divider">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <span className="text-anthropic-text-secondary">Most Likely: </span>
            <span className="font-mono font-normal text-anthropic-text">
              {chartData[0]?.fullToken || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-anthropic-text-secondary">Probability: </span>
            <span className="font-normal text-anthropic-text">
              {chartData[0]?.percentage || '0.00'}%
            </span>
          </div>
          <div>
            <span className="text-anthropic-text-secondary">Total Tokens: </span>
            <span className="font-normal text-anthropic-text">
              {Object.keys(predictions).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProbabilityChart
