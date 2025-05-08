export enum ROUTES {
    SMS= "/sms",
    VOICE_CALL = "/voice",
    VOICE_CALL_INPUT= "/voice-response",
    GET_GYM = "/gym/:gymPhoneNumber",
    CHAT_HISTORY_GYM_CLIENTS = "/chat-history/gym/:gymPhoneNumber/clients",
    CHAT_HISTORY_GYM_CLIENT_MESSAGES = '/chat-history/gym/:gymPhoneNumber/chats/:clientPhoneNumber'
}