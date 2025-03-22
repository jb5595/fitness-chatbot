import { OpenAIService } from "./openAIService.js";
export class IntentDeterminationService {
    static async determineIntent(customerMessage) {
        const response = await OpenAIService.call([this.INTENT_PROMPT], [customerMessage]);
        return response?.trim();
    }
}
IntentDeterminationService.INTENT_PROMPT = `Classify the intent of this message as one of: "booking", "general question", "workout suggestion", or "other". Return only the intent in lowercase.`;
