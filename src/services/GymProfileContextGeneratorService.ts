import { FreeTrialSchedule, GymProfile } from "../models/GymProfile";
import { BookingType } from "../types/bookingTypes";

export class ContextGeneratorService {
    static generateContextFromGymProfile(profile?: GymProfile ): string {
        if (!profile) {
            return '';
        }

        const contextParts: string[] = [];

        if (profile.name) {
            contextParts.push(`Gym Name: ${profile.name}`);
        }

        if (profile.description) {
            contextParts.push(`About: ${profile.description}`);
        }

        if (profile.scheduleInfo) {
            contextParts.push(`Schedule: ${profile.scheduleInfo}`);
        }

        if (profile.pricing) {
            contextParts.push(`Pricing: ${profile.pricing}`);
        }

        if (profile.additionalInfo?.length > 0) {
            contextParts.push(`Additional Information: ${profile.additionalInfo.join('. ')}`);
        }

        if (profile.bookingType){ 
            contextParts.push("Booking type:", this.bookingTypeDescription(profile.bookingType))
        }

        if (profile.freeTrialSchedule){
            contextParts.push(`Free Trial Schedule: ${this.formattedFreeTrialSchedule(profile.freeTrialSchedule)}`);
        }

        if (profile.calendlyLink){
            contextParts.push(`Calendly Link: ${profile.calendlyLink}`)
        }

        return contextParts.length > 0 
            ? `\nGym Information:\n${contextParts.join('\n')}`
            : '';
    }

    static formattedFreeTrialSchedule(freeTrialSchedule: FreeTrialSchedule): string {
        const days = Object.keys(freeTrialSchedule);
        const scheduleParts: string[] = [];
    
        for (const day of days) {
            const times = freeTrialSchedule[day as keyof FreeTrialSchedule];
            if (times && times.length > 0) {
                // Capitalize the day for readability (e.g., "monday" -> "Monday")
                const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);
                // Convert each time to 12-hour AM/PM format
                const formattedTimes = times.map(time => {
                    const [hours, minutes] = time.split(":").map(Number);
                    const period = hours >= 12 ? "PM" : "AM";
                    const adjustedHours = hours % 12 || 12; // Convert 0 to 12 for midnight, 13 to 1 PM, etc.
                    return `${adjustedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
                }).join(", ");
                scheduleParts.push(`${formattedDay} at ${formattedTimes}`);
            }
        }
        return scheduleParts.join("; ");
    }

    static bookingTypeDescription(bookingType: BookingType) : string{
        switch (bookingType) {
            case "CALENDLY":
                return "Answer the user's initial questions about the gym to provide helpful information.Allow the user to ask at least one question about the gym before suggesting they book.  If the user expresses interest, provide the Calendly link to schedule an appointment. Focus on encouraging the user to book a slot using the link. Ensure the conversation feels natural and not pushy.";
            case "FREE_TRIAL_WALK_IN":
                return "Answer the user's initial questions about the gym to provide helpful information. Allow the user to ask at least one question about the gym before suggesting a free trial class. If the user expresses interest, encourage the user to attend a free trial class by sharing the free trial schedule (e.g., 'We have free trials on Monday at 19:00 and Wednesday at 19:00'), and let them know you're happy to answer any additional questions they may have before they sign up.  If they express interest, ask for their full name and preferred class time from the schedule to confirm the booking we need both the full name and class time to confirm the booking. Ensure the conversation feels natural and not pushy.";
            }
    }

    static combineContexts(contexts: string[]): string {
        return contexts
            .filter(context => context && context.trim().length > 0)
            .join('\n\n');
    }
}