import { getGymProfileByPhoneNumber } from "../database/helpers/gymProfile";
import { Controller } from "./Controller";
import  { Request, Response } from "express";

export class GymController extends Controller {

    public static async getGym(req: Request, res: Response){
        const gym = await getGymProfileByPhoneNumber(req.params.gymPhoneNumber)
        res.type("text/json");
        res.send(JSON.stringify(gym))
    }
}