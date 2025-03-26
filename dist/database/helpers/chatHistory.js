import { client, connectToDatabase, DB_NAME } from "../db.js";
const COLLECTION_NAME = "chat_history";
// Chat History Management
export async function getChatHistory(userId) {
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);
    return await collection.find({ userId }).toArray();
}
export async function addChatInteraction(userId, userMessage, assistantResponse) {
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);
    await collection.insertOne({
        userId,
        userMessage,
        assistantResponse,
        timestamp: Date.now()
    });
}
export async function getFormattedChatHistory(userId) {
    const history = await getChatHistory(userId);
    return history
        .map((entry) => `Q: ${entry.userMessage}\nA: ${entry.assistantResponse}`)
        .join("\n");
}
