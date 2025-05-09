import { client, connectToDatabase, DB_NAME } from "../db";
import { BookingType } from "../../types/bookingTypes";

const COLLECTION_NAME= 'gymProfiles'

// //I.e. Has free trials monday and wednsday at 7pm
// // monday => ["19:00"]
// // wednesday => ["19:00"]
// export type FreeTrialSchedule = {
//     sunday?: string[]
//     monday?: string[]
//     tuesday?: string[]
//     wednesday?: string[]
//     thursday?: string[]
//     friday?: string[]
//     saturday?: string[]
// }


// export interface GymProfile {
//     _id?: string;  // MongoDB ID
//     name: string;
//     phoneNumber: string
//     description?: string;
//     scheduleInfo?: string;
//     bookingType?: BookingType;
//     freeTrialSchedule?: FreeTrialSchedule;
//     forwardingNumber?: string
//     calendlyLink?: string;
//     pricing: string;
//     websiteData?: { [url: string]: string };
//     additionalInfo: string[];
//     lastUpdated: number;
// }// Gym Profile Management



export async function updateGymProfile(
    gymId: string,
    profileData: Partial<GymProfile>
): Promise<void> {
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection<GymProfile>(COLLECTION_NAME); // Updated collection name
    
    await collection.updateOne(
        { _id: gymId },
        { 
            $set: {
                ...profileData,
                lastUpdated: Date.now()
            }
        },
        { upsert: true }
    );
}

export async function createGymProfile(gymProfile: GymProfile){
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection<GymProfile>(COLLECTION_NAME); // Updated collection name
    
    await collection.insertOne(
        gymProfile
    );
}


export async function getGymProfileByPhoneNumber(gymPhoneNumber: string): Promise<GymProfile | null> {
    await connectToDatabase();
    const collection = client.db(DB_NAME).collection<GymProfile>(COLLECTION_NAME); // Updated collection name
    return await collection.findOne({ phoneNumber: gymPhoneNumber });
}


// Initialize default gym profile
export async function initializeDefaultGymProfile(): Promise<void> {
    const topeiraProfle: GymProfile = {
        phoneNumber: "14155238886",
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

    await createGymProfile( topeiraProfle);
}

