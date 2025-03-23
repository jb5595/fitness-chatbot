import { JSONFilePreset } from "lowdb/node";
// ... existing code ...
let db;
async function setupDatabase() {
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
async function updateGymProfile(gymId, profileData) {
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
async function getGymProfile(gymId) {
    await db.read();
    return db.data.gymProfiles[gymId] || null;
}
// Chat History Management
async function getChatHistory(userId) {
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
async function addChatInteraction(userId, userMessage, assistantResponse) {
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
async function getFormattedChatHistory(userId) {
    const history = await getChatHistory(userId);
    return history
        .map((entry) => `Q: ${entry.userMessage}\nA: ${entry.assistantResponse}`)
        .join("\n");
}
export { setupDatabase, 
// Gym Profile exports
updateGymProfile, getGymProfile, 
// Chat History exports
getChatHistory, addChatInteraction, getFormattedChatHistory };
