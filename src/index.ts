import express, { Request, Response } from "express";
import twilio from "twilio";
import { closeDatabase, setupDatabase } from './database/db.ts';
import dotenv from "dotenv";
import { getFormattedChatHistory } from "./database/helpers/chatHistory.ts";
import { FitnessAssistantReplyGeneratorService } from "./services/fitnessAssistantReplyGeneratorService.ts";
import { getGymProfileByPhoneNumber } from "./database/helpers/gymProfile.ts";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse.js";
import { VoiceResponseService } from "./services/callResponseService.ts";
import path from "path"; // Add this import
import cors from "cors"

dotenv.config();

const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug log

interface TwilioRequest extends Request {
    body: {
        Body: string;
        From: string;
        To: string;
    };
}

app.post("/sms", async (req: TwilioRequest, res: Response) => {
    const userInput = req.body.Body;
    const userPhoneNumber = req.body.From;
    const gymPhoneNumber = req.body.To.replace(/\D/g, '');

    console.log(`Receiving request from: ${userPhoneNumber}, to: ${gymPhoneNumber}, content: ${userInput}`);
    const gymProfile = await getGymProfileByPhoneNumber(gymPhoneNumber);

    const twiml = new twilio.twiml.MessagingResponse();

    if (!gymProfile) {
        twiml.message("Sorry, you're trying to message a gym that's not set up.");
        res.type("text/xml");
        res.send(twiml.toString());
        return;
    }

    const replyGenerator = new FitnessAssistantReplyGeneratorService({
        gymProfile: gymProfile
    });
    const response = await replyGenerator.generateReply(userInput, userPhoneNumber, gymPhoneNumber);
    console.log("Sending response");
    twiml.message(response);
    res.type("text/xml");
    res.send(twiml.toString());
});

// New /voice endpoint for incoming calls
app.post("/voice", (req, res) => {
    const twiml = new VoiceResponse();
    const gather = twiml.gather({
      numDigits: 1,
      action: "/voice-response",
      method: "POST",
      timeout: 5,
    });
    gather.say(
      "Thanks for calling! Press 1 if you would like to receive a text response."
    );
    twiml.say("We didn’t receive an input. Goodbye.");
    res.type("text/xml");
    res.send(twiml.toString());
  });
  
  // Handle voice response
  app.post("/voice-response", async (req, res) => {
    const userId = req.body.From;
    const digit = req.body.Digits;
    const toNumber = req.body.To.replace(/\D/g, '');
    console.log(`in voice response fromNumber ${userId}, to number: ${toNumber}, Digit ${digit}`)
    const voiceService = new VoiceResponseService({
        twilioNumber: toNumber,
    });
    const twimlResponse = await voiceService.generateVoiceResponse(userId, digit, toNumber);

    res.type("text/xml");
    res.send(twimlResponse);
  });

  app.get('/gym/:userId', async (req: {params: {phoneNumber: string}}, res) => {
    const gym = await getGymProfileByPhoneNumber(req.params.phoneNumber)
    res.type("text/xml");
    res.send(gym)
  })

  app.get('/gym/:userId/chatHistory', async (req: {params: {userId: string}}, res) => {
    const chatHistory = await getFormattedChatHistory(req.params.userId)
    res.type("text/json");
    res.send(JSON.stringify(chatHistory))
  })


// Start the app with database setup
async function startApp(): Promise<void> {
    try {
        await setupDatabase();

        // Add graceful shutdown
        process.on('SIGINT', async () => {
            console.log('Shutting down gracefully...');
            await closeDatabase();
            process.exit(0);
        });

        app.listen(3000, () => console.log("Server running on port 3000"));
    } catch (error) {
        console.error("Failed to start app:", error);
        process.exit(1);
    }
}

startApp().catch((err) => console.error("Failed to start app:", err));