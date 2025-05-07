import { client, DB_NAME } from "../db";

type TEXT_CONSENT = 'text_consent'

type Consent = {
    clientPhoneNumber: string,
    gymPhoneNumber: string
    type: TEXT_CONSENT
    timestamp:number,
    message: string
}
export async function addConsent(clientPhoneNumber: string, gymPhoneNumber: string, message: string) {
    const collection = client.db(DB_NAME).collection<Consent>("consents");

    try {
      await collection.insertOne({
        clientPhoneNumber,
        type: "text_consent",
        timestamp: Date.now(),
        message,
        gymPhoneNumber
      });
      console.log(`Logged consent for ${clientPhoneNumber} to ${gymPhoneNumber}`);
    } catch (error) {
      console.error("Error logging consent:", error);
    }
  }

