// services/callResponseService.ts
import twilio from "twilio";

import { addConsent } from "../database/helpers/consents";
import { getGymProfileByPhoneNumber, GymProfile } from "../database/helpers/gymProfile";
import { addChatInteraction } from "../database/helpers/chatHistory";
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

  private async sendTextResponse(userPhoneNumber: string, gymPhoneNumber: string): Promise<string> {
    const gymProfile: GymProfile | null = await getGymProfileByPhoneNumber(gymPhoneNumber);
    const gymName = gymProfile?.name || "Us"
    const response = `Thanks for calling ${gymName}! How can we assist you today? Reply here. Reply STOP to opt out.`;
    await this.twilioClient.messages.create({
      body: response,
      from: this.config.twilioNumber,
      to: userPhoneNumber,
    });
    console.log(`Sent SMS to ${userPhoneNumber}: ${response}`);

    await addChatInteraction(userPhoneNumber, gymPhoneNumber, "Requested text via call", response);
    await addConsent(userPhoneNumber, gymPhoneNumber, `User requested text response via voice call to ${gymPhoneNumber}`);

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

