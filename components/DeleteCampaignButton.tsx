'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteCampaignButton({ campaignId }: { campaignId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/campaigns/${campaignId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/campaigns')
    } else {
      const data = await res.json()
      alert(data.error ?? 'Failed to delete campaign')
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">Delete this campaign?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
        >
          {loading ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 transition-colors"
    >
      Delete campaign
    </button>
  )
}
