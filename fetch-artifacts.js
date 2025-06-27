// This script extracts contract artifacts (ABI and bytecode) from compiled contracts
// Run this script after compiling your contracts with Hardhat

const fs = require('fs');
const path = require('path');

// Paths to compiled contract artifacts
const artifactsDir = path.join(__dirname, 'artifacts/contracts');
const outputDir = path.join(__dirname, 'frontend-artifacts');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Contract names to extract
const contractNames = ['CVToken', 'CVTMultisig', 'CVTVesting'];

// Extract artifacts
function extractArtifacts() {
    console.log('Extracting contract artifacts...');
    
    const artifacts = {};
    
    for (const contractName of contractNames) {
        try {
            // Find the contract JSON file
            const contractPath = path.join(artifactsDir, `${contractName}.sol/${contractName}.json`);
            
            if (!fs.existsSync(contractPath)) {
                console.error(`Contract artifact not found: ${contractPath}`);
                continue;
            }
            
            // Read and parse the contract JSON
            const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
            
            // Extract ABI and bytecode
            artifacts[contractName] = {
                abi: contractJson.abi,
                bytecode: contractJson.bytecode
            };
            
            console.log(`Extracted artifacts for ${contractName}`);
        } catch (error) {
            console.error(`Error extracting artifacts for ${contractName}:`, error);
        }
    }
    
    // Write combined artifacts to a single file
    const outputPath = path.join(outputDir, 'contract-artifacts.js');
    const artifactsContent = `
// Auto-generated contract artifacts
// Generated on: ${new Date().toISOString()}
const contractArtifacts = ${JSON.stringify(artifacts, null, 2)};
`;
    
    fs.writeFileSync(outputPath, artifactsContent);
    console.log(`Artifacts written to: ${outputPath}`);
}

// Run the extraction
extractArtifacts(); 