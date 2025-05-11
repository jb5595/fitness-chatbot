import { IntentDeterminationService } from "./intentDeterminationService";
import { OpenAIChatService } from "./openAIChatService";
import { ContextGeneratorService } from "./GymProfileContextGeneratorService";
import twilio from "twilio";
import { addChatInteraction } from "../database/helpers/chatHistory";
import {gymClientChatHistoryUrl} from "../helpers/frontendRoutesHelper"
import { GymProfile } from "../models/GymProfile";

interface AssistantConfig {
    systemPrompt: string;
    gymProfile: GymProfile;
}

export class FitnessAssistantReplyGeneratorService {
    private readonly config: AssistantConfig;
    private readonly chatService: OpenAIChatService;
    private readonly twilioClient;

    private static DEFAULT_BOOKING_CONFIRMATION = "Great we got you booked looking forward to seeing you in for your free trial class"


    constructor(config?: Partial<AssistantConfig>) {
        this.config = {
            systemPrompt: config?.systemPrompt || 
                "You're a fitness coach's assistant. Answer questions about rates, availability, and suggest workouts. Keep it short.",
            gymProfile: config?.gymProfile
        };
        
        this.chatService = new OpenAIChatService();
        this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    }

    private async getSystemPrompt(): Promise<string> {
        const contexts = [
            this.config.systemPrompt,
            ContextGeneratorService.generateContextFromGymProfile(this.config.gymProfile)
        ];

        return ContextGeneratorService.combineContexts(contexts);
    }



    private async generateChatReply(clientInput: string, clientPhoneNumber: string, gymPhoneNumber: string): Promise<string> {
        const systemPrompt = await this.getSystemPrompt();
        const response = await this.chatService.chatWithHistory(
            clientPhoneNumber,
            gymPhoneNumber,
            [systemPrompt],
            [clientInput]
        );
        return response || '';
    }

    async sendBookingConfirmationTextToGym(clientPhoneNumber: string){
        if (!this.config.gymProfile?.forwardingNumber) {
            console.warn("No forwarding number found in gym profile. Skipping confirmation SMS.");
            return;
        }

        const messageBody = `New booking at ${this.config.gymProfile.name || "the gym"}: Client (${clientPhoneNumber}) booked a free trial class. See chat history: ${gymClientChatHistoryUrl(this.config.gymProfile.phoneNumber, clientPhoneNumber)}`;

        try {
            await this.twilioClient.messages.create({
                body: messageBody,
                from: this.config.gymProfile.phoneNumber, // The gym's Twilio number
                to: this.config.gymProfile.forwardingNumber // The gym owner's number
            });
            console.log(`Confirmation SMS sent to ${this.config.gymProfile.forwardingNumber}: ${messageBody}`);
        } catch (error) {
            console.error("Error sending booking confirmation SMS:", error);
        }    }

    async generateReply(clientInput: string, clientPhoneNumber: string, gymPhoneNumber: string): Promise<string> {
        try {
            const intent = await IntentDeterminationService.determineIntent(clientPhoneNumber, gymPhoneNumber, clientInput);
            console.log(`Detected intent: ${intent}`);
            let response: string;
             if(intent =="booking-confirmation"){
                const systemPrompt = await this.getSystemPrompt();
                this.sendBookingConfirmationTextToGym(clientPhoneNumber)
                response = await this.chatService.reWriteMessageBasedOnContext(clientPhoneNumber, gymPhoneNumber, 
                    FitnessAssistantReplyGeneratorService.DEFAULT_BOOKING_CONFIRMATION,
                    [systemPrompt])
            }
            else {
                console.log("generarting chat reply")
                response = await this.generateChatReply(clientInput, clientPhoneNumber, gymPhoneNumber);
            }
            console.log("generated response");

            await addChatInteraction(clientPhoneNumber, gymPhoneNumber, clientInput, response || '');

            return response;
        } catch (error) {
            console.error('Error generating reply:', error);
            return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
        }
    }
}
