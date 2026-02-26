import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { runScrape, ApifyTweet } from '@/lib/apify'
import { subDays, format } from 'date-fns'

export async function POST(req: NextRequest) {
  const { campaignId, days = 7 } = await req.json()

  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId is required' }, { status: 400 })
  }

  // Fetch campaign + keywords
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*, keywords(*)')
    .eq('id', campaignId)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const keywords = campaign.keywords.map((k: { keyword: string }) => k.keyword)
  const since = format(subDays(new Date(), days), 'yyyy-MM-dd')
  const until = format(new Date(), 'yyyy-MM-dd')

  // Create a scrape_run record
  const { data: scrapeRun, error: runError } = await supabase
    .from('scrape_runs')
    .insert({ campaign_id: campaignId, status: 'running' })
    .select()
    .single()

  if (runError || !scrapeRun) {
    return NextResponse.json({ error: 'Failed to create scrape run' }, { status: 500 })
  }

  try {
    const tweets = await runScrape(keywords, since, until)

    // Upsert posts (tweet ID as primary key prevents duplicates)
    const posts = tweets.map((t: ApifyTweet) => ({
      id: t.id,
      campaign_id: campaignId,
      scrape_run_id: scrapeRun.id,
      matched_keyword: null,
      text: t.text,
      author_handle: t.author?.userName ?? null,
      author_name: t.author?.displayName ?? null,
      author_followers: t.author?.followers ?? null,
      posted_at: t.createdAt ?? null,
      likes: t.likeCount ?? 0,
      retweets: t.retweetCount ?? 0,
      replies: t.replyCount ?? 0,
      views: t.viewCount ?? 0,
      url: t.url ?? null,
    }))

    const { error: insertError } = await supabase
      .from('posts')
      .upsert(posts, { onConflict: 'id' })

    if (insertError) throw insertError

    // Mark run as completed
    await supabase
      .from('scrape_runs')
      .update({ status: 'completed', posts_found: posts.length, completed_at: new Date().toISOString() })
      .eq('id', scrapeRun.id)

    return NextResponse.json({ success: true, postsFound: posts.length, runId: scrapeRun.id })
  } catch (err) {
    await supabase
      .from('scrape_runs')
      .update({ status: 'failed', completed_at: new Date().toISOString() })
      .eq('id', scrapeRun.id)

    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
