const ACTOR_ID = '61RPP7dywgiy0JPD0'
const BASE = 'https://api.apify.com/v2'

export type ApifyTweet = {
  id: string
  text: string
  createdAt: string
  url: string
  likeCount: number
  retweetCount: number
  replyCount: number
  viewCount: number
  author: {
    userName: string
    displayName: string
    followers: number
  }
}

export async function runScrape(
  keywords: string[],
  since: string,
  until: string,
  maxItems = 500
): Promise<ApifyTweet[]> {
  const token = process.env.APIFY_API_TOKEN!
  const searchTerms = keywords.map(k => `${k} since:${since} until:${until}`)

  // Start the actor run
  const startRes = await fetch(
    `${BASE}/acts/${encodeURIComponent(ACTOR_ID)}/runs?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchTerms, maxItems, addUserInfo: true, lang: 'en', queryType: 'Latest' }),
    }
  )
  if (!startRes.ok) throw new Error(`Failed to start actor: ${await startRes.text()}`)
  const { data: run } = await startRes.json()

  // Poll until finished (max ~4 min)
  const runId = run.id
  for (let i = 0; i < 48; i++) {
    await new Promise(r => setTimeout(r, 5000))
    const statusRes = await fetch(`${BASE}/actor-runs/${runId}?token=${token}`)
    const { data: status } = await statusRes.json()
    if (status.status === 'SUCCEEDED') {
      const itemsRes = await fetch(
        `${BASE}/datasets/${status.defaultDatasetId}/items?token=${token}&clean=true`
      )
      const items = await itemsRes.json()
      console.log('[apify] items count:', items?.length, 'first item:', JSON.stringify(items?.[0], null, 2))
      return items as ApifyTweet[]
    }
    if (status.status === 'FAILED' || status.status === 'ABORTED' || status.status === 'TIMED-OUT') {
      throw new Error(`Actor run ${status.status}`)
    }
  }
  throw new Error('Actor run timed out waiting for results')
}
