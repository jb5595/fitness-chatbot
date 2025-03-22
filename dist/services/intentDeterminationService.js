import { OpenAIChatService } from "./openAIChatService.js";
export class IntentDeterminationService {
    static async determineIntent(customerMessage) {
        const chatService = new OpenAIChatService();
        const response = await chatService.chat([this.INTENT_PROMPT], [customerMessage]);
        return response?.trim();
    }
}
IntentDeterminationService.INTENT_PROMPT = `Classify the intent of this message as one of: "booking", "general question", "workout suggestion", or "other". Return only the intent in lowercase.`;
