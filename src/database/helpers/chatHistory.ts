import {  client, connectToDatabase, DB_NAME } from "../db.js";

const COLLECTION_NAME = "chat_history"


// Type definitions
interface ChatInteraction {
    userId: string;
    userMessage: string;
    assistantResponse: string;
    timestamp: number;
}

// Chat History Management
export async function getChatHistory(userId: string): Promise<ChatInteraction[]> {
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection<ChatInteraction>(COLLECTION_NAME);
    return await collection.find({userId}).toArray();
}

export async function addChatInteraction(
    userId: string, 
    userMessage: string, 
    assistantResponse: string
): Promise<void> {
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection<ChatInteraction & { userId: string }>(COLLECTION_NAME);
    

    await collection.insertOne({
        userId,
        userMessage,
        assistantResponse,
        timestamp: Date.now()
    });
}

export async function getFormattedChatHistory(userId: string): Promise<string> {
    const history = await getChatHistory(userId);
    return history
        .map((entry) => `Q: ${entry.userMessage}\nA: ${entry.assistantResponse}`)
        .join("\n");
}

