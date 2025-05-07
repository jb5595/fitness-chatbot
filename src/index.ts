import { closeDatabase, setupDatabase } from './database/db';
import app from "./app";


// Start the app with database setup
async function startApp(): Promise<void> {
    try {
        await setupDatabase();

        // Add graceful shutdown
        process.on('SIGINT', async () => {
            console.log('Shutting down gracefully...');
            await closeDatabase();
            process.exit(0);
        });

        app.listen(3000, () => console.log("Server running on port 3000"));
    } catch (error) {
        console.error("Failed to start app:", error);
        process.exit(1);
    }
}

startApp().catch((err) => console.error("Failed to start app:", err));