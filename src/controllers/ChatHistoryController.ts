import { ChatHistory, getFormattedChatHistoryByClientPhoneNumber } from "../models/ChatHistory";
import { Controller } from "./Controller";
import  { Request, Response } from "express";

export class ChatHistoryController extends Controller{
    
    public static async getGymClients(req: Request, res: Response){
        const gymPhoneNumber = req.params.gymPhoneNumber
         const clientList = await ChatHistory
              .find({ gymPhoneNumber: gymPhoneNumber }).distinct("clientPhoneNumber");

        res.type("text/json");
        res.send(JSON.stringify(clientList))
    }

    public static async getGymClientMessages(req: Request, res: Response){

        const chatHistory = await getFormattedChatHistoryByClientPhoneNumber(req.params.clientPhoneNumber, req.params.gymPhoneNumber)
        res.type("text/json");
        res.send(JSON.stringify(chatHistory))
    }

}