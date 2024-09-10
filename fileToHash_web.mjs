const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");

const provider = new HDWalletProvider(
  "secret",
  "https://sepolia.infura.io..."
);
const web3 = new Web3(provider);

const fileHashStorage = require("./FileHashStorage.json");


const instance = new web3.eth.Contract(JSON.parse(fileHashStorage.interface),"0x..");

export default instance;
