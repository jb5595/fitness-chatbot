import { JSONFilePreset } from "lowdb/node";
import { Low } from "lowdb";

interface CustomerInteraction {
    question: string;
    answer: string;
    timestamp: number;
}

interface DatabaseSchema {
    customers: {
        [userId: string]: CustomerInteraction[];
    };
    messages: Record<string, unknown>;
}

let db: Low<DatabaseSchema>;

async function setupDatabase(): Promise<Low<DatabaseSchema>> {
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

async function getCustomerHistory(userId: string): Promise<CustomerInteraction[]> {
    await db.read();
    return db.data.customers[userId] || [];
}

async function addCustomerInteraction(
    userId: string, 
    question: string, 
    answer: string
): Promise<void> {
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

async function getFormattedCustomerHistory(userId: string): Promise<string> {
    const history = await getCustomerHistory(userId);
    return history
        .map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`)
        .join("\n");
}

export {
    setupDatabase,
    getCustomerHistory,
    addCustomerInteraction,
    getFormattedCustomerHistory
};