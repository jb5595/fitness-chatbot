import { OpenAIChatService } from "./openAIChatService.js";

type Intent = "booking" | "general question" | "workout suggestion" | "other";

export class IntentDeterminationService {
    private static INTENT_PROMPT = `Classify the intent of this message as one of: "booking", "general question", "workout suggestion", or "other". Return only the intent in lowercase.`;

    static async determineIntent(customerMessage: string): Promise<Intent> {
        const chatService = new OpenAIChatService();
        const response = await chatService.chat(
            [this.INTENT_PROMPT],
            [customerMessage]
        );
        return response?.trim() as Intent;
    }
}
