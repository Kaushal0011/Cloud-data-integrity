process.stderr.write = () => {};
//ETHEREUM PART
// import instance from "./fileToHash_web.mjs";


const fileHashStorage = require("./build/FileHashStorage.json");


const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
//const compiledFactory = require("./build/FileHashStorage.json");

const provider = new HDWalletProvider(
    "secret",
    "https://sepolia.infura.io..."
    );
    const web3 = new Web3(provider);
    
    const instance = new web3.eth.Contract(JSON.parse(fileHashStorage.interface),"0x..");

const fs = require('fs');
const crypto = require('crypto');

function calculateSHA256Hash(filePath) {
    try {
        //read the file content
        const fileContent = fs.readFileSync(filePath);

        //hash object
        const hash = crypto.createHash('sha256');

        //update the hash object with content
        hash.update(fileContent);

        //hexadecimal format hash
        const hashValue = hash.digest('hex');

        return hashValue;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}


const { MongoClient } = require('mongodb');


//mongoDb URI for coonection with database
const mongoURI = ""; //Give Valid URL
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

async function saveFileToMongoDB(fileName) {
    try {
        //connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        const database = client.db('thesis');
        const collection = database.collection('storage'); 
        //read file 
        const fileData = fs.readFileSync(fileName);

        //insert file into MongoDB
        await collection.insertOne({ fileName: fileName, fileData: fileData });
        console.log("File saved to MongoDB successfully");

        const hashValue = calculateSHA256Hash(fileName);

        if (hashValue) {
            console.log(`SHA-256 hash of '${fileName}': `, hashValue);
            console.log(`Attempting to store file hash into sepolia-ethereum-blockchain-ledger': `);

            try {
                const accounts = await web3.eth.getAccounts();
                await instance.methods.put(fileName,hashValue).send({from : accounts[0]});
                console.log("\x1b[32m%s\x1b[0m", "Hash stored successfuly..");
            } catch (error){
                console.log("Failed to connect with blockchain : ", error);
            }
        } else {
            console.log("Failed to calculate the hash.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        //close the connection
        await client.close();
        console.log("Connection to MongoDB closed");
    }
}

//get file name from console input
const fileName = process.argv[2];
if (!fileName) {
    console.error("Please provide a file name as input argument.");
    process.exit(1);
}

//save file to MongoDB
saveFileToMongoDB(fileName);
