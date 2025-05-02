import { IntentDeterminationService } from "./intentDeterminationService.ts";
import { OpenAIChatService } from "./openAIChatService.ts";
import { ContextGeneratorService } from "./GymProfileContextGeneratorService.ts";
import { GymProfile } from "../database/helpers/gymProfile.ts";
import { addChatInteraction } from "../database/helpers/chatHistory.ts";

interface AssistantConfig {
    calendlyLink: string;
    systemPrompt: string;
    gymProfile?: GymProfile;
}

export class FitnessAssistantReplyGeneratorService {
    private readonly config: AssistantConfig;
    private readonly chatService: OpenAIChatService;


    constructor(config?: Partial<AssistantConfig>) {
        this.config = {
            calendlyLink: config?.calendlyLink || "calendly.com/jacobberman1995",
            systemPrompt: config?.systemPrompt || 
                "You're a fitness coach's assistant. Answer questions about rates, availability, and suggest workouts. Keep it short.",
            gymProfile: config?.gymProfile
        };
        
        this.chatService = new OpenAIChatService();
    }

    private async getSystemPrompt(): Promise<string> {
        const contexts = [
            this.config.systemPrompt,
            ContextGeneratorService.generateContextFromGymProfile(this.config.gymProfile)
        ];

        return ContextGeneratorService.combineContexts(contexts);
    }

    private async generateBookingReply(userInput: string, userPhoneNumber: string, gymPhoneNumber: string): Promise<string> {

        if (this.config.gymProfile?.bookingType === "CALENDLY"){
        const bookingLink = this.config.calendlyLink;
        const response = `Let's get you scheduled! Book here: ${bookingLink}`;
        await this.logInteraction(userPhoneNumber, gymPhoneNumber, userInput, `Sent booking link: ${bookingLink}`);
        return response;
        }
        // If its a walkin booking type get their full name to foward to gym after confirmation
        else{
            const systemPrompt = await this.getSystemPrompt();
            const baseMessage = "Let's get you all set up! But first can I get your full name in order to get you confirmed?"
            const message = await this.chatService.reWriteMessageBasedOnContext(userPhoneNumber, gymPhoneNumber, baseMessage, [systemPrompt])
            await this.logInteraction(userPhoneNumber, gymPhoneNumber, userInput, message);
            return message
        }

    }

    private async generateChatReply(userInput: string, userPhoneNumber: string, gymPhoneNumber: string): Promise<string> {
        const systemPrompt = await this.getSystemPrompt();
        const response = await this.chatService.chatWithHistory(
            userPhoneNumber,
            gymPhoneNumber,
            [systemPrompt],
            [userInput]
        );
        return response || '';
    }

    private async logInteraction(userPhoneNumber: string, gymPhoneNumber: string, userInput: string, response: string): Promise<void> {
        await addChatInteraction(userPhoneNumber, gymPhoneNumber, userInput, response);
    }

    async generateReply(userInput: string, userPhoneNumber: string, gymPhoneNumber: string): Promise<string> {
        try {
            const intent = await IntentDeterminationService.determineIntent(userPhoneNumber, gymPhoneNumber, userInput);
            console.log(`Detected intent: ${intent}`);

            let response: string;
            
            if (intent === "booking") {
                response = await this.generateBookingReply(userInput, userPhoneNumber, gymPhoneNumber);
            } else if(intent ==="booking-confirmation" && this.config.gymProfile?.customBookingConfirmationMessage){
                const systemPrompt = await this.getSystemPrompt();

                response = await this.chatService.reWriteMessageBasedOnContext(userPhoneNumber, gymPhoneNumber, this.config.gymProfile?.customBookingConfirmationMessage, [systemPrompt])
            }
            else {
                response = await this.generateChatReply(userInput, userPhoneNumber, gymPhoneNumber);
            }
            console.log("generated response");
            return response;
        } catch (error) {
            console.error('Error generating reply:', error);
            return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
        }
    }
}
