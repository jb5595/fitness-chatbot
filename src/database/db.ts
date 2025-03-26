import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

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

const DB_NAME = 'fitness-chatbot'; // Updated database name
let isConnected = false;

async function connectToDatabase() {
    if (!isConnected) {
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