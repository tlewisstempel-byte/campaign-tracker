'use client'

import { useState } from 'react'
import { CAMPAIGN_REGISTRY_ABI } from '@/lib/contractABI'
import { getWalletClient, REGISTRY_ADDRESS } from '@/lib/web3'
import { base } from 'viem/chains'

interface Props {
  campaignId: string
  campaignName: string
  keywords: string[]
  txHash?: string | null
}

export default function RegisterOnBase({ campaignId, campaignName, keywords, txHash }: Props) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'pending' | 'done' | 'error'>('idle')
  const [hash, setHash] = useState<string | null>(txHash ?? null)
  const [error, setError] = useState<string | null>(null)

  if (hash) {
    return (
      <a
        href={`https://basescan.org/tx/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-800 rounded-lg transition-colors"
      >
        On Base ↗
      </a>
    )
  }

  async function handleRegister() {
    try {
      if (!REGISTRY_ADDRESS) {
        setError('NEXT_PUBLIC_REGISTRY_ADDRESS not set in .env.local')
        return
      }

      setStatus('connecting')
      setError(null)

      const walletClient = getWalletClient()
      const [account] = await walletClient.requestAddresses()

      try {
        await walletClient.switchChain({ id: base.id })
      } catch {
        // already on Base or switch unsupported
      }

      setStatus('pending')

      const txHash = await walletClient.writeContract({
        address: REGISTRY_ADDRESS,
        abi: CAMPAIGN_REGISTRY_ABI,
        functionName: 'registerCampaign',
        args: [campaignName, keywords],
        account,
      })

      await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_tx_hash: txHash }),
      })

      setHash(txHash)
      setStatus('done')
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Transaction failed')
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleRegister}
        disabled={status === 'connecting' || status === 'pending'}
        className="px-3 py-2 text-sm bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
      >
        {status === 'connecting'
          ? 'Connecting...'
          : status === 'pending'
            ? 'Registering...'
            : 'Register on Base'}
      </button>
      {error && <p className="text-xs text-red-400 max-w-48 text-right">{error}</p>}
    </div>
  )
}
