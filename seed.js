const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, 'database.db');
const ROSTER_PATH = path.join(__dirname, 'q', 'students_data.js');

console.log('Starting Database Initialization & Seeding...');

// 1. Initialize SQLite Database
let db;
try {
    db = new DatabaseSync(DB_PATH);
    console.log('Connected to SQLite database at:', DB_PATH);
} catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
}

// 2. Create Schema Tables
db.exec(`
    DROP TABLE IF EXISTS attendance_records;
    DROP TABLE IF EXISTS attendance_sessions;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        gender TEXT,
        category TEXT,
        subject TEXT,
        class TEXT,
        department TEXT,
        division TEXT,
        program TEXT,
        year TEXT,
        semester TEXT,
        fee_due REAL DEFAULT 0,
        fee_paid REAL DEFAULT 0,
        fee_total REAL DEFAULT 0
    );

    CREATE TABLE attendance_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        creator_id INTEGER NOT NULL,
        class_name TEXT NOT NULL,
        subject TEXT NOT NULL,
        division TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY(creator_id) REFERENCES users(id)
    );

    CREATE TABLE attendance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'present',
        FOREIGN KEY(session_id) REFERENCES attendance_sessions(id),
        FOREIGN KEY(student_id) REFERENCES users(id),
        UNIQUE(session_id, student_id)
    );
`);
console.log('Database tables created successfully.');

// 3. Load Student Data from students_data.js
let students = [];
try {
    const fileContent = fs.readFileSync(ROSTER_PATH, 'utf8');
    // Replace const definition with global variable assignment
    const evalCode = fileContent.replace('const TOLANI_STUDENTS =', 'global.TOLANI_STUDENTS =');
    eval(evalCode);
    students = global.TOLANI_STUDENTS;
    console.log(`Loaded ${students.length} students from roster.`);
} catch (err) {
    console.error('Failed to read or parse students_data.js:', err);
    process.exit(1);
}

// 4. Seed Admin & Teacher
const insertStmt = db.prepare(`
    INSERT INTO users (
        username, password, role, name, email, phone, gender, category, 
        subject, class, department, division, program, year, semester, 
        fee_due, fee_paid, fee_total
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
`);

db.exec('BEGIN TRANSACTION');

try {
    // Insert Admin
    insertStmt.run(
        'admin',
        'okokokok',
        'admin',
        'Admin Principal',
        'daveneel1405@gmail.com',
        '+91 99999 88888',
        'Male',
        'General',
        'All',
        'All',
        'Administration',
        'All',
        'B.Com (NEP)',
        'N/A',
        'N/A',
        0, 0, 0
    );

    // Insert Teacher
    insertStmt.run(
        'teacher',
        'okokokok',
        'teacher',
        'Prof. Sarah Jenkins',
        'khushichovatiya489@gmail.com',
        '+91 99999 77777',
        'Female',
        'General',
        'Statistics',
        'B.Com. Sem-I',
        'Commerce & Accountancy',
        'All',
        'B.Com (NEP)',
        'N/A',
        'N/A',
        0, 0, 0
    );

    // Insert Students
    students.forEach((s) => {
        const username = s.rollNo.toString().trim();
        const password = s.spdid.toString().trim();
        const feeStatus = s.feeStatus || { due: 6200, paid: 0, total: 6200 };
        
        // Seed division based on roll number
        const rollNum = parseInt(s.rollNo);
        let division = 'A';
        if (!isNaN(rollNum)) {
            if (rollNum <= 170) division = 'A';
            else if (rollNum <= 340) division = 'B';
            else if (rollNum <= 510) division = 'C';
            else if (rollNum <= 680) division = 'D';
            else if (rollNum <= 850) division = 'E';
            else division = 'F';
        }

        insertStmt.run(
            username,
            password,
            'student',
            s.name || 'Student ' + username,
            s.email || null,
            s.phone || null,
            s.gender || 'Unknown',
            s.category || 'General',
            s.subject || 'Commerce',
            s.class || 'B.Com. Sem-I',
            s.department || 'B.Com (NEP)',
            division,
            'B.Com (Regular)',
            '1st Year',
            'Semester 1',
            feeStatus.due,
            feeStatus.paid,
            feeStatus.total
        );
    });

    db.exec('COMMIT');
    console.log(`Database transaction completed. Successfully seeded ${students.length + 2} users.`);
} catch (err) {
    db.exec('ROLLBACK');
    console.error('Error seeding database, transaction rolled back:', err);
    process.exit(1);
}

console.log('Seeding finished successfully.');
db.close();
