import { supabase } from '@/lib/supabase'
import { computeMetrics } from '@/lib/metrics'
import { Post } from '@/types'
import { notFound } from 'next/navigation'
import MetricsSummary from '@/components/MetricsSummary'
import PostsTable from '@/components/PostsTable'
import ScrapeButton from '@/components/ScrapeButton'
import DeleteCampaignButton from '@/components/DeleteCampaignButton'

export const revalidate = 0

type Props = { params: Promise<{ slug: string }> }

export default async function CampaignPage({ params }: Props) {
  const { slug } = await params

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*, keywords(*)')
    .eq('slug', slug)
    .single()

  if (!campaign) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('campaign_id', campaign.id)
    .order('posted_at', { ascending: false })
    .limit(200)

  const { data: lastRun } = await supabase
    .from('scrape_runs')
    .select('*')
    .eq('campaign_id', campaign.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  const metrics = computeMetrics((posts ?? []) as Post[])

  return (
    <main className="min-h-screen text-zinc-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <a href="/campaigns" className="text-zinc-500 text-sm hover:text-zinc-300 mb-2 inline-block">
              ← All campaigns
            </a>
            <h1 className="text-2xl font-semibold">{campaign.name}</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              {campaign.keywords?.map((k: { id: string; keyword: string }) => (
                <span key={k.id} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                  {k.keyword}
                </span>
              ))}
            </div>
            {lastRun && (
              <p className="text-zinc-500 text-xs mt-2">
                Last scraped: {new Date(lastRun.started_at).toLocaleString()} · {lastRun.posts_found} posts found
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <DeleteCampaignButton campaignId={campaign.id} />
            <ScrapeButton campaignId={campaign.id} />
          </div>
        </div>

        {/* Metrics */}
        <MetricsSummary metrics={metrics} />

        {/* Posts */}
        <div className="mt-8">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            Posts ({posts?.length ?? 0})
          </h2>
          <PostsTable posts={(posts ?? []) as Post[]} />
        </div>
      </div>
    </main>
  )
}
