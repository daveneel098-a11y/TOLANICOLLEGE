const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'database.db');

// Read config from env variables
const API_KEY = process.env.MONGODB_DATA_API_KEY;
const API_URL = process.env.MONGODB_DATA_API_URL;
const CLUSTER = process.env.MONGODB_CLUSTER || 'Cluster0';
const DATABASE = process.env.MONGODB_DB || 'college_portal';
const COLLECTION = process.env.MONGODB_COLLECTION || 'backups';

async function callMongoAPI(action, body) {
    if (!API_KEY || !API_URL) {
        throw new Error("MongoDB Data API credentials not configured.");
    }
    const response = await fetch(`${API_URL}/action/${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Headers': '*',
            'api-key': API_KEY
        },
        body: JSON.stringify({
            dataSource: CLUSTER,
            database: DATABASE,
            collection: COLLECTION,
            ...body
        })
    });
    
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${text}`);
    }
    
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error);
    }
    return data;
}

// Load database.db from MongoDB Atlas
async function loadDatabaseFromMongo() {
    try {
        if (!API_KEY || !API_URL) {
            console.log("MongoDB Data API credentials not configured. Using local SQLite database.");
            return false;
        }

        console.log("Checking MongoDB Atlas for database backup...");
        const result = await callMongoAPI('findOne', {
            filter: { key: 'sqlite_db' }
        });
        
        if (result && result.document && result.document.data) {
            const buffer = Buffer.from(result.document.data, 'base64');
            fs.writeFileSync(FILE_PATH, buffer);
            console.log(`Database loaded successfully from MongoDB Atlas (${buffer.length} bytes).`);
            return true;
        } else {
            console.log("No existing database backup found on MongoDB Atlas. Using local file.");
            return false;
        }
    } catch (err) {
        console.warn("MongoDB backup load failed:", err.message);
        return false;
    }
}

// Save database.db to MongoDB Atlas
async function saveDatabaseToMongo() {
    try {
        if (!API_KEY || !API_URL) {
            return;
        }
        if (!fs.existsSync(FILE_PATH)) return;
        const buffer = fs.readFileSync(FILE_PATH);
        const base64Data = buffer.toString('base64');
        
        console.log(`Uploading database backup to MongoDB Atlas (${buffer.length} bytes)...`);
        await callMongoAPI('updateOne', {
            filter: { key: 'sqlite_db' },
            update: {
                $set: {
                    key: 'sqlite_db',
                    data: base64Data,
                    updated_at: new Date().toISOString()
                }
            },
            upsert: true
        });
        console.log("Database backup saved successfully to MongoDB Atlas.");
    } catch (err) {
        console.error("MongoDB backup save failed:", err.message);
    }
}

module.exports = {
    loadDatabaseFromMongo,
    saveDatabaseToMongo
};
