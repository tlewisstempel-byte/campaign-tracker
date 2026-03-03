import { createWalletClient, createPublicClient, custom, http } from 'viem'
import { base } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

export function getWalletClient() {
  if (typeof window === 'undefined') throw new Error('Not in browser')
  const eth = (window as Window & { ethereum?: unknown }).ethereum
  if (!eth) throw new Error('No wallet detected. Install MetaMask or Coinbase Wallet.')
  return createWalletClient({
    chain: base,
    transport: custom(eth),
  })
}

export const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}` | undefined
