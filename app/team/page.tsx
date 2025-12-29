'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TeamMember {
  id: string
  userId: string
  name: string
  email: string
  addedAt: string
}

interface Statistics {
  totalMembers: number
  totalRounds: number
  averageScore: number
  bestScore: number | null
  mostPlayedCourse: string | null
  roundsThisMonth: number
  memberStats: Array<{
    userId: string
    name: string
    roundsPlayed: number
    averageScore: number
    bestScore: number | null
  }>
}

interface LeaderboardEntry {
  userId: string
  name: string
  value: number
  display: string
}

interface Leaderboard {
  title: string
  type: string
  entries: LeaderboardEntry[]
}

interface Activity {
  id: string
  type: string
  userName: string
  courseName: string
  status: string
  mode: string
  players: Array<{ name: string; score: number | null }>
  createdAt: string
}

interface WagerStats {
  totalBet: number
  totalWon: number
  totalLost: number
  netAmount: number
  memberStats: Array<{
    name: string
    bet: number
    won: number
    lost: number
    net: number
  }>
}

type Tab = 'overview' | 'leaderboards' | 'activity' | 'members'

export default function TeamPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [wagerStats, setWagerStats] = useState<WagerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [showSearch, setShowSearch] = useState(false)
  const [adding, setAdding] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const initialize = async () => {
      await checkAuth()
      // Only load team after auth check completes
      // Small delay to ensure auth state is set
      setTimeout(() => {
        loadTeam()
      }, 100)
    }
    initialize()
  }, [])

  useEffect(() => {
    // Always load stats, even if no team members (to show empty state)
    loadStatistics()
    loadLeaderboards()
    loadActivity()
    loadWagerStats()
  }, [teamMembers])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      })
      
      if (!response.ok) {
        console.error('Auth check failed with status:', response.status)
        // Only redirect if it's a clear auth error (401), not server errors
        if (response.status === 401) {
          router.push('/login')
        }
        return
      }
      
      const data = await response.json()
      if (!data.user) {
        console.log('No user found in auth response, redirecting to login')
        router.push('/login')
      } else {
        console.log('Auth check successful, user:', data.user.email)
      }
    } catch (error) {
      console.error('Auth check error (network/database issue):', error)
      // Don't redirect on network errors - might be temporary
      // Only redirect if we're sure it's an auth issue
      // For now, let the page load and show errors if API calls fail
    }
  }

  const loadTeam = async () => {
    try {
      const response = await fetch('/api/team', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        const members = data.team?.members || []
        console.log('Loaded team members:', members)
        setTeamMembers(members)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to load team:', response.status, errorData)
      }
    } catch (error) {
      console.error('Failed to load team:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/team/statistics', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Loaded team statistics:', data.statistics)
        setStatistics(data.statistics)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to load statistics:', response.status, errorData)
      }
    } catch (error) {
      console.error('Failed to load statistics:', error)
    }
  }

  const loadLeaderboards = async () => {
    try {
      const response = await fetch('/api/team/leaderboard', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setLeaderboards(data.leaderboards || [])
      }
    } catch (error) {
      console.error('Failed to load leaderboards:', error)
    }
  }

  const loadActivity = async () => {
    try {
      const response = await fetch('/api/team/activity?limit=20', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to load activity:', error)
    }
  }

  const loadWagerStats = async () => {
    try {
      const response = await fetch('/api/team/wagers', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setWagerStats(data)
      }
    } catch (error) {
      console.error('Failed to load wager statistics:', error)
    }
  }

  const searchUsers = async (query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!query || query.trim().length < 2) {
      setSearchResults([])
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/team/search?q=${encodeURIComponent(query.trim())}`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          const users = data.users || []
          setSearchResults(users)
          
          // Log for debugging
          if (users.length === 0 && query.trim().length >= 2) {
            console.log('Search returned no results for:', query.trim())
            console.log('This could mean:')
            console.log('1. No users match the search query')
            console.log('2. All matching users are already in your team')
            console.log('3. All matching users have already added you to their team')
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('Search failed:', response.status, errorData)
        }
      } catch (error) {
        console.error('Failed to search users:', error)
      }
    }, 300)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    searchUsers(query)
  }

  const addMember = async (userId: string) => {
    setAdding(true)
    try {
      console.log('[addMember] Attempting to add user:', userId)
      
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      })

      console.log('[addMember] Response status:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('[addMember] Successfully added member:', data.member)
        setTeamMembers([...teamMembers, data.member])
        setSearchQuery('')
        setSearchResults([])
        setShowSearch(false)
        // Reload stats after adding member
        loadStatistics()
        loadLeaderboards()
        loadActivity()
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[addMember] Failed to add member:', response.status, error)
        
        // Handle specific error cases
        if (response.status === 401) {
          // Session expired or invalid - refresh auth and show helpful message
          console.log('[addMember] Unauthorized - checking auth status')
          const authResponse = await fetch('/api/auth/me', {
            credentials: 'include',
            cache: 'no-store',
          })
          const authData = await authResponse.json().catch(() => ({ user: null }))
          
          if (!authData.user) {
            alert('Your session has expired. Please log in again.')
            router.push('/login')
            return
          } else {
            // Auth is valid, but the team API call failed - retry once
            console.log('[addMember] Auth is valid, retrying add member request')
            const retryResponse = await fetch('/api/team', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ userId }),
            })
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json()
              setTeamMembers([...teamMembers, retryData.member])
              setSearchQuery('')
              setSearchResults([])
              setShowSearch(false)
              loadStatistics()
              loadLeaderboards()
              loadActivity()
              return
            }
          }
        }
        
        // Show user-friendly error message
        const errorMessage = error.error || 
          (response.status === 401 ? 'Your session has expired. Please log in again.' :
           response.status === 404 ? 'User not found.' :
           response.status === 400 ? error.error || 'Invalid request.' :
           'Failed to add member. Please try again.')
        alert(errorMessage)
      }
    } catch (error) {
      console.error('[addMember] Exception while adding member:', error)
      alert('Network error. Please check your connection and try again.')
    } finally {
      setAdding(false)
    }
  }

  const removeMember = async (userId: string) => {
    if (!confirm('Remove this member from your team?')) return

    try {
      const response = await fetch(`/api/team?userId=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setTeamMembers(teamMembers.filter(m => m.userId !== userId))
        // Reload stats after removing member
        loadStatistics()
        loadLeaderboards()
        loadActivity()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to remove member')
      }
    } catch (error) {
      console.error('Failed to remove member:', error)
      alert('Failed to remove member')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'leaderboards', label: 'Leaderboards' },
    { id: 'activity', label: 'Activity' },
    { id: 'members', label: 'Members' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-8">
          My Team
        </h1>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-gray-200 dark:border-green-800/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-green-600 text-green-600 dark:text-green-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {statistics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-green-800/30">
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Team Members</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{statistics.totalMembers}</div>
                  </div>
                  <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-green-800/30">
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Total Rounds</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{statistics.totalRounds}</div>
                  </div>
                  <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-green-800/30">
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Average Score</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {statistics.averageScore > 0 ? statistics.averageScore : '-'}
                    </div>
                  </div>
                  <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-green-800/30">
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Best Score</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {statistics.bestScore ? statistics.bestScore : '-'}
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Member Statistics</h2>
                  {statistics.memberStats.length > 0 ? (
                    <div className="space-y-3">
                      {statistics.memberStats.map((member) => (
                        <div
                          key={member.userId}
                          className="flex justify-between items-center p-3 bg-white/50 dark:bg-green-800/30 rounded-lg"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                          <div className="flex gap-4 text-sm text-gray-700 dark:text-gray-300">
                            <span>{member.roundsPlayed} rounds</span>
                            <span>Avg: {member.averageScore > 0 ? member.averageScore : '-'}</span>
                            {member.bestScore && <span>Best: {member.bestScore}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300">No statistics available yet.</p>
                  )}
                </div>

                {statistics.mostPlayedCourse && (
                  <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-green-800/30">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Most Played Course</h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300">{statistics.mostPlayedCourse}</p>
                  </div>
                )}

                {/* Wager Statistics */}
                {wagerStats && (
                  <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-green-800/30">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">💰 Wager Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white/50 dark:bg-green-800/30 rounded-lg p-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Total Bet</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {`$${wagerStats.totalBet.toFixed(2)}`}
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Total Won</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {`$${wagerStats.totalWon.toFixed(2)}`}
                        </div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Total Lost</div>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {`$${wagerStats.totalLost.toFixed(2)}`}
                        </div>
                      </div>
                      <div className={`rounded-lg p-4 ${
                        wagerStats.netAmount >= 0
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'
                      }`}>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Net Amount</div>
                        <div className={`text-2xl font-bold ${
                          wagerStats.netAmount >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {wagerStats.netAmount >= 0 ? '+' : ''}{`$${wagerStats.netAmount.toFixed(2)}`}
                        </div>
                      </div>
                    </div>
                    {wagerStats.memberStats.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">By Member</h3>
                        <div className="space-y-2">
                          {wagerStats.memberStats.map((member) => (
                            <div
                              key={member.name}
                              className="flex justify-between items-center p-3 bg-white/50 dark:bg-green-800/30 rounded-lg"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                              <div className="flex gap-4 text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Won: <span className="font-medium text-green-600 dark:text-green-400">{`$${member.won.toFixed(2)}`}</span>
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  Lost: <span className="font-medium text-red-600 dark:text-red-400">{`$${member.lost.toFixed(2)}`}</span>
                                </span>
                                <span className={`font-semibold ${
                                  member.net >= 0
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  Net: {member.net >= 0 ? '+' : ''}{`$${member.net.toFixed(2)}`}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 text-center">
                <p className="text-gray-500 dark:text-gray-400">Loading statistics...</p>
              </div>
            )}
          </div>
        )}

        {/* Leaderboards Tab */}
        {activeTab === 'leaderboards' && (
          <div className="space-y-6">
            {leaderboards.length > 0 ? (
              leaderboards.map((leaderboard) => (
              <div
                key={leaderboard.type}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{leaderboard.title}</h2>
                {leaderboard.entries.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.entries.map((entry, index) => (
                      <div
                        key={entry.userId}
                        className={`flex justify-between items-center p-3 rounded-lg ${
                          index === 0
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400'
                            : 'bg-white/50 dark:bg-green-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-600 dark:text-gray-400 w-6">
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">{entry.name}</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{entry.display}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No data available yet.</p>
                )}
              </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No leaderboards available yet.</p>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link
                        href={`/rounds/${activity.id}`}
                        className="font-semibold text-green-600 dark:text-green-400 hover:underline"
                      >
                        {activity.courseName}
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.userName} {activity.status === 'completed' ? 'completed' : 'created'} a round
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {activity.players.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-green-800/30">
                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Players:</div>
                      <div className="flex flex-wrap gap-2">
                        {activity.players.map((player, idx) => (
                          <span
                            key={idx}
                            className="text-sm px-2 py-1 bg-gray-100 dark:bg-green-800/30 rounded"
                          >
                            {player.name}
                            {player.score && <span className="ml-1 font-medium">({player.score})</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 text-center">
                <p className="text-gray-500 dark:text-gray-400">No activity yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h2>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all shadow-md hover:shadow-lg ${
                  showSearch
                    ? 'bg-gray-600 dark:bg-green-800/50 text-white hover:bg-gray-700 dark:hover:bg-green-800/70'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                }`}
              >
                {showSearch ? (
                  <>
                    <span>✕</span>
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">+</span>
                    <span>Add Member</span>
                  </>
                )}
              </button>
            </div>

            {showSearch && (
              <div className="mb-6 relative transition-all duration-200">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by name or email..."
                    autoFocus
                    className="w-full px-4 py-3 pl-10 border-2 border-gray-300 dark:border-green-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-green-900/20 dark:text-white transition-all"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">🔍</span>
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-green-900/30 border-2 border-gray-200 dark:border-green-700 rounded-xl shadow-xl max-h-64 overflow-y-auto transition-all duration-200">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => addMember(user.id)}
                        disabled={adding}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border-b border-gray-100 dark:border-green-800/30 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</div>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-green-900/30 border-2 border-gray-200 dark:border-green-700 rounded-xl shadow-xl p-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="text-center mb-2">No users found matching "{searchQuery}"</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
                      They may already be in your team or haven't created an account yet
                    </div>
                  </div>
                )}
              </div>
            )}

            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No team members yet.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Add members to your team to include them in rounds.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex justify-between items-center p-4 bg-white/50 dark:bg-green-800/30 rounded-lg border border-gray-200/50 dark:border-green-700"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                    </div>
                    <button
                      onClick={() => removeMember(member.userId)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
