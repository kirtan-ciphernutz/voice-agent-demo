import { useState, useEffect } from 'react'
import { ElevenLabsWidget } from './ElevenLabsWidget'
import { CustomerHistoryCard } from './components/CustomerHistoryCard'
import './index.css'

// Hardcoded test users
const USERS = [
  { username: 'admin', password: 'admin123' },
  { username: 'testuser', password: 'test456' },
]

// The Agent ID placeholder
const AGENT_ID = 'agent_5401kpzqvrehfnm9vqnwzv4qc0ks'

const HISTORY_URL = '/api/n8n/webhook/v2/get-history/'
const AUTH_STORAGE_KEY = 'voice-agent-auth-user'

type HistoryData = {
  id?: string
  user_id?: string
  name?: string
  phone?: string
  property_type?: string
  location?: string
  budget?: string
  purpose?: string
  timeline?: string
  summary?: string
  created_at?: string
  updated_at?: string
}

function normalizeValue(value: unknown) {
  if (value === null || value === undefined) return ''
  return String(value)
}

export default function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState('')
  const [historyData, setHistoryData] = useState<HistoryData | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!storedUser) return

    const isKnownUser = USERS.some((user) => user.username === storedUser)
    if (!isKnownUser) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return
    }

    setLoggedIn(true)
    setLoggedInUser(storedUser)
  }, [])

  // Fetch conversation history when user logs in
  useEffect(() => {
    if (!loggedIn || !loggedInUser) return

    const fetchHistory = async () => {
      setLoadingHistory(true)
      try {
        const res = await fetch(HISTORY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: loggedInUser }),
        })
        if (res.ok) {
          const data = await res.json()
          setHistoryData({
            id: normalizeValue(data.id),
            user_id: normalizeValue(data.user_id),
            name: normalizeValue(data.name),
            phone: normalizeValue(data.phone),
            property_type: normalizeValue(data.property_type),
            location: normalizeValue(data.location),
            budget: normalizeValue(data.budget),
            purpose: normalizeValue(data.purpose),
            timeline: normalizeValue(data.timeline),
            summary: normalizeValue(data.summary),
            created_at: normalizeValue(data.created_at),
            updated_at: normalizeValue(data.updated_at),
          })
        }
      } catch (err) {
        console.error('Failed to fetch conversation history:', err)
      } finally {
        setLoadingHistory(false)
      }
    }

    fetchHistory()
  }, [loggedIn, loggedInUser])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const match = USERS.find(
      (u) => u.username === username && u.password === password
    )

    if (match) {
      setLoggedIn(true)
      setLoggedInUser(username)
      localStorage.setItem(AUTH_STORAGE_KEY, username)
    } else {
      setError('Invalid username or password.')
    }
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setLoggedInUser('')
    setUsername('')
    setPassword('')
    setError('')
    setHistoryData(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  if (loggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Welcome, <span className="text-indigo-600">{loggedInUser}</span>
              </h1>
              <p className="text-sm text-gray-500">Use the context card and talk to the assistant.</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-lg border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CustomerHistoryCard loading={loadingHistory} data={historyData} />
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Voice Assistant</h2>
              <p className="text-sm text-gray-500">
                The same history is passed as dynamic variables to personalize the call.
              </p>
              <ElevenLabsWidget
                agentId={AGENT_ID}
                actionText="Chat with Realty"
                startCallText="Find your home"
                dynamicVariables={{
                  user_id: loggedInUser,
                  previous_conversation_summary:
                    historyData?.summary && historyData.summary !== 'null' ? historyData.summary : '',
                  name: historyData?.name ?? '',
                  phone: historyData?.phone ?? '',
                  property_type: historyData?.property_type ?? '',
                  location: historyData?.location ?? '',
                  budget: historyData?.budget ?? '',
                  purpose: historyData?.purpose ?? '',
                  timeline: historyData?.timeline ?? '',
                }}
              />
            </section>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Sign in</h1>
          <p className="mt-1 text-sm text-gray-500">Voice Agent Demo</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </form>
        </div>

        {/* Test credentials hint */}
        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 space-y-1">
          <p className="font-semibold text-amber-800">Test credentials</p>
          <p><span className="font-medium">admin</span> / admin123</p>
          <p><span className="font-medium">testuser</span> / test456</p>
        </div>
      </div>
    </div>
  )
}
