const express = require('express');
const cors = require('cors');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to SQLite
const db = new DatabaseSync(path.join(__dirname, 'database.db'));
console.log('Server connected to SQLite database successfully.');

// --- HELPER FUNCTIONS ---
function generateAttendanceCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
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
    const { creator_id, class_name, subject, division, duration_minutes } = req.body;

    if (!creator_id || !class_name || !subject || !division) {
        return res.status(400).json({ error: 'Missing required session parameters.' });
    }

    const duration = duration_minutes || 10; // Default 10 mins
    const code = generateAttendanceCode();
    const expiresAt = new Date(Date.now() + duration * 60000).toISOString();

    try {
        const stmt = db.prepare(`
            INSERT INTO attendance_sessions (code, creator_id, class_name, subject, division, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(code, creator_id, class_name, subject, division, expiresAt);

        res.json({
            success: true,
            session: {
                id: info.lastInsertRowid,
                code,
                class_name,
                subject,
                division,
                expires_at: expiresAt
            }
        });
    } catch (err) {
        console.error('Error creating attendance session:', err);
        res.status(500).json({ error: 'Failed to generate attendance session.' });
    }
});

// 3. Student Check-in
app.post('/api/attendance/check-in', (req, res) => {
    const { code, student_id } = req.body;

    if (!code || !student_id) {
        return res.status(400).json({ error: 'Code and Student ID are required.' });
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

        // Fetch student details to verify division eligibility
        const studentStmt = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'student'");
        const student = studentStmt.get(student_id);

        if (!student) {
            return res.status(404).json({ error: 'Student record not found.' });
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

        // Insert attendance record
        const recordStmt = db.prepare(`
            INSERT INTO attendance_records (session_id, student_id, status)
            VALUES (?, ?, 'present')
        `);
        recordStmt.run(session.id, student.id);

        res.json({ 
            success: true, 
            message: `Check-in successful! Present marked for ${session.subject} (${session.class_name}).` 
        });
    } catch (err) {
        console.error('Check-in error:', err);
        res.status(500).json({ error: 'Check-in failed due to server error.' });
    }
});

// 4. Retrieve checked-in students for a specific active code (Polling API for Teachers)
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

// 5. Close attendance session manually (Teacher/Admin)
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

        res.json({ success: true, message: 'Attendance session successfully closed.' });
    } catch (err) {
        console.error('Error closing session:', err);
        res.status(500).json({ error: 'Failed to close session.' });
    }
});

// 6. Student Dashboard Overview & History
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

// 7. Get All Users (Admin GUI)
app.get('/api/users', (req, res) => {
    try {
        const stmt = db.prepare('SELECT id, username, role, name, email, phone, division, class, department FROM users');
        const users = stmt.all();
        res.json({ success: true, users });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users list.' });
    }
});

// 8. Add User (Admin GUI)
app.post('/api/users/add', (req, res) => {
    const { username, password, role, name, email, phone, division, class_name, department, program, year, semester } = req.body;

    if (!username || !password || !role || !name) {
        return res.status(400).json({ error: 'Missing required user parameters.' });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO users (username, password, role, name, email, phone, division, class, department, program, year, semester)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            username, password, role, name, email || null, phone || null, 
            division || 'A', class_name || 'B.Com. Sem-I', department || 'B.Com (NEP)',
            program || 'B.Com (Regular)', year || '1st Year', semester || 'Semester 1'
        );
        res.json({ success: true, message: 'User added successfully.' });
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ error: 'Failed to add user. Username may already exist.' });
    }
});

// 9. Edit User (Admin GUI)
app.post('/api/users/edit', (req, res) => {
    const { id, name, email, phone, division, class_name, department, program, year, semester } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        const stmt = db.prepare(`
            UPDATE users 
            SET name = ?, email = ?, phone = ?, division = ?, class = ?, department = ?, program = ?, year = ?, semester = ?
            WHERE id = ?
        `);
        stmt.run(
            name, email || null, phone || null, division || 'A', class_name || 'B.Com. Sem-I', 
            department || 'B.Com (NEP)', program || 'B.Com (Regular)', year || '1st Year', semester || 'Semester 1',
            id
        );
        res.json({ success: true, message: 'User updated successfully.' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Failed to update user.' });
    }
});

// 10. Delete User (Admin GUI)
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

// 11. SQL Command Terminal Emulator (Admin Console)
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

// Catch-all route to serve SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`EduSphere Server is listening on http://localhost:${PORT}`);
});
