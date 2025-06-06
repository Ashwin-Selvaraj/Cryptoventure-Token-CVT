require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Debug: Check if API key is loaded
console.log("BSCScan API Key loaded:", process.env.BSCSCAN_API_KEY ? "Yes" : "No");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    matic: {
      url: `https://autumn-falling-firefly.matic-testnet.quiknode.pro/c8e3ff914ff86361fd66c6de0e7aed3c878963fb/`,
      accounts: [process.env.PRIVATE_KEY],
    },
    scrollSepolia: {
      url: "https://winter-ultra-sheet.scroll-testnet.quiknode.pro/3d92ec6b4d0bd800befb790f751b5b79441575a1/",
      accounts: [process.env.PRIVATE_KEY],
    },
    HederaTestnet:
    {
      url:`https://pool.arkhia.io/hedera/mainnet/api/v1/${process.env.HBAR_API_KEY}`,
      accounts:[process.env.PRIVATE_KEY],
    },
    BSCTestnet:
    {
      url:"https://restless-responsive-county.bsc-testnet.quiknode.pro/e8596af8dc28ad6ae70ea957eea500d4af507877",
      accounts:[process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY
    },
    customChains: [
      {
        network: "bscTestnet",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com"
        }
      }
    ]
  },
};
