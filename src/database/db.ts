import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// MongoDB setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri!, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const mngos = mongoose.createConnection(uri!, {
    dbName: 'fitness-chatbot',
});

const DB_NAME = 'fitness-chatbot'; // Updated database name
let isConnected = false;

async function connectToDatabase() {
    if (!isConnected) {
        await mongoose.connect(uri!, {
            dbName: 'fitness-chatbot'
        });
        await client.connect();
        isConnected = true;
        console.log("Connected to MongoDB");
    }
}

async function setupDatabase(): Promise<void> {
    try {
        
        await connectToDatabase();
        await client.db(DB_NAME).command({ ping: 1 });
        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Failed to initialize database:", error);
        throw error;
    }
}

// Cleanup function
async function closeDatabase() {
    if (isConnected) {
        await client.close();
        await mongoose.disconnect();
        isConnected = false;
        console.log("Disconnected from MongoDB");
    }
}

export {
    setupDatabase,
    closeDatabase,
    connectToDatabase,
    DB_NAME,
    client,
};