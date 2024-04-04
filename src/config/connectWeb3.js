const { Web3 } = require("web3");

const port = "http://127.0.0.1:7545";
const abiLink = "../../web3-trustfunds/build/contracts/Crowdfunding.json";
const contractAddr = "0xC1Ec1f36D415ADec5E1e514A2776B08Cb27DA926";

const web3 = new Web3(port);
const contractABI = require(abiLink).abi
const contractAddress = contractAddr;

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
    console.error("Error:", error);
  });

// constants
const gasLimit = 6000000;
const accountIndex = 9;

module.exports = { contract, gasLimit, accountIndex, web3, contractABI }
