// Contract ABIs and Bytecode
// These would normally be imported from compiled contract JSON files
// For this example, we'll fetch them dynamically

// Global variables
let currentAccount = null;
let provider = null;
let signer = null;
let chainId = null;
let networkName = null;

// DOM Elements
const connectWalletBtn = document.getElementById('connectWallet');
const deployButton = document.getElementById('deployButton');
const connectionStatus = document.getElementById('connectionStatus');
const accountInfo = document.getElementById('accountInfo');
const deploymentStatus = document.getElementById('deploymentStatus');
const logElement = document.getElementById('log');
const addOwnerBtn = document.getElementById('addOwner');
const ownersContainer = document.getElementById('ownersContainer');

// Helper function to log messages
function log(message, type = 'info') {
    const logEntry = document.createElement('div');
    logEntry.className = type;
    logEntry.textContent = message;
    logElement.appendChild(logEntry);
    logElement.scrollTop = logElement.scrollHeight;
    
    console.log(message);
}

// Helper function to update status
function updateStatus(element, message, type) {
    element.textContent = message;
    element.className = `status ${type}`;
}

// Check if MetaMask is installed
async function checkMetaMaskInstalled() {
    if (window.ethereum) {
        try {
            // Initialize ethers provider
            provider = new ethers.providers.Web3Provider(window.ethereum);
            return true;
        } catch (error) {
            updateStatus(connectionStatus, 'Error connecting to MetaMask: ' + error.message, 'error');
            return false;
        }
    } else {
        updateStatus(connectionStatus, 'MetaMask is not installed. Please install MetaMask to use this application.', 'error');
        return false;
    }
}

// Connect to MetaMask
async function connectWallet() {
    if (!(await checkMetaMaskInstalled())) return;
    
    try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAccount = accounts[0];
        
        // Get provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        // Get network information
        const network = await provider.getNetwork();
        chainId = network.chainId;
        networkName = network.name;
        
        // Update UI
        updateStatus(connectionStatus, `Connected to MetaMask on ${networkName} (Chain ID: ${chainId})`, 'success');
        accountInfo.innerHTML = `
            <p><strong>Account:</strong> ${currentAccount}</p>
            <p><strong>Network:</strong> ${networkName} (Chain ID: ${chainId})</p>
        `;
        
        // Enable deploy button
        deployButton.disabled = false;
        updateStatus(deploymentStatus, 'Ready to deploy contracts', 'info');
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        
        // Listen for chain changes
        window.ethereum.on('chainChanged', handleChainChanged);
        
        // Check if contract artifacts are loaded
        checkContractArtifacts();
        
    } catch (error) {
        updateStatus(connectionStatus, 'Error connecting to MetaMask: ' + error.message, 'error');
        console.error(error);
    }
}

// Handle account changes
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts
        updateStatus(connectionStatus, 'Please connect to MetaMask.', 'warning');
        currentAccount = null;
        deployButton.disabled = true;
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        accountInfo.innerHTML = `
            <p><strong>Account:</strong> ${currentAccount}</p>
            <p><strong>Network:</strong> ${networkName} (Chain ID: ${chainId})</p>
        `;
        updateStatus(connectionStatus, `Connected to MetaMask with account ${currentAccount}`, 'success');
    }
}

// Handle chain changes
function handleChainChanged() {
    // Reload the page when the chain changes
    window.location.reload();
}

// Check if contract artifacts are loaded
function checkContractArtifacts() {
    try {
        // Check if contractArtifacts is defined (from contract-artifacts.js)
        if (typeof contractArtifacts === 'undefined') {
            log('Contract artifacts not loaded. Please run the fetch-artifacts.js script first.', 'error');
            updateStatus(deploymentStatus, 'Contract artifacts not loaded', 'error');
            deployButton.disabled = true;
            return false;
        }
        
        // Check if all required contracts are present
        const requiredContracts = ['CVToken', 'CVTMultisig', 'CVTVesting'];
        for (const contract of requiredContracts) {
            if (!contractArtifacts[contract]) {
                log(`Contract artifact for ${contract} is missing`, 'error');
                updateStatus(deploymentStatus, `Contract artifact for ${contract} is missing`, 'error');
                deployButton.disabled = true;
                return false;
            }
        }
        
        log('Contract artifacts loaded successfully', 'success');
        return true;
    } catch (error) {
        log('Error checking contract artifacts: ' + error.message, 'error');
        console.error(error);
        return false;
    }
}

// Deploy contracts
async function deployContracts() {
    if (!currentAccount || !provider || !signer) {
        updateStatus(deploymentStatus, 'Please connect to MetaMask first', 'warning');
        return;
    }
    
    if (!checkContractArtifacts()) {
        return;
    }
    
    updateStatus(deploymentStatus, 'Deploying contracts...', 'info');
    deployButton.disabled = true;
    
    try {
        // Get configuration from UI
        const numConfirmations = document.getElementById('numConfirmations').value;
        const ownerInputs = document.querySelectorAll('.owner-address');
        const owners = Array.from(ownerInputs).map(input => input.value).filter(addr => addr.trim() !== '');
        
        if (owners.length === 0) {
            throw new Error('At least one owner address must be provided');
        }
        
        if (isNaN(numConfirmations) || parseInt(numConfirmations) <= 0 || parseInt(numConfirmations) > owners.length) {
            throw new Error(`Number of confirmations must be between 1 and ${owners.length}`);
        }
        
        log('Starting deployment process...');
        log(`Network: ${networkName} (Chain ID: ${chainId})`);
        log(`Deployer account: ${currentAccount}`);
        
        // Deploy CVToken
        log('Deploying CVToken...');
        const CVTokenFactory = new ethers.ContractFactory(
            contractArtifacts.CVToken.abi, 
            contractArtifacts.CVToken.bytecode, 
            signer
        );
        const cvtToken = await CVTokenFactory.deploy();
        log(`CVToken deployment transaction sent: ${cvtToken.deployTransaction.hash}`);
        log('Waiting for CVToken deployment confirmation...');
        await cvtToken.deployed();
        log(`CVToken deployed at: ${cvtToken.address}`, 'success');
        
        // Deploy CVTMultisig
        log('Deploying CVTMultisig...');
        const CVTMultisigFactory = new ethers.ContractFactory(
            contractArtifacts.CVTMultisig.abi, 
            contractArtifacts.CVTMultisig.bytecode, 
            signer
        );
        const multisig = await CVTMultisigFactory.deploy(
            owners, 
            parseInt(numConfirmations), 
            cvtToken.address
        );
        log(`CVTMultisig deployment transaction sent: ${multisig.deployTransaction.hash}`);
        log('Waiting for CVTMultisig deployment confirmation...');
        await multisig.deployed();
        log(`CVTMultisig deployed at: ${multisig.address}`, 'success');
        
        // Deploy CVTVesting
        log('Deploying CVTVesting...');
        const CVTVestingFactory = new ethers.ContractFactory(
            contractArtifacts.CVTVesting.abi, 
            contractArtifacts.CVTVesting.bytecode, 
            signer
        );
        const vesting = await CVTVestingFactory.deploy(cvtToken.address);
        log(`CVTVesting deployment transaction sent: ${vesting.deployTransaction.hash}`);
        log('Waiting for CVTVesting deployment confirmation...');
        await vesting.deployed();
        log(`CVTVesting deployed at: ${vesting.address}`, 'success');
        
        // Save deployment info
        const deploymentInfo = {
            network: networkName,
            chainId: chainId,
            CVTContractAddress: cvtToken.address,
            MultisigContractAddress: multisig.address,
            VestingContractAddress: vesting.address,
            deploymentTime: new Date().toISOString()
        };
        
        log('Deployment completed successfully!', 'success');
        log('Contract Addresses:');
        log(`CVToken: ${cvtToken.address}`);
        log(`CVTMultisig: ${multisig.address}`);
        log(`CVTVesting: ${vesting.address}`);
        
        // Save to local storage for reference
        localStorage.setItem('cvtDeploymentInfo', JSON.stringify(deploymentInfo));
        
        updateStatus(deploymentStatus, 'Contracts deployed successfully!', 'success');
        
        // Create a downloadable JSON file with deployment info
        createDownloadableDeploymentInfo(deploymentInfo);
        
    } catch (error) {
        log('Deployment failed: ' + error.message, 'error');
        updateStatus(deploymentStatus, 'Deployment failed: ' + error.message, 'error');
        console.error(error);
    } finally {
        deployButton.disabled = false;
    }
}

// Create downloadable deployment info
function createDownloadableDeploymentInfo(deploymentInfo) {
    const dataStr = JSON.stringify(deploymentInfo, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `deployment-${deploymentInfo.network}-${deploymentInfo.chainId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.textContent = 'Download Deployment Info';
    linkElement.className = 'download-link';
    linkElement.style.display = 'block';
    linkElement.style.marginTop = '20px';
    
    const deploymentContainer = document.querySelector('.container:nth-child(3)');
    deploymentContainer.appendChild(linkElement);
}

// Add owner input field
function addOwnerField() {
    const ownerInput = document.createElement('div');
    ownerInput.className = 'owner-input';
    ownerInput.innerHTML = `
        <input type="text" class="owner-address" placeholder="Owner Address (0x...)">
        <button class="remove-owner">Remove</button>
    `;
    ownersContainer.appendChild(ownerInput);
    
    // Add event listener to the remove button
    ownerInput.querySelector('.remove-owner').addEventListener('click', function() {
        ownersContainer.removeChild(ownerInput);
    });
}

// Event Listeners
window.addEventListener('load', function() {
    console.log("Page loaded. Setting up event listeners.");
    
    // Make sure DOM elements are available
    if (!connectWalletBtn) console.error("Connect Wallet button not found");
    if (!deployButton) console.error("Deploy button not found");
    if (!addOwnerBtn) console.error("Add Owner button not found");
    
    connectWalletBtn.addEventListener('click', function() {
        console.log("Connect wallet button clicked");
        connectWallet();
    });
    
    deployButton.addEventListener('click', function() {
        console.log("Deploy button clicked");
        deployContracts();
    });
    
    addOwnerBtn.addEventListener('click', function() {
        console.log("Add owner button clicked");
        addOwnerField();
    });
    
    // Initialize
    initApp();
});

// Initialize application
async function initApp() {
    console.log("Initializing application");
    if (await checkMetaMaskInstalled()) {
        // Check if already connected
        try {
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                // User is already connected
                connectWallet();
            }
        } catch (error) {
            console.error('Error checking accounts:', error);
        }
    }
} 