import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { base_tx_hash } = await req.json()

  const { error } = await supabase
    .from('campaigns')
    .update({ base_tx_hash, base_registered_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Delete child records first (in case no cascade is set)
  await supabase.from('posts').delete().eq('campaign_id', id)
  await supabase.from('scrape_runs').delete().eq('campaign_id', id)
  await supabase.from('keywords').delete().eq('campaign_id', id)

  const { error } = await supabase.from('campaigns').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
