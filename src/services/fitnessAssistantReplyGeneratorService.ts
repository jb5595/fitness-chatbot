import { IntentDeterminationService } from "./intentDeterminationService.js";
import { ScrapingService } from "./scrapingService.js";
import { OpenAIChatService } from "./openAIChatService.js";
import { ContextGeneratorService } from "./GymProfileContextGeneratorService.js";
import { GymProfile } from "../database/helpers/gymProfile.js";
import { addChatInteraction } from "../database/helpers/chatHistory.js";

interface AssistantConfig {
    calendlyLink: string;
    websiteUrls: string[];
    systemPrompt: string;
    gymProfile?: GymProfile;
}

export class FitnessAssistantReplyGeneratorService {
    private readonly config: AssistantConfig;
    private readonly chatService: OpenAIChatService;
    private readonly scrapedContentPromise: Promise<string>;

    constructor(config?: Partial<AssistantConfig>) {
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

    private async getSystemPrompt(): Promise<string> {
        const contexts = [
            this.config.systemPrompt,
            ContextGeneratorService.generateContextFromGymProfile(this.config.gymProfile),
            `Additional context from the fitness website: ${await this.scrapedContentPromise}`
        ];

        return ContextGeneratorService.combineContexts(contexts);
    }

    private async generateBookingReply(userInput: string, fromNumber: string): Promise<string> {
        const bookingLink = this.config.calendlyLink;
        const response = `Let's get you scheduled! Book here: ${bookingLink}`;
        await this.logInteraction(fromNumber, userInput, `Sent booking link: ${bookingLink}`);
        return response;
    }

    private async generateChatReply(userInput: string, fromNumber: string): Promise<string> {
        const systemPrompt = await this.getSystemPrompt();
        const response = await this.chatService.chatWithHistory(
            fromNumber,
            [systemPrompt],
            [userInput]
        );
        return response || '';
    }

    private async logInteraction(fromNumber: string, userInput: string, response: string): Promise<void> {
        await addChatInteraction(fromNumber, userInput, response);
    }

    async generateReply(userInput: string, fromNumber: string): Promise<string> {
        try {
            const intent = await IntentDeterminationService.determineIntent(userInput);
            console.log(`Detected intent: ${intent}`);

            const response = intent === "booking"
                ? await this.generateBookingReply(userInput, fromNumber)
                : await this.generateChatReply(userInput, fromNumber);
            console.log("generated response")
            return response;
        } catch (error) {
            console.error('Error generating reply:', error);
            return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
        }
    }
}
