import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ElevenLabsWidget } from './ElevenLabsWidget'
import { CustomerHistoryCard } from './components/CustomerHistoryCard'
import { AgentGrid } from './components/AgentGrid'
import { agents, type AgentConfig } from './config/agents'
import './index.css'

const USERS = [
  { username: 'admin', password: 'admin123' },
  { username: 'testuser', password: 'test456' },
]

const AUTH_STORAGE_KEY = 'voice-agent-auth-user'

type HistoryData = Record<string, string>

function normalizeValue(value: unknown) {
  if (value === null || value === undefined) return ''
  return String(value)
}

function normalizeHistoryPayload(payload: unknown): HistoryData {
  if (!payload || typeof payload !== 'object') return {}
  return Object.entries(payload as Record<string, unknown>).reduce<HistoryData>((acc, [key, value]) => {
    acc[key] = normalizeValue(value)
    return acc
  }, {})
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export default function App() {
  const [authError, setAuthError] = useState('')
  const [loggedInUser, setLoggedInUser] = useState('')
  const [historyData, setHistoryData] = useState<HistoryData | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [connectingAgentId, setConnectingAgentId] = useState<string | null>(null)
  const [activeAgent, setActiveAgent] = useState<AgentConfig | null>(null)
  const [refreshCountdown, setRefreshCountdown] = useState<number | null>(null)
  const [isRefreshingAfterCall, setIsRefreshingAfterCall] = useState(false)
  const [isNewlyUpdated, setIsNewlyUpdated] = useState(false)

  const refreshTimeoutRef = useRef<number | null>(null)
  const refreshIntervalRef = useRef<number | null>(null)

  const isAuthenticated = Boolean(loggedInUser)

  const activeAgentForSession = useMemo(() => {
    if (activeAgent) return activeAgent
    if (!loggedInUser) return null
    return agents.find((agent) => agent.userId === loggedInUser) ?? agents[0]
  }, [activeAgent, loggedInUser])

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!storedUser) return

    const isKnownUser = USERS.some((user) => user.username === storedUser)
    if (!isKnownUser) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return
    }

    setLoggedInUser(storedUser)
    const defaultAgent = agents.find((agent) => agent.userId === storedUser) ?? null
    setActiveAgent(defaultAgent)
  }, [])

  const clearRefreshTimers = useCallback(() => {
    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current)
      refreshTimeoutRef.current = null
    }
    if (refreshIntervalRef.current) {
      window.clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }
  }, [])

  const fetchHistory = useCallback(
    async (compareAgainstUpdatedAt?: string) => {
      if (!isAuthenticated || !loggedInUser || !activeAgentForSession) return

      setLoadingHistory(true)
      try {
        const res = await fetch(activeAgentForSession.historyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: loggedInUser }),
        })
        if (res.ok) {
          const data = await res.json()
          const nextData = normalizeHistoryPayload(data)
          setHistoryData(nextData)

          if (compareAgainstUpdatedAt !== undefined) {
            setIsNewlyUpdated(
              Boolean(
                nextData.updated_at &&
                  compareAgainstUpdatedAt &&
                  nextData.updated_at !== compareAgainstUpdatedAt
              )
            )
          }
        }
      } catch (err) {
        console.error('Failed to fetch conversation history:', err)
      } finally {
        setLoadingHistory(false)
      }
    },
    [isAuthenticated, loggedInUser, activeAgentForSession]
  )

  useEffect(() => {
    void fetchHistory()
  }, [fetchHistory])

  const startVoiceSession = async (agent: AgentConfig) => {
    setAuthError('')
    setConnectingAgentId(agent.id)
    clearRefreshTimers()
    setRefreshCountdown(null)
    setIsRefreshingAfterCall(false)
    setIsNewlyUpdated(false)
    await sleep(800)
    setActiveAgent(agent)
    setConnectingAgentId(null)
  }

  const loginWithAgentUser = (agent: AgentConfig) => {
    const accountExists = USERS.some((user) => user.username === agent.userId)
    if (!accountExists) {
      setAuthError(`No test account found for ${agent.title}.`)
      return false
    }
    setLoggedInUser(agent.userId)
    localStorage.setItem(AUTH_STORAGE_KEY, agent.userId)
    return true
  }

  const handleStartDemo = async (agent: AgentConfig) => {
    if (!isAuthenticated) {
      const loggedIn = loginWithAgentUser(agent)
      if (!loggedIn) return
    } else if (loggedInUser !== agent.userId) {
      const loggedIn = loginWithAgentUser(agent)
      if (!loggedIn) return
    }
    await startVoiceSession(agent)
  }

  const handleLogout = () => {
    clearRefreshTimers()
    setLoggedInUser('')
    setHistoryData(null)
    setActiveAgent(null)
    setAuthError('')
    setConnectingAgentId(null)
    setRefreshCountdown(null)
    setIsRefreshingAfterCall(false)
    setIsNewlyUpdated(false)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  const handleCallEnded = useCallback(() => {
    clearRefreshTimers()
    const baseUpdatedAt = historyData?.updated_at ?? ''
    setIsRefreshingAfterCall(true)
    setIsNewlyUpdated(false)
    setRefreshCountdown(15)

    refreshIntervalRef.current = window.setInterval(() => {
      setRefreshCountdown((current) => {
        if (current === null) return null
        if (current <= 1) {
          if (refreshIntervalRef.current) {
            window.clearInterval(refreshIntervalRef.current)
            refreshIntervalRef.current = null
          }
          return 0
        }
        return current - 1
      })
    }, 1000)

    refreshTimeoutRef.current = window.setTimeout(() => {
      void fetchHistory(baseUpdatedAt).finally(() => {
        setIsRefreshingAfterCall(false)
        setRefreshCountdown(null)
      })
    }, 15000)
  }, [clearRefreshTimers, fetchHistory, historyData?.updated_at])

  useEffect(() => {
    return () => {
      clearRefreshTimers()
    }
  }, [clearRefreshTimers])

  if (isAuthenticated && activeAgentForSession) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {activeAgentForSession.title} Demo
              </h1>
              <p className="text-sm text-gray-500">
                Signed in as <span className="font-medium text-gray-700">{loggedInUser}</span>.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-lg border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CustomerHistoryCard
              loading={loadingHistory}
              data={historyData}
              fieldLabels={activeAgentForSession.contextFields}
              refreshCountdown={refreshCountdown}
              isRefreshingAfterCall={isRefreshingAfterCall}
              isNewlyUpdated={isNewlyUpdated}
            />
            <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Voice Session</h2>
              <p className="text-sm text-gray-500">
                Real-time voice interaction with dynamic context and conversation history.
              </p>
              <p className="text-xs text-gray-500">Microphone access required.</p>
              <ElevenLabsWidget
                agentId={activeAgentForSession.voiceAgentId}
                actionText={activeAgentForSession.widgetActionText}
                startCallText={activeAgentForSession.widgetStartCallText}
                onCallEnded={handleCallEnded}
                dynamicVariables={{
                  user_id: loggedInUser,
                  agent_type: activeAgentForSession.id,
                  previous_conversation_summary:
                    historyData?.summary && historyData.summary !== 'null' ? historyData.summary : '',
                  name: historyData?.name ?? '',
                  phone: historyData?.phone || historyData?.phone_number || '',
                  property_type: historyData?.property_type ?? '',
                  car_type: historyData?.car_type ?? '',
                  car_model: historyData?.car_model ?? '',
                  location: historyData?.location ?? '',
                  budget: historyData?.budget ?? '',
                  purpose: historyData?.purpose ?? '',
                  timeline: historyData?.timeline ?? '',
                  preferred_action: historyData?.preferred_action ?? '',
                  notes: historyData?.notes ?? '',
                }}
              />
            </section>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            Test AI Voice Agents in Real Conversations
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
            Interact with domain-specific AI agents using real-time voice conversations.
          </p>
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
            This demo showcases real-time AI voice interactions.
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">Enterprise ready</span>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">Low latency voice</span>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">Domain-specific agents</span>
          </div>
        </header>

        <AgentGrid
          agents={agents}
          onStartDemo={(agent) => {
            void handleStartDemo(agent)
          }}
          connectingAgentId={connectingAgentId}
        />

        {authError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {authError}
          </p>
        )}
      </div>
    </div>
  )
}
