import { useState, useEffect } from 'react'
import { ElevenLabsWidget } from './ElevenLabsWidget'
import './index.css'

// Hardcoded test users
const USERS = [
  { username: 'admin', password: 'admin123' },
  { username: 'testuser', password: 'test456' },
]

// The Agent ID placeholder
const AGENT_ID = 'agent_5401kpzqvrehfnm9vqnwzv4qc0ks'

const HISTORY_URL = '/api/n8n/webhook/get-history/'

export default function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState('')
  const [previousSummary, setPreviousSummary] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)

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
          setPreviousSummary(data.summary || '')
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
  }

  if (loggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="text-5xl">👋</div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome, <span className="text-indigo-600">{loggedInUser}</span>!
          </h1>
          <p className="text-gray-500 text-sm">You are successfully logged in.</p>

          <button
            onClick={handleLogout}
            className="text-sm text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
          >
            Sign out
          </button>

          {loadingHistory ? (
            <p className="text-sm text-gray-400 animate-pulse">Loading conversation history…</p>
          ) : (
            <ElevenLabsWidget
              agentId={AGENT_ID}
              actionText="Chat with Realty"
              startCallText="Find your home"
              dynamicVariables={
                previousSummary
                  ? { previous_conversation_summary: previousSummary, user_id: loggedInUser }
                  : { user_id: loggedInUser }
              }
            />
          )}
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