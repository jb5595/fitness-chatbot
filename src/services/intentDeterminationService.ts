import { OpenAIChatService } from "./openAIChatService";

type Intent =  "general-question"| "booking-confirmation" | "other";

export class IntentDeterminationService {
    private static INTENT_PROMPT = `You are classifying the intent of a user's message in a gym chatbot. The possible intents are:
    - "booking-confirmation": The user is confirming a booking by providing their full name and/or a preferred class time from the free trial schedule (e.g., "My name is Sarah Johnson", "I’ll come on Monday at 7pm"). If the name or time was provided in a previous message, consider this intent if the current message provides the missing piece.
    - "general-question": The user is asking about gym details (e.g., "What’s your pricing?", "When are you open?", "How much is a membership?").
    - "other": Any other intent not covered above (e.g., "Hi", "Thanks", "What’s the weather?").

    Instructions:
    1. Use the chat history to determine if the user has already provided their name or preferred time.
    2. For "booking-confirmation", the user must provide their full name and a preferred class time (not necessarily in the same message). If the current message provides one piece and the other was provided earlier, classify as "booking-confirmation".
    3. Return only the intent in lowercase with no quotes (e.g., general-question, booking-confirmation).`;

    static async determineIntent(userPhoneNumber: string, gymPhoneNumber: string, customerMessage: string): Promise<Intent> {
        const chatService = new OpenAIChatService();
        const response = await chatService.chatWithHistory(
            userPhoneNumber,
            gymPhoneNumber,
            [this.INTENT_PROMPT],
            [customerMessage]
        );
        return response?.trim() as Intent;
    }
}
