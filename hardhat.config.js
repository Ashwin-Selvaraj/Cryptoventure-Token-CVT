require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Debug: Check if API key is loaded
console.log("BSCScan API Key loaded:", process.env.BSCSCAN_API_KEY ? "Yes" : "No");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28", // Or your preferred Solidity version
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Adjust as needed
      },
    },
  },
  networks: {
    BSCTestnet:
    {
      url:"https://restless-responsive-county.bsc-testnet.quiknode.pro/e8596af8dc28ad6ae70ea957eea500d4af507877",
      accounts:[process.env.PRIVATE_KEY]
    },
    BSCMainnet:
    {
      url:"https://attentive-red-layer.bsc.quiknode.pro/7e90189cf42a8e1cbbfaa0537e7f15eab4c2c2f1/",
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
