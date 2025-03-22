import express from "express";
import { OpenAI } from "openai";
import twilio from "twilio";
import { setupDatabase, addCustomerInteraction, getFormattedCustomerHistory } from './database/db.js';
import { IntentDeterminationService } from "./services/intentDeterminationService.js";
import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const CALENDLY_LINK = "calendly.com/jacobberman1995";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// Function to scrape a URL and extract text
async function scrapeUrl(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const text = $("p, h1, h2, h3, h4, h5, h6")
            .map((i, el) => $(el).text().trim())
            .get()
            .join("\n");
        return text.length > 0 ? text : "No readable content found.";
    }
    catch (error) {
        console.error("Scraping error:", error);
        return "Failed to scrape the URL.";
    }
}
app.post("/sms", async (req, res) => {
    const userInput = req.body.Body;
    const fromNumber = req.body.From;
    console.log("body", req.body);
    console.log("userInput", userInput);
    const intent = await IntentDeterminationService.determineIntent(userInput);
    console.log(`Detected intent: ${intent}`);
    if (intent === "booking") {
        const twiml = new twilio.twiml.MessagingResponse();
        twiml.message(`Let's get you scheduled! Book here: ${CALENDLY_LINK}`);
        res.type("text/xml");
        res.send(twiml.toString());
        console.log(`Sent booking link to ${fromNumber}`);
        await addCustomerInteraction(fromNumber, userInput, `Sent booking link: ${CALENDLY_LINK}`);
    }
    else {
        const previousQuestions = await getFormattedCustomerHistory(fromNumber);
        const additionalContext = await scrapeUrl("https://topeiraboxing.com/about-us/") + await scrapeUrl("https://topeiraboxing.com/faq/");
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You're a fitness coach's assistant. Previous customer questions:\n${previousQuestions}\nAdditional context from the fitness website: ${additionalContext}\nAnswer questions about rates, availability, and suggest workouts. Keep it short.`,
                },
                { role: "user", content: userInput },
            ],
        });
        console.log(response);
        const reply = response.choices[0].message.content;
        await addCustomerInteraction(fromNumber, userInput, reply || '');
        const twiml = new twilio.twiml.MessagingResponse();
        twiml.message(reply || '');
        res.type("text/xml");
        res.send(twiml.toString());
    }
});
// Start the app with database setup
async function startApp() {
    await setupDatabase();
    app.listen(3000, () => console.log("Server running on port 3000"));
}
startApp().catch((err) => console.error("Failed to start app:", err));
