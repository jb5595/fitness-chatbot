import { JSONFilePreset } from "lowdb/node";
import { Low } from "lowdb";

// Type definitions for better organization
interface ChatInteraction {
    userMessage: string;
    assistantResponse: string;
    timestamp: number;
}

interface GymProfile {
    name: string;
    description?: string;
    scheduleInfo?: string;
    pricing: string;
    websiteData?: {[url: string]: string};
    additionalInfo: string[]
    lastUpdated: number;
}

interface DatabaseSchema {
    chatHistory: {
        [userId: string]: ChatInteraction[];
    };
    gymProfiles: {
        [gymId: string]: GymProfile;
    };
}

// ... existing code ...

let db: Low<DatabaseSchema>;

async function setupDatabase(): Promise<Low<DatabaseSchema>> {
    db = await JSONFilePreset('db.json', { 
        chatHistory: {}, 
        gymProfiles: {} 
    });

    await db.read();

    if (!db.data) {
        db.data = { 
            chatHistory: {}, 
            gymProfiles: {} 
        };
        await db.write();
    }
    console.log("Database initialized");
    return db;
}

// Gym Profile Management
async function updateGymProfile(
    gymId: string,
    profileData: Partial<GymProfile>
): Promise<void> {
    await db.read();
    
    const existingProfile = db.data.gymProfiles[gymId] || {
        name: '',
        lastUpdated: 0
    };

    db.data.gymProfiles[gymId] = {
        ...existingProfile,
        ...profileData,
        lastUpdated: Date.now()
    };

    return db.write();
}

async function getGymProfile(gymId: string): Promise<GymProfile> {
    await db.read();
    return db.data.gymProfiles[gymId] || null;
}


// Chat History Management
async function getChatHistory(userId: string): Promise<ChatInteraction[]> {
    await db.read();

    // Ensure chatHistory object exists
    if (!db.data.chatHistory) {
        db.data.chatHistory = {};
    }
    
    // Ensure user's chat history array exists
    if (!db.data.chatHistory[userId]) {
        db.data.chatHistory[userId] = [];
    }

    return db.data?.chatHistory[userId] || [];
}

async function addChatInteraction(
    userId: string, 
    userMessage: string, 
    assistantResponse: string
): Promise<void> {
    await db.read();

        
    // Ensure chatHistory object exists
    if (!db.data.chatHistory) {
        db.data.chatHistory = {};
    }
    
    // Ensure user's chat history array exists
    if (!db.data.chatHistory[userId]) {
        db.data.chatHistory[userId] = [];
    }
    
    db.data.chatHistory[userId].push({
        userMessage,
        assistantResponse,
        timestamp: Date.now(),
    });
    
    return db.write();
}

async function getFormattedChatHistory(userId: string): Promise<string> {
    const history = await getChatHistory(userId);
    return history
        .map((entry) => `Q: ${entry.userMessage}\nA: ${entry.assistantResponse}`)
        .join("\n");
}

export {
    setupDatabase,
    // Gym Profile exports
    updateGymProfile,
    getGymProfile,
    // Chat History exports
    getChatHistory,
    addChatInteraction,
    getFormattedChatHistory,
    // Type exports
    type GymProfile,
    type ChatInteraction
};