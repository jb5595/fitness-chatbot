import { client, DB_NAME } from "../db.js";
export async function addConsent(phoneNumber, gymPhoneNumber, message) {
    const collection = client.db(DB_NAME).collection("consents");
    try {
        await collection.insertOne({
            phoneNumber,
            type: "text_consent",
            timestamp: Date.now(),
            message,
            gymPhoneNumber
        });
        console.log(`Logged consent for ${phoneNumber} to ${gymPhoneNumber}`);
    }
    catch (error) {
        console.error("Error logging consent:", error);
    }
}
