// constructor-args.js
const bscTestnetConfig = require('./deployments/BSCTestnet.json');

module.exports = [
    ["0xf73687C4d37d363e8f97Fad2bd03bc7b68876A72", "0x8358847c2D38F97F2Fc20cfA83F61075C4BfD14A"], // _owners
    1, // _numConfirmationsRequired
    bscTestnetConfig.CVTContractAddress // _token (ERC20 token address)
];
