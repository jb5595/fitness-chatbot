import { JSONFilePreset } from "lowdb/node";
let db;
async function setupDatabase() {
    db = await JSONFilePreset('db.json', { customers: {}, messages: {} });
    // Read the file first
    await db.read();
    // If db.data is undefined or null (file doesn't exist or is empty), set default
    if (!db.data) {
        db.data = { customers: {}, messages: {} };
        await db.write(); // Persist the default data to the file
    }
    console.log("Database initialized");
    return db;
}
async function getCustomerHistory(userId) {
    await db.read();
    return db.data.customers[userId] || [];
}
async function addCustomerInteraction(userId, question, answer) {
    await db.read();
    // Initialize customer array if it doesn't exist
    db.data.customers[userId] = db.data.customers[userId] || [];
    // Add new interaction
    db.data.customers[userId].push({
        question,
        answer,
        timestamp: Date.now(),
    });
    return db.write();
}
async function getFormattedCustomerHistory(userId) {
    const history = await getCustomerHistory(userId);
    return history
        .map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`)
        .join("\n");
}
export { setupDatabase, getCustomerHistory, addCustomerInteraction, getFormattedCustomerHistory };
