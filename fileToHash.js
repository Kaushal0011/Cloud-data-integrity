
import web3 from "./web3";
const Campaign = require("./FileHashStorage.json");


export default (address) => {
  return new web3.eth.Contract(JSON.parse(Campaign.interface), address);
};
