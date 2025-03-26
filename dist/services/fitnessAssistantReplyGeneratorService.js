import { IntentDeterminationService } from "./intentDeterminationService.js";
import { ScrapingService } from "./scrapingService.js";
import { OpenAIChatService } from "./openAIChatService.js";
import { ContextGeneratorService } from "./GymProfileContextGeneratorService.js";
import { addChatInteraction } from "../database/helpers/chatHistory.js";
export class FitnessAssistantReplyGeneratorService {
    constructor(config) {
        this.config = {
            calendlyLink: config?.calendlyLink || "calendly.com/jacobberman1995",
            websiteUrls: config?.websiteUrls || [
                "https://topeiraboxing.com/about-us/",
                "https://topeiraboxing.com/faq/"
            ],
            systemPrompt: config?.systemPrompt ||
                "You're a fitness coach's assistant. Answer questions about rates, availability, and suggest workouts. Keep it short.",
            gymProfile: config?.gymProfile
        };
        this.chatService = new OpenAIChatService();
        this.scrapedContentPromise = ScrapingService.scrapeUrls(this.config.websiteUrls);
    }
    async getSystemPrompt() {
        const contexts = [
            this.config.systemPrompt,
            ContextGeneratorService.generateContextFromGymProfile(this.config.gymProfile),
            `Additional context from the fitness website: ${await this.scrapedContentPromise}`
        ];
        return ContextGeneratorService.combineContexts(contexts);
    }
    async generateBookingReply(userInput, fromNumber) {
        const bookingLink = this.config.calendlyLink;
        const response = `Let's get you scheduled! Book here: ${bookingLink}`;
        await this.logInteraction(fromNumber, userInput, `Sent booking link: ${bookingLink}`);
        return response;
    }
    async generateChatReply(userInput, fromNumber) {
        const systemPrompt = await this.getSystemPrompt();
        const response = await this.chatService.chatWithHistory(fromNumber, [systemPrompt], [userInput]);
        return response || '';
    }
    async logInteraction(fromNumber, userInput, response) {
        await addChatInteraction(fromNumber, userInput, response);
    }
    async generateReply(userInput, fromNumber) {
        try {
            const intent = await IntentDeterminationService.determineIntent(userInput);
            console.log(`Detected intent: ${intent}`);
            const response = intent === "booking"
                ? await this.generateBookingReply(userInput, fromNumber)
                : await this.generateChatReply(userInput, fromNumber);
            console.log("generated response");
            return response;
        }
        catch (error) {
            console.error('Error generating reply:', error);
            return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
        }
    }
}
