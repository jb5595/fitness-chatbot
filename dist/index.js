import express from "express";
import twilio from "twilio";
import { closeDatabase, setupDatabase } from './database/db.js';
import dotenv from "dotenv";
import { FitnessAssistantReplyGeneratorService } from "./services/fitnessAssistantReplyGeneratorService.js";
import { getGymProfileByPhoneNumber } from "./database/helpers/gymProfile.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post("/sms", async (req, res) => {
    const userInput = req.body.Body;
    const fromNumber = req.body.From;
    const toNumber = req.body.To.replace(/\D/g, '');
    console.log(`Recieving request from: ${fromNumber}, to: ${toNumber}, content: ${userInput}`);
    const gymProfile = await getGymProfileByPhoneNumber(toNumber);
    const twiml = new twilio.twiml.MessagingResponse();
    if (!gymProfile) {
        twiml.message("Sorry you're trying to message a gym thats not setup");
        res.type("text/xml");
        res.send(twiml.toString());
        return;
    }
    const replyGenerator = new FitnessAssistantReplyGeneratorService({
        gymProfile: gymProfile
    });
    const response = await replyGenerator.generateReply(userInput, fromNumber);
    console.log("sending response");
    twiml.message(response);
    res.type("text/xml");
    res.send(twiml.toString());
});
// Start the app with database setup
async function startApp() {
    try {
        await setupDatabase();
        // Add graceful shutdown
        process.on('SIGINT', async () => {
            console.log('Shutting down gracefully...');
            await closeDatabase();
            process.exit(0);
        });
        app.listen(3000, () => console.log("Server running on port 3000"));
    }
    catch (error) {
        console.error("Failed to start app:", error);
        process.exit(1);
    }
}
startApp().catch((err) => console.error("Failed to start app:", err));
