import { Request, Response } from 'express';
import { extractPhoneNumber } from '../database/helpers/extractPhoneNumber';
import { getGymProfileByPhoneNumber } from '../database/helpers/gymProfile';
import twilio from "twilio";
import { FitnessAssistantReplyGeneratorService } from '../services/fitnessAssistantReplyGeneratorService';
import { Controller } from './Controller';
 
export interface TwilioRequest extends Request {
    body: {
        Body: string;
        From: string;
        To: string;
        Digits?: string
    };
}


export class MessagingController extends Controller {

    private static GYM_NOT_SETUP_RESPONSE = "Sorry, you're trying to message a gym that's not set up."
    
    public static async handleIncomingSMS(req: TwilioRequest, res: Response){
        const userInput = req.body.Body;
        const userPhoneNumber = extractPhoneNumber(req.body.From);
        const gymPhoneNumber = req.body.To.replace(/\D/g, '');
    
        MessagingController.log(`Receiving request from: ${userPhoneNumber}, to: ${gymPhoneNumber}, content: ${userInput}`);
        const gymProfile = await getGymProfileByPhoneNumber(gymPhoneNumber);
    
        const twiml = new twilio.twiml.MessagingResponse();
    
        if (!gymProfile) {
            twiml.message(MessagingController.GYM_NOT_SETUP_RESPONSE);
            res.type("text/xml");
            res.send(twiml.toString());
            return;
        }
    
        const replyGenerator = new FitnessAssistantReplyGeneratorService({
            gymProfile: gymProfile
        });
        const response = await replyGenerator.generateReply(userInput, userPhoneNumber, gymPhoneNumber);
        MessagingController.log("Sending response");
        twiml.message(response);
        res.type("text/xml");
        res.send(twiml.toString());
    }
}