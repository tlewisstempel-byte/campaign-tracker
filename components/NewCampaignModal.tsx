'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function NewCampaignModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [kwInput, setKwInput] = useState('')
  const [scrapeDays, setScrapeDays] = useState(7)
  const [minEngagement, setMinEngagement] = useState(0)
  const [maxEngagement, setMaxEngagement] = useState('')
  const [status, setStatus] = useState<'idle' | 'creating' | 'scraping' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const kwInputRef = useRef<HTMLInputElement>(null)

  function reset() {
    setName('')
    setDescription('')
    setKeywords([])
    setKwInput('')
    setScrapeDays(7)
    setMinEngagement(0)
    setMaxEngagement('')
    setStatus('idle')
    setErrorMsg('')
  }

  function close() {
    if (status === 'creating' || status === 'scraping') return
    setOpen(false)
    reset()
  }

  function addKeyword() {
    const trimmed = kwInput.trim().replace(/^,+|,+$/g, '')
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed])
    }
    setKwInput('')
  }

  function handleKwKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addKeyword()
    } else if (e.key === 'Backspace' && kwInput === '' && keywords.length > 0) {
      setKeywords((prev) => prev.slice(0, -1))
    }
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw))
  }

  async function handleSubmit() {
    if (!name.trim()) { setErrorMsg('Campaign name is required'); return }
    if (keywords.length === 0) { setErrorMsg('Add at least one keyword'); return }
    setErrorMsg('')
    setStatus('creating')

    // 1. Create campaign
    const createRes = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        keywords,
        scrape_days: scrapeDays,
        min_engagement: minEngagement,
        max_engagement: maxEngagement !== '' ? parseInt(maxEngagement) : null,
      }),
    })

    const createData = await createRes.json()
    if (!createRes.ok) {
      setStatus('error')
      setErrorMsg(createData.error ?? 'Failed to create campaign')
      return
    }

    const campaign = createData.campaign
    setStatus('scraping')

    // 2. Trigger initial scrape
    const scrapeRes = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: campaign.id }),
    })

    if (!scrapeRes.ok) {
      // Scrape failed but campaign was created — still navigate
      setStatus('done')
      router.push(`/campaigns/${campaign.slug}`)
      return
    }

    setStatus('done')
    router.push(`/campaigns/${campaign.slug}`)
  }

  const busy = status === 'creating' || status === 'scraping'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
      >
        + New Campaign
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70" onClick={close} />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">New Campaign</h2>
              <button
                onClick={close}
                disabled={busy}
                className="text-zinc-500 hover:text-zinc-300 transition-colors text-xl leading-none disabled:opacity-30"
              >
                ✕
              </button>
            </div>

            {/* Campaign Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Campaign Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
                placeholder="e.g. Fableborne"
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Description <span className="text-zinc-600 normal-case">(optional)</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={busy}
                placeholder="e.g. Tracking Fableborne and $POWER token mentions"
                rows={2}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
              />
            </div>

            {/* Keywords */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Keywords to Search</label>
              <div
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 flex flex-wrap gap-1.5 cursor-text min-h-[42px]"
                onClick={() => kwInputRef.current?.focus()}
              >
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 bg-blue-900/60 text-blue-300 text-xs px-2 py-1 rounded"
                  >
                    {kw}
                    <button
                      onClick={() => removeKeyword(kw)}
                      disabled={busy}
                      className="hover:text-white disabled:opacity-30"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  ref={kwInputRef}
                  type="text"
                  value={kwInput}
                  onChange={(e) => setKwInput(e.target.value)}
                  onKeyDown={handleKwKeyDown}
                  onBlur={addKeyword}
                  disabled={busy}
                  placeholder={keywords.length === 0 ? 'Type a keyword and press Enter…' : ''}
                  className="flex-1 min-w-[140px] bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-zinc-600">Press Enter or comma to add each keyword</p>
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Duration — how far back to search</label>
              <div className="flex gap-2">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setScrapeDays(d)}
                    disabled={busy}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                      scrapeDays === d
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700'
                    }`}
                  >
                    {d} days
                  </button>
                ))}
                <div className="flex-1 flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-lg px-3">
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={![7, 14, 30].includes(scrapeDays) ? scrapeDays : ''}
                    onChange={(e) => setScrapeDays(parseInt(e.target.value) || 7)}
                    onFocus={() => { if ([7, 14, 30].includes(scrapeDays)) setScrapeDays(0) }}
                    disabled={busy}
                    placeholder="Custom"
                    className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Engagement Thresholds */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Engagement Thresholds <span className="text-zinc-600 normal-case">(likes + retweets + replies per post)</span></label>
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-xs text-zinc-500">Minimum</span>
                  <input
                    type="number"
                    min={0}
                    value={minEngagement}
                    onChange={(e) => setMinEngagement(parseInt(e.target.value) || 0)}
                    disabled={busy}
                    placeholder="0"
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-xs text-zinc-500">Maximum <span className="text-zinc-600">(optional)</span></span>
                  <input
                    type="number"
                    min={0}
                    value={maxEngagement}
                    onChange={(e) => setMaxEngagement(e.target.value)}
                    disabled={busy}
                    placeholder="No limit"
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {errorMsg && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{errorMsg}</p>
            )}

            {/* Status */}
            {busy && (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="animate-spin">⟳</span>
                {status === 'creating' ? 'Creating campaign…' : `Scraping X for the last ${scrapeDays} days… this may take a minute`}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={close}
                disabled={busy}
                className="flex-1 py-2 rounded-lg text-sm text-zinc-400 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors disabled:opacity-30"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={busy || !name.trim() || keywords.length === 0}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {busy ? '…' : 'Create & Scrape'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
