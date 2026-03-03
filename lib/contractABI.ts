export const CAMPAIGN_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'registerCampaign',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'keywords', type: 'string[]' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getCampaignCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getCampaign',
    inputs: [{ name: 'index', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'keywords', type: 'string[]' },
          { name: 'creator', type: 'address' },
          { name: 'createdAt', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'CampaignRegistered',
    inputs: [
      { name: 'index', type: 'uint256', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'creator', type: 'address', indexed: true },
    ],
  },
] as const
