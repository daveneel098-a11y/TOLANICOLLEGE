const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'database.db');

// Conditional require for mongodb to prevent crash on local environment lacking npm
let MongoClient;
let hasMongoDriver = false;

try {
    MongoClient = require('mongodb').MongoClient;
    hasMongoDriver = true;
    console.log("MongoDB standard driver loaded successfully.");
} catch (e) {
    console.log("MongoDB native driver ('mongodb') not found. Standard Mongo sync disabled locally.");
}

// Connection parameters
const uri = process.env.MONGODB_DATA_API_URL || process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'college_portal';
const collectionName = process.env.MONGODB_COLLECTION || 'backups';

async function getClient() {
    if (!uri) {
        throw new Error("MongoDB Connection String not configured.");
    }
    const client = new MongoClient(uri);
    await client.connect();
    return client;
}

// Load database.db from MongoDB Atlas
async function loadDatabaseFromMongo() {
    try {
        if (!hasMongoDriver) {
            console.log("Local mode active: using local SQLite database.");
            return false;
        }

        if (!uri) {
            console.log("MongoDB connection string not configured. Using local SQLite database.");
            return false;
        }

        console.log("Connecting to MongoDB to pull database backup...");
        const client = await getClient();
        const db = client.db(dbName);
        const col = db.collection(collectionName);
        
        const doc = await col.findOne({ key: 'sqlite_db' });
        await client.close();
        
        if (doc && doc.data) {
            const buffer = Buffer.from(doc.data.buffer || doc.data, 'base64');
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
        if (!hasMongoDriver || !uri) {
            return;
        }
        if (!fs.existsSync(FILE_PATH)) return;
        
        const buffer = fs.readFileSync(FILE_PATH);
        const base64Data = buffer.toString('base64');
        
        console.log(`Uploading database backup to MongoDB Atlas (${buffer.length} bytes)...`);
        const client = await getClient();
        const db = client.db(dbName);
        const col = db.collection(collectionName);
        
        await col.updateOne(
            { key: 'sqlite_db' },
            {
                $set: {
                    key: 'sqlite_db',
                    data: base64Data,
                    updated_at: new Date().toISOString()
                }
            },
            { upsert: true }
        );
        await client.close();
        console.log("Database backup saved successfully to MongoDB Atlas.");
    } catch (err) {
        console.error("MongoDB backup save failed:", err.message);
    }
}

module.exports = {
    loadDatabaseFromMongo,
    saveDatabaseToMongo
};
