const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
    // Get the URL path
    let filePath = '.' + req.url;
    
    // Default to index.html if the path is '/'
    if (filePath === './') {
        filePath = './deploy-frontend.html';
    }
    
    // Get the file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    
    // Define content types based on file extension
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };
    
    // Set the content type based on the file extension
    const contentType = contentTypes[extname] || 'application/octet-stream';
    
    // Read the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Page not found
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Ensure frontend-artifacts directory exists
const artifactsDir = path.join(__dirname, 'frontend-artifacts');
if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
    
    // Create dummy contract-artifacts.js if it doesn't exist
    const artifactsFile = path.join(artifactsDir, 'contract-artifacts.js');
    if (!fs.existsSync(artifactsFile)) {
        const dummyArtifacts = `
// Auto-generated contract artifacts
// Generated on: ${new Date().toISOString()}
const contractArtifacts = {
  "CVToken": {
    "abi": [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      }
    ],
    "bytecode": "0x608060405234801561001057600080fd5b50610771806100206000396000f3fe"
  },
  "CVTMultisig": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address[]",
            "name": "_owners",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "_numConfirmationsRequired",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_tokenAddress",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      }
    ],
    "bytecode": "0x608060405234801561001057600080fd5b50610771806100206000396000f3fe"
  },
  "CVTVesting": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token_",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      }
    ],
    "bytecode": "0x608060405234801561001057600080fd5b50610771806100206000396000f3fe"
  }
};`;
        fs.writeFileSync(artifactsFile, dummyArtifacts);
        console.log('Created dummy contract artifacts file');
    }
}

// Start the server with error handling
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Deployment interface available at http://localhost:${PORT}/deploy-frontend.html`);
}).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port by setting the PORT environment variable.`);
        console.error('Example: PORT=3001 node serve.js');
        process.exit(1);
    } else {
        console.error('Server error:', error);
        process.exit(1);
    }
}); 