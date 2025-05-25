import { Request, Response } from "express"

import createHttpError from "http-errors";
import { meMessages } from "../constants/strings/me";
import { User } from "../models/User";

export class UserController {
    public static async me(request: Request & { user: User }, response: Response){
        const user = request.user;

        try{
            const dbUser = await User.findOne({email: user.email})

            return response.send(dbUser);
        } catch(e){
            // TODO  better error handing
            throw createHttpError(404, meMessages.userNotExist);
        }
    }
}