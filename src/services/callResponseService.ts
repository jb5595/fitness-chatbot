// services/callResponseService.ts
import twilio from "twilio";

import { addConsent } from "../database/helpers/consents.js";
import { getGymProfileByPhoneNumber, GymProfile } from "../database/helpers/gymProfile.js";
import { addChatInteraction } from "../database/helpers/chatHistory.js";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse.js";

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

  private async sendTextResponse(userId: string, toNumber: string): Promise<string> {
    const gymProfile: GymProfile | null = await getGymProfileByPhoneNumber(toNumber);
    const gymName = gymProfile?.name || "Us"
    const response = `Thanks for calling ${gymName}! How can we assist you today? Reply here.`;
    await this.twilioClient.messages.create({
      body: response,
      from: this.config.twilioNumber,
      to: userId,
    });
    console.log(`Sent SMS to ${userId}: ${response}`);

    await addChatInteraction(userId, "Requested text via call", response);
    await addConsent(userId, toNumber, `User requested text response via voice call to ${toNumber}`);

    return "We’ve sent you a text. Please reply there. Goodbye.";
  }

  async generateVoiceResponse(userId: string, digit: string, toNumber: string): Promise<string> {
    const twiml = new VoiceResponse();

    if (digit === "1") {
      const voiceMessage = await this.sendTextResponse(userId, toNumber);
      twiml.say(voiceMessage);
    } else {
      twiml.say("Invalid option. Goodbye.");
    }

    return twiml.toString();
  }
}

