export type AgentIconType = 'home' | 'car'

export type AgentConfig = {
  id: 'real_estate' | 'car_dealer'
  title: string
  description: string
  capabilities: [string, string, string]
  contextFields: Array<{ key: string; label: string }>
  icon: AgentIconType
  userId: string
  voiceAgentId: string
  historyUrl: string
  widgetActionText: string
  widgetStartCallText: string
}

export const agents: AgentConfig[] = [
  {
    id: 'real_estate',
    title: 'Real Estate Agent',
    description: 'Find properties based on your budget, location, and timeline.',
    capabilities: [
      'Capture buyer requirements in real-time conversations',
      'Switch seamlessly between Hindi and English',
      'Recall past interactions and continue conversations naturally',
    ],
    contextFields: [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'property_type', label: 'Property Type' },
      { key: 'location', label: 'Location' },
      { key: 'budget', label: 'Budget' },
      { key: 'purpose', label: 'Purpose' },
      { key: 'timeline', label: 'Timeline' },
    ],
    icon: 'home',
    userId: 'admin',
    voiceAgentId: 'agent_5401kpzqvrehfnm9vqnwzv4qc0ks',
    historyUrl: '/api/n8n/webhook/v2/get-history/',
    widgetActionText: 'Talk to property advisor',
    widgetStartCallText: 'Start property demo',
  },
  {
    id: 'car_dealer',
    title: 'Car Dealer Agent',
    description: 'Help customers find the right car through real-time voice conversations and guided recommendations.',
    capabilities: [
      'Understand budget and vehicle preferences',
      'Suggest matching cars with clear trade-offs',
      'Assist with test drive booking and follow-ups',
    ],
    contextFields: [
      { key: 'name', label: 'Name' },
      { key: 'phone_number', label: 'Phone Number' },
      { key: 'car_type', label: 'Car Type' },
      { key: 'car_model', label: 'Car Model' },
      { key: 'budget', label: 'Budget' },
      { key: 'purpose', label: 'Purpose' },
      { key: 'timeline', label: 'Timeline' },
      // { key: 'preferred_action', label: 'Preferred Action' },
      // { key: 'notes', label: 'Notes' },
      // { key: 'lead_id', label: 'Lead ID' },
    ],
    icon: 'car',
    userId: 'testuser',
    voiceAgentId: 'agent_9401kq79hdt9e61vc8wkhaahbh38',
    historyUrl: 'https://n8n.ciphernutz.com/webhook/car-agent/v2/get-history/',
    widgetActionText: 'Talk to car advisor',
    widgetStartCallText: 'Start car demo',
  },
]
