'use client'

import { useState } from 'react'
import type { Wager, WagerType } from '@/lib/wager-types'
import { WAGER_TEMPLATES } from '@/lib/wager-types'

interface WagerManagerProps {
  wagers: Wager[]
  players: string[] // Player names
  onChange: (wagers: Wager[]) => void
}

export default function WagerManager({ wagers, players, onChange }: WagerManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [editingWager, setEditingWager] = useState<Wager | null>(null)

  const addWager = (templateKey?: string) => {
    const template = templateKey ? WAGER_TEMPLATES[templateKey] : WAGER_TEMPLATES.custom
    const newWager: Wager = {
      id: `wager_${Date.now()}`,
      type: template?.type || 'custom',
      description: template?.description || '',
      amount: template?.amount || '',
      config: template?.config ? { ...template.config } : undefined,
    }
    onChange([...wagers, newWager])
    setEditingWager(newWager)
    setShowAddForm(false)
    setSelectedTemplate('')
  }

  const updateWager = (id: string, updates: Partial<Wager>) => {
    onChange(wagers.map(w => w.id === id ? { ...w, ...updates } : w))
  }

  const removeWager = (id: string) => {
    onChange(wagers.filter(w => w.id !== id))
    setEditingWager(null)
  }

  const getWagerDisplay = (wager: Wager): string => {
    if (wager.type === 'skins' && wager.config?.skinValue) {
      return `$${wager.config.skinValue} per skin`
    }
    if (wager.type === 'nassau') {
      const parts: string[] = []
      if (wager.config?.frontValue) parts.push(`Front: $${wager.config.frontValue}`)
      if (wager.config?.backValue) parts.push(`Back: $${wager.config.backValue}`)
      if (wager.config?.overallValue) parts.push(`Overall: $${wager.config.overallValue}`)
      return parts.length > 0 ? parts.join(', ') : 'Nassau'
    }
    if (wager.amount) {
      return `$${wager.amount}`
    }
    return wager.description
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Wagers & Side Bets
        </label>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          {showAddForm ? 'Cancel' : '+ Add Wager'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Choose a template or create custom:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {Object.entries(WAGER_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                type="button"
                onClick={() => addWager(key)}
                className="px-3 py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500 transition text-left"
              >
                {template.description}
              </button>
            ))}
          </div>
        </div>
      )}

      {wagers.length === 0 && !showAddForm && (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          No wagers added. Click "+ Add Wager" to add one.
        </p>
      )}

      {wagers.map((wager) => (
        <div
          key={wager.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          {editingWager?.id === wager.id ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={wager.description}
                  onChange={(e) => updateWager(wager.id, { description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Wager description"
                />
              </div>

              {wager.type === 'skins' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Value per Skin
                  </label>
                  <input
                    type="text"
                    value={wager.config?.skinValue || ''}
                    onChange={(e) =>
                      updateWager(wager.id, {
                        config: { ...wager.config, skinValue: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 5"
                  />
                </div>
              )}

              {wager.type === 'nassau' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Front 9
                    </label>
                    <input
                      type="text"
                      value={wager.config?.frontValue || ''}
                      onChange={(e) =>
                        updateWager(wager.id, {
                          config: { ...wager.config, frontValue: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Back 9
                    </label>
                    <input
                      type="text"
                      value={wager.config?.backValue || ''}
                      onChange={(e) =>
                        updateWager(wager.id, {
                          config: { ...wager.config, backValue: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Overall
                    </label>
                    <input
                      type="text"
                      value={wager.config?.overallValue || ''}
                      onChange={(e) =>
                        updateWager(wager.id, {
                          config: { ...wager.config, overallValue: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="5"
                    />
                  </div>
                </div>
              )}

              {(wager.type === 'side' || wager.type === 'main' || wager.type === 'custom') && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="text"
                    value={wager.amount || ''}
                    onChange={(e) => updateWager(wager.id, { amount: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 20 or $20 per player"
                  />
                </div>
              )}

              {wager.type === 'side' && players.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Participants (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {players.map((player) => (
                      <label key={player} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={wager.participants?.includes(player) || false}
                          onChange={(e) => {
                            const current = wager.participants || []
                            const updated = e.target.checked
                              ? [...current, player]
                              : current.filter((p) => p !== player)
                            updateWager(wager.id, { participants: updated })
                          }}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{player}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {wager.type === 'side' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hole Number (optional, for hole-specific bets)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="18"
                    value={wager.holeNumber || ''}
                    onChange={(e) =>
                      updateWager(wager.id, {
                        holeNumber: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 5"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingWager(null)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => removeWager(wager.id)}
                  className="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{wager.description}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getWagerDisplay(wager)}
                  {wager.participants && wager.participants.length > 0 && (
                    <span className="ml-2">
                      ({wager.participants.join(', ')})
                    </span>
                  )}
                  {wager.holeNumber && <span className="ml-2">- Hole {wager.holeNumber}</span>}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingWager(wager)}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

