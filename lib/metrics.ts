import { Post, CampaignMetrics } from '@/types'

export function computeMetrics(posts: Post[]): CampaignMetrics {
  if (posts.length === 0) {
    return {
      totalPosts: 0,
      totalLikes: 0,
      totalRetweets: 0,
      totalReplies: 0,
      totalViews: 0,
      engagementRate: 0,
      topPost: null,
    }
  }

  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0)
  const totalRetweets = posts.reduce((sum, p) => sum + p.retweets, 0)
  const totalReplies = posts.reduce((sum, p) => sum + p.replies, 0)
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0)

  // Engagement rate: (likes + retweets + replies) / views * 100
  const engagementRate =
    totalViews > 0
      ? ((totalLikes + totalRetweets + totalReplies) / totalViews) * 100
      : 0

  const topPost = posts.reduce((best, p) => {
    const score = p.likes + p.retweets * 2 + p.replies
    const bestScore = best.likes + best.retweets * 2 + best.replies
    return score > bestScore ? p : best
  }, posts[0])

  return {
    totalPosts: posts.length,
    totalLikes,
    totalRetweets,
    totalReplies,
    totalViews,
    engagementRate: Math.round(engagementRate * 100) / 100,
    topPost,
  }
}
