import { ethers } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying from:', deployer.address)

  const balance = await ethers.provider.getBalance(deployer.address)
  console.log('Balance:', ethers.formatEther(balance), 'ETH')

  const CampaignRegistry = await ethers.getContractFactory('CampaignRegistry')
  const registry = await CampaignRegistry.deploy()
  await registry.waitForDeployment()

  const address = await registry.getAddress()
  console.log('\nCampaignRegistry deployed to:', address)
  console.log('\nAdd to your .env.local:')
  console.log(`NEXT_PUBLIC_REGISTRY_ADDRESS=${address}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
