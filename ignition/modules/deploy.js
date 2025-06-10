const { ethers } = require("hardhat");
require("dotenv").config();
const {readFileSync, writeFileSync, mkdirSync, existsSync } = require("fs");
const path = require("path");

// Add delay function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const private_key = process.env.PRIVATE_KEY;
  const network = process.env.NETWORK || "testnet"; // Default to testnet if no network is provided
  let provider;

  // Set provider based on the environment (Testnet or Mainnet)
  if (network === "mainnet") {
    provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
  } else if (network === "sepolia") {
    provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  } else if (network === "matic") {
    provider = new ethers.JsonRpcProvider(process.env.MATIC_RPC_URL);
  } else if (network === "BSCTestnet") {
    provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_RPC_URL);
  } else if (network === "BSCMainnet") {
    provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
  }else if (network === "scrollSepolia") {
    provider = new ethers.JsonRpcProvider(process.env.SCROLL_SEPOLIA_RPC_URL);
  } else {
    console.error("Invalid network provided.");
    process.exit(1);
  }

  const deployer = new ethers.Wallet(private_key, provider);
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  const balance = await provider.getBalance(deployer);
  console.log("Deployer Balance:", ethers.formatEther(balance), process.env.TOKEN_SYMBOL);

  try {
    // Deploying CVT Token Contract
    console.log("Deploying CVT Token Contract...");
    const CVTFactory = await ethers.getContractFactory("CVToken");
    const cvt = await CVTFactory.connect(deployer).deploy();
    console.log("Waiting for deployment confirmation...");
    await delay(5000); // Increased delay for better reliability
    await cvt.waitForDeployment();
    console.log(`CVTToken contract deployed at: ${cvt.target}`);

    // Deploying Multisig Contract
    console.log("Deploying Multisig Contract...");
    
    // Validate number of confirmations required
    const numConfirmationsRequired = parseInt(process.env.NUM_CONFIRMATIONS_REQUIRED);
    if (!numConfirmationsRequired || numConfirmationsRequired <= 0) {
        throw new Error("NUM_CONFIRMATIONS_REQUIRED must be greater than 0");
    }

    // Get all owners from environment variables
    const owners = [];
    let ownerIndex = 1;
    while (process.env[`MULTISIG_OWNER_${ownerIndex}`]) {
        owners.push(process.env[`MULTISIG_OWNER_${ownerIndex}`]);
        ownerIndex++;
    }

    if (owners.length === 0) {
        throw new Error("At least one owner must be specified in environment variables");
    }

    const MultisigFactory = await ethers.getContractFactory("CVTMultisig");
    const multisig = await MultisigFactory.connect(deployer).deploy(
        owners, 
        numConfirmationsRequired, 
        cvt.target
    );
    console.log("Waiting for deployment confirmation...");
    await delay(5000); // Increased delay for better reliability
    await multisig.waitForDeployment();
    console.log(`MultiSig contract deployed at: ${multisig.target}`);


    // Deploying Vesting Contract
    console.log("Deploying Vesting Contract...");
    const VestingFactory = await ethers.getContractFactory("CVTVesting");
    const vesting = await VestingFactory.connect(deployer).deploy(cvt.target);
    console.log("Waiting for deployment confirmation...");
    await delay(5000); // Increased delay for better reliability
    await vesting.waitForDeployment();
    console.log(`Vesting contract deployed at: ${vesting.target}`);

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(process.cwd(), "deployments");
    if (!existsSync(deploymentsDir)) {
      console.log("Creating deployments directory...");
      mkdirSync(deploymentsDir, { recursive: true });
    }

    // Writing the contract addresses to a JSON file
    const deploymentInfo = {
      network,
      CVTContractAddress: cvt.target,
      MultisigContractAddress: multisig.target,
      VestingContractAddress: vesting.target,
      deploymentTime: new Date().toISOString()
    };

    const deploymentPath = path.join(deploymentsDir, `${network}.json`);
    writeFileSync(
      deploymentPath,
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("Deployment completed successfully!");
    console.log("Contract addresses saved to:", deploymentPath);

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });
  