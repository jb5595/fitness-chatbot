import mongoose from "mongoose";


export interface ChatHistory {
    _id?: string;  // MongoDB ID
    clientPhoneNumber: string;
    gymPhoneNumber: string
    clientMessage: string;
    assistantResponse: string;
    timestamp: Number;
}

const ChatHistorySchema = new mongoose.Schema<ChatHistory>({
    clientPhoneNumber: {
        type: String,
        required: true,
    },
    gymPhoneNumber: {
        type: String,
        required: true,
    },
    clientMessage: {
        type: String,
        required: true,
    },
    assistantResponse: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
    }
},
{ collection: 'chatHistory'});

export async function getFormattedChatHistoryByClientPhoneNumber(clientPhoneNumber: string, gymPhoneNumber: string): Promise<string> {
    const history = await ChatHistory.find({clientPhoneNumber, gymPhoneNumber})
    return history
        .map((entry) => `Q: ${entry.clientMessage}\nA: ${entry.assistantResponse}`)
        .join("\n");
}

export const ChatHistory = mongoose.model("ChatHistory", ChatHistorySchema);