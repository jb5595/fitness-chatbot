import express from "express";
import { OpenAI } from "openai";
import twilio from "twilio";
import { setupDatabase } from './database/db.js';
import dotenv from "dotenv";
import { FitnessAssistantReplyGeneratorService } from "./services/fitnessAssistantReplyGeneratorService.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const CALENDLY_LINK = "calendly.com/jacobberman1995";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
app.post("/sms", async (req, res) => {
    const userInput = req.body.Body;
    const fromNumber = req.body.From;
    console.log("body", req.body);
    console.log("userInput", userInput);
    const replyGenerator = new FitnessAssistantReplyGeneratorService();
    const response = await replyGenerator.generateReply(userInput, fromNumber);
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(response);
    res.type("text/xml");
    res.send(twiml.toString());
});
// Start the app with database setup
async function startApp() {
    await setupDatabase();
    app.listen(3000, () => console.log("Server running on port 3000"));
}
startApp().catch((err) => console.error("Failed to start app:", err));
