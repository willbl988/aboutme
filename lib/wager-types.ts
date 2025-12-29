// Wager types and interfaces

export type WagerType = 'main' | 'skins' | 'nassau' | 'side' | 'custom'

export interface Wager {
  id: string
  type: WagerType
  description: string
  amount?: string
  participants?: string[] // Player names for side bets
  holeNumber?: number // For hole-specific bets
  config?: {
    // For skins: value per skin
    skinValue?: string
    // For nassau: front 9, back 9, overall
    frontValue?: string
    backValue?: string
    overallValue?: string
    // For side bets: custom configuration
    [key: string]: any
  }
}

export const WAGER_TEMPLATES: Record<string, Partial<Wager>> = {
  main: {
    type: 'main',
    description: 'Main Wager',
    amount: '',
  },
  skins: {
    type: 'skins',
    description: 'Skins Game',
    config: {
      skinValue: '',
    },
  },
  nassau: {
    type: 'nassau',
    description: 'Nassau',
    config: {
      frontValue: '',
      backValue: '',
      overallValue: '',
    },
  },
  closestToPin: {
    type: 'side',
    description: 'Closest to Pin',
    amount: '',
  },
  longestDrive: {
    type: 'side',
    description: 'Longest Drive',
    amount: '',
  },
  firstBirdie: {
    type: 'side',
    description: 'First Birdie',
    amount: '',
  },
  greenie: {
    type: 'side',
    description: 'Greenie (Closest to Pin on Par 3s)',
    amount: '',
  },
  sandie: {
    type: 'side',
    description: 'Sandie (Up & Down from Bunker)',
    amount: '',
  },
  barkie: {
    type: 'side',
    description: 'Barkie (Up & Down from Trees)',
    amount: '',
  },
  custom: {
    type: 'custom',
    description: 'Custom Wager',
    amount: '',
  },
}

