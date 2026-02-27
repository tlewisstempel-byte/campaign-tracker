'use client'

import { useState } from 'react'

type Props = { campaignId: string }

export default function ScrapeButton({ campaignId }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<string | null>(null)

  async function handleScrape() {
    setStatus('loading')
    setResult(null)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, days: 7 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(`${data.postsFound} posts scraped`)
      setStatus('done')
      // Reload page data after scrape
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      setResult(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleScrape}
        disabled={status === 'loading'}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {status === 'loading' ? 'Scraping...' : 'Scrape Now'}
      </button>
      {result && (
        <p className={`text-xs ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
          {result}
        </p>
      )}
    </div>
  )
}
