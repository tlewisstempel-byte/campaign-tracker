import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Campaign } from '@/types'

export const revalidate = 60

export default async function CampaignsPage() {
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, keywords(*)')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-1">Campaign Tracker</h1>
        <p className="text-zinc-400 text-sm mb-8">Track X mentions and metrics per campaign</p>

        <div className="grid gap-4">
          {campaigns?.map((campaign: Campaign) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.slug}`}
              className="block bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-medium text-lg">{campaign.name}</h2>
                  {campaign.description && (
                    <p className="text-zinc-400 text-sm mt-1">{campaign.description}</p>
                  )}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {campaign.keywords?.map((k) => (
                      <span
                        key={k.id}
                        className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded"
                      >
                        {k.keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    campaign.active
                      ? 'bg-emerald-950 text-emerald-400'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {campaign.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
