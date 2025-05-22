import mongoose, { Schema } from "mongoose";
import { GymProfile } from "./GymProfile";
    
    
    export interface User {
        _id?: string;  // MongoDB ID
        firstName?: string;
        lastName?: string;
        username?: string;
        email: string;
        password: string;
        gym?: GymProfile;
        tokens?: {};
        lastUpdated: number;
    }
    
    const UserSchema = new mongoose.Schema<User>({
        firstName: {
            type: String,
            required: false,
        },
        lastName: {
            type: String,
            required: false,
        },
        username: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        gym: {
            type: Schema.Types.ObjectId,
            ref: "GymProfile"
        },
        tokens: [{
            type: Schema.Types.ObjectId,
            ref: "RefreshTokens"
        }],
        lastUpdated: {
            type: Number,
            required: true,
        }
    },
    { collection: 'users'});
    
    
    export const ChatHistory = mongoose.model("User", UserSchema);