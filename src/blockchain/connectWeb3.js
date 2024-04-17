const { Web3 } = require("web3");

const port = "http://127.0.0.1:7545";
const abiLink = "../../web3-trustfunds/build/contracts/Crowdfunding.json";
const contractABI = require(abiLink).abi;
const contractAddress = `${process.env.CONTRACT_ADDRESS}`;
const senderAddress = `${process.env.SENDER_ADDRESS}`;

const web3 = new Web3(port);

console.log("Contract Address:", contractAddress);
const contract = new web3.eth.Contract(contractABI, contractAddress);
web3.eth
  .isSyncing()
  .then((syncing) => {
    if (syncing) {
      console.log("Node is syncing with the network:");
      console.log("Current block:", syncing.currentBlock);
      console.log("Highest block:", syncing.highestBlock);
      console.log("Starting block:", syncing.startingBlock);
    } else {
      console.log("Node is fully synced with the network.");
    }
  })
  .catch((error) => {
    console.log("Error connecting to web3 network at 7545.");
    console.error("Error:", error);
  });

// constants
const gasLimit = 6000000;
const accountIndex = 9;

module.exports = {
  contract,
  gasLimit,
  accountIndex,
  web3,
  contractABI,
  senderAddress,
};
