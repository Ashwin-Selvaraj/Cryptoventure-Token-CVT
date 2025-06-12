const fs = require('fs');
const path = require('path');

// Read contract artifacts
const cvtTokenArtifact = require('../artifacts/contracts/CVTToken.sol/CVToken.json');
const multisigArtifact = require('../artifacts/contracts/CVTMultisig.sol/CVTMultisig.json');
const vestingArtifact = require('../artifacts/contracts/CVTVesting.sol/CVTVesting.json');

// Create the artifacts object
const contractArtifacts = {
    CVToken: {
        abi: cvtTokenArtifact.abi,
        bytecode: cvtTokenArtifact.bytecode
    },
    CVTMultisig: {
        abi: multisigArtifact.abi,
        bytecode: multisigArtifact.bytecode
    },
    CVTVesting: {
        abi: vestingArtifact.abi,
        bytecode: vestingArtifact.bytecode
    }
};

// Create the frontend-artifacts directory if it doesn't exist
const frontendArtifactsDir = path.join(__dirname, '../frontend-artifacts');
if (!fs.existsSync(frontendArtifactsDir)) {
    fs.mkdirSync(frontendArtifactsDir, { recursive: true });
}

// Write the artifacts to a file
const outputPath = path.join(frontendArtifactsDir, 'contract-artifacts.js');
const outputContent = `// This file is auto-generated. Do not edit manually.
const contractArtifacts = ${JSON.stringify(contractArtifacts, null, 2)};
`;

fs.writeFileSync(outputPath, outputContent);
console.log(`Contract artifacts written to ${outputPath}`); 