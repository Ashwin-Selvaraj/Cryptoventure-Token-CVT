# Cryptoventure-Token-CVT
Smart contracts for Cryptoventure Token (CVT) on BSC. Includes BEP-20 token with 20M fixed supply and automated vesting for pre-sale, team, staking, marketing, and more. Fully on-chain, no manual interference.

# CVT Token Deployment Interface

This is a web-based interface for deploying the CVT Token contracts using MetaMask.

## Features

- Deploy CVT Token, Multisig, and Vesting contracts
- Connect with MetaMask
- Support for multiple networks (Ethereum, BSC, Polygon, etc.)
- Automatic contract artifact generation
- Download deployment information
- GitHub Pages deployment support

## How to Use

1. Visit the [deployment interface](https://[your-github-username].github.io/[repository-name]/deploy-frontend.html)
2. Connect your MetaMask wallet
3. Configure the deployment:
   - Set the number of required confirmations for the multisig
   - Add owner addresses for the multisig
4. Click "Deploy Contracts"
5. Confirm the transactions in MetaMask
6. Download the deployment information

## Supported Networks

- Ethereum Mainnet
- Ethereum Testnets (Sepolia, Goerli)
- BSC Mainnet
- BSC Testnet
- Polygon Mainnet
- Polygon Testnet
- Scroll Sepolia

## Development

To run locally:

1. Clone the repository
2. Install dependencies: `npm install`
3. Generate contract artifacts: `node scripts/generate-artifacts.js`
4. Start the local server: `node serve.js`
5. Visit `http://localhost:8080/deploy-frontend.html`

## Security

- Always verify contract addresses after deployment
- Keep your MetaMask seed phrase secure
- Double-check all transaction parameters before confirming
- Use a hardware wallet for mainnet deployments

## License

MIT
