process.stderr.write = () => {};

//ETHERERUM
const fileHashStorage = require("./build/FileHashStorage.json");

const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
//const compiledFactory = require("./build/FileHashStorage.json");

const provider = new HDWalletProvider(
    "secret",
    "https://sepolia.infura.io..."
    );
    const web3 = new Web3(provider);
    
    //smart contract addres and abi instance 
    const instance = new web3.eth.Contract(JSON.parse(fileHashStorage.interface),"0x..");



function calculateSHA256Hash(filePath) {
    try {
        //read 
        const fileContent = fs.readFileSync(filePath);

        //hash object
        const hash = crypto.createHash('sha256');

        //update hash object with content
        hash.update(fileContent);

        //hexadecimal format hash
        const hashValue = hash.digest('hex');

        return hashValue;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}



const fs = require('fs');
const { MongoClient, Binary } = require('mongodb');
const crypto = require('crypto');


const mongoURI = "...";
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

async function downloadFileFromMongoDB(fileName) {
    try {
        //connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        const database = client.db('thesis'); 
        const collection = database.collection('storage'); 

        //search file in MongoDB
        const file = await collection.findOne({ fileName: fileName });

        if (!file) {
            console.log("File not found in MongoDB.");
            return;
        }

        //storing Binary data to Buffer
        const fileDataBuffer = Buffer.from(file.fileData.buffer);

        // Write file in disk
        fs.writeFileSync(fileName, fileDataBuffer);
        console.log(`File '${fileName}' downloaded successfully from MongoDB.`);

        const hashValue = calculateSHA256Hash(fileName);

        try {
                // const accounts = await web3.eth.getAccounts();
             const resultHash =    await instance.methods.get(fileName).call();
             if (resultHash !== hashValue) {
                console.log("\x1b[31m%s\x1b[0m", "File is Modifie, it hash not match with ledger-stored hash...")
             } else {
                console.log("\x1b[32m%s\x1b[0m", "Hash verified, File is not modified.")
             }
            } catch (error){
                console.log("Failed to connect with blockchain : ", error);
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

//download file from MongoDB
downloadFileFromMongoDB(fileName);
