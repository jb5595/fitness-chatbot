import { OpenAIService } from "./openAIService.js";

type Intent = "booking" | "general question" | "workout suggestion" | "other";

export class IntentDeterminationService {
    private static INTENT_PROMPT = `Classify the intent of this message as one of: "booking", "general question", "workout suggestion", or "other". Return only the intent in lowercase.`;

    static async determineIntent(customerMessage: string): Promise<Intent> {
        const response = await OpenAIService.call(
            [this.INTENT_PROMPT],
            [customerMessage]
        );
        return response?.trim() as Intent;
    }
}
