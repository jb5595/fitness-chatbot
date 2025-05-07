import mongoose from "mongoose";
import { BookingType } from "../types/bookingTypes";


export type FreeTrialSchedule = {
    sunday?: string[]
    monday?: string[]
    tuesday?: string[]
    wednesday?: string[]
    thursday?: string[]
    friday?: string[]
    saturday?: string[]
}

export interface GymProfile {
    _id?: string;  // MongoDB ID
    name: string;
    phoneNumber: string
    description?: string;
    scheduleInfo?: string;
    bookingType?: BookingType;
    freeTrialSchedule?: FreeTrialSchedule;
    forwardingNumber?: string
    calendlyLink?: string;
    pricing: string;
    websiteData?: { [url: string]: string };
    additionalInfo: string[];
    lastUpdated: number;
}

const GymProfileSchema = new mongoose.Schema<GymProfile>({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    scheduleInfo: {
        type: String,
        required: false,
    },
    bookingType: {
        type: String,
        required: true,
    },
    freeTrialSchedule: {
        type: {
            sunday: [String],
            monday: [String],
            tuesday: [String],
            wednesday: [String],
            thursday: [String],
            friday: [String],
            saturday: [String]
        },
        required: false
    },
    forwardingNumber: {
        type: String,
        required: false,
    },
    calendlyLink: {
        type: String,
        required: false,
    },
    pricing: {
        type: String,
        required: true,
    },
    websiteData: {
        type: Map,
        of: String,
        required: false,
    },
    additionalInfo: {
        type: [String],
        required: false,
        default: [],
    },
    lastUpdated: {
        type: Number,
        required: true,
        default: Date.now,
    }
},
{ collection: 'gymProfiles'});

export const GymProfile = mongoose.model("GymProfiles", GymProfileSchema);

