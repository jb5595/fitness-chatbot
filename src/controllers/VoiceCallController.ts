import VoiceResponse from "twilio/lib/twiml/VoiceResponse.js";
import {  Response } from "express";
import { Controller } from "./Controller";
import { TwilioRequest } from "./MessagingController";
import { VoiceResponseService } from "../services/callResponseService";
import { getGymProfileByPhoneNumber } from "../database/helpers/gymProfile";
import { extractPhoneNumber } from "../helpers/extractPhoneNumber";

export class VoiceCallController extends Controller {
    private static GYM_NOT_SETUP_RESPONSE = "Sorry, you're trying to call a gym that's not set up.";

    public static async handleIncomingCall(req: TwilioRequest, res: Response) {
        const gymPhoneNumber = extractPhoneNumber(req.body.To);
        VoiceCallController.log(`Receiving voice call from ${req.body.From} to ${gymPhoneNumber}`);

        const twiml = new VoiceResponse();
        const gather = twiml.gather({
            numDigits: 1,
            action: "/voice-response",
            method: "POST",
            timeout: 5,
        });

        const gymProfile = await getGymProfileByPhoneNumber(gymPhoneNumber);

        if (!gymProfile) {
            VoiceCallController.log("Gym profile not found, returning gym not setup response.");
            twiml.say(VoiceCallController.GYM_NOT_SETUP_RESPONSE);
            res.type("text/xml");
            res.send(twiml.toString());
            return;
        }

        gather.say(
            "Thanks for calling! Press 1 to receive help over text, or press 2 to wait on the line for someone to help or leave a voicemail."
        );
        twiml.say("We didn't receive an input. Goodbye.");

        res.type("text/xml");
        res.send(twiml.toString());
    }

    public static async handleVoiceCallInput(req: TwilioRequest, res: Response) {
        const clientNumber = extractPhoneNumber(req.body.From);
        const keypadInput = req.body.Digits;
        const gymPhoneNumber = extractPhoneNumber(req.body.To);
        VoiceCallController.log(`Voice response clientNumber ${clientNumber}, to number: ${gymPhoneNumber}, Digit ${keypadInput}`);

        const twiml = new VoiceResponse();
        const gymProfile = await getGymProfileByPhoneNumber(gymPhoneNumber);

        if (!gymProfile) {
            VoiceCallController.log("Gym profile not found, returning gym not setup response.");
            twiml.say(VoiceCallController.GYM_NOT_SETUP_RESPONSE);
            res.type("text/xml");
            res.send(twiml.toString());
            return;
        }

        if (keypadInput === "1") {
            VoiceCallController.log(`Sending text response to ${clientNumber}, for gym ${gymPhoneNumber}`);
            const voiceService = new VoiceResponseService({
                twilioNumber: gymPhoneNumber,
            });
            const twimlResponse = await voiceService.generateVoiceResponse(clientNumber, keypadInput, gymPhoneNumber);
            res.type("text/xml");
            res.send(twimlResponse);
        } else if (keypadInput === "2" && gymProfile.voiceForwardingNumber) {
            VoiceCallController.log(`Forwarding call from ${clientNumber} to forwarding number: ${gymProfile.voiceForwardingNumber}, gym twillio number ${gymPhoneNumber}`);
            
            twiml.say("Please wait while we connect you to someone who can help.");
            const dial = twiml.dial({
                timeout: 30, // Wait 30 seconds for the gym to answer
            });
            dial.number(gymProfile.voiceForwardingNumber);

            // If the call isn't answered, the forwarded phone's voicemail will handle it
            twiml.say("We couldn't connect your call. Goodbye.");
            res.type("text/xml");
            res.send(twiml.toString());
        } else {
            twiml.say("Sorry, that's not a valid option. Goodbye.");
            res.type("text/xml");
            res.send(twiml.toString());
        }
    }
}
