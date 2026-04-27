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

type CustomerHistoryCardProps = {
  loading: boolean
  data: HistoryData | null
}

const FIELD_LABELS: Array<{ key: keyof HistoryData; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'property_type', label: 'Property Type' },
  { key: 'location', label: 'Location' },
  { key: 'budget', label: 'Budget' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'timeline', label: 'Timeline' },
]

function getSafeValue(value?: string) {
  if (!value || value === 'null') return 'Not provided'
  return value
}

function getFormattedDate(value?: string) {
  if (!value || value === 'null') return 'Not available'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return parsed.toLocaleString()
}

export function CustomerHistoryCard({ loading, data }: CustomerHistoryCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500 animate-pulse">Loading customer context...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">No previous customer context found.</p>
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Customer Context</h2>
          <p className="mt-1 text-sm text-gray-500">
            This is the latest history returned by the `get-history` API.
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          ID: {getSafeValue(data.id)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELD_LABELS.map((field) => (
          <div key={field.key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{field.label}</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{getSafeValue(data[field.key])}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Conversation Summary</p>
        <p className="mt-2 text-sm leading-6 text-gray-800">{getSafeValue(data.summary)}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 text-xs text-gray-500 sm:grid-cols-2">
        <p>
          <span className="font-medium text-gray-700">Created:</span> {getFormattedDate(data.created_at)}
        </p>
        <p>
          <span className="font-medium text-gray-700">Updated:</span> {getFormattedDate(data.updated_at)}
        </p>
      </div>
    </section>
  )
}
