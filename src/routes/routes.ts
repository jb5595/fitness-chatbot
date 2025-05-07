export enum ROUTES {
    SMS= "/sms",
    VOICE_CALL = "/voice",
    VOICE_CALL_INPUT= "/voice-response",
    GET_GYM = "/gym/:gymPhoneNumber",
    CHAT_HISTORY_GYM_MESSENGERS = "/chat-history/gym/:gymPhoneNumber/users",
    CHAT_HISTORY_GYM_MESSENGER_MESSAGES = '/chat-history/gym/:gymPhoneNumber/chats/:userPhoneNumber'
}