// services/callResponseService.ts
import twilio from "twilio";
import { addConsent } from "../database/helpers/consents";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse.js";
import { GymProfile } from "../models/GymProfile";
import { ChatHistory } from "../models/ChatHistory";

interface VoiceResponseConfig {
  twilioNumber: string;
  defaultMessage?: string;
}

export class VoiceResponseService {
  private readonly config: VoiceResponseConfig;
  private readonly twilioClient;

  constructor(config?: Partial<VoiceResponseConfig>) {
    this.config = {
      twilioNumber: config?.twilioNumber || process.env.TWILIO_PHONE_NUMBER!,
      defaultMessage:
        config?.defaultMessage ||
        "Thanks for calling! How can we assist you today? Reply here.",
    };
    this.twilioClient = new twilio.Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }

  private async sendTextResponse(clientPhoneNumber: string, gymPhoneNumber: string): Promise<string> {
    const gymProfile = await GymProfile.findOne(
        {phoneNumber: gymPhoneNumber}
    );
    const gymName = gymProfile?.name || "Us"
    const response = `Thanks for calling ${gymName}! How can we assist you today? Reply here. Reply STOP to opt out.`;
    await this.twilioClient.messages.create({
      body: response,
      from: this.config.twilioNumber,
      to: clientPhoneNumber,
    });
    console.log(`Sent SMS to ${clientPhoneNumber}: ${response}`);

    await ChatHistory.insertOne({
        clientPhoneNumber,
        gymPhoneNumber,
        clientMessage: "Requested text via call",
        assistantResponse: response,
        timestamp: Date.now()
    });
    await addConsent(clientPhoneNumber, gymPhoneNumber, `Client requested text response via voice call to ${gymPhoneNumber}`);

    return "We’ve sent you a text. Please reply there. Goodbye.";
  }

  async generateVoiceResponse(clientPhoneNumber: string, digit: string, toNumber: string): Promise<string> {
    const twiml = new VoiceResponse();

    if (digit === "1") {
      const voiceMessage = await this.sendTextResponse(clientPhoneNumber, toNumber);
      twiml.say(voiceMessage);
    } else {
      twiml.say("Invalid option. Goodbye.");
    }

    return twiml.toString();
  }
}

