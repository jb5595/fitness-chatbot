import {  client, connectToDatabase, DB_NAME } from "../db";

const COLLECTION_NAME = "chat_history"


// Type definitions
interface ChatInteraction {
    clientPhoneNumber: string;
    gymPhoneNumber: string;
    clientMessage: string;
    assistantResponse: string;
    timestamp: number;
}

// Chat History Management
export async function getChatHistoryByClientPhoneNumber(clientPhoneNumber: string, gymPhoneNumber: string): Promise<ChatInteraction[]> {
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection<ChatInteraction>(COLLECTION_NAME);
    return await collection.find({clientPhoneNumber, gymPhoneNumber}).toArray();
}

export async function getClientPhoneNumbersByGym(gymPhoneNumber: string): Promise<string[]> {
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection<ChatInteraction>(COLLECTION_NAME);
  
    // Find all documents with the given gymPhoneNumber and project only clientPhoneNumber
    const results = await collection
      .find({ gymPhoneNumber }, { projection: { clientPhoneNumber: 1, _id: 0 } })
      .toArray();
  
    // Extract clientPhoneNumber from each document
    const clientPhoneNumbers = results.map(doc => doc.clientPhoneNumber);
    
    // return a unique list
    return clientPhoneNumbers.filter((value, index, array) => array.indexOf(value) === index);
  }

export async function getChatHistoryByGymPhoneNumber(gymPhoneNumber: string): Promise<ChatInteraction[]> {
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection<ChatInteraction>(COLLECTION_NAME);
    return await collection.find({gymPhoneNumber}).toArray();
}

export async function addChatInteraction(
    clientPhoneNumber: string, 
    gymPhoneNumber: string,
    clientMessage: string, 
    assistantResponse: string
): Promise<void> {
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection<ChatInteraction>(COLLECTION_NAME);
    

    await collection.insertOne({
        clientPhoneNumber,
        gymPhoneNumber,
        clientMessage,
        assistantResponse,
        timestamp: Date.now()
    });
}

export async function getFormattedChatHistoryByClientPhoneNumber(clientPhoneNumber: string, gymPhoneNumber: string): Promise<string> {
    const history = await getChatHistoryByClientPhoneNumber(clientPhoneNumber, gymPhoneNumber);
    return history
        .map((entry) => `Q: ${entry.clientMessage}\nA: ${entry.assistantResponse}`)
        .join("\n");
}

