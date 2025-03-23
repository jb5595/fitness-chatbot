import { GymProfile } from "../database/db.js";

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

        return contextParts.length > 0 
            ? `\nGym Information:\n${contextParts.join('\n')}`
            : '';
    }

    static combineContexts(contexts: string[]): string {
        return contexts
            .filter(context => context && context.trim().length > 0)
            .join('\n\n');
    }
}