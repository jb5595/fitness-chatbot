import mongoose from "mongoose";

type TEXT_CONSENT = 'text_consent'

export interface Consent {
    _id?: string;  // MongoDB ID
    clientPhoneNumber: string,
    gymPhoneNumber: string
    type: TEXT_CONSENT
    timestamp:number,
    message: string
}

const ConsentSchema = new mongoose.Schema<Consent>({
    clientPhoneNumber: {
        type: String,
        required: true,
    },
    gymPhoneNumber: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        default: 'text_consent'
    },
    timestamp: {
        type: Number,
        required: true,
    },
    message: {
        type: String,
        required: true,
    }
},
{ collection: 'consents'});


export const Consent = mongoose.model("Consent", ConsentSchema);