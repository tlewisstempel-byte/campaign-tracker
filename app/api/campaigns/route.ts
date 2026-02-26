import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, keywords(*)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { name, description, keywords, scrape_days, min_engagement, max_engagement } = await req.json()

  if (!name?.trim() || !keywords?.length) {
    return NextResponse.json({ error: 'Name and at least one keyword are required' }, { status: 400 })
  }

  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const suffix = Math.random().toString(36).slice(2, 6)
  const slug = `${base}-${suffix}`

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert({
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      scrape_days: scrape_days ?? 7,
      min_engagement: min_engagement ?? 0,
      max_engagement: max_engagement ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { error: kwError } = await supabase
    .from('keywords')
    .insert(keywords.map((k: string) => ({ campaign_id: campaign.id, keyword: k.trim() })))

  if (kwError) return NextResponse.json({ error: kwError.message }, { status: 500 })

  return NextResponse.json({ campaign })
}
