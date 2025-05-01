import { OpenAIChatService } from "./openAIChatService.ts";

type Intent = "booking" | "general question"| "booking-confirmation" | "other";

export class IntentDeterminationService {
    private static INTENT_PROMPT = `Classify the intent of this message as one of: "booking", "general question", "booking-confirmation", or "other". If the user is replying with their name after inquiring about booking treat it as a booking-confirmation. Return only the intent in lowercase.`;

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
