import type { AgentConfig } from '../config/agents'

type AgentCardProps = {
  agent: AgentConfig
  onStartDemo: (agent: AgentConfig) => void
  disabled?: boolean
}

function AgentIcon({ icon }: Pick<AgentConfig, 'icon'>) {
  if (icon === 'home') {
    return (
      <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10.5L12 3l9 7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.25 9.75V21h13.5V9.75" />
      </svg>
    )
  }

  return (
    <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M4 12l1.2-3.4A2 2 0 017.1 7h9.8a2 2 0 011.9 1.6L20 12M4 12v4m16-4v4M6 16h12"
      />
      <circle cx="7.5" cy="16.5" r="1.5" fill="currentColor" />
      <circle cx="16.5" cy="16.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function AgentCard({ agent, onStartDemo, disabled = false }: AgentCardProps) {
  return (
    <article className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
        <AgentIcon icon={agent.icon} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{agent.title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">{agent.description}</p>
      <ul className="mt-4 space-y-2 text-sm text-gray-700">
        {agent.capabilities.map((capability) => (
          <li key={capability} className="flex items-start gap-2">
            <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-indigo-500" />
            <span>{capability}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onStartDemo(agent)}
        disabled={disabled}
        className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 active:scale-[0.99] active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {disabled ? 'Connecting to agent...' : 'Start Demo'}
      </button>
    </article>
  )
}
