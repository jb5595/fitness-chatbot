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
    voiceForwardingNumber: string;
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
    voiceForwardingNumber: {
        type: String,
        required: true,
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

GymProfileSchema.methods.initializeDefaultGymProfile = async function initializeDefaultGymProfile() {
    const topeiraProfle: GymProfile = {
        "phoneNumber": "14155238886",
        "name": "Topeira Boxing Club",
        "description": "Topeira Boxing Club is a premier boxing gym dedicated to teaching authentic boxing techniques in a welcoming, supportive environment. We focus on both technical excellence and personal growth, making boxing accessible to everyone from beginners to advanced fighters.",
        "scheduleInfo": "Monday: 4pm Level 1, 5pm Kids Class, 6pm Level 1 Class, 7pm Level 2 Class. Tuesday: 12pm Open Gym, 1pm Level 1 Class, 2pm Level 1 Class, 3pm Level 1.5 Class, 5pm Kids Class, 6pm Level 2 Class, 7pm Level 1 Class, 8pm Level 1 Class. Wednesday: 12pm Open Gym, 1pm Level 1 Class, 2pm Level 1 Class, 3pm Level 1.5 Class, 5pm Kids Class, 6pm Level 1 Class, 7pm Level 2 Class. Thursday: 12pm Open Gym, 1pm Level 1 Class, 2pm Level 1 Class, 3pm Level 1.5 Class, 4pm Level 1 Class, 5pm Kids Class, 6pm Level 2 Class, 7pm Level 1 Class, 8pm Level 1 Class. Friday: 12pm Open Gym, 1pm Level 1 Class, 2pm Level 1 Class, 3pm Level 1 Class, 4pm Level 1.5 Class, 5pm Junior Sparring. Saturday: 8am Level 1 Class, 9am Level 1 Class, 10am Level 1.5 Class, 11am Level 2 Sparring.",
        "pricing": "Monthly Membership: $90",
        "websiteData": {
          "about": "Topeira Boxing Club was founded with the mission to make authentic boxing training accessible to everyone.",
          "facilities": "Modern facility with full-size ring, heavy bags, speed bags, and conditioning equipment."
        },
        "additionalInfo": [
          "For free trial classes please arrive 20 minutes early to check class capacity, sign a safety waiver, and get your hands wrapped and warmed up, as late arrivals must wait for the next free trial class; bring water and workout clothing, and note that previous experience will be assessed by coaches with no immediate sparring allowed—most importantly, have fun!"
        ],
        "forwardingNumber": "5715290900",
        "voiceForwardingNumber": "5715290900",
        "bookingType": "FREE_TRIAL_WALK_IN",
        "lastUpdated": 1742690074009
      }

    await GymProfile.create(topeiraProfle)
  };



export const GymProfile = mongoose.model("GymProfiles", GymProfileSchema);