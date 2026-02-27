const BASE = 'https://api.twitterapi.io/twitter/tweet/advanced_search'

export type Tweet = {
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

type RawTweet = {
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
    name: string
    followers: number
  }
}

async function searchPage(
  query: string,
  cursor: string,
  apiKey: string
): Promise<{ tweets: RawTweet[]; has_next_page: boolean; next_cursor: string }> {
  const params = new URLSearchParams({ query, queryType: 'Latest' })
  if (cursor) params.set('cursor', cursor)

  const res = await fetch(`${BASE}?${params}`, {
    headers: { 'X-API-Key': apiKey },
  })
  if (!res.ok) throw new Error(`twitterapi.io error ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function runScrape(
  keywords: string[],
  since: string,
  until: string,
  maxItems = 500
): Promise<Tweet[]> {
  const apiKey = process.env.TWITTERAPI_KEY!
  const all: Tweet[] = []

  for (const keyword of keywords) {
    const query = `${keyword} since:${since} until:${until} lang:en`
    let cursor = ''

    while (all.length < maxItems) {
      const data = await searchPage(query, cursor, apiKey)
      for (const t of data.tweets) {
        all.push({
          id: t.id,
          text: t.text,
          createdAt: t.createdAt,
          url: t.url,
          likeCount: t.likeCount ?? 0,
          retweetCount: t.retweetCount ?? 0,
          replyCount: t.replyCount ?? 0,
          viewCount: t.viewCount ?? 0,
          author: {
            userName: t.author?.userName ?? '',
            displayName: t.author?.name ?? '',
            followers: t.author?.followers ?? 0,
          },
        })
      }
      if (!data.has_next_page || !data.next_cursor) break
      cursor = data.next_cursor
    }
  }

  console.log('[twitterapi] total tweets fetched:', all.length)
  return all.slice(0, maxItems)
}
