const FRONT_END_BASE_URL = "https://fitness-chatbot-ui-git-main-jb5595s-projects.vercel.app";

export const gymClientChatHistoryUrl = (gymPhoneNumber: string, clientPhoneNumber: string) => {
    return `${FRONT_END_BASE_URL}/chat-history/${gymPhoneNumber}?clientPhoneNumber=${clientPhoneNumber}`
}