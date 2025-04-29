import { client, DB_NAME } from "../db.ts";

type TEXT_CONSENT = 'text_consent'

type Consent = {
    phoneNumber: string,
    gymPhoneNumber: string
    type: TEXT_CONSENT
    timestamp:number,
    message: string
}
export async function addConsent(phoneNumber: string, gymPhoneNumber: string, message: string) {
    const collection = client.db(DB_NAME).collection<Consent>("consents");

    try {
      await collection.insertOne({
        phoneNumber,
        type: "text_consent",
        timestamp: Date.now(),
        message,
        gymPhoneNumber
      });
      console.log(`Logged consent for ${phoneNumber} to ${gymPhoneNumber}`);
    } catch (error) {
      console.error("Error logging consent:", error);
    }
  }

