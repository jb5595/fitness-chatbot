import { ChatHistory, getFormattedChatHistoryByClientPhoneNumber } from "../models/ChatHistory";
import { Controller } from "./Controller";
import  { Request, Response } from "express";

export class ChatHistoryController extends Controller{
    
    public static async getGymClients(req: Request, res: Response){
        const gymPhoneNumber = req.params.gymPhoneNumber
         const clientList = await ChatHistory
              .find({ gymPhoneNumber: gymPhoneNumber }).select({ "clientPhoneNumber": 1, "_id": 0});
        // Extract clientPhoneNumber from each document
        const clientPhoneNumbers = clientList.map(doc => doc.clientPhoneNumber).filter((value, index, array) => array.indexOf(value) === index);

        res.type("text/json");
        res.send(JSON.stringify(clientPhoneNumbers))
    }

    public static async getGymClientMessages(req: Request, res: Response){

        const chatHistory = await getFormattedChatHistoryByClientPhoneNumber(req.params.clientPhoneNumber, req.params.gymPhoneNumber)
        res.type("text/json");
        res.send(JSON.stringify(chatHistory))
    }

}