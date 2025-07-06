// constructor-args.js
const bscTestnetConfig = require('./deployments/BSCTestnet.json');

// Get all owners from environment variables
const owners = [];
let ownerIndex = 1;
while (process.env[`MULTISIG_OWNER_${ownerIndex}`]) {
    owners.push(process.env[`MULTISIG_OWNER_${ownerIndex}`]);
    ownerIndex++;s
}

module.exports = [
    owners, // _owners
    parseInt(process.env.NUM_CONFIRMATIONS_REQUIRED), // _numConfirmationsRequired
    bscTestnetConfig.CVTContractAddress // _token (BEP20 token address)
];

