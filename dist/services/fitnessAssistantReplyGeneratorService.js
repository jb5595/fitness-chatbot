import { IntentDeterminationService } from "./intentDeterminationService.js";
import { ScrapingService } from "./scrapingService.js";
import { OpenAIChatService } from "./openAIChatService.js";
import { addCustomerInteraction } from "../database/db.js";
export class FitnessAssistantReplyGeneratorService {
    constructor() {
        this.chatService = new OpenAIChatService();
    }
    async generateReply(userInput, fromNumber) {
        const intent = await IntentDeterminationService.determineIntent(userInput);
        console.log(`Detected intent: ${intent}`);
        if (intent === "booking") {
            const response = `Let's get you scheduled! Book here: ${FitnessAssistantReplyGeneratorService.CALENDLY_LINK}`;
            await addCustomerInteraction(fromNumber, userInput, `Sent booking link: ${FitnessAssistantReplyGeneratorService.CALENDLY_LINK}`);
            return response;
        }
        const additionalContext = await ScrapingService.scrapeUrls([
            "https://topeiraboxing.com/about-us/",
            "https://topeiraboxing.com/faq/"
        ]);
        const response = await this.chatService.chatWithHistory(fromNumber, [`You're a fitness coach's assistant. Additional context from the fitness website: ${additionalContext}\nAnswer questions about rates, availability, and suggest workouts. Keep it short.`], [userInput]);
        return response || '';
    }
}
FitnessAssistantReplyGeneratorService.CALENDLY_LINK = "calendly.com/jacobberman1995";
