import { Controller } from "./Controller";
import  { Request, Response } from "express";
import { GymProfile } from "../models/GymProfile";
export class GymController extends Controller {

    public static async getGym(req: Request, res: Response){
        const phoneNumber = req.params.gymPhoneNumber.toString()
        GymController.log(`Getting GymProfile for ${phoneNumber}`)
        const gym = await GymProfile.findOne({phoneNumber})
        
        res.type("text/json");
        res.send(JSON.stringify(gym))
    }
}