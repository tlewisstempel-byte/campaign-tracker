import { ApifyClient } from 'apify-client'

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN! })

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
  const run = await client.actor(ACTOR_ID).call({
    searchTerms: keywords,
    since,
    until,
    maxItems,
    addUserInfo: true,
    lang: 'en',
  })

  const { items } = await client.dataset(run.defaultDatasetId).listItems()
  return items as ApifyTweet[]
}
