import { CampaignMetrics } from '@/types'

type Props = { metrics: CampaignMetrics }

const statCards: { label: string; key: keyof CampaignMetrics; suffix?: string }[] = [
  { label: 'Posts', key: 'totalPosts' },
  { label: 'Likes', key: 'totalLikes' },
  { label: 'Retweets', key: 'totalRetweets' },
  { label: 'Replies', key: 'totalReplies' },
  { label: 'Views', key: 'totalViews' },
  { label: 'Eng. Rate', key: 'engagementRate', suffix: '%' },
]

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export default function MetricsSummary({ metrics }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {statCards.map(({ label, key, suffix }) => (
        <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 mb-1">{label}</p>
          <p className="text-xl font-semibold">
            {fmt(metrics[key] as number)}
            {suffix ?? ''}
          </p>
        </div>
      ))}
    </div>
  )
}
