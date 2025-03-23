import { IntentDeterminationService } from "./intentDeterminationService.js";
import { ScrapingService } from "./scrapingService.js";
import { OpenAIChatService } from "./openAIChatService.js";
import { addCustomerInteraction } from "../database/db.js";
export class FitnessAssistantReplyGeneratorService {
    constructor(config) {
        this.config = {
            calendlyLink: config?.calendlyLink || "calendly.com/jacobberman1995",
            websiteUrls: config?.websiteUrls || [
                "https://topeiraboxing.com/about-us/",
                "https://topeiraboxing.com/faq/"
            ],
            systemPrompt: config?.systemPrompt ||
                "You're a fitness coach's assistant. Answer questions about rates, availability, and suggest workouts. Keep it short."
        };
        this.chatService = new OpenAIChatService();
        // Pre-fetch website content on initialization
        this.scrapedContentPromise = ScrapingService.scrapeUrls(this.config.websiteUrls);
    }
    async getSystemPrompt() {
        const additionalContext = await this.scrapedContentPromise;
        return `${this.config.systemPrompt}\nAdditional context from the fitness website: ${additionalContext}`;
    }
    async generateBookingReply(userInput, fromNumber) {
        const response = `Let's get you scheduled! Book here: ${this.config.calendlyLink}`;
        await this.logInteraction(fromNumber, userInput, `Sent booking link: ${this.config.calendlyLink}`);
        return response;
    }
    async generateChatReply(userInput, fromNumber) {
        const systemPrompt = await this.getSystemPrompt();
        const response = await this.chatService.chatWithHistory(fromNumber, [systemPrompt], [userInput]);
        await this.logInteraction(fromNumber, userInput, response || '');
        return response || '';
    }
    async logInteraction(fromNumber, userInput, response) {
        await addCustomerInteraction(fromNumber, userInput, response);
    }
    async generateReply(userInput, fromNumber) {
        try {
            const intent = await IntentDeterminationService.determineIntent(userInput);
            console.log(`Detected intent: ${intent}`);
            const response = intent === "booking"
                ? await this.generateBookingReply(userInput, fromNumber)
                : await this.generateChatReply(userInput, fromNumber);
            return response;
        }
        catch (error) {
            console.error('Error generating reply:', error);
            return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
        }
    }
}
