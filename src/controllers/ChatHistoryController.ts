import {  getFormattedChatHistoryByUserPhoneNumber, getUserPhoneNumbersByGym } from "../database/helpers/chatHistory";
import { Controller } from "./Controller";
import  { Request, Response } from "express";

export class ChatHistoryController extends Controller{
    
    public static async getGymMessengers(req: Request, res: Response){
        const userList = await getUserPhoneNumbersByGym(req.params.gymPhoneNumber)
        res.type("text/json");
        res.send(JSON.stringify(userList))
    }

    public static async getGymMessengerMessages(req: Request, res: Response){
        const chatHistory = await getFormattedChatHistoryByUserPhoneNumber(req.params.userPhoneNumber, req.params.gymPhoneNumber)
        res.type("text/json");
        res.send(JSON.stringify(chatHistory))
    }

}