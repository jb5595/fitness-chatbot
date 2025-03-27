// voiceResponseService.js
import twilio from "twilio";
import { addChatInteraction } from "../database/helpers/chatHistory.js"; // Updated helper imports
import { addConsent } from "../database/helpers/consents.js";

const VoiceResponse = twilio.twiml.VoiceResponse;

interface VoiceResponseConfig {
  twilioNumber: string;
  defaultMessage: string;
}

export class VoiceResponseService {
  private readonly config: VoiceResponseConfig;
  private readonly twilioClient;

  constructor(config?: Partial<VoiceResponseConfig>) {
    this.config = {
      twilioNumber: config?.twilioNumber || process.env.TWILIO_PHONE_NUMBER || '',
      defaultMessage:
        config?.defaultMessage ||
        "Thanks for giving us a call! How can we assist you today?",
    };
    this.twilioClient = new twilio.Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  // Send SMS and return voice response
  private async sendTextResponse(userId: string): Promise<string> {
    const response = this.config.defaultMessage;
    await this.twilioClient.messages.create({
      body: response,
      from: this.config.twilioNumber,
      to: userId,
    });
    console.log(`Sent SMS to ${userId}: ${response}`);

    // Log interaction and consent using helper methods
    await addChatInteraction(userId, "Requested text via call", response);
    await addConsent(userId, this.config.twilioNumber ,"User requested text response via voice call");

    return "We’ve sent you a text. Please reply there. Goodbye.";
  }

  // Main method to handle voice response
  async generateVoiceResponse(userId: string, digit: string): Promise<string> {
    const twiml = new VoiceResponse();

    if (digit === "1") {
      const voiceMessage = await this.sendTextResponse(userId);
      twiml.say(voiceMessage);
    } else {
      twiml.say("Invalid option. Goodbye.");
    }

    return twiml.toString();
  }
}