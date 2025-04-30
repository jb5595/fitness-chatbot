import { IntentDeterminationService } from "./intentDeterminationService.js";
import { OpenAIChatService } from "./openAIChatService.js";
import { ContextGeneratorService } from "./GymProfileContextGeneratorService.js";
import { GymProfile } from "../database/helpers/gymProfile.js";
import { addChatInteraction } from "../database/helpers/chatHistory.js";
import twilio, { Twilio } from "twilio";

interface AssistantConfig {
    calendlyLink: string;
    systemPrompt: string;
    gymProfile?: GymProfile;
}

export class FitnessAssistantReplyGeneratorService {
    private readonly config: AssistantConfig;
    private readonly chatService: OpenAIChatService;
    private readonly twillioClient: Twilio


    constructor(config?: Partial<AssistantConfig>) {
        this.config = {
            calendlyLink: config?.calendlyLink || "calendly.com/jacobberman1995",
            systemPrompt: config?.systemPrompt || 
                "You're a fitness coach's assistant. Answer questions about rates, availability, and suggest workouts. Keep it short.",
            gymProfile: config?.gymProfile
        };
        this.twillioClient  = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
          );
          
          
        this.chatService = new OpenAIChatService();
    }

    private async getSystemPrompt(): Promise<string> {
        const contexts = [
            this.config.systemPrompt,
            ContextGeneratorService.generateContextFromGymProfile(this.config.gymProfile)
        ];

        return ContextGeneratorService.combineContexts(contexts);
    }

    private async generateBookingReply(userInput: string, fromNumber: string): Promise<string> {
        
        if (this.config.gymProfile?.bookingType === "CALENDLY"){
        const bookingLink = this.config.calendlyLink;
        const response = `Let's get you scheduled! Book here: ${bookingLink}`;
        await this.logInteraction(fromNumber, userInput, `Sent booking link: ${bookingLink}`);
        return response;
        }
        // If its a walkin booking type get their full name to foward to gym after confirmation
        else{
            const systemPrompt = await this.getSystemPrompt();
            const baseMessage = "Let's get you all set up! But first can I get your full name in order to get you confirmed?"
            const message = await this.chatService.reWriteMessageBasedOnContext(fromNumber,  baseMessage, [systemPrompt])
            await this.logInteraction(fromNumber, userInput, message);
            return message
        }

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

    // Send a confirmation SMS to the gym's forwarding number
    private async sendConfirmationTextToGym(userNumber: string, userInput: string, confirmationMessage: string): Promise<void> {

        if (!this.config.gymProfile?.forwardingNumber) {
        console.warn("No forwarding number found in gym profile. Skipping confirmation SMS.");
        return;
        }

        const messageBody = `New booking for ${this.config.gymProfile.name || "unknown gym"}: Phone Number: (${userNumber}) confirmed with "${userInput}". Confirmation: ${confirmationMessage}`;

        try {
        await this.twillioClient.messages.create({
            body: messageBody,
            from: this.config.gymProfile.phoneNumber, // The gym's Twilio number
            to: this.config.gymProfile.forwardingNumber// The gym owner's number
        });
        console.log(`Confirmation SMS sent to ${this.config.gymProfile.forwardingNumber}: ${messageBody}`);
        } catch (error) {
        console.error("Error sending confirmation SMS:", error);
        }
    }



    async generateReply(userInput: string, fromNumber: string): Promise<string> {
        try {
            const intent = await IntentDeterminationService.determineIntent(fromNumber, userInput);
            console.log(`Detected intent: ${intent}`);

            let response: string;
            
            if (intent === "booking") {
                response = await this.generateBookingReply(userInput, fromNumber);
            } else if(intent ==="booking-confirmation" && this.config.gymProfile?.customBookingConfirmationMessage){
                const systemPrompt = await this.getSystemPrompt();

                response = await this.chatService.reWriteMessageBasedOnContext(fromNumber,  this.config.gymProfile?.customBookingConfirmationMessage, [systemPrompt])
                this.sendConfirmationTextToGym(fromNumber, userInput, response)
            }
            else {
                response = await this.generateChatReply(userInput, fromNumber);
            }
            console.log("generated response", response);
            return response;
        } catch (error) {
            console.error('Error generating reply:', error);
            return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
        }
    }
}
