const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Persistence Middleware
let dbChanged = false;
app.use((req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        dbChanged = true;
    }
    next();
});

// Connect to SQLite (with Render Persistent Disk support)
const RENDER_DATA_DIR = '/var/data';
let dbPath = path.join(__dirname, 'database.db');
if (fs.existsSync(RENDER_DATA_DIR)) {
    dbPath = path.join(RENDER_DATA_DIR, 'database.db');
    // If persistent database does not exist, copy from local directory as baseline
    const localDbPath = path.join(__dirname, 'database.db');
    if (!fs.existsSync(dbPath) && fs.existsSync(localDbPath)) {
        try {
            fs.copyFileSync(localDbPath, dbPath);
            console.log('Copied baseline database to Render persistent volume:', dbPath);
        } catch (copyErr) {
            console.error('Failed to copy baseline database to Render persistent volume:', copyErr);
        }
    }
    console.log('Using persistent volume database:', dbPath);
} else {
    console.log('Using local directory database:', dbPath);
}
let db;

// --- DATABASE AUTO-MIGRATIONS ---
function runMigrations() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        program TEXT NOT NULL,
        year TEXT NOT NULL,
        semester TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS timetables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        program TEXT NOT NULL,
        day TEXT NOT NULL,
        slot_1 TEXT DEFAULT '',
        slot_2 TEXT DEFAULT '',
        slot_3 TEXT DEFAULT '',
        slot_4 TEXT DEFAULT '',
        UNIQUE(program, day)
    );

    CREATE TABLE IF NOT EXISTS notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        program TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_lectures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        program TEXT NOT NULL,
        division TEXT NOT NULL,
        slot TEXT NOT NULL,
        subject TEXT NOT NULL,
        original_teacher TEXT NOT NULL,
        status TEXT NOT NULL,
        substitute_teacher TEXT DEFAULT '',
        combined_division TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        UNIQUE(date, program, division, slot)
    );

    CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        program TEXT NOT NULL,
        syllabus TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        due_date TEXT NOT NULL,
        file_name TEXT,
        file_path TEXT,
        program TEXT NOT NULL,
        class_name TEXT NOT NULL,
        subject TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS study_materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        file_name TEXT,
        file_path TEXT,
        program TEXT NOT NULL,
        class_name TEXT NOT NULL,
        subject TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS marks_registry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        exam_name TEXT NOT NULL,
        marks_obtained INTEGER NOT NULL,
        marks_total INTEGER NOT NULL,
        FOREIGN KEY(student_id) REFERENCES users(id)
    );
`);

// Safe Schema Upgrades for Anti-Proxy Suite
try { db.exec("ALTER TABLE attendance_sessions ADD COLUMN require_gps INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE attendance_sessions ADD COLUMN creator_lat REAL"); } catch (e) {}
try { db.exec("ALTER TABLE attendance_sessions ADD COLUMN creator_lon REAL"); } catch (e) {}
try { db.exec("ALTER TABLE attendance_sessions ADD COLUMN is_rolling INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE attendance_sessions ADD COLUMN geofence_radius INTEGER DEFAULT 50"); } catch (e) {}
try { db.exec("ALTER TABLE attendance_records ADD COLUMN device_id TEXT"); } catch (e) {}

// Try adding program column to attendance_sessions in case of legacy schema
try {
    db.exec("ALTER TABLE attendance_sessions ADD COLUMN program TEXT DEFAULT 'B.Com (Regular)'");
} catch (e) {
    // Column already exists, ignore
}
// Try adding gender column to users in case of legacy schema
try {
    db.exec("ALTER TABLE users ADD COLUMN gender TEXT DEFAULT 'Male'");
} catch (e) {
    // Column already exists, ignore
}

// Try adding profile_locked column to users in case of legacy schema
try {
    db.exec("ALTER TABLE users ADD COLUMN profile_locked INTEGER DEFAULT 0");
} catch (e) {
    // Column already exists, ignore
}

    // Auto-seed Semester 3 and Semester 5 timetables for B.Com Regular if missing
    try {
        const check = db.prepare("SELECT count(*) as count FROM timetables WHERE program LIKE '%Semester 3%' OR program LIKE '%Semester 5%'").get();
        if (!check || check.count === 0) {
            console.log("Seeding B.Com Regular Semester 3 and 5 timetables...");
            const insertTimetable = db.prepare(`
                INSERT INTO timetables (program, day, slot_1, slot_2, slot_3, slot_4)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(program, day) DO UPDATE SET
                    slot_1 = excluded.slot_1,
                    slot_2 = excluded.slot_2,
                    slot_3 = excluded.slot_3,
                    slot_4 = excluded.slot_4
            `);

            const sem3Timetables = {
                'A': [
                    ['Monday', 'BUSI. A/C (SAP)', 'Cost A/C (SDA)', 'MD/ECO (ABB)', 'VAC/RM (GD)'],
                    ['Tuesday', 'SEC/SM (JRR)', 'MD/ECO (ABB)', 'TAX P. (SJT)', 'Free Slot'],
                    ['Wednesday', 'Cost A/C (SDA)', 'TAX P. (SJT)', 'BUSI. A/C (KHK)', 'TAX P. (SAP)'],
                    ['Thursday', 'BUSI. A/C (KHK)', 'Cost A/C (SAP)', 'MD301A (ABB)', 'Cost A/C (SDA)'],
                    ['Friday', 'AEC/ENG (DRM)', 'MD/ECO (ABB)', 'SEC/SM (JRR)', 'DSC303 (SJT)'],
                    ['Saturday', 'AEC/ENG (DRM)', 'BUSI. A/C (KHK)', 'VAC/RM (GD)', 'Free Slot']
                ],
                'B': [
                    ['Monday', 'MD/ECO (ABB)', 'TAX P. (SJT)', 'BUSI. A/C (KHK)', 'Free Slot'],
                    ['Tuesday', 'Cost A/C (SDA)', 'BUSI. A/C (KHK)', 'MD/ECO (ABB)', 'AEC/ENG (DRM)'],
                    ['Wednesday', 'AEC/ENG (DRM)', 'TAX P. (SAP)', 'TAX P. (SAP)', 'MD/ECO (ABB)'],
                    ['Thursday', 'Cost A/C (SDA)', 'VAC/RM (GD)', 'SEC/SM (JKR)', 'BUSI. A/C (KHK)'],
                    ['Friday', 'TAX P. (SJT)', 'SEC/SM (JKR)', 'Cost A/C (SDA)', 'VAC/RM (GD)'],
                    ['Saturday', 'Cost A/C (SDA)', 'MD/ECO (ABB)', 'BUSI. A/C (SAP)', 'Free Slot']
                ],
                'C': [
                    ['Monday', 'DSC303 (SJT)', 'MD/ECO (ABB)', 'VAC/RM (GD)', 'Free Slot'],
                    ['Tuesday', 'BUSI. A/C (SAP)', 'Cost A/C (SDA)', 'BUSI. A/C (KHK)', 'MD/ECO (ABB)'],
                    ['Wednesday', 'TAX P. (SJT)', 'MD/ECO (ABB)', 'TAX P. (SAP)', 'SEC/SM (JKR)'],
                    ['Thursday', 'AEC/ENG (DRM)', 'Cost A/C (SDA)', 'BUSI. A/C (KHK)', 'VAC/RM (GD)'],
                    ['Friday', 'Cost A/C (SDA)', 'TAX P. (SJT)', 'MD/ECO (ABB)', 'Free Slot'],
                    ['Saturday', 'BUSI. A/C (KHK)', 'Cost A/C (SAP)', 'SEC/SM (JKR)', 'AEC/ENG (DRM)']
                ],
                'D': [
                    ['Monday', 'AEC/ENG (DRM)', 'TAX P. (SAP)', 'Cost A/C (SDA)', 'BUSI. A/C (KHK)'],
                    ['Tuesday', 'MD/ECO (DJ)', 'DSC303 (SJT)', 'BUSI. A/C (SAP)', 'Free Slot'],
                    ['Wednesday', 'BUSI. A/C (KHK)', 'AEC/ENG (DRM)', 'Cost A/C (SDA)', 'VAC/RM (GD)'],
                    ['Thursday', 'MD/ECO (DJ)', 'TAX P. (SJT)', 'Cost A/C (SDA)', 'Free Slot'],
                    ['Friday', 'BUSI. A/C (SAP)', 'Cost A/C (SDA)', 'MD/ECO (DJ)', 'SEC/SM (JKR)'],
                    ['Saturday', 'SEC/SM (JKR)', 'VAC/RM (GD)', 'TAX P. (SJT)', 'MD/ECO (DJ)']
                ],
                'E': [
                    ['Monday', 'Cost A/C (SDA)', 'BUSI. A/C (KHK)', 'SEC/SM (JKR)', 'TAX P. (SJT)'],
                    ['Tuesday', 'TAX P. (SJT)', 'AEC/ENG (DRM)', 'Cost A/C (SDA)', 'VAC/RM (GD)'],
                    ['Wednesday', 'VAC/RM (GD)', 'DSC302 (KHK)', 'MD/ECO (ABB)', 'Free Slot'],
                    ['Thursday', 'TAX P. (SJT)', 'MD/ECO (ABB)', 'AEC/ENG (DRM)', 'Cost A/C (SAP)'],
                    ['Friday', 'BUSI. A/C (SAP)', 'BUSI. A/C (KHK)', 'SEC/SM (JKR)', 'MD/ECO (ABB)'],
                    ['Saturday', 'MD/ECO (ABB)', 'TAX P. (SJT)', 'Cost A/C (SDA)', 'Free Slot']
                ]
            };

            const sem5Timetables = {
                'A': [
                    ['Monday', 'DC503 (PMC)', 'M501D (MG)', 'DC502 (RK)', 'DC501 (KT)'],
                    ['Tuesday', 'DC503 (PMC)', 'M501D (MG)', 'DC501 (KT)', 'SEC (JR/RM)'],
                    ['Wednesday', 'DC502 (RK)', 'M502D (MG)', 'SEC (JR/RM)', 'DC503 (PMC)'],
                    ['Thursday', 'DC503 (PMC)', 'M502D (MG)', 'DC501 (KT)', 'Free Slot'],
                    ['Friday', 'M502D (MG)', 'M502D (MG)', 'M501D (MG)', 'DC502 (RK)'],
                    ['Saturday', 'M502D (MG)', 'DC502 (RK)', 'M501D (MG)', 'Free Slot']
                ],
                'B': [
                    ['Monday', 'SEC (JR/RM)', 'DC501 (KT)', 'M501BD (MG/JRR)', 'M502BD (MG/JRR)'],
                    ['Tuesday', 'DC502 (RK)', 'DC503 (PMC)', 'M502BD (MG/JRR)', 'M501BD (MG/PBC)'],
                    ['Wednesday', 'DC503 (PMC)', 'SEC (JR/RM)', 'M501BD (MG/PBC)', 'M502BD (MG/JRR)'],
                    ['Thursday', 'DC501 (KT)', 'DC502 (RK)', 'M502BD (MG/JRR)', 'M501BD (MG/PBC)'],
                    ['Friday', 'DC501 (KT)', 'DC502 (RK)', 'DC503 (PMC)', 'Free Slot'],
                    ['Saturday', 'DC503 (PMC)', 'DC501 (KT)', 'DC502 (RK)', 'Free Slot']
                ],
                'C': [
                    ['Monday', 'M502A (PBC)', 'DC503 (PMC)', 'M501A (JRR)', 'DC502 (RK)'],
                    ['Tuesday', 'SEC (JR/RM)', 'DC502 (RK)', 'M501A (PBC)', 'DC501 (KT)'],
                    ['Wednesday', 'M501A (PBC)', 'DC503 (PMC)', 'DC501 (KT)', 'DC502 (RK)'],
                    ['Thursday', 'DC502 (RK)', 'M502A (JRR)', 'DC503 (PMC)', 'SEC (JR/RM)'],
                    ['Friday', 'M502A (JRR)', 'M501A (PBC)', 'DC501 (KT)', 'Free Slot'],
                    ['Saturday', 'DC501 (KT)', 'M502A (JRR)', 'DC503 (PMC)', 'Free Slot']
                ],
                'D': [
                    ['Monday', 'DC502 (RK)', 'SEC (JR/RM)', 'DC501 (KT)', 'DC503 (PMC)'],
                    ['Tuesday', 'DC501 (KT)', 'M502A (JRR)', 'DC503 (PMC)', 'DC502 (RK)'],
                    ['Wednesday', 'M502A (JRR)', 'DC501 (KT)', 'DC502 (RK)', 'M501A (PBC)'],
                    ['Thursday', 'M501A (PBC)', 'DC502 (RK)', 'SEC (JR/RM)', 'DC501 (KT)'],
                    ['Friday', 'DC503 (PMC)', 'M502A (JRR)', 'M501A (PBC)', 'Free Slot'],
                    ['Saturday', 'M501A (PBC)', 'DC503 (PMC)', 'M502A (JRR)', 'Free Slot']
                ]
            };

            // Seed Sem 3
            for (const [div, rows] of Object.entries(sem3Timetables)) {
                const programName = `B.Com (Regular) - Semester 3 - Div ${div}`;
                rows.forEach(([day, s1, s2, s3, s4]) => {
                    insertTimetable.run(programName, day, s1, s2, s3, s4);
                });
            }

            // Seed Sem 5
            for (const [div, rows] of Object.entries(sem5Timetables)) {
                const programName = `B.Com (Regular) - Semester 5 - Div ${div}`;
                rows.forEach(([day, s1, s2, s3, s4]) => {
                    insertTimetable.run(programName, day, s1, s2, s3, s4);
                });
            }

            dbChanged = true; // Mark as changed to trigger MongoDB upload
            console.log("Auto-seeded Semester 3 and 5 timetables successfully!");
        }
    } catch (e) {
        console.error("Failed to auto-seed timetables:", e);
    }

    // Auto-seed first-year students from q/students directory if not present
    try {
        let isSeededSetting = false;
        try {
            const row = db.prepare("SELECT value FROM settings WHERE key = 'sem1_2026_seeded'").get();
            if (row && row.value === 'true') {
                isSeededSetting = true;
            }
        } catch (e) {
            // Table might not exist or key missing
        }

        if (!isSeededSetting) {
            console.log("Forcing first-year student data cleanup and re-seeding...");
            
            // Cleanup existing first-year students and associated records (child tables first to satisfy foreign key constraints)
            db.prepare(`
                DELETE FROM attendance_records 
                WHERE student_id IN (SELECT id FROM users WHERE role = 'student' AND year = '1st Year')
            `).run();
            db.prepare(`
                DELETE FROM marks_registry 
                WHERE student_id IN (SELECT id FROM users WHERE role = 'student' AND year = '1st Year')
            `).run();
            db.prepare("DELETE FROM users WHERE role = 'student' AND year = '1st Year'").run();

            const studentsDirectory = path.join(__dirname, 'q', 'students');
            if (fs.existsSync(studentsDirectory)) {
                const files = fs.readdirSync(studentsDirectory);
                let count = 0;
                
                const insertUser = db.prepare(`
                    INSERT INTO users (
                        username, password, role, name, email, phone, gender, category, 
                        subject, class, department, division, program, year, semester, 
                        fee_due, fee_paid, fee_total
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                `);
                
                db.exec('BEGIN TRANSACTION;');
                
                for (const file of files) {
                    if (file.endsWith('.json') && file.includes('1styear')) {
                        const filePath = path.join(studentsDirectory, file);
                        const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        const fileStudents = fileData.students || [];
                        const program = fileData.program;
                        const year = fileData.year;
                        const semester = fileData.semester;
                        const division = fileData.division;
                        
                        for (const s of fileStudents) {
                            let subject = 'Commerce';
                            if (s.subject === 'STAT') subject = 'Statistics';
                            else if (s.subject === 'BA') subject = 'Business Administration';
                            else if (s.subject === 'CA') subject = 'Computer Applications';
                            
                            const baselineFee = s.gender === 'Female' ? 5000 : 6000;
                            
                            insertUser.run(
                                'I' + s.rollNo,
                                s.rollNo,
                                'student',
                                s.name,
                                s.email,
                                s.phone,
                                s.gender,
                                s.category,
                                subject,
                                s.class,
                                'Commerce Department',
                                division,
                                program,
                                year,
                                semester,
                                baselineFee,
                                0,
                                baselineFee
                            );
                            count++;
                        }
                    }
                }
                
                // Record that we seeded it successfully
                db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('sem1_2026_seeded', 'true')").run();
                
                db.exec('COMMIT;');
                dbChanged = true; // Mark as changed to upload to MongoDB Atlas
                console.log(`Successfully auto-seeded ${count} first-year students on startup!`);
            }
        }
    } catch (e) {
        console.error("Failed to auto-seed first-year students on boot:", e);
    }

    // Migration: Apply roman numeral semester prefix to all existing student usernames and set password to raw roll number
    try {
        let isMigrated = false;
        try {
            const row = db.prepare("SELECT value FROM settings WHERE key = 'student_usernames_roman_prefixed'").get();
            if (row && row.value === 'true') {
                isMigrated = true;
            }
        } catch (e) {}

        if (!isMigrated) {
            console.log("Migrating existing student usernames to semester-prefixed format...");
            const students = db.prepare("SELECT id, username, semester FROM users WHERE role = 'student'").all();
            
            db.exec('BEGIN TRANSACTION;');
            let count = 0;
            
            const updateStmt = db.prepare("UPDATE users SET username = ?, password = ? WHERE id = ?");
            
            for (const s of students) {
                // Extract raw roll number by stripping any existing roman numeral prefix
                const rollNo = s.username.replace(/^(I|II|III|IV|V|VI)/, '');
                
                let romanPrefix = 'I';
                if (s.semester) {
                    const semNum = parseInt(s.semester.replace(/\D/g, ''));
                    const romanMapping = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI' };
                    romanPrefix = romanMapping[semNum] || 'I';
                }
                
                const newUsername = romanPrefix + rollNo;
                const newPassword = rollNo; // password is raw roll number
                
                updateStmt.run(newUsername, newPassword, s.id);
                count++;
            }
            
            db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('student_usernames_roman_prefixed', 'true')").run();
            db.exec('COMMIT;');
            dbChanged = true;
            console.log(`Successfully migrated ${count} student usernames and passwords!`);
        }
    } catch (e) {
        console.error("Failed to migrate student usernames:", e);
    }

    // Auto-remove B.Com Regular Semester 3 students if migration flag is not set
    try {
        let isSem3Deleted = false;
        try {
            const row = db.prepare("SELECT value FROM settings WHERE key = 'sem3_deleted'").get();
            if (row && row.value === 'true') {
                isSem3Deleted = true;
            }
        } catch (e) {}

        if (!isSem3Deleted) {
            console.log("Forcing cleanup of Semester 3 B.Com Regular students...");
            
            // Delete attendance records of Semester 3 B.Com Regular students
            db.prepare(`
                DELETE FROM attendance_records 
                WHERE student_id IN (
                    SELECT id FROM users 
                    WHERE role = 'student' AND semester = 'Semester 3' AND program = 'B.Com (Regular)'
                )
            `).run();

            // Delete marks registry records of Semester 3 B.Com Regular students
            db.prepare(`
                DELETE FROM marks_registry 
                WHERE student_id IN (
                    SELECT id FROM users 
                    WHERE role = 'student' AND semester = 'Semester 3' AND program = 'B.Com (Regular)'
                )
            `).run();

            // Delete user accounts of Semester 3 B.Com Regular students
            db.prepare(`
                DELETE FROM users 
                WHERE role = 'student' AND semester = 'Semester 3' AND program = 'B.Com (Regular)'
            `).run();

            db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('sem3_deleted', 'true')").run();
            dbChanged = true;
            console.log("Successfully cleared Semester 3 B.Com Regular student data.");
        }
    } catch (e) {
        console.error("Failed to auto-remove Sem 3 student data:", e);
    }
}

// --- HELPER FUNCTIONS ---
function generateAttendanceCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
}

function getBaselineFee(program, gender) {
    let key = 'fee_baseline_bcom_regular_boy';
    const prog = (program || '').toLowerCase();
    const g = (gender || '').toLowerCase();

    if (prog.includes('professional')) {
        key = g === 'female' ? 'fee_baseline_bcom_professional_girl' : 'fee_baseline_bcom_professional_boy';
    } else if (prog.includes('m.com') || prog.includes('mcom')) {
        key = g === 'female' ? 'fee_baseline_mcom_girl' : 'fee_baseline_mcom_boy';
    } else {
        key = g === 'female' ? 'fee_baseline_bcom_regular_girl' : 'fee_baseline_bcom_regular_boy';
    }

    try {
        const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
        const row = stmt.get(key);
        return row ? parseFloat(row.value) : (prog.includes('professional') ? 9500 : (prog.includes('m.com') ? 12000 : 6200));
    } catch (err) {
        console.error('Error fetching baseline fee rate:', err);
        return 6200;
    }
}

// --- API ENDPOINTS ---

// 1. Authentication
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
        const user = stmt.get(username, password);

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Do not return password to frontend
        const { password: _, ...safeUser } = user;
        res.json({ success: true, user: safeUser });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// 2. Create Attendance Session (Teacher/Admin)
app.post('/api/attendance/create', (req, res) => {
    const { creator_id, class_name, subject, division, program, duration_minutes, require_gps, creator_lat, creator_lon, is_rolling, geofence_radius } = req.body;

    if (!creator_id || !class_name || !subject || !division || !program) {
        return res.status(400).json({ error: 'Missing required session parameters.' });
    }

    const duration = duration_minutes || 10; // Default 10 mins
    const code = generateAttendanceCode();
    const expiresAt = new Date(Date.now() + duration * 60000).toISOString();
    const radius = geofence_radius !== undefined ? parseInt(geofence_radius) : 50;

    try {
        const stmt = db.prepare(`
            INSERT INTO attendance_sessions (code, creator_id, class_name, subject, division, program, expires_at, require_gps, creator_lat, creator_lon, is_rolling, geofence_radius)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(
            code, creator_id, class_name, subject, division, program, expiresAt,
            require_gps ? 1 : 0, creator_lat !== undefined ? creator_lat : null, creator_lon !== undefined ? creator_lon : null, is_rolling ? 1 : 0, radius
        );

        res.json({
            success: true,
            session: {
                id: info.lastInsertRowid,
                code,
                class_name,
                subject,
                division,
                program,
                expires_at: expiresAt,
                require_gps: require_gps ? 1 : 0,
                is_rolling: is_rolling ? 1 : 0,
                geofence_radius: radius
            }
        });
    } catch (err) {
        console.error('Error creating attendance session:', err);
        res.status(500).json({ error: 'Failed to generate attendance session.' });
    }
});

// 2.5 Student Profile Update (Gender and Roll Number - one-time)
app.post('/api/student/update-profile', (req, res) => {
    const { student_id, gender, roll_no } = req.body;
    
    if (!student_id || !gender || !roll_no) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        // Fetch student details to check if already locked
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(student_id);
        if (!user) {
            return res.status(404).json({ error: "Student not found." });
        }
        
        if (user.role !== 'student') {
            return res.status(403).json({ error: "Only students can update their profiles." });
        }

        if (user.profile_locked === 1) {
            return res.status(400).json({ error: "Profile modification is locked because it was already updated once." });
        }

        let romanPrefix = 'I';
        if (user.semester) {
            const semNum = parseInt(user.semester.replace(/\D/g, ''));
            const romanMapping = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI' };
            romanPrefix = romanMapping[semNum] || 'I';
        }
        const finalUsername = romanPrefix + roll_no;

        // Validate final username duplicate check (only if they are changing the username)
        if (finalUsername !== user.username) {
            const dup = db.prepare("SELECT count(*) as count FROM users WHERE username = ?").get(finalUsername);
            if (dup && dup.count > 0) {
                return res.status(400).json({ error: "Roll number already taken by another account." });
            }
        }

        // Update student profile (username is prefixed, password is raw roll number)
        db.prepare("UPDATE users SET username = ?, password = ?, gender = ?, profile_locked = 1 WHERE id = ?").run(finalUsername, roll_no, gender, student_id);
        
        // Fetch updated user to send back
        const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(student_id);
        
        dbChanged = true; // Trigger Mongo sync
        return res.json({ success: true, message: "Profile updated and locked successfully!", user: updatedUser });
    } catch (err) {
        console.error("Error updating student profile:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
});

// 3. Student Check-in (with anti-proxy validations)
app.post('/api/attendance/check-in', (req, res) => {
    const { code, student_id, device_id, student_lat, student_lon, student_accuracy } = req.body;

    if (!code || !student_id) {
        return res.status(400).json({ error: 'Code and Student ID are required.' });
    }

    if (!device_id) {
        return res.status(400).json({ error: 'Security identifier (Device ID) is required.' });
    }

    const now = new Date().toISOString();

    try {
        // Fetch active/unexpired session
        const sessionStmt = db.prepare(`
            SELECT * FROM attendance_sessions 
            WHERE code = ? AND is_active = 1 AND expires_at > ?
        `);
        const session = sessionStmt.get(code, now);

        if (!session) {
            return res.status(400).json({ error: 'Invalid, closed, or expired attendance code.' });
        }

        // 1. Device Lockdown Protection
        const deviceCheckStmt = db.prepare(`
            SELECT * FROM attendance_records WHERE session_id = ? AND device_id = ?
        `);
        const duplicateDevice = deviceCheckStmt.get(session.id, device_id);
        if (duplicateDevice) {
            return res.status(400).json({ 
                error: 'Security Alert: This device has already marked attendance for another student in this session. Proxy attendance is strictly prohibited.' 
            });
        }

        // 2. GPS Geofencing Protection (Smart Host Device Location with Campus Fallback)
        if (session.require_gps) {
            if (student_lat === null || student_lon === null || student_lat === undefined || student_lon === undefined) {
                return res.status(400).json({ 
                    error: 'GPS Geofencing is enabled. You must share your location coordinates to complete check-in.' 
                });
            }

            // Fixed Tolani Commerce College GPS coordinates (Adipur)
            const CAMPUS_LAT = 23.0765;
            const CAMPUS_LON = 70.1537;

            let refLat = CAMPUS_LAT;
            let refLon = CAMPUS_LON;
            let targetName = "the college campus";

            // If teacher/host location is available, match directly against it to support matching matching cell/Wi-Fi tower gateway coordinates indoors
            if (session.creator_lat !== null && session.creator_lon !== null) {
                refLat = session.creator_lat;
                refLon = session.creator_lon;
                targetName = "the instructor's device";
            }

            const distance = getDistanceKm(refLat, refLon, student_lat, student_lon);
            const distanceMeters = distance * 1000;
            const radiusMeters = session.geofence_radius || 50; 

            // Subtract accuracy error margin from calculated distance (cap error margin at 30m to ensure strict boundaries)
            const errorMargin = Math.min(student_accuracy || 0, 30);
            const adjustedDistance = Math.max(0, distanceMeters - errorMargin);

            if (adjustedDistance > radiusMeters) { 
                return res.status(403).json({ 
                    error: `Geofencing failure. You must be in close proximity to ${targetName} (within ${radiusMeters}m) to check in. (Your calculated distance is ${distanceMeters.toFixed(0)}m, GPS error margin: -${errorMargin.toFixed(0)}m, Adjusted: ${adjustedDistance.toFixed(0)}m).` 
                });
            }
        }

        // Fetch student details to verify eligibility
        const studentStmt = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'student'");
        const student = studentStmt.get(student_id);

        if (!student) {
            return res.status(404).json({ error: 'Student record not found.' });
        }

        // Verify program mapping
        if (session.program && session.program !== student.program) {
            return res.status(403).json({ 
                error: `Program mismatch. This code is only for ${session.program}, but you are in ${student.program}.` 
            });
        }

        // Verify class mapping (Year and Semester check)
        if (session.class_name && !(student.class || '').startsWith(session.class_name)) {
            return res.status(403).json({ 
                error: `Class/Semester mismatch. This session is for ${session.class_name}, but you are enrolled in ${student.class}.` 
            });
        }

        // Verify division mapping
        if (session.division !== 'All' && session.division !== student.division) {
            return res.status(403).json({ 
                error: `Division mismatch. This code is only for Division ${session.division}, but you are in Division ${student.division}.` 
            });
        }

        // Check if student has already checked in
        const recordCheckStmt = db.prepare(`
            SELECT * FROM attendance_records WHERE session_id = ? AND student_id = ?
        `);
        const existingRecord = recordCheckStmt.get(session.id, student.id);
        if (existingRecord) {
            return res.status(400).json({ error: 'You have already checked in for this session.' });
        }

        // Insert attendance record (including device_id)
        const recordStmt = db.prepare(`
            INSERT INTO attendance_records (session_id, student_id, device_id, status)
            VALUES (?, ?, ?, 'present')
        `);
        recordStmt.run(session.id, student.id, device_id);

        res.json({ 
            success: true, 
            message: `Check-in successful! Present marked for ${session.subject} (${session.class_name}).` 
        });
    } catch (err) {
        console.error('Check-in error:', err);
        res.status(500).json({ error: 'Check-in failed due to server error.' });
    }
});

// 4. Retrieve checked-in students for a specific active code
app.get('/api/attendance/session/:code/records', (req, res) => {
    const { code } = req.params;

    try {
        const sessionStmt = db.prepare('SELECT * FROM attendance_sessions WHERE code = ?');
        const session = sessionStmt.get(code);

        if (!session) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        const recordsStmt = db.prepare(`
            SELECT r.id, r.marked_at, u.name, u.username as roll_number, u.username as roll_no, u.division, u.gender, r.status
            FROM attendance_records r
            JOIN users u ON r.student_id = u.id
            WHERE r.session_id = ?
            ORDER BY r.marked_at DESC
        `);
        const records = recordsStmt.all(session.id);

        res.json({
            success: true,
            session,
            records
        });
    } catch (err) {
        console.error('Error fetching session records:', err);
        res.status(500).json({ error: 'Failed to fetch session records.' });
    }
});

// 4.5. Retrieve active attendance session for a teacher
app.get('/api/attendance/session/active', (req, res) => {
    const { creator_id } = req.query;

    if (!creator_id) {
        return res.status(400).json({ error: 'Creator ID is required.' });
    }

    try {
        const now = Date.now();
        // Retrieve the most recent active session that hasn't expired yet
        const sessionStmt = db.prepare(`
            SELECT * FROM attendance_sessions 
            WHERE creator_id = ? AND is_active = 1 AND expires_at > ?
            ORDER BY created_at DESC LIMIT 1
        `);
        const session = sessionStmt.get(creator_id, now);

        if (session) {
            res.json({ success: true, session });
        } else {
            res.json({ success: false, message: 'No active session found.' });
        }
    } catch (err) {
        console.error('Error fetching active session:', err);
        res.status(500).json({ error: 'Failed to fetch active session.' });
    }
});

// 4.6. Retrieve all active attendance sessions for projector view
app.get('/api/attendance/active-sessions', (req, res) => {
    try {
        const now = new Date().toISOString();
        const sessionsStmt = db.prepare(`
            SELECT s.*, u.name as creator_name 
            FROM attendance_sessions s
            JOIN users u ON s.creator_id = u.id
            WHERE s.expires_at > ? AND s.is_active = 1
            ORDER BY s.created_at DESC
        `);
        const sessions = sessionsStmt.all(now);
        res.json({ success: true, sessions });
    } catch (err) {
        console.error('Error fetching active sessions:', err);
        res.status(500).json({ error: 'Failed to fetch active sessions.' });
    }
});

// Google Drive Auto-Sync Helper
async function triggerGoogleDriveUpload(code) {
    try {
        const sessionStmt = db.prepare('SELECT * FROM attendance_sessions WHERE code = ?');
        const session = sessionStmt.get(code);
        if (!session) return;

        const recordsStmt = db.prepare(`
            SELECT r.*, u.name, u.gender 
            FROM attendance_records r
            JOIN users u ON r.student_id = u.id
            WHERE r.session_id = ?
            ORDER BY u.name ASC
        `);
        const records = recordsStmt.all(session.id);
        if (records.length === 0) return;

        const headers = ["Roll Number", "Student Name", "Gender", "Division", "Marked At"];
        const csvRows = [headers.join(',')];
        records.forEach(r => {
            const student = db.prepare("SELECT username FROM users WHERE id = ?").get(r.student_id);
            csvRows.push([
                student ? student.username : '',
                `"${r.name.replace(/"/g, '""')}"`,
                r.gender || 'Male',
                `Division ${session.division}`,
                new Date(r.marked_at).toLocaleString()
            ].join(','));
        });
        const csvContent = csvRows.join('\n');

        const scriptUrlStmt = db.prepare("SELECT value FROM settings WHERE key = 'google_drive_script_url'");
        const scriptUrlRow = scriptUrlStmt.get();
        const scriptUrl = scriptUrlRow ? scriptUrlRow.value : null;
        if (!scriptUrl) {
            console.log("Google Drive script URL not configured. Skipping upload.");
            return;
        }

        const filename = `Attendance_${session.subject.replace(/[^a-zA-Z0-9]/g, '_')}_${session.division}_${new Date().toISOString().split('T')[0]}.csv`;
        
        const response = await fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, content: csvContent })
        });
        console.log("Google Drive auto-upload trigger completed.");
    } catch (err) {
        console.error("Failed to upload to Google Drive:", err);
    }
}

// 5. Close attendance session manually
app.post('/api/attendance/session/close', (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Session code is required.' });
    }

    try {
        const stmt = db.prepare('UPDATE attendance_sessions SET is_active = 0 WHERE code = ?');
        const info = stmt.run(code);

        if (info.changes === 0) {
            return res.status(404).json({ error: 'No active session found with this code.' });
        }

        // Trigger Google Drive auto-sync in the background
        triggerGoogleDriveUpload(code);

        res.json({ success: true, message: 'Attendance session successfully closed.' });
    } catch (err) {
        console.error('Error closing session:', err);
        res.status(500).json({ error: 'Failed to close session.' });
    }
});

// Google Drive Settings Configuration
app.get('/api/settings/drive', (req, res) => {
    try {
        const row = db.prepare("SELECT value FROM settings WHERE key = 'google_drive_script_url'").get();
        res.json({ success: true, url: row ? row.value : "" });
    } catch (e) {
        res.status(500).json({ error: "Failed to read drive settings." });
    }
});

app.post('/api/settings/drive', (req, res) => {
    const { url } = req.body;
    try {
        db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('google_drive_script_url', ?)").run(url || "");
        res.json({ success: true, message: "Drive settings saved." });
    } catch (e) {
        res.status(500).json({ error: "Failed to save drive settings." });
    }
});

// 6. Dynamic OTP Code Rotation (Projector Mode)
app.post('/api/attendance/session/rotate', (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: 'Session code is required.' });
    }

    try {
        // Fetch current session
        const session = db.prepare('SELECT * FROM attendance_sessions WHERE code = ? AND is_active = 1').get(code);
        if (!session) {
            return res.status(404).json({ error: 'Active session not found.' });
        }

        const newCode = generateAttendanceCode();
        db.prepare('UPDATE attendance_sessions SET code = ? WHERE id = ?').run(newCode, session.id);

        res.json({ success: true, new_code: newCode });
    } catch (err) {
        console.error('Error rotating code:', err);
        res.status(500).json({ error: 'Failed to rotate code.' });
    }
});

// 7. Student Dashboard Overview & History
app.get('/api/attendance/student/:student_id/history', (req, res) => {
    const { student_id } = req.params;

    try {
        const historyStmt = db.prepare(`
            SELECT r.marked_at, s.subject, s.class_name, s.code, r.status
            FROM attendance_records r
            JOIN attendance_sessions s ON r.session_id = s.id
            WHERE r.student_id = ?
            ORDER BY r.marked_at DESC
        `);
        const records = historyStmt.all(student_id);

        res.json({ success: true, records });
    } catch (err) {
        console.error('Error fetching student history:', err);
        res.status(500).json({ error: 'Failed to fetch attendance history.' });
    }
});

// 7.5. Retrieve Unified Attendance History Logs
app.get('/api/attendance/history', (req, res) => {
    const { creator_id } = req.query;
    try {
        let sql = `
            SELECT r.id, r.marked_at, u.username as roll_no, u.name as student_name, 
                   u.gender, u.program, u.class as student_class, u.division as student_division,
                   s.subject, s.class_name as session_class, s.division as session_division,
                   s.code as session_code, t.name as teacher_name
            FROM attendance_records r
            JOIN users u ON r.student_id = u.id
            JOIN attendance_sessions s ON r.session_id = s.id
            JOIN users t ON s.creator_id = t.id
        `;
        let params = [];
        if (creator_id) {
            sql += ` WHERE s.creator_id = ? `;
            params.push(creator_id);
        }
        sql += ` ORDER BY r.marked_at DESC `;

        const stmt = db.prepare(sql);
        const records = stmt.all(...params);
        res.json({ success: true, records });
    } catch (err) {
        console.error('Error fetching attendance history:', err);
        res.status(500).json({ error: 'Failed to fetch attendance history.' });
    }
});

// 8. Get All Users (Admin GUI)
app.get('/api/users', (req, res) => {
    try {
        const stmt = db.prepare('SELECT id, username, role, name, email, phone, division, class, department, program, year, semester, gender, fee_due, fee_paid, fee_total FROM users');
        const users = stmt.all();
        res.json({ success: true, users });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users list.' });
    }
});

// Helper to derive standard class format based on program and semester
function getStandardClass(program, semester) {
    let semRoman = 'I';
    const sem = String(semester || 'Semester 1');
    if (sem.includes('1')) semRoman = 'I';
    else if (sem.includes('2')) semRoman = 'II';
    else if (sem.includes('3')) semRoman = 'III';
    else if (sem.includes('4')) semRoman = 'IV';
    else if (sem.includes('5')) semRoman = 'V';
    else if (sem.includes('6')) semRoman = 'VI';

    const prog = String(program || 'B.Com (Regular)');
    if (prog === 'B.Com (Professional)') {
        return `B.Com. Prof. Sem-${semRoman}`;
    } else if (prog === 'M.Com') {
        return `M.Com. Sem-${semRoman}`;
    } else {
        return `B.Com. Sem-${semRoman}`;
    }
}

// 9. Add User (Admin GUI)
app.post('/api/users/add', (req, res) => {
    const { username, password, role, name, email, phone, division, class_name, department, program, year, semester, gender } = req.body;

    if (!username || !password || !role || !name) {
        return res.status(400).json({ error: 'Missing required user parameters.' });
    }

    const finalGender = gender || 'Male';
    const finalProgram = program || 'B.Com (Regular)';
    const finalSemester = semester || 'Semester 1';
    
    // Automatically compute class name for students to keep it aligned with semester/program
    let finalClass = class_name || 'B.Com. Sem-I';
    if (role === 'student') {
        finalClass = getStandardClass(finalProgram, finalSemester);
    }

    // Determine fees for students
    let feeDue = 0;
    let feeTotal = 0;
    if (role === 'student') {
        const baseline = getBaselineFee(finalProgram, finalGender);
        feeDue = baseline;
        feeTotal = baseline;
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO users (username, password, role, name, email, phone, division, class, department, program, year, semester, gender, fee_due, fee_paid, fee_total)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
        `);
        stmt.run(
            username, password, role, name, email || null, phone || null, 
            division || 'A', finalClass, department || 'B.Com (NEP)',
            finalProgram, year || '1st Year', finalSemester, finalGender, feeDue, feeTotal
        );
        res.json({ success: true, message: 'User added successfully.' });
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ error: 'Failed to add user. Username may already exist.' });
    }
});

// 10. Edit User (Admin GUI)
app.post('/api/users/edit', (req, res) => {
    const { id, name, email, phone, division, class_name, department, program, year, semester, gender, password } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        // Fetch current user details to inspect role
        const existing = db.prepare("SELECT role, program, semester, class FROM users WHERE id = ?").get(id);
        const finalRole = existing ? existing.role : 'student';
        
        const finalProgram = program || (existing ? existing.program : 'B.Com (Regular)');
        const finalSemester = semester || (existing ? existing.semester : 'Semester 1');
        
        let finalClass = class_name;
        if (finalRole === 'student') {
            finalClass = getStandardClass(finalProgram, finalSemester);
        } else {
            finalClass = finalClass || (existing ? existing.class : 'B.Com. Sem-I');
        }

        let query = `
            UPDATE users 
            SET name = ?, email = ?, phone = ?, division = ?, class = ?, department = ?, program = ?, year = ?, semester = ?, gender = ?
        `;
        const params = [
            name, email || null, phone || null, division || 'A', finalClass, 
            department || 'B.Com (NEP)', finalProgram, year || '1st Year', finalSemester,
            gender || 'Male'
        ];

        if (password && password.trim() !== '') {
            query += `, password = ?`;
            params.push(password.trim());
        }

        query += ` WHERE id = ?`;
        params.push(id);

        const stmt = db.prepare(query);
        stmt.run(...params);

        res.json({ success: true, message: 'User updated successfully.' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Failed to update user.' });
    }
});

// 11. Delete User (Admin GUI)
app.post('/api/users/delete', (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(id);
        res.json({ success: true, message: 'User deleted successfully.' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user.' });
    }
});

// --- PROGRAM MANAGEMENT ENDPOINTS ---

// Settings: Fees Configuration
app.get('/api/settings/fees', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM settings').all();
        const settingsMap = {};
        rows.forEach(r => { settingsMap[r.key] = r.value; });
        
        // Return baseline settings or defaults
        res.json({
            success: true,
            fees: {
                fee_baseline_bcom_regular_boy: settingsMap['fee_baseline_bcom_regular_boy'] || '6200',
                fee_baseline_bcom_regular_girl: settingsMap['fee_baseline_bcom_regular_girl'] || '5200',
                fee_baseline_bcom_professional_boy: settingsMap['fee_baseline_bcom_professional_boy'] || '9500',
                fee_baseline_bcom_professional_girl: settingsMap['fee_baseline_bcom_professional_girl'] || '8500',
                fee_baseline_mcom_boy: settingsMap['fee_baseline_mcom_boy'] || '12000',
                fee_baseline_mcom_girl: settingsMap['fee_baseline_mcom_girl'] || '11000',
                fee_penalty: settingsMap['fee_penalty'] || '150'
            }
        });
    } catch (err) {
        console.error('Error reading baseline settings:', err);
        res.status(500).json({ error: 'Failed to retrieve baseline fees configuration.' });
    }
});

app.post('/api/settings/fees', (req, res) => {
    const { fees } = req.body;
    if (!fees) {
        return res.status(400).json({ error: 'Missing fees settings object.' });
    }

    try {
        const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
        db.exec('BEGIN TRANSACTION');
        for (const [key, value] of Object.entries(fees)) {
            stmt.run(key, String(value));
        }
        db.exec('COMMIT');
        res.json({ success: true, message: 'Fees baseline configuration saved successfully.' });
    } catch (err) {
        db.exec('ROLLBACK');
        console.error('Error writing fees baseline settings:', err);
        res.status(500).json({ error: 'Failed to save fees baseline configuration.' });
    }
});

// Subjects Management
app.get('/api/subjects', (req, res) => {
    const { program } = req.query;
    try {
        let rows;
        if (program) {
            rows = db.prepare('SELECT * FROM subjects WHERE program = ? ORDER BY id ASC').all(program);
        } else {
            rows = db.prepare('SELECT * FROM subjects ORDER BY program ASC, id ASC').all();
        }
        res.json({ success: true, subjects: rows });
    } catch (err) {
        console.error('Error reading subjects:', err);
        res.status(500).json({ error: 'Failed to retrieve subjects list.' });
    }
});

app.post('/api/subjects/add', (req, res) => {
    const { name, code, program, year, semester } = req.body;
    if (!name || !code || !program) {
        return res.status(400).json({ error: 'Missing required subject parameters (name, code, program).' });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO subjects (name, code, program, year, semester)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(name, code, program, year || '1st Year', semester || 'Semester 1');
        res.json({ success: true, message: `Subject '${name}' registered successfully.` });
    } catch (err) {
        console.error('Error adding subject:', err);
        res.status(500).json({ error: 'Failed to register subject. Code may already exist.' });
    }
});

app.post('/api/subjects/delete', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'Subject ID is required.' });
    }

    try {
        db.prepare('DELETE FROM subjects WHERE id = ?').run(id);
        res.json({ success: true, message: 'Subject deleted successfully.' });
    } catch (err) {
        console.error('Error deleting subject:', err);
        res.status(500).json({ error: 'Failed to delete subject.' });
    }
});

// Notices Management
app.get('/api/notices', (req, res) => {
    const { program } = req.query;
    try {
        let rows;
        if (program) {
            rows = db.prepare("SELECT * FROM notices WHERE program = ? OR program = 'All' ORDER BY created_at DESC").all(program);
        } else {
            rows = db.prepare('SELECT * FROM notices ORDER BY created_at DESC').all();
        }
        res.json({ success: true, notices: rows });
    } catch (err) {
        console.error('Error reading notices:', err);
        res.status(500).json({ error: 'Failed to retrieve notices.' });
    }
});

app.post('/api/notices/add', (req, res) => {
    const { title, content, program } = req.body;
    if (!title || !content || !program) {
        return res.status(400).json({ error: 'Missing required notice parameters (title, content, program).' });
    }

    try {
        const stmt = db.prepare('INSERT INTO notices (title, content, program) VALUES (?, ?, ?)');
        stmt.run(title, content, program);
        res.json({ success: true, message: 'Notice posted successfully.' });
    } catch (err) {
        console.error('Error adding notice:', err);
        res.status(500).json({ error: 'Failed to post notice.' });
    }
});

app.post('/api/notices/delete', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'Notice ID is required.' });
    }

    try {
        db.prepare('DELETE FROM notices WHERE id = ?').run(id);
        res.json({ success: true, message: 'Notice deleted successfully.' });
    } catch (err) {
        console.error('Error deleting notice:', err);
        res.status(500).json({ error: 'Failed to delete notice.' });
    }
});

// Timetables Management
app.get('/api/timetables', (req, res) => {
    const { program } = req.query;
    try {
        let rows;
        if (program) {
            rows = db.prepare('SELECT * FROM timetables WHERE program = ?').all(program);
        } else {
            rows = db.prepare('SELECT * FROM timetables').all();
        }
        res.json({ success: true, timetables: rows });
    } catch (err) {
        console.error('Error reading timetables:', err);
        res.status(500).json({ error: 'Failed to retrieve timetables.' });
    }
});

app.post('/api/timetables/save', (req, res) => {
    const { program, day, slot_1, slot_2, slot_3, slot_4 } = req.body;
    if (!program || !day) {
        return res.status(400).json({ error: 'Program and day parameters are required.' });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO timetables (program, day, slot_1, slot_2, slot_3, slot_4)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(program, day) DO UPDATE SET
                slot_1 = excluded.slot_1,
                slot_2 = excluded.slot_2,
                slot_3 = excluded.slot_3,
                slot_4 = excluded.slot_4
        `);
        stmt.run(program, day, slot_1 || '', slot_2 || '', slot_3 || '', slot_4 || '');
        res.json({ success: true, message: `Timetable for ${program} (${day}) updated successfully.` });
    } catch (err) {
        console.error('Error saving timetable:', err);
        res.status(500).json({ error: 'Failed to save timetable settings.' });
    }
});

// --- DAILY LECTURE STATUS OVERRIDES ENDPOINTS ---

app.get('/api/daily-lectures', (req, res) => {
    const { date, program, division } = req.query;
    if (!date) {
        return res.status(400).json({ error: 'Date (YYYY-MM-DD) is required.' });
    }

    try {
        let rows;
        if (program && division) {
            rows = db.prepare('SELECT * FROM daily_lectures WHERE date = ? AND program = ? AND division = ?').all(date, program, division);
        } else if (program) {
            rows = db.prepare('SELECT * FROM daily_lectures WHERE date = ? AND program = ?').all(date, program);
        } else {
            rows = db.prepare('SELECT * FROM daily_lectures WHERE date = ?').all(date);
        }
        res.json({ success: true, lectures: rows });
    } catch (err) {
        console.error('Error fetching daily lectures status:', err);
        res.status(500).json({ error: 'Failed to fetch daily lectures schedule.' });
    }
});

app.post('/api/daily-lectures/save', (req, res) => {
    const { date, program, division, slot, subject, original_teacher, status, substitute_teacher, combined_division, notes } = req.body;
    if (!date || !program || !division || !slot || !status) {
        return res.status(400).json({ error: 'Missing required override parameters.' });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO daily_lectures (date, program, division, slot, subject, original_teacher, status, substitute_teacher, combined_division, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(date, program, division, slot) DO UPDATE SET
                subject = excluded.subject,
                original_teacher = excluded.original_teacher,
                status = excluded.status,
                substitute_teacher = excluded.substitute_teacher,
                combined_division = excluded.combined_division,
                notes = excluded.notes
        `);
        stmt.run(
            date, program, division, slot, subject || '', original_teacher || '', 
            status, substitute_teacher || '', combined_division || '', notes || ''
        );
        res.json({ success: true, message: 'Lecture adjustment updated successfully.' });
    } catch (err) {
        console.error('Error saving lecture override:', err);
        res.status(500).json({ error: 'Failed to save lecture override.' });
    }
});

app.post('/api/daily-lectures/delete', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'Adjustment ID is required for deletion.' });
    }

    try {
        db.prepare('DELETE FROM daily_lectures WHERE id = ?').run(id);
        res.json({ success: true, message: 'Lecture adjustment cleared (reverted to default).' });
    } catch (err) {
        console.error('Error deleting override:', err);
        res.status(500).json({ error: 'Failed to delete lecture override.' });
    }
});

// --- SYLLABUS, ASSIGNMENTS, STUDY MATERIALS, AND MARKS REGISTRY API ENDPOINTS ---

// Courses & Syllabus
app.get('/api/courses', (req, res) => {
    const { program } = req.query;
    try {
        let rows;
        if (program) {
            rows = db.prepare('SELECT * FROM courses WHERE program = ?').all(program);
        } else {
            rows = db.prepare('SELECT * FROM courses').all();
        }
        res.json({ success: true, courses: rows });
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ error: 'Failed to fetch courses list.' });
    }
});

app.post('/api/courses/save', (req, res) => {
    const { code, name, program, syllabus } = req.body;
    if (!code || !name || !program) {
        return res.status(400).json({ error: 'Missing required course fields.' });
    }
    try {
        const stmt = db.prepare(`
            INSERT INTO courses (code, name, program, syllabus)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(code) DO UPDATE SET
                name = excluded.name,
                program = excluded.program,
                syllabus = excluded.syllabus
        `);
        stmt.run(code, name, program, syllabus || '');
        res.json({ success: true, message: 'Course details saved successfully.' });
    } catch (err) {
        console.error('Error saving course:', err);
        res.status(500).json({ error: 'Failed to save course details.' });
    }
});

// Assignments
app.get('/api/assignments', (req, res) => {
    const { program, class_name } = req.query;
    try {
        let rows;
        if (program && class_name) {
            rows = db.prepare('SELECT * FROM assignments WHERE program = ? AND class_name = ?').all(program, class_name);
        } else if (program) {
            rows = db.prepare('SELECT * FROM assignments WHERE program = ?').all(program);
        } else {
            rows = db.prepare('SELECT * FROM assignments').all();
        }
        res.json({ success: true, assignments: rows });
    } catch (err) {
        console.error('Error fetching assignments:', err);
        res.status(500).json({ error: 'Failed to fetch assignments list.' });
    }
});

app.post('/api/assignments/upload', (req, res) => {
    const { title, description, due_date, file_name, file_data, program, class_name, subject } = req.body;
    if (!title || !due_date || !program || !class_name || !subject) {
        return res.status(400).json({ error: 'Missing required assignment fields.' });
    }

    let filePath = null;
    if (file_name && file_data) {
        try {
            const base64Data = file_data.replace(/^data:.*;base64,/, "");
            const uploadDir = path.join(__dirname, 'public', 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const cleanFileName = path.basename(file_name);
            const fullPath = path.join(uploadDir, cleanFileName);
            fs.writeFileSync(fullPath, base64Data, 'base64');
            filePath = `/uploads/${cleanFileName}`;
        } catch (fileErr) {
            console.error('Error saving file upload:', fileErr);
            return res.status(500).json({ error: 'Failed to upload attachment.' });
        }
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO assignments (title, description, due_date, file_name, file_path, program, class_name, subject)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(title, description || '', due_date, file_name || null, filePath, program, class_name, subject);
        res.json({ success: true, message: 'Assignment uploaded successfully.' });
    } catch (err) {
        console.error('Error creating assignment:', err);
        res.status(500).json({ error: 'Failed to create assignment record.' });
    }
});

app.post('/api/assignments/delete', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Assignment ID is required.' });
    try {
        const item = db.prepare('SELECT file_path FROM assignments WHERE id = ?').get(id);
        if (item && item.file_path) {
            const fullPath = path.join(__dirname, 'public', item.file_path);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }
        db.prepare('DELETE FROM assignments WHERE id = ?').run(id);
        res.json({ success: true, message: 'Assignment deleted successfully.' });
    } catch (err) {
        console.error('Error deleting assignment:', err);
        res.status(500).json({ error: 'Failed to delete assignment.' });
    }
});

// Study Materials
app.get('/api/study-materials', (req, res) => {
    const { program, class_name } = req.query;
    try {
        let rows;
        if (program && class_name) {
            rows = db.prepare('SELECT * FROM study_materials WHERE program = ? AND class_name = ?').all(program, class_name);
        } else if (program) {
            rows = db.prepare('SELECT * FROM study_materials WHERE program = ?').all(program);
        } else {
            rows = db.prepare('SELECT * FROM study_materials').all();
        }
        res.json({ success: true, materials: rows });
    } catch (err) {
        console.error('Error fetching study materials:', err);
        res.status(500).json({ error: 'Failed to fetch study materials.' });
    }
});

app.post('/api/study-materials/upload', (req, res) => {
    const { title, description, file_name, file_data, program, class_name, subject } = req.body;
    if (!title || !program || !class_name || !subject) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    let filePath = null;
    if (file_name && file_data) {
        try {
            const base64Data = file_data.replace(/^data:.*;base64,/, "");
            const uploadDir = path.join(__dirname, 'public', 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const cleanFileName = path.basename(file_name);
            const fullPath = path.join(uploadDir, cleanFileName);
            fs.writeFileSync(fullPath, base64Data, 'base64');
            filePath = `/uploads/${cleanFileName}`;
        } catch (fileErr) {
            console.error('Error saving study material file:', fileErr);
            return res.status(500).json({ error: 'Failed to upload study file.' });
        }
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO study_materials (title, description, file_name, file_path, program, class_name, subject)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(title, description || '', file_name || null, filePath, program, class_name, subject);
        res.json({ success: true, message: 'Study material uploaded successfully.' });
    } catch (err) {
        console.error('Error creating study material:', err);
        res.status(500).json({ error: 'Failed to create study material record.' });
    }
});

app.post('/api/study-materials/delete', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Material ID is required.' });
    try {
        const item = db.prepare('SELECT file_path FROM study_materials WHERE id = ?').get(id);
        if (item && item.file_path) {
            const fullPath = path.join(__dirname, 'public', item.file_path);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }
        db.prepare('DELETE FROM study_materials WHERE id = ?').run(id);
        res.json({ success: true, message: 'Study material deleted successfully.' });
    } catch (err) {
        console.error('Error deleting study material:', err);
        res.status(500).json({ error: 'Failed to delete study material.' });
    }
});

// Marks Registry
app.get('/api/marks/:student_id', (req, res) => {
    const { student_id } = req.params;
    try {
        const rows = db.prepare(`
            SELECT m.id, m.subject, m.exam_name, m.marks_obtained, m.marks_total, u.name as student_name
            FROM marks_registry m
            JOIN users u ON m.student_id = u.id
            WHERE m.student_id = ?
        `).all(student_id);
        res.json({ success: true, marks: rows });
    } catch (err) {
        console.error('Error fetching student marks:', err);
        res.status(500).json({ error: 'Failed to fetch student marks registry.' });
    }
});

app.post('/api/marks/save', (req, res) => {
    const { student_id, subject, exam_name, marks_obtained, marks_total } = req.body;
    if (!student_id || !subject || !exam_name || marks_obtained === undefined || !marks_total) {
        return res.status(400).json({ error: 'Missing required marks fields.' });
    }
    try {
        const checkStmt = db.prepare('SELECT id FROM marks_registry WHERE student_id = ? AND subject = ? AND exam_name = ?');
        const existing = checkStmt.get(student_id, subject, exam_name);

        if (existing) {
            db.prepare('UPDATE marks_registry SET marks_obtained = ?, marks_total = ? WHERE id = ?')
              .run(parseInt(marks_obtained), parseInt(marks_total), existing.id);
        } else {
            db.prepare('INSERT INTO marks_registry (student_id, subject, exam_name, marks_obtained, marks_total) VALUES (?, ?, ?, ?, ?)')
              .run(student_id, subject, exam_name, parseInt(marks_obtained), parseInt(marks_total));
        }
        res.json({ success: true, message: 'Marks saved successfully.' });
    } catch (err) {
        console.error('Error saving marks:', err);
        res.status(500).json({ error: 'Failed to save student marks.' });
    }
});

// SQL Command Terminal Emulator (Admin Console)
app.post('/api/sql', (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: 'No SQL query entered.' });
    }

    const q = query.trim();
    const command = q.split(/\s+/)[0].toUpperCase();

    try {
        if (command === 'SELECT') {
            const stmt = db.prepare(q);
            const rows = stmt.all();
            if (rows.length === 0) {
                return res.json({ result: '(0 rows)' });
            }
            const cols = Object.keys(rows[0]);
            let headerLine = cols.join(' | ');
            let separatorLine = cols.map(c => '-'.repeat(Math.max(c.length, 6))).join('-+-');
            let lines = [headerLine, separatorLine];

            rows.forEach(r => {
                let rowLine = cols.map(c => String(r[c] !== null && r[c] !== undefined ? r[c] : '')).join(' | ');
                lines.push(rowLine);
            });

            res.json({ result: lines.join('\n') + `\n(${rows.length} rows)` });
        } else {
            const stmt = db.prepare(q);
            const info = stmt.run();
            res.json({ result: `${command} completed. Changes: ${info.changes || 0}` });
        }
    } catch (err) {
        res.json({ result: `ERROR: ${err.message}` });
    }
});

// Database Purge / Cleanup Endpoint for Administrator
app.post('/api/admin/clear-database', (req, res) => {
    const { confirm } = req.body;
    if (confirm !== 'yes') {
        return res.status(400).json({ error: "Missing confirmation. Please set confirm to 'yes'." });
    }

    try {
        db.exec('PRAGMA foreign_keys = OFF;');
        db.exec('BEGIN TRANSACTION;');

        // Delete all users except administrator
        const usersInfo = db.prepare("DELETE FROM users WHERE role != 'admin'").run();
        
        // Clear schedules, logs, notices and registers
        db.prepare("DELETE FROM subjects").run();
        db.prepare("DELETE FROM timetables").run();
        db.prepare("DELETE FROM daily_lectures").run();
        db.prepare("DELETE FROM attendance_sessions").run();
        db.prepare("DELETE FROM attendance_records").run();
        db.prepare("DELETE FROM notices").run();
        db.prepare("DELETE FROM courses").run();
        db.prepare("DELETE FROM assignments").run();
        db.prepare("DELETE FROM study_materials").run();
        db.prepare("DELETE FROM marks_registry").run();

        db.exec('COMMIT;');
        db.exec('PRAGMA foreign_keys = ON;');

        // Sync to MongoDB in the background
        const { saveDatabaseToMongo } = require('./mongoSync');
        saveDatabaseToMongo();

        res.json({ 
            success: true, 
            message: `Database cleaned successfully. Deleted ${usersInfo.changes} students/teachers. Timetables, notices, subjects, and schedules cleared. Baseline fees preserved.` 
        });
    } catch (err) {
        try { db.exec('ROLLBACK;'); } catch (e) {}
        try { db.exec('PRAGMA foreign_keys = ON;'); } catch (e) {}
        console.error("Cleanup endpoint failed:", err);
        res.status(500).json({ error: `Cleanup failed: ${err.message}` });
    }
});

// Bulk Import B.Com Regular Sem 1 Student Roster Endpoint
app.post('/api/admin/import-sem1', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'bcom_regular_sem1.txt');
        if (!fs.existsSync(filePath)) {
            return res.status(400).json({ error: 'Roster text file not found.' });
        }
        
        const ocrText = fs.readFileSync(filePath, 'utf8');
        const lines = ocrText.trim().split('\n');
        
        db.exec('PRAGMA foreign_keys = OFF;');
        db.exec('BEGIN TRANSACTION;');
        
        const insertUser = db.prepare(`
            INSERT INTO users (
                username, password, role, name, email, phone, gender, category, 
                subject, class, department, division, program, year, semester, 
                fee_due, fee_paid, fee_total
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `);
        
        const program = "B.Com (Regular)";
        const year = "1st Year";
        const semester = "Semester 1";
        let count = 0;
        
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length < 4) continue;
            
            const srNo = parseInt(parts[0]);
            const subjectCode = parts[parts.length - 1];
            
            const nameParts = parts.slice(2, parts.length - 1);
            const name = nameParts.join(' ');
            
            let division = 'A';
            const username = String(srNo);
            const password = String(srNo); // password matching SR.NO.
            
            let subject = 'Commerce';
            if (subjectCode === 'STAT') {
                subject = 'Statistics';
                if (srNo <= 190) {
                    division = 'A';
                } else {
                    division = 'B';
                }
            } else if (subjectCode === 'BA') {
                subject = 'Business Administration';
                if (srNo >= 351 && srNo <= 400) {
                    division = 'B';
                } else if (srNo >= 401 && srNo <= 590) {
                    division = 'C';
                } else if (srNo >= 591 && srNo <= 780) {
                    division = 'D';
                } else {
                    division = 'E';
                }
            } else if (subjectCode === 'CA') {
                subject = 'Computer Applications';
                if (srNo >= 901 && srNo <= 1020) {
                    division = 'E';
                } else {
                    division = 'F';
                }
            }
            
            let gender = 'Male';
            const nameLower = name.toLowerCase();
            if (
                nameLower.endsWith('ben') || 
                nameLower.endsWith('kumari') || 
                nameLower.endsWith('a') || 
                nameLower.endsWith('i') || 
                nameLower.endsWith('y') ||
                nameLower.includes('kumari') ||
                nameLower.includes('devi') ||
                nameLower.includes('ba')
            ) {
                if (!nameLower.endsWith('kumar') && !nameLower.endsWith('sinh') && !nameLower.endsWith('bhai') && !nameLower.endsWith('ji')) {
                    gender = 'Female';
                }
            }
            
            const baselineFee = gender === 'Female' ? 5000 : 6000;
            
            insertUser.run(
                username,
                password,
                'student',
                name,
                `${username}@tolani.edu`,
                '+91 99000 0' + username.padStart(4, '0'),
                gender,
                'General',
                subject,
                `B.Com. Sem-I`,
                'Commerce Department',
                division,
                program,
                year,
                semester,
                baselineFee,
                0,
                baselineFee
            );
            
            count++;
        }
        
        db.exec('COMMIT;');
        db.exec('PRAGMA foreign_keys = ON;');
        
        // Sync to MongoDB in the background
        const { saveDatabaseToMongo } = require('./mongoSync');
        saveDatabaseToMongo();
        
        res.json({ 
            success: true, 
            message: `Successfully imported ${count} students to B.Com Regular Sem 1 and updated MongoDB backup.` 
        });
    } catch (err) {
        try { db.exec('ROLLBACK;'); } catch (e) {}
        try { db.exec('PRAGMA foreign_keys = ON;'); } catch (e) {}
        console.error("Bulk Sem1 import failed:", err);
        res.status(500).json({ error: `Import failed: ${err.message}` });
    }
});

// Bulk Import B.Com Regular Semester 3 and Semester 5 Student Rosters Endpoint
app.post('/api/admin/import-sem3-sem5', (req, res) => {
    try {
        const filePathSem3 = path.join(__dirname, 'bcom_regular_sem3.txt');
        const filePathSem5 = path.join(__dirname, 'bcom_regular_sem5.txt');
        
        if (!fs.existsSync(filePathSem3) || !fs.existsSync(filePathSem5)) {
            return res.status(400).json({ error: 'Roster files bcom_regular_sem3.txt or bcom_regular_sem5.txt not found.' });
        }
        
        db.exec('PRAGMA foreign_keys = OFF;');
        db.exec('BEGIN TRANSACTION;');
        
        const insertUser = db.prepare(`
            INSERT INTO users (
                username, password, role, name, email, phone, gender, category, 
                subject, class, department, division, program, year, semester, 
                fee_due, fee_paid, fee_total
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `);
        
        const program = "B.Com (Regular)";
        let countSem3 = 0;
        let countSem5 = 0;
        
        // 1. Process Semester 3
        const ocrTextSem3 = fs.readFileSync(filePathSem3, 'utf8');
        const linesSem3 = ocrTextSem3.trim().split('\n');
        for (const line of linesSem3) {
            const parts = line.trim().split(/\s+/);
            if (parts.length < 4) continue;
            
            const rollNo = parseInt(parts[0]);
            const enrollmentNo = parts[1];
            const spdid = parts[2];
            const name = parts.slice(3).join(' ');
            
            // Credentials: username & password matching SPDID
            const username = spdid;
            const password = spdid;
            
            // Division assignments for Semester 3
            let division = 'A';
            if (rollNo >= 1 && rollNo <= 190) {
                division = 'A';
            } else if ((rollNo >= 191 && rollNo <= 322) || (rollNo >= 401 && rollNo <= 450)) {
                division = 'B';
            } else if (rollNo >= 451 && rollNo <= 640) {
                division = 'C';
            } else if (rollNo >= 641 && rollNo <= 830) {
                division = 'D';
            } else if (rollNo >= 831 && rollNo <= 1021) {
                division = 'E';
            }
            
            let gender = 'Male';
            const nameLower = name.toLowerCase();
            if (
                nameLower.endsWith('ben') || 
                nameLower.endsWith('kumari') || 
                nameLower.endsWith('a') || 
                nameLower.endsWith('i') || 
                nameLower.endsWith('y') ||
                nameLower.includes('kumari') ||
                nameLower.includes('devi') ||
                nameLower.includes('ba')
            ) {
                if (!nameLower.endsWith('kumar') && !nameLower.endsWith('sinh') && !nameLower.endsWith('bhai') && !nameLower.endsWith('ji')) {
                    gender = 'Female';
                }
            }
            
            const baselineFee = gender === 'Female' ? 5000 : 6000;
            
            insertUser.run(
                username,
                password,
                'student',
                name,
                `${username}@tolani.edu`,
                '+91 99000 0' + String(rollNo).padStart(4, '0'),
                gender,
                'General',
                'Commerce',
                `B.Com. Sem-III`,
                'Commerce Department',
                division,
                program,
                '2nd Year',
                'Semester 3',
                baselineFee,
                0,
                baselineFee
            );
            countSem3++;
        }
        
        // 2. Process Semester 5
        const ocrTextSem5 = fs.readFileSync(filePathSem5, 'utf8');
        const linesSem5 = ocrTextSem5.trim().split('\n');
        for (const line of linesSem5) {
            const parts = line.trim().split(/\s+/);
            if (parts.length < 4) continue;
            
            const rollNo = parseInt(parts[0]);
            const enrollmentNo = parts[1];
            const spdid = parts[2];
            const name = parts.slice(3).join(' ');
            
            // Credentials: username & password matching SPDID
            const username = spdid;
            const password = spdid;
            
            // Division assignments for Semester 5
            let division = 'A';
            if (rollNo >= 1 && rollNo <= 200) {
                division = 'A';
            } else if ((rollNo >= 201 && rollNo <= 307) || (rollNo >= 351 && rollNo <= 500)) {
                division = 'B';
            } else if (rollNo >= 501 && rollNo <= 725) {
                division = 'C';
            } else if (rollNo >= 726 && rollNo <= 954) {
                division = 'D';
            }
            
            let gender = 'Male';
            const nameLower = name.toLowerCase();
            if (
                nameLower.endsWith('ben') || 
                nameLower.endsWith('kumari') || 
                nameLower.endsWith('a') || 
                nameLower.endsWith('i') || 
                nameLower.endsWith('y') ||
                nameLower.includes('kumari') ||
                nameLower.includes('devi') ||
                nameLower.includes('ba')
            ) {
                if (!nameLower.endsWith('kumar') && !nameLower.endsWith('sinh') && !nameLower.endsWith('bhai') && !nameLower.endsWith('ji')) {
                    gender = 'Female';
                }
            }
            
            const baselineFee = gender === 'Female' ? 5000 : 6000;
            
            insertUser.run(
                username,
                password,
                'student',
                name,
                `${username}@tolani.edu`,
                '+91 98000 0' + String(rollNo).padStart(4, '0'),
                gender,
                'General',
                'Commerce',
                `B.Com. Sem-V`,
                'Commerce Department',
                division,
                program,
                '3rd Year',
                'Semester 5',
                baselineFee,
                0,
                baselineFee
            );
            countSem5++;
        }
        
        db.exec('COMMIT;');
        db.exec('PRAGMA foreign_keys = ON;');
        
        // Sync to MongoDB in the background
        const { saveDatabaseToMongo } = require('./mongoSync');
        saveDatabaseToMongo();
        
        res.json({ 
            success: true, 
            message: `Successfully imported ${countSem3} Sem 3 students and ${countSem5} Sem 5 students. MongoDB backup updated.` 
        });
    } catch (err) {
        try { db.exec('ROLLBACK;'); } catch (e) {}
        try { db.exec('PRAGMA foreign_keys = ON;'); } catch (e) {}
        console.error("Bulk Sem3/5 import failed:", err);
        res.status(500).json({ error: `Import failed: ${err.message}` });
    }
});

// Bulk Import B.Com Professional Semester 3 and Semester 5 Student Rosters Endpoint
app.post('/api/admin/import-prof-sem3-sem5', (req, res) => {
    try {
        const filePathSem3 = path.join(__dirname, 'bcom_prof_sem3_raw.txt');
        const filePathSem5 = path.join(__dirname, 'bcom_prof_sem5_raw.txt');
        
        if (!fs.existsSync(filePathSem3) || !fs.existsSync(filePathSem5)) {
            return res.status(400).json({ error: 'Roster files bcom_prof_sem3_raw.txt or bcom_prof_sem5_raw.txt not found.' });
        }
        
        db.exec('PRAGMA foreign_keys = OFF;');
        db.exec('BEGIN TRANSACTION;');
        
        const insertUser = db.prepare(`
            INSERT INTO users (
                username, password, role, name, email, phone, gender, category, 
                subject, class, department, division, program, year, semester, 
                fee_due, fee_paid, fee_total
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `);
        
        // Dynamically get baseline fees for B.Com Professional
        let feeBoy = 9500;
        let feeGirl = 8500;
        try {
            const rowBoy = db.prepare("SELECT value FROM settings WHERE key = 'fee_baseline_bcom_professional_boy'").get();
            const rowGirl = db.prepare("SELECT value FROM settings WHERE key = 'fee_baseline_bcom_professional_girl'").get();
            if (rowBoy) feeBoy = parseFloat(rowBoy.value);
            if (rowGirl) feeGirl = parseFloat(rowGirl.value);
        } catch (e) {
            console.error("Failed to query settings for baseline fees:", e.message);
        }
        
        const program = "B.Com (Professional)";
        let countSem3 = 0;
        let countSem5 = 0;
        
        // 1. Process Semester 3
        const ocrTextSem3 = fs.readFileSync(filePathSem3, 'utf8');
        const linesSem3 = ocrTextSem3.trim().split('\n');
        for (const line of linesSem3) {
            const parts = line.trim().split(/\s+/);
            if (parts.length < 7) continue;
            
            const rollNo = parseInt(parts[0]);
            const enrollmentNo = parts[1];
            const spdid = parts[2];
            const gender = parts[3];
            const category = parts[parts.length - 1];
            const phone = parts[parts.length - 2];
            const email = parts[parts.length - 3];
            
            const nameParts = parts.slice(4, parts.length - 3);
            const name = nameParts.join(' ');
            
            const username = spdid;
            const password = spdid;
            const division = 'A';
            const subject = 'Commerce';
            
            const baselineFee = gender === 'Female' ? feeGirl : feeBoy;
            
            insertUser.run(
                username,
                password,
                'student',
                name,
                email,
                phone,
                gender,
                category,
                subject,
                `B.Com. Prof. Sem-III`,
                'Commerce Department',
                division,
                program,
                '2nd Year',
                'Semester 3',
                baselineFee,
                0,
                baselineFee
            );
            countSem3++;
        }
        
        // 2. Process Semester 5
        const ocrTextSem5 = fs.readFileSync(filePathSem5, 'utf8');
        const linesSem5 = ocrTextSem5.trim().split('\n');
        for (const line of linesSem5) {
            const parts = line.trim().split(/\s+/);
            if (parts.length < 6) continue;
            
            const rollNo = parseInt(parts[0]);
            const spdid = parts[1];
            const gender = parts[2];
            const category = parts[3];
            const phone = parts[parts.length - 1];
            const email = parts[parts.length - 2];
            
            const nameParts = parts.slice(4, parts.length - 2);
            const name = nameParts.join(' ');
            
            const username = spdid;
            const password = spdid;
            const division = 'A';
            const subject = 'Commerce';
            
            const baselineFee = gender === 'Female' ? feeGirl : feeBoy;
            
            insertUser.run(
                username,
                password,
                'student',
                name,
                email,
                phone,
                gender,
                category,
                subject,
                `B.Com. Prof. Sem-V`,
                'Commerce Department',
                division,
                program,
                '3rd Year',
                'Semester 5',
                baselineFee,
                0,
                baselineFee
            );
            countSem5++;
        }
        
        db.exec('COMMIT;');
        db.exec('PRAGMA foreign_keys = ON;');
        
        // Sync to MongoDB in the background
        const { saveDatabaseToMongo } = require('./mongoSync');
        saveDatabaseToMongo();
        
        res.json({ 
            success: true, 
            message: `Successfully imported ${countSem3} Sem 3 and ${countSem5} Sem 5 B.Com Professional students. MongoDB backup updated.` 
        });
    } catch (err) {
        try { db.exec('ROLLBACK;'); } catch (e) {}
        try { db.exec('PRAGMA foreign_keys = ON;'); } catch (e) {}
        console.error("Bulk B.Com Prof Sem3/5 import failed:", err);
        res.status(500).json({ error: `Import failed: ${err.message}` });
    }
});

// Diagnostics Endpoint to check SQLite and MongoDB status
app.get('/api/diagnostics', async (req, res) => {
    const status = {
        sqlite: false,
        mongodb: {
            configured: false,
            connected: false,
            backup_found: false,
            last_backup_time: null,
            error: null
        }
    };
    
    // Check SQLite
    try {
        const stmt = db.prepare("SELECT count(*) as count FROM users");
        const row = stmt.get();
        status.sqlite = !!(row && row.count > 0);
    } catch (e) {
        status.sqlite_error = e.message;
    }
    
    // Check MongoDB
    const uri = process.env.MONGODB_DATA_API_URL || process.env.MONGODB_URI;
    status.mongodb.configured = !!uri;
    
    if (status.mongodb.configured) {
        try {
            const { MongoClient } = require('mongodb');
            const client = new MongoClient(uri);
            await client.connect();
            const dbName = process.env.MONGODB_DB || 'college_portal';
            const collectionName = process.env.MONGODB_COLLECTION || 'backups';
            const col = client.db(dbName).collection(collectionName);
            const doc = await col.findOne({ key: 'sqlite_db' });
            await client.close();
            
            status.mongodb.connected = true;
            status.mongodb.backup_found = !!doc;
            status.mongodb.last_backup_time = doc ? doc.updated_at : null;
        } catch (err) {
            status.mongodb.error = err.message;
        }
    }
    
    res.json({ success: true, diagnostics: status });
});

// Catch-all route to serve SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



// Periodic database upload to MongoDB Atlas
setInterval(async () => {
    if (dbChanged) {
        dbChanged = false;
        const { saveDatabaseToMongo } = require('./mongoSync');
        await saveDatabaseToMongo();
    }
}, 10000); // sync database to MongoDB every 10 seconds if any changes occur

// Start Server Bootstrap
(async () => {
    try {
        const { loadDatabaseFromMongo } = require('./mongoSync');
        // Pull latest database state from MongoDB Atlas
        await loadDatabaseFromMongo();

        // Connect to local SQLite database
        db = new DatabaseSync(dbPath);
        console.log('Server connected to SQLite database successfully.');

        // Initialize schema tables & migrations
        runMigrations();

        app.listen(PORT, () => {
            console.log(`EduSphere Server is listening on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Critical: Server failed to start:", err);
        process.exit(1);
    }
})();
