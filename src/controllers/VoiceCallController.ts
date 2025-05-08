import VoiceResponse from "twilio/lib/twiml/VoiceResponse.js";
import  { Request, Response } from "express";

import { Controller } from "./Controller";
import { TwilioRequest } from "./MessagingController";
import { VoiceResponseService } from "../services/callResponseService";

export class VoiceCallController extends Controller {

    public static async handleIncomingCall(req: TwilioRequest, res: Response){
        VoiceCallController.log(`Receiving voice call from ${req.body.From} to ${req.body.To}`)
        const twiml = new VoiceResponse();
        const gather = twiml.gather({
          numDigits: 1,
          action: "/voice-response",
          method: "POST",
          timeout: 5,
        });
        
        gather.say(
          "Thanks for calling! We can't handle you over the phone right now, but please -ress 1 if you would like to receive help over text."
        );
        twiml.say("We didn’t receive an input. Goodbye.");
        res.type("text/xml");
        res.send(twiml.toString());
    }

    public static async handleVoiceCallInput(req: TwilioRequest, res: Response){
        const clientNumber = req.body.From;
        const digit = req.body.Digits;
        const toNumber = req.body.To.replace(/\D/g, '');
        VoiceCallController.log(`voice response clientNumber ${clientNumber}, to number: ${toNumber}, Digit ${digit}`)
        const voiceService = new VoiceResponseService({
            twilioNumber: toNumber,
        });
        const twimlResponse = await voiceService.generateVoiceResponse(clientNumber, digit, toNumber);
    
        res.type("text/xml");
        res.send(twimlResponse);
    }
}
