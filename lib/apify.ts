// Actor ID for the Twitter scraper - update if you switch actors
const ACTOR_ID = 'apidojo/tweet-scraper'

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
  const { ApifyClient } = await import('apify-client')
  const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN! })

  // Embed date filters directly in each query (Twitter advanced search syntax)
  const searchTerms = keywords.map(k => `${k} since:${since} until:${until}`)

  const run = await client.actor(ACTOR_ID).call({
    searchTerms,
    maxItems,
    addUserInfo: true,
    lang: 'en',
    queryType: 'Latest',
  })

  const { items } = await client.dataset(run.defaultDatasetId).listItems()
  return items as ApifyTweet[]
}
