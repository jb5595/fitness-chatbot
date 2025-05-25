import mongoose, { Schema } from "mongoose";
import { User } from "./User";


export interface RefreshToken {
    _id?: string;  // MongoDB ID
    jti: string;
    claims: any
    isBlackListed:boolean
    expiration: Date
    user: User

}

const RefreshTokenSchema = new mongoose.Schema<RefreshToken>({
    jti: {
        type: Schema.Types.String,
        required: false,
    },
    claims: {
        type: String,
        get: function(data: string) {
            try { 
            return JSON.parse(data);
            } catch(error) { 
            return data;
            }
        },
        set: function(data: any) {
            return JSON.stringify(data);
        }
    },
    isBlackListed: {
        type: Schema.Types.Boolean,
        default: false
    },
    expiration: {
        type: Schema.Types.Date,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},
{ collection: 'refreshTokens'});


export const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);