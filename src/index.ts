import express, { Request, Response } from "express";
import { OpenAI } from "openai";
import twilio from "twilio";
import { getGymProfile, setupDatabase } from './database/db.js';
import dotenv from "dotenv";
import { FitnessAssistantReplyGeneratorService } from "./services/fitnessAssistantReplyGeneratorService.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const CALENDLY_LINK = "calendly.com/jacobberman1995";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


interface TwilioRequest extends Request {
    body: {
        Body: string;
        From: string;
        To: string
    }
}

app.post("/sms", async (req: TwilioRequest, res: Response) => {
    const userInput = req.body.Body;
    const fromNumber = req.body.From;
    const toNumber = req.body.To.replace(/\D/g, '');
    const gymProfile = await getGymProfile(toNumber)
    console.log("body", req.body);
    console.log("userInput", userInput);
    console.log("toNumber", toNumber)
    const replyGenerator = new FitnessAssistantReplyGeneratorService({
        gymProfile:gymProfile
    });
    const response = await replyGenerator.generateReply(userInput, fromNumber);
    console.log("sending response via twillio")
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(response);
    res.type("text/xml");
    res.send(twiml.toString());
});

// Start the app with database setup
async function startApp(): Promise<void> {
    await setupDatabase();
    app.listen(3000, () => console.log("Server running on port 3000"));
}

startApp().catch((err) => console.error("Failed to start app:", err));