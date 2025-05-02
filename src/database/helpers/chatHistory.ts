import {  client, connectToDatabase, DB_NAME } from "../db.ts";

const COLLECTION_NAME = "chat_history"


// Type definitions
interface ChatInteraction {
    userPhoneNumber: string;
    gymPhoneNumber: string;
    userMessage: string;
    assistantResponse: string;
    timestamp: number;
}

// Chat History Management
export async function getChatHistoryByUserPhoneNumber(userPhoneNumber: string): Promise<ChatInteraction[]> {
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection<ChatInteraction>(COLLECTION_NAME);
    return await collection.find({userPhoneNumber}).toArray();
}

export async function getUserPhoneNumbersByGym(gymPhoneNumber: string): Promise<string[]> {
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection<ChatInteraction>(COLLECTION_NAME);
  
    // Find all documents with the given gymPhoneNumber and project only userPhoneNumber
    const results = await collection
      .find({ gymPhoneNumber }, { projection: { userPhoneNumber: 1, _id: 0 } })
      .toArray();
  
    // Extract userPhoneNumber from each document
    const userPhoneNumbers = results.map(doc => doc.userPhoneNumber);
    
    // return a unique list
    return userPhoneNumbers.filter((value, index, array) => array.indexOf(value) === index);
  }

export async function getChatHistoryByGymPhoneNumber(gymPhoneNumber: string): Promise<ChatInteraction[]> {
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection<ChatInteraction>(COLLECTION_NAME);
    return await collection.find({gymPhoneNumber}).toArray();
}

export async function addChatInteraction(
    userPhoneNumber: string, 
    gymPhoneNumber: string,
    userMessage: string, 
    assistantResponse: string
): Promise<void> {
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection<ChatInteraction>(COLLECTION_NAME);
    

    await collection.insertOne({
        userPhoneNumber,
        gymPhoneNumber,
        userMessage,
        assistantResponse,
        timestamp: Date.now()
    });
}

export async function getFormattedChatHistoryByUserPhoneNumber(userPhoneNumber: string): Promise<string> {
    const history = await getChatHistoryByUserPhoneNumber(userPhoneNumber);
    return history
        .map((entry) => `Q: ${entry.userMessage}\nA: ${entry.assistantResponse}`)
        .join("\n");
}

