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
db.exec('PRAGMA foreign_keys = OFF;');
db.exec(`
    DROP TABLE IF EXISTS attendance_records;
    DROP TABLE IF EXISTS attendance_sessions;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS settings;
    DROP TABLE IF EXISTS subjects;
    DROP TABLE IF EXISTS timetables;
    DROP TABLE IF EXISTS notices;
    DROP TABLE IF EXISTS daily_lectures;
    DROP TABLE IF EXISTS courses;
    DROP TABLE IF EXISTS assignments;
    DROP TABLE IF EXISTS study_materials;
    DROP TABLE IF EXISTS marks_registry;

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
        geofence_radius INTEGER DEFAULT 50,
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

    CREATE TABLE courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        program TEXT NOT NULL,
        syllabus TEXT DEFAULT ''
    );

    CREATE TABLE assignments (
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

    CREATE TABLE study_materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        file_name TEXT,
        file_path TEXT,
        program TEXT NOT NULL,
        class_name TEXT NOT NULL,
        subject TEXT NOT NULL
    );

    CREATE TABLE marks_registry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        exam_name TEXT NOT NULL,
        marks_obtained INTEGER NOT NULL,
        marks_total INTEGER NOT NULL,
        FOREIGN KEY(student_id) REFERENCES users(id)
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
    insertSubject.run('Advance Financial Accounting', 'DSC-MP 301 A', 'B.Com (Professional)', '2nd Year', 'Semester 3');

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

    // Insert Teacher (Assigned to B.Com Professional)
    insertUser.run(
        'teacherpro',
        'okokokok',
        'teacher',
        'Prof. Rahul Sharma',
        'rahul.sharma@tolani.edu',
        '+91 99999 66666',
        'Male',
        'General',
        'Corporate Accounting',
        'B.Com. Sem-V',
        'Commerce & Accountancy',
        'All',
        'B.Com (Professional)',
        'N/A',
        'N/A',
        0, 0, 0
    );

    // Insert Teacher (Assigned to B.Com Professional Sem-III)
    insertUser.run(
        'tulsigarva',
        'okokokok',
        'teacher',
        'Tulsi Garva',
        'tulsi.garva@tolani.edu',
        '9106947048',
        'Female',
        'General',
        'Advance Financial Accounting',
        'B.Com. Sem-III',
        'Commerce & Accountancy',
        'All',
        'B.Com (Professional)',
        'N/A',
        'N/A',
        0, 0, 0
    );

    // Insert Teacher (Assigned to M.Com)
    insertUser.run(
        'teachermcom',
        'okokokok',
        'teacher',
        'Dr. Jennifer Smith',
        'jennifer.smith@tolani.edu',
        '+91 99999 55555',
        'Female',
        'General',
        'Managerial Economics',
        'M.Com. Sem-I',
        'Commerce & Accountancy',
        'All',
        'M.Com',
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

    // --- Seed B.Com Professional Semester 3 (2nd Year) Students ---
    const bcomproSem3Students = [
        { username: '2025010195', name: 'Archana kumari upendra Singh', gender: 'Female', phone: '8511567899', email: 'Keshwarsingh521@gmail.com', category: 'General' },
        { username: '2025010180', name: 'Dev Khemchand Chandanani', gender: 'Male', phone: '9106620193', email: 'chandnanidev009@gmail.com', category: 'General' },
        { username: '2025010186', name: 'JIYA MAHESH MORYANI', gender: 'Female', phone: '9313413797', email: 'karanmoryani22@gmail.com', category: 'General' },
        { username: '2025010177', name: 'KRISHNA HARSHADBHAI ASODIYA', gender: 'Male', phone: '9727240110', email: 'krishnaasodiya1948@gmail.com', category: 'SEBC' },
        { username: '2025010187', name: 'PREETIKUMARI SANTOSHBHAI PANDIT', gender: 'Female', phone: '8799264806', email: 'ld5496822@gmail.com', category: 'General' },
        { username: '2025010181', name: 'RITIKA RAJ DAS', gender: 'Female', phone: '9974818510', email: 'rajkumarin68@gmail.com', category: 'General' },
        { username: '2025010190', name: 'RIYA BISHT', gender: 'Female', phone: '8141142687', email: 'riyab1283@gmail.com', category: 'General' },
        { username: '2025010182', name: 'ROMIKA RAJESHBHARATHI GOSWAMI', gender: 'Female', phone: '8128922545', email: 'goswamiromika3@gmail.com', category: 'SEBC' },
        { username: '2025010192', name: 'SHANA SAIF', gender: 'Female', phone: '8445591222', email: 'saifuanas786@gmail.com', category: 'General' },
        { username: '2025010199', name: 'SHIVANI RAMBHAVAN YADAV', gender: 'Female', phone: '9265448852', email: 'bhavn49@gmail.com', category: 'General' },
        { username: '2025010196', name: 'Shivani Vishanjibhai Vaniya', gender: 'Female', phone: '6354405182', email: 'rsorathiya16@gmail.com', category: 'SEBC' },
        { username: '2025010189', name: 'SNEHA RAJKUMAR PRAMANIK', gender: 'Female', phone: '7575827978', email: 'snehapramanik272@gmail.com', category: 'General' },
        { username: '2025010179', name: 'TIRTH CHETANBHAI BRAHMBHATT', gender: 'Male', phone: '9408548760', email: 'playerofficial41@gmail.com', category: 'SEBC' },
        { username: '2025010183', name: 'TRIPULLABA JAGDEVSINH JADEJA', gender: 'Female', phone: '6354181519', email: 'HARSHRAJSINHJ564@gmail.com', category: 'General' },
        { username: '2025010184', name: 'VED ALPESH JOSHI', gender: 'Male', phone: '9725071011', email: 'vedalpeshjoshi@gmail.com', category: 'General' },
        { username: '2025010185', name: 'VEENA RAMSUNDAR MISHRA', gender: 'Female', phone: '9904941617', email: 'veenamishra272007@gmail.com', category: 'General' },
        { username: '2025010197', name: 'Yashvi Sanjaybhai Vaniya', gender: 'Female', phone: '9274335012', email: 'yashviahir555@gmail.com', category: 'SEBC' },
        
        { username: '2024001519', name: 'Jyoti Singh', gender: 'Female', phone: '+91 99901 00019', email: 'jyoti.singh@gmail.com', category: 'General' },
        { username: '2024001490', name: 'Jenish Gosai', gender: 'Male', phone: '+91 99901 00090', email: 'jenish.gosai@gmail.com', category: 'General' },
        { username: '2024001482', name: 'Krishna Baherwani', gender: 'Female', phone: '+91 99901 00082', email: 'krishna.baherwani@gmail.com', category: 'General' },
        { username: '2024001487', name: 'Debabrata', gender: 'Male', phone: '+91 99901 00087', email: 'debabrata@gmail.com', category: 'General' },
        { username: '2024001525', name: 'Laxmi Thakur', gender: 'Female', phone: '+91 99901 00025', email: 'laxmi.thakur@gmail.com', category: 'General' },
        { username: '2024001511', name: 'Pranav Ramchandani', gender: 'Male', phone: '+91 99901 00011', email: 'pranav.ramchandani@gmail.com', category: 'General' },
        { username: '2024001526', name: 'Muskan Thakur', gender: 'Female', phone: '+91 99901 00026', email: 'muskan.thakur@gmail.com', category: 'General' },
        { username: '2024001512', name: 'Bharti Rana', gender: 'Female', phone: '+91 99901 00012', email: 'bharti.rana@gmail.com', category: 'General' },
        { username: '2024001535', name: 'Nandani Goswami', gender: 'Female', phone: '+91 99901 00035', email: 'nandani.goswami@gmail.com', category: 'General' },
        { username: '2024001493', name: 'Pooja Hadiya', gender: 'Female', phone: '+91 99901 00093', email: 'pooja.hadiya@gmail.com', category: 'General' },
        { username: '2024001515', name: 'Yashvi Sanjot', gender: 'Female', phone: '+91 99901 00015', email: 'yashvi.sanjot@gmail.com', category: 'General' },
        { username: '2024001528', name: 'Payal Ujjawal', gender: 'Female', phone: '+91 99901 00028', email: 'payal.ujjawal@gmail.com', category: 'General' },
        { username: '2024001495', name: 'Laljibhai Humbal', gender: 'Male', phone: '+91 99901 00095', email: 'laljibhai.humbal@gmail.com', category: 'General' },
        { username: '2024001527', name: 'Tushar Sharma', gender: 'Male', phone: '+91 99901 00027', email: 'tushar.sharma@gmail.com', category: 'General' },
        { username: '2024001494', name: 'Hitanshi Maharana', gender: 'Female', phone: '+91 99901 00094', email: 'hitanshi.maharana@gmail.com', category: 'General' },
        { username: '2024001513', name: 'Bansari Raval', gender: 'Female', phone: '+91 99901 00013', email: 'bansari.raval@gmail.com', category: 'General' },
        { username: '2024001504', name: 'Devansh Kotecha', gender: 'Male', phone: '+91 99901 00004', email: 'devansh.kotecha@gmail.com', category: 'General' },
        { username: '2024001480', name: 'Anuj Banmotra', gender: 'Male', phone: '+91 99901 00080', email: 'anuj.banmotra@gmail.com', category: 'General' },
        { username: '2024001530', name: 'Aditya Vaghela', gender: 'Male', phone: '+91 99901 00030', email: 'aditya.vaghela@gmail.com', category: 'General' },
        { username: '2024001517', name: 'Hasmita Shegaliya', gender: 'Female', phone: '+91 99901 00017', email: 'hasmita.shegaliya@gmail.com', category: 'General' },
        { username: '2024001529', name: 'Deep Vaghamshi', gender: 'Male', phone: '+91 99901 00029', email: 'deep.vaghamshi@gmail.com', category: 'General' },
        { username: '2024001540', name: 'Hiren Vada', gender: 'Male', phone: '+91 99901 00040', email: 'hiren.vada@gmail.com', category: 'General' },
        { username: '2024001502', name: 'Mann Kansara', gender: 'Male', phone: '+91 99901 00002', email: 'mann.kansara@gmail.com', category: 'General' },
        { username: '2024001483', name: 'Aaditya Baldaniya', gender: 'Male', phone: '+91 99901 00083', email: 'aaditya.baldaniya@gmail.com', category: 'General' },
        { username: '2024001491', name: 'Shivamraj Gupta', gender: 'Male', phone: '+91 99901 00091', email: 'shivamraj.gupta@gmail.com', category: 'General' },
        { username: '2024001499', name: 'Jaydeep Jani', gender: 'Male', phone: '+91 99901 00099', email: 'jaydeep.jani@gmail.com', category: 'General' },
        { username: '2024001488', name: 'Rohini Dubey', gender: 'Female', phone: '+91 99901 00088', email: 'rohini.dubey@gmail.com', category: 'General' },
        { username: '2024001532', name: 'Priya Yadav', gender: 'Female', phone: '+91 99901 00032', email: 'priya.yadav@gmail.com', category: 'General' },
        { username: '2024001521', name: 'Priyank Sorathiya', gender: 'Male', phone: '+91 99901 00021', email: 'priyank.sorathiya@gmail.com', category: 'General' },
        { username: '2024001507', name: 'Abhishek Pandey', gender: 'Male', phone: '+91 99901 00007', email: 'abhishek.pandey@gmail.com', category: 'General' },
        { username: '2024001496', name: 'Isha Sharma', gender: 'Female', phone: '+91 99901 00096', email: 'isha.sharma@gmail.com', category: 'General' },
        { username: '2024001479', name: 'Aditya', gender: 'Male', phone: '+91 99901 00079', email: 'aditya.2ndyear@gmail.com', category: 'General' },
        { username: '2024001538', name: 'Sahil Prasad', gender: 'Male', phone: '+91 99901 00038', email: 'sahil.prasad@gmail.com', category: 'General' },
        { username: '2024001484', name: 'Ronak Bhejwal', gender: 'Male', phone: '+91 99901 00084', email: 'ronak.bhejwal@gmail.com', category: 'General' },
        { username: '2024001531', name: 'Khushi Vaghela', gender: 'Female', phone: '+91 99901 00031', email: 'khushi.vaghela@gmail.com', category: 'General' },
        { username: '2024001533', name: 'Suman Yadav', gender: 'Female', phone: '+91 99901 00033', email: 'suman.yadav@gmail.com', category: 'General' },
        { username: '2024001514', name: 'Pragati Roshiya', gender: 'Female', phone: '+91 99901 00014', email: 'pragati.roshiya@gmail.com', category: 'General' },
        { username: '2024001505', name: 'Naitik', gender: 'Male', phone: '+91 99901 00005', email: 'naitik@gmail.com', category: 'General' },
        { username: '2024001497', name: 'Mahipalsinh Jadeja', gender: 'Male', phone: '+91 99901 00097', email: 'mahipalsinh.jadeja@gmail.com', category: 'General' },
        { username: '2024001518', name: 'Mohammad Sahil Sheikh', gender: 'Male', phone: '+91 99901 00018', email: 'sahil.sheikh@gmail.com', category: 'General' },
        { username: '2024001523', name: 'Asha Suthar', gender: 'Female', phone: '+91 99901 00023', email: 'asha.suthar@gmail.com', category: 'General' }
    ];

    bcomproSem3Students.forEach((s) => {
        const username = s.username.trim();
        const password = s.username.trim();
        const gender = s.gender || 'Male';
        
        let division = 'A';
        
        let baselineFee = 9500;
        if (gender.toLowerCase() === 'female') {
            baselineFee = 8500;
        }

        insertUser.run(
            username,
            password,
            'student',
            s.name,
            s.email,
            s.phone,
            gender,
            s.category || 'General',
            'Commerce',
            'B.Com. Sem-III',
            'B.Com (Professional)',
            division,
            'B.Com (Professional)', 
            '2nd Year',
            'Semester 3',
            baselineFee,
            0,
            baselineFee
        );
    });

    // Seed Courses & Syllabus
    const insertCourse = db.prepare("INSERT INTO courses (code, name, program, syllabus) VALUES (?, ?, ?, ?)");
    insertCourse.run("BCP-501", "Corporate Accounting", "B.Com (Professional)", "Module 1: Holding Company Accounts.\nModule 2: Amalgamation & External Reconstruction.\nModule 3: Valuation of Shares & Goodwill.\nModule 4: Liquidator's Final Statement of Accounts.");
    insertCourse.run("BCP-502", "Financial Management", "B.Com (Professional)", "Module 1: Capital Budgeting Decisions.\nModule 2: Cost of Capital & Leverage.\nModule 3: Dividend Policy Decisions.\nModule 4: Working Capital Management.");
    insertCourse.run("BCP-503", "Auditing & Assurance", "B.Com (Professional)", "Module 1: Audit Framework & Standards.\nModule 2: Internal Control & Risk Assessment.\nModule 3: Vouching & Verification of Assets.\nModule 4: Audit Reports & Certifications.");
    insertCourse.run("BCP-504", "Direct Tax", "B.Com (Professional)", "Module 1: Basic concepts & residential status.\nModule 2: Heads of Income (Salary, House Property).\nModule 3: Profits & Gains of Business or Profession.\nModule 4: Computation of Total Income & Tax Liability.");

    // Seed Assignments
    const insertAssignment = db.prepare("INSERT INTO assignments (title, description, due_date, file_name, file_path, program, class_name, subject) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    insertAssignment.run("Holding Company Problems Sheet", "Please complete questions 1 to 5 from Chapter 3 and submit standard calculations.", "2026-07-25", "holding_company_practice.pdf", "/uploads/holding_company_practice.pdf", "B.Com (Professional)", "B.Com. Sem-V", "Corporate Accounting");
    insertAssignment.run("Capital Budgeting Case Study", "Analyze the NPV and IRR cashflows for the project scenarios in the case document.", "2026-07-28", "capital_budgeting_scenarios.pdf", "/uploads/capital_budgeting_scenarios.pdf", "B.Com (Professional)", "B.Com. Sem-V", "Financial Management");

    // Seed Study Materials
    const insertMaterial = db.prepare("INSERT INTO study_materials (title, description, file_name, file_path, program, class_name, subject) VALUES (?, ?, ?, ?, ?, ?, ?)");
    insertMaterial.run("Amalgamation Lecture Handout", "Classroom slides covering accounting treatment for Amalgamation in the nature of purchase vs merger.", "amalgamation_slides.pdf", "/uploads/amalgamation_slides.pdf", "B.Com (Professional)", "B.Com. Sem-V", "Corporate Accounting");
    insertMaterial.run("Levrages and FM Formulas Sheet", "Quick reference PDF listing formulas for Operating Leverage, Financial Leverage, and Combined Leverage.", "leverage_formulas.pdf", "/uploads/leverage_formulas.pdf", "B.Com (Professional)", "B.Com. Sem-V", "Financial Management");

    // Seed Marks for Students 3 and 4 (Aaditya & Abhishek)
    const insertMark = db.prepare("INSERT INTO marks_registry (student_id, subject, exam_name, marks_obtained, marks_total) VALUES (?, ?, ?, ?, ?)");
    // Student 3 (roll 1) marks
    insertMark.run(3, "Corporate Accounting", "Internal Test 1", 24, 30);
    insertMark.run(3, "Corporate Accounting", "Mid-Semester Exam", 58, 70);
    insertMark.run(3, "Financial Management", "Internal Test 1", 26, 30);
    insertMark.run(3, "Financial Management", "Mid-Semester Exam", 62, 70);
    // Student 4 (roll 2) marks
    insertMark.run(4, "Corporate Accounting", "Internal Test 1", 22, 30);
    insertMark.run(4, "Corporate Accounting", "Mid-Semester Exam", 52, 70);
    insertMark.run(4, "Financial Management", "Internal Test 1", 25, 30);
    insertMark.run(4, "Financial Management", "Mid-Semester Exam", 60, 70);

    db.exec('COMMIT');
    console.log(`Database transaction completed. Successfully seeded ${students.length + 2} users and course management resources.`);
} catch (err) {
    db.exec('ROLLBACK');
    console.error('Error seeding database, transaction rolled back:', err);
    process.exit(1);
}

console.log('Seeding finished successfully.');
db.close();
