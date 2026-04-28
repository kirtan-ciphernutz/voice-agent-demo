import { AgentCard } from './AgentCard'
import type { AgentConfig } from '../config/agents'

type AgentGridProps = {
  agents: AgentConfig[]
  onStartDemo: (agent: AgentConfig) => void
  connectingAgentId: string | null
}

export function AgentGrid({ agents, onStartDemo, connectingAgentId }: AgentGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onStartDemo={onStartDemo}
          disabled={Boolean(connectingAgentId)}
        />
      ))}
    </div>
  )
}
