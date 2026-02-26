export type Campaign = {
  id: string
  name: string
  slug: string
  description: string | null
  active: boolean
  scrape_days: number
  min_engagement: number
  max_engagement: number | null
  created_at: string
  keywords?: Keyword[]
}

export type Keyword = {
  id: string
  campaign_id: string
  keyword: string
  created_at: string
}

export type ScrapeRun = {
  id: string
  campaign_id: string
  apify_run_id: string | null
  status: 'pending' | 'running' | 'completed' | 'failed'
  posts_found: number
  started_at: string
  completed_at: string | null
}

export type Post = {
  id: string
  campaign_id: string
  scrape_run_id: string | null
  matched_keyword: string | null
  text: string | null
  author_handle: string | null
  author_name: string | null
  author_followers: number | null
  posted_at: string | null
  likes: number
  retweets: number
  replies: number
  views: number
  url: string | null
  scraped_at: string
}

export type CampaignMetrics = {
  totalPosts: number
  totalLikes: number
  totalRetweets: number
  totalReplies: number
  totalViews: number
  engagementRate: number
  topPost: Post | null
}
