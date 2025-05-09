import {  getFormattedChatHistoryByClientPhoneNumber, getClientPhoneNumbersByGym } from "../database/helpers/chatHistory";
import { Controller } from "./Controller";
import  { Request, Response } from "express";

export class ChatHistoryController extends Controller{
    
    public static async getGymClients(req: Request, res: Response){
        const clientList = await getClientPhoneNumbersByGym(req.params.gymPhoneNumber)
        res.type("text/json");
        res.send(JSON.stringify(clientList))
    }

    public static async getGymClientMessages(req: Request, res: Response){

        const chatHistory = await getFormattedChatHistoryByClientPhoneNumber(req.params.clientPhoneNumber, req.params.gymPhoneNumber)
        res.type("text/json");
        res.send(JSON.stringify(chatHistory))
    }

}