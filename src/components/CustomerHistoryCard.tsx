type HistoryData = Record<string, string>

type CustomerHistoryCardProps = {
  loading: boolean
  data: HistoryData | null
  fieldLabels: Array<{ key: string; label: string }>
  refreshCountdown: number | null
  isRefreshingAfterCall: boolean
  isNewlyUpdated: boolean
}

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

export function CustomerHistoryCard({
  loading,
  data,
  fieldLabels,
  refreshCountdown,
  isRefreshingAfterCall,
  isNewlyUpdated,
}: CustomerHistoryCardProps) {
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
          ID: {getSafeValue(data.lead_id || data.id)}
        </span>
      </div>

      {isRefreshingAfterCall && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {refreshCountdown && refreshCountdown > 0
            ? `Fetching new data in ${refreshCountdown}s...`
            : 'Fetching new data...'}
        </div>
      )}

      {isNewlyUpdated && !isRefreshingAfterCall && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          New history update detected just now.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fieldLabels.map((field) => (
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
