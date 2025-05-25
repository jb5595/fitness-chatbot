import mongoose, { Schema, Model } from "mongoose";
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
        isAdmin: boolean
    }
    
    const UserSchema = new Schema<User>({
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
            unique: true,
            validate: {
                validator: async (email: string): Promise<boolean> => await validateUniqueEmail(email),
                message: 'User with email already exists'
            }
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
        isAdmin: {
            type: Boolean,
            default: false
        }
    },
    { collection: 'users'});
    
    
    export const User: Model<User> = mongoose.model<User>("User", UserSchema);

    const validateUniqueEmail = async (email: string): Promise<boolean> => {
        return !(await User.exists({ email }));
    }