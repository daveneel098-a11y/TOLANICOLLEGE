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
    DROP TABLE IF EXISTS settings;
    DROP TABLE IF EXISTS subjects;
    DROP TABLE IF EXISTS timetables;
    DROP TABLE IF EXISTS notices;
    DROP TABLE IF EXISTS daily_lectures;

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

    CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );

    CREATE TABLE subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        program TEXT NOT NULL,
        year TEXT NOT NULL,
        semester TEXT NOT NULL
    );

    CREATE TABLE timetables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        program TEXT NOT NULL,
        day TEXT NOT NULL,
        slot_1 TEXT DEFAULT '',
        slot_2 TEXT DEFAULT '',
        slot_3 TEXT DEFAULT '',
        slot_4 TEXT DEFAULT '',
        UNIQUE(program, day)
    );

    CREATE TABLE notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        program TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE daily_lectures (
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

    CREATE TABLE attendance_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        creator_id INTEGER NOT NULL,
        class_name TEXT NOT NULL,
        subject TEXT NOT NULL,
        division TEXT NOT NULL,
        program TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        is_active INTEGER DEFAULT 1,
        require_gps INTEGER DEFAULT 0,
        creator_lat REAL,
        creator_lon REAL,
        is_rolling INTEGER DEFAULT 0,
        FOREIGN KEY(creator_id) REFERENCES users(id)
    );

    CREATE TABLE attendance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        device_id TEXT,
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
    const evalCode = fileContent.replace('const TOLANI_STUDENTS =', 'global.TOLANI_STUDENTS =');
    eval(evalCode);
    students = global.TOLANI_STUDENTS;
    console.log(`Loaded ${students.length} students from roster.`);
} catch (err) {
    console.error('Failed to read or parse students_data.js:', err);
    process.exit(1);
}

// 4. Seeding Transaction
db.exec('BEGIN TRANSACTION');

try {
    // --- Seed Settings (Gender-Based Baseline Fees) ---
    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insertSetting.run('fee_baseline_bcom_regular_boy', '6200');
    insertSetting.run('fee_baseline_bcom_regular_girl', '5200');
    insertSetting.run('fee_baseline_bcom_professional_boy', '9500');
    insertSetting.run('fee_baseline_bcom_professional_girl', '8500');
    insertSetting.run('fee_baseline_mcom_boy', '12000');
    insertSetting.run('fee_baseline_mcom_girl', '11000');
    insertSetting.run('fee_penalty', '150');
    console.log('Baseline fees settings seeded.');

    // --- Seed Subjects ---
    const insertSubject = db.prepare('INSERT INTO subjects (name, code, program, year, semester) VALUES (?, ?, ?, ?, ?)');
    
    // B.Com (Regular)
    insertSubject.run('Financial Accounting', 'BC-101', 'B.Com (Regular)', '1st Year', 'Semester 1');
    insertSubject.run('Business Organisation', 'BC-102', 'B.Com (Regular)', '1st Year', 'Semester 1');
    insertSubject.run('Microeconomics', 'BC-103', 'B.Com (Regular)', '1st Year', 'Semester 1');
    insertSubject.run('Business Communication', 'BC-104', 'B.Com (Regular)', '1st Year', 'Semester 2');
    insertSubject.run('Principles of Management', 'BC-201', 'B.Com (Regular)', '1st Year', 'Semester 2');

    // B.Com (Professional)
    insertSubject.run('Corporate Accounting', 'BCP-101', 'B.Com (Professional)', '1st Year', 'Semester 1');
    insertSubject.run('Financial Management', 'BCP-102', 'B.Com (Professional)', '1st Year', 'Semester 1');
    insertSubject.run('Auditing & Assurance', 'BCP-103', 'B.Com (Professional)', '1st Year', 'Semester 1');
    insertSubject.run('Direct Tax', 'BCP-201', 'B.Com (Professional)', '1st Year', 'Semester 2');
    insertSubject.run('Cost Accounting', 'BCP-202', 'B.Com (Professional)', '1st Year', 'Semester 2');

    // M.Com
    insertSubject.run('Managerial Economics', 'MC-101', 'M.Com', '1st Year', 'Semester 1');
    insertSubject.run('Research Methodology', 'MC-102', 'M.Com', '1st Year', 'Semester 1');
    insertSubject.run('Strategic Cost Management', 'MC-103', 'M.Com', '1st Year', 'Semester 2');
    insertSubject.run('Quantitative Techniques', 'MC-201', 'M.Com', '1st Year', 'Semester 2');
    console.log('Course subjects seeded.');

    // --- Seed Timetables ---
    const insertTimetable = db.prepare(`
        INSERT INTO timetables (program, day, slot_1, slot_2, slot_3, slot_4)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Timetable definitions
    const schedules = {
        'B.Com (Regular)': [
            ['Monday', 'Financial Accounting (Dr. Thapa)', 'Microeconomics (Prof. Mehta)', 'Business Organisation (Dr. R. K.)', 'Statistics (Prof. Sarah Jenkins)'],
            ['Tuesday', 'Financial Accounting (Dr. Thapa)', 'Microeconomics (Prof. Mehta)', 'Statistics (Prof. Sarah Jenkins)', 'Free Slot'],
            ['Wednesday', 'Business Organisation (Dr. R. K.)', 'Microeconomics (Prof. Mehta)', 'Free Slot', 'Financial Accounting (Dr. Thapa)'],
            ['Thursday', 'Financial Accounting (Dr. Thapa)', 'Microeconomics (Prof. Mehta)', 'Statistics (Prof. Sarah Jenkins)', 'Free Slot'],
            ['Friday', 'Microeconomics (Prof. Mehta)', 'Statistics (Prof. Sarah Jenkins)', 'Business Organisation (Dr. R. K.)', 'Principles of Management (Prof. Mehta)'],
            ['Saturday', 'Microeconomics (Prof. Mehta)', 'Business Organisation (Dr. R. K.)', 'Principles of Management (Prof. Mehta)', 'Free Slot']
        ],
        'B.Com (Professional)': [
            ['Monday', 'Corporate Accounting (Dr. Trivedi)', 'Financial Management (Prof. Joshi)', 'Auditing & Assurance (CA Patel)', 'Direct Tax (Prof. Sarah Jenkins)'],
            ['Tuesday', 'Corporate Accounting (Dr. Trivedi)', 'Financial Management (Prof. Joshi)', 'Direct Tax (Prof. Sarah Jenkins)', 'Free Slot'],
            ['Wednesday', 'Auditing & Assurance (CA Patel)', 'Financial Management (Prof. Joshi)', 'Free Slot', 'Corporate Accounting (Dr. Trivedi)'],
            ['Thursday', 'Corporate Accounting (Dr. Trivedi)', 'Financial Management (Prof. Joshi)', 'Direct Tax (Prof. Sarah Jenkins)', 'Free Slot'],
            ['Friday', 'Financial Management (Prof. Joshi)', 'Direct Tax (Prof. Sarah Jenkins)', 'Auditing & Assurance (CA Patel)', 'Cost Accounting (Prof. Joshi)'],
            ['Saturday', 'Financial Management (Prof. Joshi)', 'Auditing & Assurance (CA Patel)', 'Cost Accounting (Prof. Joshi)', 'Free Slot']
        ],
        'M.Com': [
            ['Monday', 'Managerial Economics (Dr. Shah)', 'Research Methodology (Prof. Vyas)', 'Strategic Cost Management (Dr. Dave)', 'Quantitative Techniques (Prof. Jadeja)'],
            ['Tuesday', 'Managerial Economics (Dr. Shah)', 'Research Methodology (Prof. Vyas)', 'Quantitative Techniques (Prof. Jadeja)', 'Free Slot'],
            ['Wednesday', 'Strategic Cost Management (Dr. Dave)', 'Research Methodology (Prof. Vyas)', 'Free Slot', 'Managerial Economics (Dr. Shah)'],
            ['Thursday', 'Managerial Economics (Dr. Shah)', 'Research Methodology (Prof. Vyas)', 'Quantitative Techniques (Prof. Jadeja)', 'Free Slot'],
            ['Friday', 'Research Methodology (Prof. Vyas)', 'Quantitative Techniques (Prof. Jadeja)', 'Strategic Cost Management (Dr. Dave)', 'Corporate Governance (Dr. Shah)'],
            ['Saturday', 'Research Methodology (Prof. Vyas)', 'Strategic Cost Management (Dr. Dave)', 'Corporate Governance (Dr. Shah)', 'Free Slot']
        ]
    };

    for (const [program, rows] of Object.entries(schedules)) {
        rows.forEach(([day, s1, s2, s3, s4]) => {
            insertTimetable.run(program, day, s1, s2, s3, s4);
        });
    }
    console.log('Course timetables seeded.');

    // --- Seed Notices ---
    const insertNotice = db.prepare('INSERT INTO notices (title, content, program) VALUES (?, ?, ?)');
    insertNotice.run('Orientation Program', 'Welcome to the B.Com (Regular) program. The orientation session for Sem-I is next Monday in Room 101.', 'B.Com (Regular)');
    insertNotice.run('Professional Training Workshop', 'An exclusive Direct Tax workshop is scheduled for B.Com (Professional) students this Saturday.', 'B.Com (Professional)');
    insertNotice.run('Research Dissertation Seminar', 'M.Com students must choose their dissertation topics by the end of this week. Contact Prof. Vyas.', 'M.Com');
    insertNotice.run('Mid-Semester Examinations', 'Mid-sem exams for all streams will commence from the 1st of next month. Timetable will be released shortly.', 'All');
    console.log('Notice board announcements seeded.');

    // --- Seed Admin & Teacher ---
    const insertUser = db.prepare(`
        INSERT INTO users (
            username, password, role, name, email, phone, gender, category, 
            subject, class, department, division, program, year, semester, 
            fee_due, fee_paid, fee_total
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    `);

    // Insert Admin (Overall)
    insertUser.run(
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
        'B.Com (Regular)',
        'N/A',
        'N/A',
        0, 0, 0
    );

    // Insert Teacher (Assigned to B.Com Regular)
    insertUser.run(
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
        'B.Com (Regular)',
        'N/A',
        'N/A',
        0, 0, 0
    );
    console.log('Admin and Faculty instructions seeded.');

    // --- Seed Students with Gender-Based Fees & 7 Divisions ---
    students.forEach((s) => {
        const username = s.rollNo.toString().trim();
        const password = s.spdid.toString().trim();
        const gender = s.gender || 'Male';
        
        // Calculate division based on roll number (7 divisions: A to G)
        const rollNum = parseInt(s.rollNo);
        let division = 'A';
        if (!isNaN(rollNum)) {
            if (rollNum <= 125) division = 'A';
            else if (rollNum <= 250) division = 'B';
            else if (rollNum <= 375) division = 'C';
            else if (rollNum <= 500) division = 'D';
            else if (rollNum <= 625) division = 'E';
            else if (rollNum <= 750) division = 'F';
            else division = 'G';
        }

        // Gender-based fees (seeding Professional student - Boy: 9500, Girl: 8500)
        let baselineFee = 9500;
        if (gender.toLowerCase() === 'female') {
            baselineFee = 8500;
        }

        const feeStatus = {
            due: baselineFee,
            paid: 0,
            total: baselineFee
        };

        const originalClass = s.class || 'B.Com. Sem-I';
        const finalClass = originalClass.replace('Sem-I', 'Sem-V');

        insertUser.run(
            username,
            password,
            'student',
            s.name || 'Student ' + username,
            s.email || null,
            s.phone || null,
            gender,
            s.category || 'General',
            s.subject || 'Commerce',
            finalClass,
            'B.Com (Professional)',
            division,
            'B.Com (Professional)', // seeded as Professional
            '3rd Year',
            'Semester 5',
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
