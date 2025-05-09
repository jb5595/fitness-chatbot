import dotenv from 'dotenv';

dotenv.config();

const FRONT_END_BASE_URL = process.env.FRONT_END_BASE_URL;

export const gymClientChatHistoryUrl = (gymPhoneNumber: string, clientPhoneNumber: string) => {
    return `${FRONT_END_BASE_URL}/chat-history/${gymPhoneNumber}?clientPhoneNumber=${clientPhoneNumber}`
}