import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const campaignId = searchParams.get('campaign_id')
  const limit = parseInt(searchParams.get('limit') ?? '100')

  let query = supabase
    .from('posts')
    .select('*')
    .order('posted_at', { ascending: false })
    .limit(limit)

  if (campaignId) {
    query = query.eq('campaign_id', campaignId)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
