// ==========================================
// EduSphere College Management Portal - Core Client SPA
// ==========================================

// Ensure client device fingerprint
let deviceId = localStorage.getItem("es_device_id");
if (!deviceId) {
    deviceId = 'dev-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
    localStorage.setItem("es_device_id", deviceId);
}

// Global State
let currentUser = null;
let currentView = "dashboard";
let activeSessionPollingInterval = null;
let activeSessionCode = null;

// DOM Elements
const authView = document.getElementById("auth-view");
const dashboardView = document.getElementById("dashboard-view");
const loginForm = document.getElementById("login-form");
const loginUsernameInput = document.getElementById("login-username");
const loginPasswordInput = document.getElementById("login-password");
const sidebarMenuList = document.getElementById("sidebar-menu-list");
const sidebarUserName = document.getElementById("sidebar-user-name");
const sidebarUserRole = document.getElementById("sidebar-user-role");
const sidebarUserAvatar = document.getElementById("sidebar-user-avatar");
const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");
const dynamicContentArea = document.getElementById("dynamic-content-area");
const sidebarToggle = document.getElementById("sidebar-toggle");
const appSidebar = document.getElementById("app-sidebar");
const logoutButton = document.getElementById("logout-button");
const currentDateDisplay = document.getElementById("current-date-display");

// Modals
const generalModal = document.getElementById("general-modal");
const generalModalTitle = document.getElementById("general-modal-title");
const generalModalBody = document.getElementById("general-modal-body");
const generalModalClose = document.getElementById("general-modal-close");

const feeModal = document.getElementById("fee-modal");
const feeModalClose = document.getElementById("fee-modal-close");
const feePayForm = document.getElementById("fee-pay-form");
const feeModalDueAmt = document.getElementById("fee-modal-due-amt");
const feePayStudentId = document.getElementById("fee-pay-student-id");

// Set Current Date
if (currentDateDisplay) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
}

// Check session in LocalStorage on startup
const storedUser = localStorage.getItem("es_current_user");
if (storedUser) {
    try {
        currentUser = JSON.parse(storedUser);
        initializeDashboard();
    } catch (e) {
        localStorage.removeItem("es_current_user");
    }
}

// --- Sidebar Toggle ---
if (sidebarToggle && appSidebar) {
    sidebarToggle.addEventListener("click", () => {
        appSidebar.classList.toggle("active");
    });
}

// --- Login Handling ---
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();

        showLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            showLoading(false);

            if (data.success) {
                currentUser = data.user;
                localStorage.setItem("es_current_user", JSON.stringify(currentUser));
                initializeDashboard();
            } else {
                alert(data.error || 'Login failed.');
            }
        } catch (err) {
            showLoading(false);
            console.error(err);
            alert('Failed to connect to the server.');
        }
    });
}

// --- Logout Handling ---
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("es_current_user");
        currentUser = null;
        if (activeSessionPollingInterval) {
            clearInterval(activeSessionPollingInterval);
        }
        activeSessionCode = null;
        dashboardView.style.display = "none";
        authView.style.display = "flex";
        loginForm.reset();
    });
}

// --- Modal Handling ---
if (generalModalClose) {
    generalModalClose.addEventListener("click", () => {
        generalModal.classList.remove("active");
    });
}
if (feeModalClose) {
    feeModalClose.addEventListener("click", () => {
        feeModal.classList.remove("active");
    });
}

// Helper: Show/Hide Loading Overlay
function showLoading(show) {
    const btn = document.querySelector("#login-form button[type='submit']");
    if (btn) {
        btn.disabled = show;
        btn.innerHTML = show ? '<span>Signing In...</span> <i class="fa-solid fa-spinner fa-spin"></i>' : '<span>Sign In</span> <i class="fa-solid fa-arrow-right-to-bracket"></i>';
    }
}

// Helper: Get Initials
function getInitials(name) {
    if (!name) return "US";
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

// Initialize Dashboard UI
function initializeDashboard() {
    authView.style.display = "none";
    dashboardView.style.display = "flex";

    // Set user profile info
    sidebarUserName.textContent = currentUser.name;
    sidebarUserRole.textContent = currentUser.role.toUpperCase();
    sidebarUserAvatar.textContent = getInitials(currentUser.name);

    currentView = "dashboard";
    buildSidebarMenu(currentUser.role);
    navigateTo("dashboard");
}

// Navigation Configuration
const ROLE_NAV = {
    student: [
        { id: "dashboard", label: "Overview", icon: "fa-chart-pie" },
        { id: "timetable", label: "Class Timetable", icon: "fa-calendar-days" },
        { id: "attendance", label: "Attendance Record", icon: "fa-calendar-check" },
        { id: "fees", label: "Fee Payment", icon: "fa-credit-card" },
        { id: "profile", label: "Profile Settings", icon: "fa-user-gear" }
    ],
    teacher: [
        { id: "dashboard", label: "Dashboard", icon: "fa-gauge" },
        { id: "students", label: "Student Registry", icon: "fa-users" },
        { id: "timetable", label: "Class Timetable", icon: "fa-calendar" },
        { id: "schedule", label: "Manage Attendance", icon: "fa-calendar-plus" },
        { id: "profile", label: "Profile Settings", icon: "fa-user-gear" }
    ],
    admin: [
        { id: "dashboard", label: "Admin Console", icon: "fa-sliders" },
        { id: "bcom", label: "B.Com Regular", icon: "fa-book" },
        { id: "bcompro", label: "B.Com Professional", icon: "fa-graduation-cap" },
        { id: "mcom", label: "M.Com Management", icon: "fa-award" },
        { id: "students", label: "User Registry", icon: "fa-users" },
        { id: "schedule", label: "Manage Attendance", icon: "fa-calendar-plus" },
        { id: "fees", label: "Fees Setup", icon: "fa-wallet" },
        { id: "database", label: "Postgres Console", icon: "fa-database" },
        { id: "profile", label: "Profile Settings", icon: "fa-user-gear" }
    ]
};

function buildSidebarMenu(role) {
    const navItems = ROLE_NAV[role];
    sidebarMenuList.innerHTML = "";
    
    navItems.forEach(item => {
        const li = document.createElement("li");
        li.className = `sidebar-menu-item ${item.id === currentView ? 'active' : ''}`;
        li.dataset.view = item.id;
        
        li.innerHTML = `
            <a>
                <i class="fa-solid ${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `;
        
        li.addEventListener("click", () => {
            document.querySelectorAll(".sidebar-menu-item").forEach(el => el.classList.remove("active"));
            li.classList.add("active");
            navigateTo(item.id);
            if (window.innerWidth <= 992) {
                appSidebar.classList.remove("active");
            }
        });
        
        sidebarMenuList.appendChild(li);
    });
}

function navigateTo(viewId) {
    if (activeSessionPollingInterval) {
        clearInterval(activeSessionPollingInterval);
        activeSessionPollingInterval = null;
    }
    activeSessionCode = null;

    currentView = viewId;
    
    const activeItem = sidebarMenuList.querySelector(`[data-view="${viewId}"]`);
    if (activeItem) {
        document.querySelectorAll(".sidebar-menu-item").forEach(el => el.classList.remove("active"));
        activeItem.classList.add("active");
    }

    const activeRoute = ROLE_NAV[currentUser.role].find(item => item.id === viewId);
    pageTitle.textContent = activeRoute ? activeRoute.label : "Portal";
    pageSubtitle.textContent = `${currentUser.name} | ${currentUser.role.toUpperCase()} Portal`;

    const renderFn = `render${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}${viewId.charAt(0).toUpperCase() + viewId.slice(1)}`;
    
    if (typeof window[renderFn] === "function") {
        window[renderFn]();
    } else {
        dynamicContentArea.innerHTML = `
            <div class="glass-card text-center" style="padding: 40px;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 40px; color: var(--warning); margin-bottom: 16px;"></i>
                <h3>View Under Construction</h3>
                <p style="color: var(--text-muted);">The ${viewId} module is being finalized.</p>
            </div>
        `;
    }
}

// Helper: Parse slot text like "Microeconomics (Prof. Sarah Jenkins)"
function parseSlot(slotText) {
    if (!slotText || slotText === 'Free Slot') return { subject: 'Free Slot', teacher: '' };
    const match = slotText.match(/^([^(]+)(?:\(([^)]+)\))?$/);
    if (match) {
        return {
            subject: match[1].trim(),
            teacher: match[2] ? match[2].trim() : ''
        };
    }
    return { subject: slotText, teacher: '' };
}

// =========================================================================
// STUDENT PORTAL MODULES
// =========================================================================

window.renderStudentDashboard = async function() {
    dynamicContentArea.innerHTML = `<div class="text-center" style="padding: 50px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i></div>`;
    
    try {
        const res = await fetch(`/api/attendance/student/${currentUser.id}/history`);
        const data = await res.json();
        
        const history = data.records || [];
        const presentCount = history.filter(r => r.status === 'present').length;
        const rate = history.length > 0 ? ((presentCount / history.length) * 100).toFixed(1) : "100.0";

        // Fetch Notices
        const noticeRes = await fetch(`/api/notices?program=${encodeURIComponent(currentUser.program)}`);
        const noticeData = await noticeRes.json();
        const notices = noticeData.notices || [];

        // --- FETCH TODAY'S DAILY LECTURE STATUS OVERRIDES ---
        const todayDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayDayName = todayDays[new Date().getDay()];
        const todayDateStr = new Date().toISOString().split('T')[0];

        let dailyLectureStatusHTML = '';

        if (todayDayName === 'Sunday') {
            dailyLectureStatusHTML = `
                <div class="glass-card mb-24" style="border: 1px dashed var(--border-color);">
                    <h3 class="card-title mb-8"><i class="fa-solid fa-calendar-day mr-8" style="color: var(--accent);"></i> Today's Lecture Tracker</h3>
                    <p style="color: var(--text-muted); font-size: 13px; text-align: center; margin: 16px 0;">Today is Sunday. College is closed.</p>
                </div>
            `;
        } else {
            // Get timetable for today's weekday
            const ttRes = await fetch(`/api/timetables?program=${encodeURIComponent(currentUser.program)}`);
            const ttData = await ttRes.json();
            const todayTimetable = (ttData.timetables || []).find(t => t.day === todayDayName) || {};

            // Get status overrides for today's date
            const adjRes = await fetch(`/api/daily-lectures?date=${todayDateStr}&program=${encodeURIComponent(currentUser.program)}&division=${encodeURIComponent(currentUser.division)}`);
            const adjData = await adjRes.json();
            const overrides = adjData.lectures || [];
            const overridesMap = {};
            overrides.forEach(o => { overridesMap[o.slot] = o; });

            const slots = [
                { id: 'slot_1', label: 'Slot 1 (9:00 - 9:55)', key: 'slot_1' },
                { id: 'slot_2', label: 'Slot 2 (10:00 - 10:55)', key: 'slot_2' },
                { id: 'slot_3', label: 'Slot 3 (11:00 - 11:55)', key: 'slot_3' },
                { id: 'slot_4', label: 'Slot 4 (12:00 - 12:55)', key: 'slot_4' }
            ];

            let slotsHTML = slots.map(s => {
                const timetableVal = todayTimetable[s.key] || 'Free Slot';
                const parsed = parseSlot(timetableVal);
                const override = overridesMap[s.id];

                let statusBadge = '';
                let detailsText = '';

                if (override) {
                    if (override.status === 'Free') {
                        statusBadge = `<span class="attendance-status-pill" style="background: rgba(239,68,68,0.1); color: var(--danger);"><i class="fa-solid fa-circle-xmark"></i> FREE LECTURE (Cancelled)</span>`;
                        detailsText = `<span style="color: var(--danger); font-size: 12px; font-weight: 500;">Original class by ${override.original_teacher} is cancelled today.</span>`;
                    } else if (override.status === 'Substituted') {
                        statusBadge = `<span class="attendance-status-pill" style="background: rgba(245,158,11,0.1); color: var(--warning);"><i class="fa-solid fa-arrows-rotate"></i> SUBSTITUTED</span>`;
                        detailsText = `<span style="color: var(--warning); font-size: 12px;">Taken by <strong>${override.substitute_teacher}</strong> (instead of ${override.original_teacher}).</span>`;
                    } else if (override.status === 'Combined') {
                        statusBadge = `<span class="attendance-status-pill" style="background: rgba(168,85,247,0.1); color: var(--secondary);"><i class="fa-solid fa-users-rectangle"></i> COMBINED CLASS</span>`;
                        detailsText = `<span style="color: var(--secondary); font-size: 12px;">Combined with <strong>Division ${override.combined_division}</strong>. ${override.notes ? `(${override.notes})` : ''}</span>`;
                    } else { // Scheduled override
                        statusBadge = `<span class="attendance-status-pill status-active"><i class="fa-solid fa-circle-check"></i> SCHEDULED</span>`;
                        detailsText = `<span style="color: var(--accent); font-size: 12px;">Class is on: ${override.notes || 'Normal room lecture.'}</span>`;
                    }
                } else {
                    if (parsed.subject === 'Free Slot') {
                        statusBadge = `<span class="attendance-status-pill" style="background: rgba(255,255,255,0.05); color: var(--text-muted);"><i class="fa-solid fa-moon"></i> No lecture</span>`;
                        detailsText = `<span style="color: var(--text-muted); font-size: 12px;">Empty slot.</span>`;
                    } else {
                        statusBadge = `<span class="attendance-status-pill status-active"><i class="fa-solid fa-circle-check"></i> SCHEDULED</span>`;
                        detailsText = `<span style="color: var(--text-muted); font-size: 12px;">Taken by ${parsed.teacher}.</span>`;
                    }
                }

                return `
                    <div class="flex-space" style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; flex-wrap: wrap; gap: 8px;">
                        <div>
                            <div style="font-size: 11px; color: var(--text-muted); font-weight: 500;">${s.label}</div>
                            <strong style="font-size: 15px; color: var(--text-main); display: block; margin: 2px 0;">
                                ${override ? override.subject : parsed.subject}
                            </strong>
                            <div style="margin-top: 4px;">${detailsText}</div>
                        </div>
                        <div>
                            ${statusBadge}
                        </div>
                    </div>
                `;
            }).join("");

            dailyLectureStatusHTML = `
                <div class="glass-card mb-24" style="border: 1.5px solid var(--accent);">
                    <div class="card-header-flex mb-16">
                        <h3 class="card-title"><i class="fa-solid fa-business-time mr-8" style="color: var(--accent);"></i> Today's Lecture Tracker</h3>
                        <span class="attendance-status-pill status-active" style="font-size: 11px;"><i class="fa-solid fa-clock-pulse fa-fade"></i> Live Updates</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${slotsHTML}
                    </div>
                </div>
            `;
        }

        let noticeBoardHTML = `
            <div class="glass-card mb-24">
                <h3 class="card-title mb-16"><i class="fa-solid fa-bullhorn mr-8" style="color: var(--primary);"></i> Notice Board</h3>
                <div style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 8px;">
                    ${notices.length === 0 ? `<p style="color: var(--text-muted); font-size: 13px; text-align: center;">No notices published for your program.</p>` : 
                    notices.map(n => `
                        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px;">
                            <div class="flex-space mb-4">
                                <strong style="color: var(--text-main); font-size: 14px;">${n.title}</strong>
                                <span style="font-size: 10px; color: var(--text-muted);">${new Date(n.created_at).toLocaleString()}</span>
                            </div>
                            <p style="color: var(--text-muted); font-size: 12px; margin: 0; line-height: 1.4;">${n.content}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;

        dynamicContentArea.innerHTML = `
            ${dailyLectureStatusHTML}

            <div class="stats-grid mb-24">
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Attendance Rate</span>
                        <div class="stat-icon" style="background: rgba(20, 184, 166, 0.1); color: var(--accent);"><i class="fa-solid fa-percent"></i></div>
                    </div>
                    <div class="stat-value">${rate}%</div>
                    <div class="stat-desc">Minimum required is 75%</div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Lectures Attended</span>
                        <div class="stat-icon" style="background: rgba(99, 102, 241, 0.1); color: var(--primary);"><i class="fa-solid fa-check-double"></i></div>
                    </div>
                    <div class="stat-value">${presentCount} / ${history.length}</div>
                    <div class="stat-desc">Total class sessions held</div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Pending Fees</span>
                        <div class="stat-icon" style="background: rgba(239, 68, 68, 0.1); color: var(--danger);"><i class="fa-solid fa-wallet"></i></div>
                    </div>
                    <div class="stat-value">₹${currentUser.fee_due}</div>
                    <div class="stat-desc">Total course tuition fee</div>
                </div>
            </div>

            <div class="glass-card mb-24">
                <h3 class="card-title mb-16"><i class="fa-solid fa-address-card mr-8"></i> Student Profile Card</h3>
                <div class="form-grid">
                    <div>
                        <span style="color: var(--text-muted); font-size: 12px; display: block;">Full Name</span>
                        <strong style="font-size: 16px;">${currentUser.name}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); font-size: 12px; display: block;">Roll Number</span>
                        <strong style="font-size: 16px;">${currentUser.username}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); font-size: 12px; display: block;">Gender</span>
                        <strong style="font-size: 16px;">${currentUser.gender || 'Male'}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); font-size: 12px; display: block;">Department / Major</span>
                        <strong style="font-size: 16px;">${currentUser.department || 'B.Com NEP'}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); font-size: 12px; display: block;">Division / Class</span>
                        <strong style="font-size: 16px;">Division ${currentUser.division} | ${currentUser.class}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); font-size: 12px; display: block;">Program</span>
                        <strong style="font-size: 16px;">${currentUser.program} (${currentUser.year})</strong>
                    </div>
                </div>
            </div>

            ${noticeBoardHTML}
        `;
    } catch (err) {
        console.error(err);
        dynamicContentArea.innerHTML = `<div class="glass-card text-center"><p style="color: var(--danger);">Failed to load dashboard statistics.</p></div>`;
    }
};

window.renderStudentTimetable = async function() {
    dynamicContentArea.innerHTML = `<div class="text-center" style="padding: 50px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i></div>`;

    try {
        const res = await fetch(`/api/timetables?program=${encodeURIComponent(currentUser.program)}`);
        const data = await res.json();
        const tRows = data.timetables || [];

        // Build a map day -> slots
        const ttMap = {};
        tRows.forEach(row => {
            ttMap[row.day] = {
                slot_1: row.slot_1 || 'Free Slot',
                slot_2: row.slot_2 || 'Free Slot',
                slot_3: row.slot_3 || 'Free Slot',
                slot_4: row.slot_4 || 'Free Slot'
            };
        });

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        let tableBodyHTML = days.map(day => {
            const slots = ttMap[day] || { slot_1: 'Free Slot', slot_2: 'Free Slot', slot_3: 'Free Slot', slot_4: 'Free Slot' };
            return `
                <tr>
                    <td><strong>${day}</strong></td>
                    <td style="${slots.slot_1 === 'Free Slot' ? 'color: var(--text-muted);' : ''}">${slots.slot_1.replace('(', '<br><small>').replace(')', '</small>')}</td>
                    <td style="${slots.slot_2 === 'Free Slot' ? 'color: var(--text-muted);' : ''}">${slots.slot_2.replace('(', '<br><small>').replace(')', '</small>')}</td>
                    <td style="${slots.slot_3 === 'Free Slot' ? 'color: var(--text-muted);' : ''}">${slots.slot_3.replace('(', '<br><small>').replace(')', '</small>')}</td>
                    <td style="${slots.slot_4 === 'Free Slot' ? 'color: var(--text-muted);' : ''}">${slots.slot_4.replace('(', '<br><small>').replace(')', '</small>')}</td>
                </tr>
            `;
        }).join("");

        dynamicContentArea.innerHTML = `
            <div class="glass-card">
                <div class="card-header-flex mb-16">
                    <h3 class="card-title">Class Timetable - ${currentUser.program} (Div ${currentUser.division})</h3>
                    <span class="attendance-status-pill status-active"><i class="fa-solid fa-clock"></i> Weekly Class Schedule</span>
                </div>
                
                <div class="table-responsive">
                    <table class="custom-table text-center">
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Slot 1 (9:00 - 9:55)</th>
                                <th>Slot 2 (10:00 - 10:55)</th>
                                <th>Slot 3 (11:00 - 11:55)</th>
                                <th>Slot 4 (12:00 - 12:55)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableBodyHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (err) {
        console.error(err);
        dynamicContentArea.innerHTML = `<div class="glass-card text-center"><p style="color: var(--danger);">Failed to load timetable.</p></div>`;
    }
};

window.renderStudentAttendance = async function() {
    dynamicContentArea.innerHTML = `<div class="text-center" style="padding: 50px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i></div>`;
    
    try {
        const res = await fetch(`/api/attendance/student/${currentUser.id}/history`);
        const data = await res.json();
        
        const history = data.records || [];
        const tableRows = history.map(r => `
            <tr>
                <td><strong>${r.code}</strong></td>
                <td>${r.subject}</td>
                <td>${r.class_name}</td>
                <td>${new Date(r.marked_at).toLocaleString()}</td>
                <td><span class="attendance-status-pill status-active">PRESENT</span></td>
            </tr>
        `).join("");

        dynamicContentArea.innerHTML = `
            <div class="glass-card mb-24">
                <h3 class="card-title mb-16"><i class="fa-solid fa-qrcode mr-8"></i> Digital Check-in Console</h3>
                <div style="font-size: 11px; color: var(--accent); margin-bottom: 12px; font-weight: 500;">
                    <i class="fa-solid fa-shield-halved"></i> Anti-Proxy Protection Active (Locked to device ID: <code>${deviceId.substring(0, 12)}...</code>)
                </div>
                <form id="student-checkin-form" style="max-width: 480px; display: flex; gap: 12px;">
                    <input type="text" id="checkin-code-input" class="form-control" placeholder="Enter active code (e.g. 482934)" required max="999999" pattern="\\d{6}" title="6-digit security code">
                    <button type="submit" class="btn btn-primary" style="width: 140px;">
                        <i class="fa-solid fa-circle-check"></i> Check In
                    </button>
                </form>
            </div>

            <div class="glass-card">
                <h3 class="card-title mb-16">Attendance History Logs</h3>
                <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                    <table class="custom-table text-center">
                        <thead>
                            <tr>
                                <th>Session Code</th>
                                <th>Subject</th>
                                <th>Class</th>
                                <th>Checked-in At</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows.length > 0 ? tableRows : `<tr><td colspan="5" style="color: var(--text-muted); padding: 24px;">No attendance logged yet.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const checkinForm = document.getElementById("student-checkin-form");
        if (checkinForm) {
            checkinForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const code = document.getElementById("checkin-code-input").value.trim();
                
                // Get Geolocation if available
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        await submitCheckin(code, position.coords.latitude, position.coords.longitude);
                    }, async (err) => {
                        // Location query blocked/failed
                        await submitCheckin(code, null, null);
                    });
                } else {
                    await submitCheckin(code, null, null);
                }
            });
        }
    } catch (err) {
        console.error(err);
        dynamicContentArea.innerHTML = `<div class="glass-card text-center"><p style="color: var(--danger);">Failed to load check-in portal.</p></div>`;
    }
};

async function submitCheckin(code, lat, lon) {
    try {
        const submitRes = await fetch('/api/attendance/check-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                code, 
                student_id: currentUser.id, 
                device_id: deviceId,
                student_lat: lat,
                student_lon: lon
            })
        });
        const submitData = await submitRes.json();
        
        if (submitData.success) {
            alert(submitData.message);
            window.renderStudentAttendance();
        } else {
            alert(submitData.error || "Check-in failed.");
        }
    } catch (err) {
        console.error(err);
        alert("Error submitting check-in.");
    }
}

window.renderStudentFees = function() {
    dynamicContentArea.innerHTML = `
        <div class="glass-card mb-24">
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); padding: 24px; border-radius: 16px; margin-bottom: 24px;">
                <div class="form-grid">
                    <div>
                        <span style="color: var(--text-muted); font-size: 12px; display: block;">Total Tuition Fees</span>
                        <h2 style="color: var(--text-main); font-weight: 700;">₹${currentUser.fee_total}</h2>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); font-size: 12px; display: block;">Amount Paid</span>
                        <h2 style="color: var(--success); font-weight: 700;">₹${currentUser.fee_paid}</h2>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); font-size: 12px; display: block;">Outstanding Balance</span>
                        <h2 style="color: var(--danger); font-weight: 700;">₹${currentUser.fee_due}</h2>
                    </div>
                </div>
            </div>

            ${currentUser.fee_due > 0 ? `
                <div class="text-center">
                    <a href="https://share.google/x83WwiwJV409pKHzP" target="_blank" class="btn btn-primary" style="text-decoration: none; max-width: 320px; margin: 0 auto; display: inline-flex; align-items: center;">
                        <i class="fa-solid fa-credit-card mr-8"></i>
                        <span>Pay Outstanding Fees (eShiksa)</span>
                    </a>
                </div>
            ` : `
                <div class="text-center" style="color: var(--success); padding: 10px;">
                    <i class="fa-solid fa-circle-check" style="font-size: 32px; margin-bottom: 12px;"></i>
                    <h4>All Fees Fully Paid</h4>
                    <p style="color: var(--text-muted); font-size: 12px;">No outstanding balance for Semester 1.</p>
                </div>
            `}
        </div>
    `;
};

window.openPaymentModal = function(amount) {
    feeModalDueAmt.textContent = `₹${amount.toFixed(2)}`;
    feePayStudentId.value = currentUser.id;
    feeModal.classList.add("active");
};

if (feePayForm) {
    feePayForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        alert("Payment Simulated Successfully! Outstanding balance cleared.");
        feeModal.classList.remove("active");
        
        currentUser.fee_paid = currentUser.fee_total;
        currentUser.fee_due = 0;
        localStorage.setItem("es_current_user", JSON.stringify(currentUser));
        
        try {
            await fetch('/api/sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `UPDATE users SET fee_paid = ${currentUser.fee_total}, fee_due = 0 WHERE id = ${currentUser.id};`
                })
            });
        } catch (e) {}

        navigateTo("fees");
    });
}

window.renderStudentProfile = function() {
    dynamicContentArea.innerHTML = `
        <div class="glass-card">
            <h3 class="card-title mb-16"><i class="fa-solid fa-shield-halved mr-8"></i> Security & Details</h3>
            <div class="form-grid mb-24">
                <div>
                    <label>Full Name</label>
                    <input type="text" class="form-control" value="${currentUser.name}" disabled>
                </div>
                <div>
                    <label>Roll Number (Username)</label>
                    <input type="text" class="form-control" value="${currentUser.username}" disabled>
                </div>
                <div>
                    <label>Gender</label>
                    <input type="text" class="form-control" value="${currentUser.gender || 'Male'}" disabled>
                </div>
                <div>
                    <label>Email ID</label>
                    <input type="text" class="form-control" value="${currentUser.email || 'N/A'}" disabled>
                </div>
                <div>
                    <label>Contact Phone</label>
                    <input type="text" class="form-control" value="${currentUser.phone || 'N/A'}" disabled>
                </div>
            </div>
            <p style="font-size: 12px; color: var(--text-muted);">
                <i class="fa-solid fa-circle-info"></i> Profile modification is locked. Please contact the college registrar office for major data changes.
            </p>
        </div>
    `;
};


// =========================================================================
// TEACHER PORTAL MODULES
// =========================================================================

window.renderTeacherDashboard = async function() {
    dynamicContentArea.innerHTML = `<div class="text-center" style="padding: 50px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i></div>`;

    const todayDateStr = new Date().toISOString().split('T')[0];

    try {
        // Fetch current overrides to list them
        const res = await fetch(`/api/daily-lectures?date=${todayDateStr}`);
        const data = await res.json();
        const overrides = data.lectures || [];

        let overridesRowsHTML = overrides.map(o => `
            <tr>
                <td>${o.program} (Div ${o.division})</td>
                <td><strong>${o.slot.toUpperCase().replace('_', ' ')}</strong></td>
                <td>${o.subject}</td>
                <td>${o.original_teacher}</td>
                <td>
                    <span class="attendance-status-pill" style="
                        background: ${o.status === 'Free' ? 'rgba(239,68,68,0.1)' : (o.status === 'Substituted' ? 'rgba(245,158,11,0.1)' : 'rgba(168,85,247,0.1)')};
                        color: ${o.status === 'Free' ? 'var(--danger)' : (o.status === 'Substituted' ? 'var(--warning)' : 'var(--secondary)')};
                    ">
                        ${o.status.toUpperCase()}
                    </span>
                </td>
                <td>
                    ${o.status === 'Substituted' ? `Sub: ${o.substitute_teacher}` : ''}
                    ${o.status === 'Combined' ? `Combined Div: ${o.combined_division} ${o.notes ? `(${o.notes})` : ''}` : ''}
                    ${o.status === 'Scheduled' ? `Note: ${o.notes}` : ''}
                    ${o.status === 'Free' ? 'Cancelled' : ''}
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="clearLectureAdjustment(${o.id})" style="padding: 2px 6px; font-size: 10px;">Clear</button>
                </td>
            </tr>
        `).join("");

        dynamicContentArea.innerHTML = `
            <div class="stats-grid mb-24">
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Lectures Scheduled</span>
                        <div class="stat-icon" style="background: rgba(99,102,241,0.1); color: var(--primary);"><i class="fa-solid fa-calendar"></i></div>
                    </div>
                    <div class="stat-value">7</div>
                    <div class="stat-desc">Active lectures this week</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Assigned Program</span>
                        <div class="stat-icon" style="background: rgba(20, 184, 166, 0.1); color: var(--accent);"><i class="fa-solid fa-book"></i></div>
                    </div>
                    <div class="stat-value" style="font-size: 18px; line-height: 38px;">${currentUser.program || 'B.Com (Regular)'}</div>
                    <div class="stat-desc">Faculty Instruction Stream</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Assigned Major</span>
                        <div class="stat-icon" style="background: rgba(168,85,247,0.1); color: var(--secondary);"><i class="fa-solid fa-building-columns"></i></div>
                    </div>
                    <div class="stat-value" style="font-size: 18px; line-height: 38px;">${currentUser.subject || 'Statistics'}</div>
                    <div class="stat-desc">${currentUser.department || 'Commerce & Accountancy'}</div>
                </div>
            </div>

            <!-- DAILY TIMETABLE ADJUSTMENTS FORM -->
            <div class="glass-card mb-24" style="border: 1.5px solid var(--warning);">
                <h3 class="card-title mb-12" style="color: var(--warning);"><i class="fa-solid fa-arrows-down-to-people mr-8"></i> Today's Lecture Availability Declarations</h3>
                <p style="color: var(--text-muted); font-size: 12px; margin-bottom: 16px;">
                    Declare substitutions, combine classes, or mark cancelled slots for today. Students will see live notices immediately on their home screen.
                </p>
                <form id="lecture-adj-form" class="form-grid">
                    <div>
                        <label>Academic Program</label>
                        <select id="adj-program" class="form-control" required>
                            <option value="B.Com (Regular)">B.Com (Regular)</option>
                            <option value="B.Com (Professional)">B.Com (Professional)</option>
                            <option value="M.Com">M.Com</option>
                        </select>
                    </div>
                    <div>
                        <label>Division</label>
                        <select id="adj-division" class="form-control" required>
                            <option value="A">Division A</option>
                            <option value="B">Division B</option>
                            <option value="C">Division C</option>
                            <option value="D">Division D</option>
                            <option value="E">Division E</option>
                            <option value="F">Division F</option>
                            <option value="G">Division G</option>
                        </select>
                    </div>
                    <div>
                        <label>Lecture Slot</label>
                        <select id="adj-slot" class="form-control" required>
                            <option value="slot_1">Slot 1 (9:00 - 9:55)</option>
                            <option value="slot_2">Slot 2 (10:00 - 10:55)</option>
                            <option value="slot_3">Slot 3 (11:00 - 11:55)</option>
                            <option value="slot_4">Slot 4 (12:00 - 12:55)</option>
                        </select>
                    </div>
                    <div>
                        <label>Subject Title</label>
                        <input type="text" id="adj-subject" class="form-control" placeholder="e.g. Statistics" required>
                    </div>
                    <div>
                        <label>Original Teacher</label>
                        <input type="text" id="adj-original-teacher" class="form-control" value="${currentUser.name}" required>
                    </div>
                    <div>
                        <label>Lecture Status Today</label>
                        <select id="adj-status" class="form-control" required>
                            <option value="Scheduled">Scheduled (Normal)</option>
                            <option value="Free">Free Lecture (Cancelled)</option>
                            <option value="Substituted">Substituted (Taken by other teacher)</option>
                            <option value="Combined">Combined (Merged with another division)</option>
                        </select>
                    </div>

                    <!-- SUB CONTAINER FOR SUBSTITUTION -->
                    <div id="sub-teacher-container" class="form-grid-full" style="display: none; margin-top: 8px;">
                        <label style="color: var(--warning);">Substitute Teacher Name</label>
                        <input type="text" id="adj-substitute-teacher" class="form-control" placeholder="Enter name of professor taking this class">
                    </div>

                    <!-- SUB CONTAINER FOR COMBINATION -->
                    <div id="combined-div-container" class="form-grid" style="display: none; grid-column: span 2; margin-top: 8px;">
                        <div>
                            <label style="color: var(--secondary);">Combined with Division</label>
                            <select id="adj-combined-division" class="form-control">
                                <option value="A">Division A</option>
                                <option value="B">Division B</option>
                                <option value="C">Division C</option>
                                <option value="D">Division D</option>
                                <option value="E">Division E</option>
                                <option value="F">Division F</option>
                                <option value="G">Division G</option>
                            </select>
                        </div>
                        <div>
                            <label style="color: var(--secondary);">Class Venue / Room / Lecture Notes</label>
                            <input type="text" id="adj-notes" class="form-control" placeholder="e.g. Held in Seminar Hall / Room 105">
                        </div>
                    </div>

                    <div class="form-grid-full" style="margin-top: 10px;">
                        <button type="submit" class="btn btn-primary" style="max-width: 260px;"><i class="fa-solid fa-bullhorn mr-4"></i> Publish Daily Adjustment</button>
                    </div>
                </form>
            </div>

            <!-- TODAY'S ACTIVE ADJUSTMENTS LIST -->
            <div class="glass-card">
                <h3 class="card-title mb-16">Today's Timetable Adjustments Monitor</h3>
                <div class="table-responsive">
                    <table class="custom-table text-center" style="font-size: 11px;">
                        <thead>
                            <tr>
                                <th>Class Info</th>
                                <th>Slot</th>
                                <th>Subject</th>
                                <th>Original Faculty</th>
                                <th>Status Today</th>
                                <th>Adjustment Details</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${overridesRowsHTML.length > 0 ? overridesRowsHTML : `<tr><td colspan="7" style="color: var(--text-muted); padding: 12px;">No modifications declared today. Default weekly timetables are active.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Handle Status Change toggles
        const statusSelect = document.getElementById("adj-status");
        const subContainer = document.getElementById("sub-teacher-container");
        const combContainer = document.getElementById("combined-div-container");

        statusSelect.addEventListener("change", (e) => {
            const val = e.target.value;
            subContainer.style.display = (val === 'Substituted') ? 'block' : 'none';
            combContainer.style.display = (val === 'Combined') ? 'grid' : 'none';
        });

        // Submit Override
        const adjForm = document.getElementById("lecture-adj-form");
        adjForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const program = document.getElementById("adj-program").value;
            const division = document.getElementById("adj-division").value;
            const slot = document.getElementById("adj-slot").value;
            const subject = document.getElementById("adj-subject").value.trim();
            const original_teacher = document.getElementById("adj-original-teacher").value.trim();
            const status = statusSelect.value;
            const substitute_teacher = document.getElementById("adj-substitute-teacher").value.trim();
            const combined_division = document.getElementById("adj-combined-division").value;
            const notes = document.getElementById("adj-notes").value.trim();

            try {
                const saveRes = await fetch('/api/daily-lectures/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: todayDateStr, program, division, slot, subject, original_teacher, status,
                        substitute_teacher, combined_division, notes
                    })
                });
                const saveData = await saveRes.json();
                if (saveData.success) {
                    alert(saveData.message);
                    window.renderTeacherDashboard();
                } else {
                    alert(saveData.error);
                }
            } catch (err) {
                alert("Failed to submit adjustment.");
            }
        });

    } catch (err) {
        console.error(err);
        dynamicContentArea.innerHTML = `<div class="glass-card text-center"><p style="color: var(--danger);">Failed to load teacher workspace.</p></div>`;
    }
};

window.clearLectureAdjustment = async function(id) {
    if (!confirm("Are you sure you want to delete this class override? Timetable slot will fall back to default.")) return;
    try {
        const res = await fetch('/api/daily-lectures/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            if (currentUser.role === 'teacher') {
                window.renderTeacherDashboard();
            } else {
                window.renderAdminDashboard();
            }
        }
    } catch (e) {
        alert("Failed to clear override.");
    }
};

window.renderTeacherStudents = async function() {
    dynamicContentArea.innerHTML = `<div class="text-center" style="padding: 50px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i></div>`;
    
    try {
        const res = await fetch('/api/users');
        const data = await res.json();
        const allStudents = (data.users || []).filter(u => u.role === 'student');

        function renderRows(filtered) {
            return filtered.map(s => `
                <tr>
                    <td><strong>${s.username}</strong></td>
                    <td>${s.name}</td>
                    <td>${s.gender || 'Male'}</td>
                    <td>Division ${s.division}</td>
                    <td>${s.program || 'B.Com (Regular)'}</td>
                    <td><span class="attendance-status-pill status-active">${s.subject || 'Commerce'}</span></td>
                </tr>
            `).join("");
        }

        dynamicContentArea.innerHTML = `
            <div class="glass-card">
                <div class="card-header-flex mb-16" style="flex-wrap: wrap; gap: 12px;">
                    <h3 class="card-title">Student Registry (Roster List)</h3>
                    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                        <select id="teacher-student-program-filter" class="form-control" style="width: 170px; padding: 4px 8px; font-size: 13px; height: 32px;">
                            <option value="All">All Programs</option>
                            <option value="B.Com (Regular)">B.Com (Regular)</option>
                            <option value="B.Com (Professional)">B.Com (Professional)</option>
                            <option value="M.Com">M.Com</option>
                        </select>
                        <select id="teacher-student-div-filter" class="form-control" style="width: 120px; padding: 4px 8px; font-size: 13px; height: 32px;">
                            <option value="All">All Divisions</option>
                            <option value="A">Division A</option>
                            <option value="B">Division B</option>
                            <option value="C">Division C</option>
                            <option value="D">Division D</option>
                            <option value="E">Division E</option>
                            <option value="F">Division F</option>
                            <option value="G">Division G</option>
                        </select>
                        <span style="font-size: 13px; color: var(--text-muted);" id="teacher-student-count">${allStudents.length} students</span>
                    </div>
                </div>
                
                <div class="table-responsive" style="max-height: 480px; overflow-y: auto;">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Roll Number</th>
                                <th>Full Name</th>
                                <th>Gender</th>
                                <th>Division</th>
                                <th>Program</th>
                                <th>Subject</th>
                            </tr>
                        </thead>
                        <tbody id="teacher-student-tbody">
                            ${renderRows(allStudents)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const progFilter = document.getElementById("teacher-student-program-filter");
        const divFilter = document.getElementById("teacher-student-div-filter");
        const tbody = document.getElementById("teacher-student-tbody");
        const countSpan = document.getElementById("teacher-student-count");

        const filterHandler = () => {
            const pVal = progFilter.value;
            const dVal = divFilter.value;

            const filtered = allStudents.filter(s => {
                const matchesP = (pVal === "All") || (s.program === pVal);
                const matchesD = (dVal === "All") || (s.division === dVal);
                return matchesP && matchesD;
            });

            tbody.innerHTML = renderRows(filtered);
            countSpan.textContent = `${filtered.length} students`;
        };

        progFilter.addEventListener("change", filterHandler);
        divFilter.addEventListener("change", filterHandler);

    } catch (err) {
        console.error(err);
        dynamicContentArea.innerHTML = `<div class="glass-card text-center"><p style="color: var(--danger);">Failed to load students roster.</p></div>`;
    }
};

window.renderTeacherTimetable = function() {
    dynamicContentArea.innerHTML = `
        <div class="glass-card">
            <h3 class="card-title mb-16">Faculty Lectures Schedule</h3>
            <div class="table-responsive">
                <table class="custom-table text-center">
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Slot 1 (9:00 - 9:55)</th>
                            <th>Slot 2 (10:00 - 10:55)</th>
                            <th>Slot 3 (11:00 - 11:55)</th>
                            <th>Slot 4 (12:00 - 12:55)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Monday</strong></td>
                            <td>Stat (Div A)<br><small>Room 101</small></td>
                            <td>BA (Div B)<br><small>Room 102</small></td>
                            <td style="color: var(--text-muted);">Free</td>
                            <td style="color: var(--text-muted);">Free</td>
                        </tr>
                        <tr>
                            <td><strong>Tuesday</strong></td>
                            <td>BM (Div C)<br><small>Room 103</small></td>
                            <td>CS (Div D)<br><small>Room 104</small></td>
                            <td style="color: var(--text-muted);">Free</td>
                            <td style="color: var(--text-muted);">Free</td>
                        </tr>
                        <tr>
                            <td><strong>Wednesday</strong></td>
                            <td>Stat (Div A)<br><small>Room 101</small></td>
                            <td style="color: var(--text-muted);">Free</td>
                            <td style="color: var(--text-muted);">Free</td>
                            <td style="color: var(--text-muted);">Free</td>
                        </tr>
                        <tr>
                            <td><strong>Thursday</strong></td>
                            <td style="color: var(--text-muted);">Free</td>
                            <td>BA (Div B)<br><small>Room 102</small></td>
                            <td style="color: var(--text-muted);">Free</td>
                            <td style="color: var(--text-muted);">Free</td>
                        </tr>
                        <tr>
                            <td><strong>Friday</strong></td>
                            <td>BM (Div C)<br><small>Room 103</small></td>
                            <td style="color: var(--text-muted);">Free</td>
                            <td style="color: var(--text-muted);">Free</td>
                            <td style="color: var(--text-muted);">Free</td>
                        </tr>
                        <tr>
                            <td><strong>Saturday</strong></td>
                            <td style="color: var(--text-muted);">Free</td>
                            <td>CS (Div D)<br><small>Room 104</small></td>
                            <td style="color: var(--text-muted);">Free</td>
                            <td style="color: var(--text-muted);">Free</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

// attendance code generator page
window.renderTeacherSchedule = function() {
    dynamicContentArea.innerHTML = `
        <div class="glass-card mb-24" id="code-generation-form-card">
            <h3 class="card-title mb-16"><i class="fa-solid fa-gears mr-8"></i> Configure Attendance Session</h3>
            <form id="attendance-gen-form" class="form-grid">
                <div>
                    <label for="att-program">Academic Program</label>
                    <select id="att-program" class="form-control">
                        <option value="B.Com (Regular)">B.Com (Regular)</option>
                        <option value="B.Com (Professional)">B.Com (Professional)</option>
                        <option value="M.Com">M.Com</option>
                    </select>
                </div>
                <div>
                    <label for="att-class">Semester Year</label>
                    <select id="att-class" class="form-control">
                        <option value="B.Com. Sem-I">B.Com. Sem-I</option>
                        <option value="B.Com. Sem-III">B.Com. Sem-III</option>
                        <option value="B.Com. Sem-V">B.Com. Sem-V</option>
                    </select>
                </div>
                <div>
                    <label for="att-subject">Subject</label>
                    <select id="att-subject" class="form-control">
                        <!-- Loaded Dynamically -->
                    </select>
                </div>
                <div>
                    <label for="att-division">Division Eligibility</label>
                    <select id="att-division" class="form-control">
                        <option value="A">Division A</option>
                        <option value="B">Division B</option>
                        <option value="C">Division C</option>
                        <option value="D">Division D</option>
                        <option value="E">Division E</option>
                        <option value="F">Division F</option>
                        <option value="G">Division G</option>
                        <option value="All">All Divisions</option>
                    </select>
                </div>
                <div>
                    <label for="att-duration">Expiration Time</label>
                    <select id="att-duration" class="form-control">
                        <option value="5">5 minutes</option>
                        <option value="10" selected>10 minutes</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">60 minutes</option>
                    </select>
                </div>

                <!-- ANTI-PROXY OPTIONS BLOCK -->
                <div style="grid-column: span 2; display: flex; gap: 24px; align-items: center; background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; margin-top: 10px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0; font-weight: 500; font-size: 13px; color: var(--accent);">
                        <input type="checkbox" id="att-require-gps" style="width: 18px; height: 18px; cursor: pointer;">
                        <span><i class="fa-solid fa-location-crosshairs mr-4"></i> Enforce GPS Geofencing (50m)</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0; font-weight: 500; font-size: 13px; color: var(--accent);">
                        <input type="checkbox" id="att-is-rolling" style="width: 18px; height: 18px; cursor: pointer;">
                        <span><i class="fa-solid fa-arrows-spin mr-4"></i> Enable Rolling Codes (20s)</span>
                    </label>
                </div>

                <div class="form-grid-full text-center" style="margin-top: 20px;">
                    <button type="submit" class="btn btn-primary" style="max-width: 320px; margin: 0 auto; display: flex;">
                        <i class="fa-solid fa-qrcode mr-8"></i>
                        <span>Generate Active Check-in Code</span>
                    </button>
                </div>
            </form>
        </div>

        <div class="glass-card" id="code-active-display-card" style="display: none; border: 1.5px solid var(--accent);">
            <div class="card-header-flex mb-16">
                <h3 class="card-title">Live Attendance Session Log</h3>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-sm" id="launch-projector-btn" style="padding: 6px 12px; display: none;"><i class="fa-solid fa-expand"></i> Launch Projector View</button>
                    <button class="btn btn-danger btn-sm" id="close-session-btn" style="padding: 6px 12px;"><i class="fa-solid fa-power-off"></i> Close Session Early</button>
                </div>
            </div>

            <div class="attendance-code-container">
                <span class="attendance-status-pill status-active" id="active-session-label"><i class="fa-solid fa-circle-dot fa-fade"></i> SESSION ACTIVE</span>
                <div class="attendance-code-number" id="active-code-display">000000</div>
                <p style="color: var(--text-muted); font-size: 13px;" id="active-session-desc">
                    Show this code on the classroom projector screen. Students enter it in their dashboard.
                </p>
                <div style="font-size: 12px; margin-top: 8px; color: var(--accent);" id="active-session-timer">Expires at: --:--</div>
            </div>

            <h4 class="mb-12"><i class="fa-solid fa-users-viewfinder mr-8"></i> Checked-in Students (<span id="checked-in-count">0</span>)</h4>
            
            <div class="table-responsive">
                <table class="custom-table text-center" style="font-size: 12px;">
                    <thead>
                        <tr>
                            <th>Roll Number</th>
                            <th>Student Name</th>
                            <th>Gender</th>
                            <th>Division</th>
                            <th>Marked At</th>
                        </tr>
                    </thead>
                    <tbody id="checked-in-records-list">
                        <tr><td colspan="5" style="color: var(--text-muted); padding: 12px;">Waiting for student check-ins...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const progSel = document.getElementById("att-program");
    const subSel = document.getElementById("att-subject");
    const classSel = document.getElementById("att-class");

    // Load subjects for selected program dynamically
    async function loadSubjects(program) {
        try {
            subSel.innerHTML = `<option value="">Loading subjects...</option>`;
            const res = await fetch(`/api/subjects?program=${encodeURIComponent(program)}`);
            const data = await res.json();
            const subjects = data.subjects || [];

            if (subjects.length === 0) {
                subSel.innerHTML = `<option value="Statistics">Statistics (Fallback)</option><option value="Accountancy">Accountancy (Fallback)</option>`;
            } else {
                subSel.innerHTML = subjects.map(s => `<option value="${s.name}">${s.name} (${s.code})</option>`).join("");
            }
        } catch (e) {
            subSel.innerHTML = `<option value="Statistics">Statistics (Fallback)</option>`;
        }
    }

    function loadClasses(program) {
        if (program === 'M.Com') {
            classSel.innerHTML = `
                <option value="M.Com. Sem-I">M.Com. Sem-I</option>
                <option value="M.Com. Sem-III">M.Com. Sem-III</option>
            `;
        } else {
            classSel.innerHTML = `
                <option value="B.Com. Sem-I">B.Com. Sem-I</option>
                <option value="B.Com. Sem-III">B.Com. Sem-III</option>
                <option value="B.Com. Sem-V">B.Com. Sem-V</option>
            `;
        }
    }

    // Default load based on teacher program
    if (currentUser.program) {
        progSel.value = currentUser.program;
    }
    loadSubjects(progSel.value);
    loadClasses(progSel.value);

    progSel.addEventListener("change", (e) => {
        loadSubjects(e.target.value);
        loadClasses(e.target.value);
    });

    const activeCard = document.getElementById("code-active-display-card");
    const formCard = document.getElementById("code-generation-form-card");
    const genForm = document.getElementById("attendance-gen-form");
    const projectorBtn = document.getElementById("launch-projector-btn");

    let currentSessionObj = null;

    if (genForm) {
        genForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const className = document.getElementById("att-class").value;
            const subject = subSel.value;
            const division = document.getElementById("att-division").value;
            const program = progSel.value;
            const duration = document.getElementById("att-duration").value;
            const requireGps = document.getElementById("att-require-gps").checked;
            const isRolling = document.getElementById("att-is-rolling").checked;

            if (requireGps) {
                if (!navigator.geolocation) {
                    alert("GPS is not supported by your browser. Disable GPS check or change browser.");
                    return;
                }
                navigator.geolocation.getCurrentPosition(async (position) => {
                    await sendCreateSession(className, subject, division, program, duration, true, position.coords.latitude, position.coords.longitude, isRolling);
                }, (err) => {
                    alert("Failed to acquire coordinates. Please allow location permissions and try again.");
                });
            } else {
                await sendCreateSession(className, subject, division, program, duration, false, null, null, isRolling);
            }
        });
    }

    async function sendCreateSession(class_name, subject, division, program, duration_minutes, require_gps, lat, lon, is_rolling) {
        try {
            const res = await fetch('/api/attendance/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creator_id: currentUser.id,
                    class_name,
                    subject,
                    division,
                    program,
                    duration_minutes: parseInt(duration_minutes),
                    require_gps,
                    creator_lat: lat,
                    creator_lon: lon,
                    is_rolling
                })
            });
            const data = await res.json();

            if (data.success) {
                activeSessionCode = data.session.code;
                currentSessionObj = data.session;

                document.getElementById("active-code-display").textContent = activeSessionCode;
                
                const expiryTime = new Date(data.session.expires_at).toLocaleTimeString();
                document.getElementById("active-session-timer").textContent = `Expires at: ${expiryTime}`;
                document.getElementById("active-session-label").innerHTML = `<i class="fa-solid fa-circle-dot fa-fade"></i> ACTIVE | ${data.session.subject} (${data.session.division})`;

                formCard.style.display = "none";
                activeCard.style.display = "block";

                // Show projector button
                projectorBtn.style.display = "block";

                // Start Polling records
                pollCheckedInStudents(activeSessionCode);
                activeSessionPollingInterval = setInterval(() => pollCheckedInStudents(activeSessionCode), 3000);
            } else {
                alert(data.error || "Failed to create session.");
            }
        } catch (err) {
            console.error(err);
            alert("Error starting attendance session.");
        }
    }

    if (projectorBtn) {
        projectorBtn.addEventListener("click", () => {
            if (currentSessionObj) {
                openProjectorMode(currentSessionObj);
            }
        });
    }

    const closeBtn = document.getElementById("close-session-btn");
    if (closeBtn) {
        closeBtn.addEventListener("click", async () => {
            if (!activeSessionCode) return;
            try {
                const res = await fetch('/api/attendance/session/close', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: activeSessionCode })
                });
                const data = await res.json();
                if (data.success) {
                    clearInterval(activeSessionPollingInterval);
                    activeSessionPollingInterval = null;
                    activeSessionCode = null;
                    currentSessionObj = null;
                    activeCard.style.display = "none";
                    formCard.style.display = "block";
                    alert("Attendance session successfully closed.");
                }
            } catch (e) {
                alert("Error closing session.");
            }
        });
    }
};

// --- DYNAMIC PROJECTOR VIEW FULLSCREEN MODAL ---
window.openProjectorMode = function(session) {
    const overlay = document.createElement("div");
    overlay.id = "projector-overlay";
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #020617;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        padding: 40px;
        box-sizing: border-box;
    `;

    overlay.innerHTML = `
        <style>
            @keyframes pulseGlow {
                0% { box-shadow: 0 0 10px rgba(20, 184, 166, 0.1); }
                100% { box-shadow: 0 0 25px rgba(20, 184, 166, 0.4); }
            }
        </style>
        <div style="position: absolute; top: 24px; right: 24px; display: flex; gap: 16px;">
            <button class="btn btn-secondary" onclick="closeProjectorMode()" style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: #ffffff;"><i class="fa-solid fa-compress mr-8"></i> Exit Projector View</button>
        </div>

        <div class="text-center" style="max-width: 800px; width: 100%;">
            <div style="font-size: 18px; color: var(--accent); font-weight: 600; text-transform: uppercase; letter-spacing: 2px;" id="projector-program">${session.program} - ${session.division !== 'All' ? 'Div ' + session.division : 'All Divisions'}</div>
            <h1 style="font-size: 38px; font-weight: 800; margin: 8px 0 24px 0; color: #f8fafc;" id="projector-subject">${session.subject}</h1>
            
            <div style="background: rgba(255,255,255,0.02); border: 1.5px solid var(--accent); padding: 48px; border-radius: 24px; margin-bottom: 32px; box-shadow: 0 0 50px rgba(20,184,166,0.15); position: relative; overflow: hidden;">
                <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 3px; color: var(--text-muted); margin-bottom: 12px;">Active Security Code</div>
                <div id="projector-code" style="font-size: 110px; font-weight: 900; letter-spacing: 8px; color: #ffffff; line-height: 1;">${activeSessionCode}</div>
                
                ${session.is_rolling ? `
                    <div style="margin-top: 24px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fa-solid fa-arrows-spin fa-spin" style="color: var(--accent);"></i>
                        <span style="font-size: 13px; color: var(--accent); font-weight: 500;" id="projector-timer-text">Code rotates in 20 seconds</span>
                    </div>
                ` : ''}
            </div>

            <div class="stats-grid mb-24" style="grid-template-columns: repeat(2, 1fr); max-width: 500px; margin: 0 auto 32px auto;">
                <div class="stat-card" style="background: rgba(255,255,255,0.01); border-color: rgba(255,255,255,0.05); padding: 16px;">
                    <div style="font-size: 12px; color: var(--text-muted);">Present Count</div>
                    <div style="font-size: 36px; font-weight: 800; color: var(--accent);" id="projector-present-count">0</div>
                </div>
                <div class="stat-card" style="background: rgba(255,255,255,0.01); border-color: rgba(255,255,255,0.05); padding: 16px;">
                    <div style="font-size: 12px; color: var(--text-muted);">Geofencing Check</div>
                    <div style="font-size: 15px; font-weight: 700; color: ${session.require_gps ? 'var(--accent)' : 'var(--text-muted)'}; margin-top: 10px;">
                        ${session.require_gps ? '<i class="fa-solid fa-location-crosshairs mr-4"></i> ACTIVE (50m)' : '<i class="fa-solid fa-location-slash mr-4"></i> DISABLED'}
                    </div>
                </div>
            </div>

            <h3 style="text-align: left; font-size: 18px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-users mr-4"></i> Recently Checked In</h3>
            <div id="projector-joined-list" style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: start; max-height: 200px; overflow-y: auto; background: rgba(255,255,255,0.01); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="color: var(--text-muted); font-size: 13px; width: 100%; text-align: center;">Waiting for student check-ins...</div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    let secondsLeft = 20;
    let projectorTimerInterval = null;

    if (session.is_rolling) {
        projectorTimerInterval = setInterval(async () => {
            secondsLeft--;
            const timerTxt = document.getElementById("projector-timer-text");
            if (timerTxt) {
                timerTxt.textContent = `Code rotates in ${secondsLeft} seconds`;
            }

            if (secondsLeft <= 0) {
                secondsLeft = 20;
                try {
                    const rotateRes = await fetch('/api/attendance/session/rotate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: activeSessionCode })
                    });
                    const rotateData = await rotateRes.json();
                    if (rotateData.success) {
                        activeSessionCode = rotateData.new_code;
                        const codeDisplay = document.getElementById("projector-code");
                        if (codeDisplay) codeDisplay.textContent = activeSessionCode;

                        const backDisplay = document.getElementById("active-code-display");
                        if (backDisplay) backDisplay.textContent = activeSessionCode;
                    }
                } catch (e) {
                    console.error("Rotation error:", e);
                }
            }
        }, 1000);
    }

    // Set polling display for projector mode
    window.projectorPollInterval = setInterval(async () => {
        try {
            const res = await fetch(`/api/attendance/session/${activeSessionCode}/records`);
            const data = await res.json();
            if (data.success) {
                const records = data.records || [];
                const presentCnt = document.getElementById("projector-present-count");
                if (presentCnt) presentCnt.textContent = records.length;

                const joinedList = document.getElementById("projector-joined-list");
                if (joinedList) {
                    if (records.length === 0) {
                        joinedList.innerHTML = `<div style="color: var(--text-muted); font-size: 13px; width: 100%; text-align: center;">Waiting for student check-ins...</div>`;
                    } else {
                        joinedList.innerHTML = records.slice(0, 15).map(r => `
                            <span style="background: rgba(20,184,166,0.1); border: 1px solid var(--accent); color: #ffffff; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px; animation: pulseGlow 1.5s infinite alternate;">
                                <i class="fa-solid fa-circle-check" style="color: var(--accent);"></i>
                                ${r.name} (${r.roll_no})
                            </span>
                        `).join("");
                    }
                }
            }
        } catch (e) {}
    }, 3000);

    window.closeProjectorMode = function() {
        if (projectorTimerInterval) clearInterval(projectorTimerInterval);
        if (window.projectorPollInterval) clearInterval(window.projectorPollInterval);
        const overlay = document.getElementById("projector-overlay");
        if (overlay) overlay.remove();
    };
};

async function pollCheckedInStudents(code) {
    try {
        const res = await fetch(`/api/attendance/session/${code}/records`);
        const data = await res.json();

        if (data.success) {
            const records = data.records || [];
            document.getElementById("checked-in-count").textContent = records.length;

            const tbody = document.getElementById("checked-in-records-list");
            if (records.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="color: var(--text-muted); padding: 12px;">Waiting for student check-ins...</td></tr>`;
            } else {
                tbody.innerHTML = records.map(r => `
                    <tr>
                        <td><strong>${r.roll_no}</strong></td>
                        <td>${r.name}</td>
                        <td>${r.gender || 'Male'}</td>
                        <td>Division ${r.division}</td>
                        <td>${new Date(r.marked_at).toLocaleTimeString()}</td>
                    </tr>
                `).join("");
            }
        }
    } catch (e) {
        console.error("Polling error:", e);
    }
}

window.renderTeacherProfile = function() {
    window.renderStudentProfile(); // Profiles are identical
};


// =========================================================================
// ADMIN PORTAL MODULES
// =========================================================================

window.renderAdminDashboard = async function() {
    dynamicContentArea.innerHTML = `<div class="text-center" style="padding: 50px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i></div>`;
    
    try {
        const res = await fetch('/api/users');
        const data = await res.json();
        const users = data.users || [];
        
        const students = users.filter(u => u.role === 'student');
        const teacherCount = users.filter(u => u.role === 'teacher').length;
        
        const bcomRegCount = students.filter(s => s.program === 'B.Com (Regular)').length;
        const bcomProCount = students.filter(s => s.program === 'B.Com (Professional)').length;
        const mcomCount = students.filter(s => s.program === 'M.Com').length;

        // Fetch today's live lecture overrides for admin monitor
        const todayDateStr = new Date().toISOString().split('T')[0];
        const adjRes = await fetch(`/api/daily-lectures?date=${todayDateStr}`);
        const adjData = await adjRes.json();
        const overrides = adjData.lectures || [];

        let overridesTableHTML = overrides.map(o => `
            <tr>
                <td>${o.program} (Div ${o.division})</td>
                <td><strong>${o.slot.toUpperCase().replace('_', ' ')}</strong></td>
                <td>${o.subject}</td>
                <td>${o.original_teacher}</td>
                <td>
                    <span class="attendance-status-pill" style="
                        background: ${o.status === 'Free' ? 'rgba(239,68,68,0.1)' : (o.status === 'Substituted' ? 'rgba(245,158,11,0.1)' : 'rgba(168,85,247,0.1)')};
                        color: ${o.status === 'Free' ? 'var(--danger)' : (o.status === 'Substituted' ? 'var(--warning)' : 'var(--secondary)')};
                    ">
                        ${o.status.toUpperCase()}
                    </span>
                </td>
                <td>
                    ${o.status === 'Substituted' ? `Sub Faculty: <strong>${o.substitute_teacher}</strong>` : ''}
                    ${o.status === 'Combined' ? `Combined Div: <strong>Division ${o.combined_division}</strong> ${o.notes ? `(${o.notes})` : ''}` : ''}
                    ${o.status === 'Scheduled' ? `Note: ${o.notes}` : ''}
                    ${o.status === 'Free' ? 'Cancelled' : ''}
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="clearLectureAdjustment(${o.id})" style="padding: 2px 6px; font-size: 10px;">Clear</button>
                </td>
            </tr>
        `).join("");

        dynamicContentArea.innerHTML = `
            <div class="stats-grid mb-24">
                <div class="stat-card" style="grid-column: span 1;">
                    <div class="stat-header">
                        <span class="stat-title">Enrolled Students</span>
                        <div class="stat-icon" style="background: rgba(20, 184, 166, 0.1); color: var(--accent);"><i class="fa-solid fa-graduation-cap"></i></div>
                    </div>
                    <div class="stat-value">${students.length}</div>
                    <div style="font-size: 11px; margin-top: 8px; color: var(--text-muted); display: flex; flex-direction: column; gap: 4px;">
                        <span>B.Com Regular: <strong>${bcomRegCount}</strong></span>
                        <span>B.Com Professional: <strong>${bcomProCount}</strong></span>
                        <span>M.Com Postgrad: <strong>${mcomCount}</strong></span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Faculty Instructors</span>
                        <div class="stat-icon" style="background: rgba(99, 102, 241, 0.1); color: var(--primary);"><i class="fa-solid fa-user-tie"></i></div>
                    </div>
                    <div class="stat-value">${teacherCount}</div>
                    <div class="stat-desc">Across all commerce streams</div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Database System</span>
                        <div class="stat-icon" style="background: rgba(168, 85, 247, 0.1); color: var(--secondary);"><i class="fa-solid fa-server"></i></div>
                    </div>
                    <div class="stat-value" style="font-size: 22px; line-height: 38px;">SQLite 3</div>
                    <div class="stat-desc">Integrated program schemas</div>
                </div>
            </div>

            <!-- LIVE COLLEGE LECTURE MONITOR (Principal / Admin view) -->
            <div class="glass-card mb-24" style="border: 1.5px solid var(--warning);">
                <div class="card-header-flex mb-16">
                    <h3 class="card-title" style="color: var(--warning);"><i class="fa-solid fa-desktop mr-8"></i> Live Today's Timetable Overrides Monitor</h3>
                    <span class="attendance-status-pill status-active" style="font-size: 11px;"><i class="fa-solid fa-clock-pulse fa-fade"></i> Live Campus Feed</span>
                </div>
                <div class="table-responsive">
                    <table class="custom-table text-center" style="font-size: 11px;">
                        <thead>
                            <tr>
                                <th>Class Info</th>
                                <th>Slot</th>
                                <th>Subject</th>
                                <th>Original Faculty</th>
                                <th>Status Today</th>
                                <th>Adjustment Details</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${overridesTableHTML.length > 0 ? overridesTableHTML : `<tr><td colspan="7" style="color: var(--text-muted); padding: 12px;">No active adjustments declared for today. Normal weekly timetables are running.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="glass-card">
                <h3 class="card-title mb-16"><i class="fa-solid fa-sliders mr-8"></i> Administration Shortcut Actions</h3>
                <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="navigateTo('students')" style="flex-grow: 1; max-width: 250px;">
                        <i class="fa-solid fa-user-plus mr-8"></i>
                        <span>Manage Users List</span>
                    </button>
                    <button class="btn btn-secondary" onclick="navigateTo('database')" style="flex-grow: 1; max-width: 250px;">
                        <i class="fa-solid fa-terminal mr-8"></i>
                        <span>SQL CLI Terminal</span>
                    </button>
                </div>
            </div>
        `;
    } catch (err) {
        console.error(err);
        dynamicContentArea.innerHTML = `<div class="glass-card text-center"><p style="color: var(--danger);">Failed to load admin stats.</p></div>`;
    }
};

window.renderAdminStudents = async function() {
    dynamicContentArea.innerHTML = `<div class="text-center" style="padding: 50px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i></div>`;
    
    try {
        const res = await fetch('/api/users');
        const data = await res.json();
        const users = data.users || [];

        function renderRows(filtered) {
            return filtered.map(u => `
                <tr>
                    <td><strong>${u.id}</strong></td>
                    <td><strong>${u.username}</strong></td>
                    <td>${u.name}</td>
                    <td>${u.gender || 'Male'}</td>
                    <td><span class="attendance-status-pill ${u.role === 'admin' ? 'status-active' : (u.role === 'teacher' ? 'status-active' : 'status-active')}" style="background: ${u.role === 'admin' ? 'rgba(168,85,247,0.1)' : (u.role === 'teacher' ? 'rgba(99,102,241,0.1)' : 'rgba(20,184,166,0.1)')}; color: ${u.role === 'admin' ? 'var(--secondary)' : (u.role === 'teacher' ? 'var(--primary)' : 'var(--accent)')};">${u.role.toUpperCase()}</span></td>
                    <td>Division ${u.division || 'N/A'}</td>
                    <td>${u.program || 'N/A'}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="openEditUserModal(${JSON.stringify(u).replace(/"/g, '&quot;')})" style="padding: 4px 8px; font-size: 11px;">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})" style="padding: 4px 8px; font-size: 11px;">Delete</button>
                    </td>
                </tr>
            `).join("");
        }

        dynamicContentArea.innerHTML = `
            <div class="glass-card">
                <div class="card-header-flex mb-16" style="flex-wrap: wrap; gap: 12px;">
                    <h3 class="card-title">User Registry Console</h3>
                    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                        <select id="admin-user-role-filter" class="form-control" style="width: 120px; padding: 4px 8px; font-size: 13px; height: 32px;">
                            <option value="All">All Roles</option>
                            <option value="admin">Admins</option>
                            <option value="teacher">Teachers</option>
                            <option value="student">Students</option>
                        </select>
                        <select id="admin-user-program-filter" class="form-control" style="width: 170px; padding: 4px 8px; font-size: 13px; height: 32px;">
                            <option value="All">All Programs</option>
                            <option value="B.Com (Regular)">B.Com (Regular)</option>
                            <option value="B.Com (Professional)">B.Com (Professional)</option>
                            <option value="M.Com">M.Com</option>
                        </select>
                        <button class="btn btn-primary btn-sm" onclick="openAddUserModal()"><i class="fa-solid fa-user-plus"></i> Add User</button>
                    </div>
                </div>
                
                <div class="table-responsive" style="max-height: 450px; overflow-y: auto;">
                    <table class="custom-table" style="font-size: 12px;">
                        <thead>
                            <tr>
                                <th>UID</th>
                                <th>Username / Roll No</th>
                                <th>Name</th>
                                <th>Gender</th>
                                <th>Role</th>
                                <th>Division</th>
                                <th>Program</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="admin-user-tbody">
                            ${renderRows(users)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const rFilter = document.getElementById("admin-user-role-filter");
        const pFilter = document.getElementById("admin-user-program-filter");
        const tbody = document.getElementById("admin-user-tbody");

        const filterHandler = () => {
            const rVal = rFilter.value;
            const pVal = pFilter.value;

            const filtered = users.filter(u => {
                const matchesR = (rVal === "All") || (u.role === rVal);
                const matchesP = (pVal === "All") || (u.role !== "student") || (u.program === pVal);
                return matchesR && matchesP;
            });

            tbody.innerHTML = renderRows(filtered);
        };

        rFilter.addEventListener("change", filterHandler);
        pFilter.addEventListener("change", filterHandler);

    } catch (err) {
        console.error(err);
        dynamicContentArea.innerHTML = `<div class="glass-card text-center"><p style="color: var(--danger);">Failed to load user registry list.</p></div>`;
    }
};

window.openAddUserModal = function() {
    generalModalTitle.textContent = "Register New User Account";
    generalModalBody.innerHTML = `
        <form id="add-user-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div class="form-grid">
                <div>
                    <label>Username / Roll Number</label>
                    <input type="text" id="add-user-username" class="form-control" placeholder="105 or prof_sarah" required autocomplete="off">
                </div>
                <div>
                    <label>Password (Security Key / SPID)</label>
                    <input type="password" id="add-user-password" class="form-control" placeholder="••••••" required autocomplete="off">
                </div>
                <div>
                    <label>Full Name</label>
                    <input type="text" id="add-user-name" class="form-control" placeholder="Jane Doe" required autocomplete="off">
                </div>
                <div>
                    <label>Gender</label>
                    <select id="add-user-gender" class="form-control" required>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div>
                    <label>User Role</label>
                    <select id="add-user-role" class="form-control" required>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>
                <div>
                    <label>Email Address</label>
                    <input type="email" id="add-user-email" class="form-control" placeholder="jane@tolani.edu" autocomplete="off">
                </div>
                <div>
                    <label>Contact Phone</label>
                    <input type="text" id="add-user-phone" class="form-control" placeholder="+91 98765 43210" autocomplete="off">
                </div>
                <div>
                    <label>Division</label>
                    <select id="add-user-division" class="form-control">
                        <option value="A">Division A</option>
                        <option value="B">Division B</option>
                        <option value="C">Division C</option>
                        <option value="D">Division D</option>
                        <option value="E">Division E</option>
                        <option value="F">Division F</option>
                        <option value="G">Division G</option>
                    </select>
                </div>
                <div>
                    <label>Class Year</label>
                    <input type="text" id="add-user-class" class="form-control" placeholder="B.Com. Sem-I" value="B.Com. Sem-I" autocomplete="off">
                </div>
                <div>
                    <label>Stream / Program</label>
                    <select id="add-user-program" class="form-control">
                        <option value="B.Com (Regular)">B.Com (Regular)</option>
                        <option value="B.Com (Professional)">B.Com (Professional)</option>
                        <option value="M.Com">M.Com</option>
                    </select>
                </div>
                <div>
                    <label>Current Year</label>
                    <select id="add-user-year" class="form-control">
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                    </select>
                </div>
                <div>
                    <label>Current Semester</label>
                    <select id="add-user-semester" class="form-control">
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                        <option value="Semester 3">Semester 3</option>
                        <option value="Semester 4">Semester 4</option>
                        <option value="Semester 5">Semester 5</option>
                        <option value="Semester 6">Semester 6</option>
                    </select>
                </div>
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
                <i class="fa-solid fa-save mr-8"></i>
                <span>Save Record</span>
            </button>
        </form>
    `;

    generalModal.classList.add("active");

    const addForm = document.getElementById("add-user-form");
    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("add-user-username").value.trim();
        const password = document.getElementById("add-user-password").value;
        const name = document.getElementById("add-user-name").value.trim();
        const gender = document.getElementById("add-user-gender").value;
        const role = document.getElementById("add-user-role").value;
        const email = document.getElementById("add-user-email").value.trim();
        const phone = document.getElementById("add-user-phone").value.trim();
        const division = document.getElementById("add-user-division").value;
        const class_name = document.getElementById("add-user-class").value.trim();
        const program = document.getElementById("add-user-program").value;
        const year = document.getElementById("add-user-year").value;
        const semester = document.getElementById("add-user-semester").value;

        try {
            const res = await fetch('/api/users/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role, name, email, phone, division, class_name, program, year, semester, gender })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                generalModal.classList.remove("active");
                window.renderAdminStudents();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to submit user creation request.");
        }
    });
};

window.openEditUserModal = function(user) {
    generalModalTitle.textContent = `Edit User Details (UID: ${user.id})`;
    generalModalBody.innerHTML = `
        <form id="edit-user-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div class="form-grid">
                <div>
                    <label>Full Name</label>
                    <input type="text" id="edit-user-name" class="form-control" value="${user.name}" required autocomplete="off">
                </div>
                <div>
                    <label>Gender</label>
                    <select id="edit-user-gender" class="form-control" required>
                        <option value="Male" ${user.gender === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${user.gender === 'Female' ? 'selected' : ''}>Female</option>
                    </select>
                </div>
                <div>
                    <label>Email Address</label>
                    <input type="email" id="edit-user-email" class="form-control" value="${user.email || ''}" autocomplete="off">
                </div>
                <div>
                    <label>Contact Phone</label>
                    <input type="text" id="edit-user-phone" class="form-control" value="${user.phone || ''}" autocomplete="off">
                </div>
                <div>
                    <label>Division</label>
                    <select id="edit-user-division" class="form-control">
                        <option value="A" ${user.division === 'A' ? 'selected' : ''}>Division A</option>
                        <option value="B" ${user.division === 'B' ? 'selected' : ''}>Division B</option>
                        <option value="C" ${user.division === 'C' ? 'selected' : ''}>Division C</option>
                        <option value="D" ${user.division === 'D' ? 'selected' : ''}>Division D</option>
                        <option value="E" ${user.division === 'E' ? 'selected' : ''}>Division E</option>
                        <option value="F" ${user.division === 'F' ? 'selected' : ''}>Division F</option>
                        <option value="G" ${user.division === 'G' ? 'selected' : ''}>Division G</option>
                    </select>
                </div>
                <div>
                    <label>Class Year</label>
                    <input type="text" id="edit-user-class" class="form-control" value="${user.class || ''}" autocomplete="off">
                </div>
                <div>
                    <label>Department / Major</label>
                    <input type="text" id="edit-user-dept" class="form-control" value="${user.department || ''}" autocomplete="off">
                </div>
                <div>
                    <label>Stream / Program</label>
                    <select id="edit-user-program" class="form-control">
                        <option value="B.Com (Regular)" ${user.program === 'B.Com (Regular)' ? 'selected' : ''}>B.Com (Regular)</option>
                        <option value="B.Com (Professional)" ${user.program === 'B.Com (Professional)' ? 'selected' : ''}>B.Com (Professional)</option>
                        <option value="M.Com" ${user.program === 'M.Com' ? 'selected' : ''}>M.Com</option>
                    </select>
                </div>
                <div>
                    <label>Current Year</label>
                    <select id="edit-user-year" class="form-control">
                        <option value="1st Year" ${user.year === '1st Year' ? 'selected' : ''}>1st Year</option>
                        <option value="2nd Year" ${user.year === '2nd Year' ? 'selected' : ''}>2nd Year</option>
                        <option value="3rd Year" ${user.year === '3rd Year' ? 'selected' : ''}>3rd Year</option>
                    </select>
                </div>
                <div>
                    <label>Current Semester</label>
                    <select id="edit-user-semester" class="form-control">
                        <option value="Semester 1" ${user.semester === 'Semester 1' ? 'selected' : ''}>Semester 1</option>
                        <option value="Semester 2" ${user.semester === 'Semester 2' ? 'selected' : ''}>Semester 2</option>
                        <option value="Semester 3" ${user.semester === 'Semester 3' ? 'selected' : ''}>Semester 3</option>
                        <option value="Semester 4" ${user.semester === 'Semester 4' ? 'selected' : ''}>Semester 4</option>
                        <option value="Semester 5" ${user.semester === 'Semester 5' ? 'selected' : ''}>Semester 5</option>
                        <option value="Semester 6" ${user.semester === 'Semester 6' ? 'selected' : ''}>Semester 6</option>
                    </select>
                </div>
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
                <i class="fa-solid fa-save mr-8"></i>
                <span>Save Updates</span>
            </button>
        </form>
    `;

    generalModal.classList.add("active");

    const editForm = document.getElementById("edit-user-form");
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("edit-user-name").value.trim();
        const gender = document.getElementById("edit-user-gender").value;
        const email = document.getElementById("edit-user-email").value.trim();
        const phone = document.getElementById("edit-user-phone").value.trim();
        const division = document.getElementById("edit-user-division").value;
        const class_name = document.getElementById("edit-user-class").value.trim();
        const department = document.getElementById("edit-user-dept").value.trim();
        const program = document.getElementById("edit-user-program").value;
        const year = document.getElementById("edit-user-year").value;
        const semester = document.getElementById("edit-user-semester").value;

        try {
            const res = await fetch('/api/users/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, name, email, phone, division, class_name, department, program, year, semester, gender })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                generalModal.classList.remove("active");
                window.renderAdminStudents();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to save updates.");
        }
    });
};

window.deleteUser = async function(id) {
    if (!confirm("Are you sure you want to permanently delete this user account?")) return;

    try {
        const res = await fetch('/api/users/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            if (currentUser.role === 'admin') {
                window.renderAdminStudents();
            } else {
                window.renderProgramManagement(programName); // Falls back correctly
            }
        } else {
            alert(data.error);
        }
    } catch (err) {
        console.error(err);
        alert("Failed to delete user.");
    }
};

window.renderAdminTimetable = function() {
    dynamicContentArea.innerHTML = `
        <div class="glass-card text-center" style="padding: 40px;">
            <i class="fa-solid fa-calendar-days" style="font-size: 40px; color: var(--primary); margin-bottom: 16px;"></i>
            <h3>Unified Timetables Console</h3>
            <p style="color: var(--text-muted); margin-bottom: 20px;">Use the program management pages in the sidebar to configure schedules for individual streams.</p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="navigateTo('bcom')">B.Com Regular</button>
                <button class="btn btn-secondary" onclick="navigateTo('bcompro')">B.Com Professional</button>
                <button class="btn btn-secondary" onclick="navigateTo('mcom')">M.Com</button>
            </div>
        </div>
    `;
};

window.renderAdminSchedule = function() {
    window.renderTeacherSchedule();
};

window.renderAdminFees = async function() {
    dynamicContentArea.innerHTML = `<div class="text-center" style="padding: 50px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i></div>`;

    try {
        const res = await fetch('/api/settings/fees');
        const data = await res.json();
        const f = data.fees || {};

        dynamicContentArea.innerHTML = `
            <div class="glass-card">
                <h3 class="card-title mb-16"><i class="fa-solid fa-wallet mr-8"></i> Baseline Tuition Fees Setup</h3>
                <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">
                    Configure gender-based baseline semester tuition fee rates for academic streams. Saving applies changes to new registrations.
                </p>
                <form id="admin-fees-form" style="display: flex; flex-direction: column; gap: 16px; max-width: 600px;">
                    
                    <h4 style="color: var(--primary); border-bottom: 1px solid var(--border-color); padding-bottom: 6px;"><i class="fa-solid fa-book mr-8"></i> B.Com (Regular) Fees</h4>
                    <div class="form-grid mb-12">
                        <div>
                            <label>Boys Tuition Fee (INR)</label>
                            <input type="number" class="form-control" value="${f.fee_baseline_bcom_regular_boy || '6200'}" id="fee-bcom-reg-boy" required>
                        </div>
                        <div>
                            <label>Girls Tuition Fee (INR)</label>
                            <input type="number" class="form-control" value="${f.fee_baseline_bcom_regular_girl || '5200'}" id="fee-bcom-reg-girl" required>
                        </div>
                    </div>

                    <h4 style="color: var(--accent); border-bottom: 1px solid var(--border-color); padding-bottom: 6px;"><i class="fa-solid fa-graduation-cap mr-8"></i> B.Com (Professional) Fees</h4>
                    <div class="form-grid mb-12">
                        <div>
                            <label>Boys Tuition Fee (INR)</label>
                            <input type="number" class="form-control" value="${f.fee_baseline_bcom_professional_boy || '9500'}" id="fee-bcom-pro-boy" required>
                        </div>
                        <div>
                            <label>Girls Tuition Fee (INR)</label>
                            <input type="number" class="form-control" value="${f.fee_baseline_bcom_professional_girl || '8500'}" id="fee-bcom-pro-girl" required>
                        </div>
                    </div>

                    <h4 style="color: var(--secondary); border-bottom: 1px solid var(--border-color); padding-bottom: 6px;"><i class="fa-solid fa-award mr-8"></i> M.Com Fees</h4>
                    <div class="form-grid mb-12">
                        <div>
                            <label>Boys Tuition Fee (INR)</label>
                            <input type="number" class="form-control" value="${f.fee_baseline_mcom_boy || '12000'}" id="fee-mcom-boy" required>
                        </div>
                        <div>
                            <label>Girls Tuition Fee (INR)</label>
                            <input type="number" class="form-control" value="${f.fee_baseline_mcom_girl || '11000'}" id="fee-mcom-girl" required>
                        </div>
                    </div>

                    <h4 style="color: var(--warning); border-bottom: 1px solid var(--border-color); padding-bottom: 6px;"><i class="fa-solid fa-triangle-exclamation mr-8"></i> Other Charges</h4>
                    <div class="form-grid mb-24">
                        <div>
                            <label>Late Penalty Rate (INR)</label>
                            <input type="number" class="form-control" value="${f.fee_penalty || '150'}" id="fee-penalty-rate" required>
                        </div>
                        <div></div>
                    </div>

                    <button type="submit" class="btn btn-primary" style="max-width: 220px;">
                        <i class="fa-solid fa-floppy-disk mr-8"></i> Save Baseline Fees
                    </button>
                </form>
            </div>
        `;

        const feesForm = document.getElementById("admin-fees-form");
        if (feesForm) {
            feesForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const fees = {
                    fee_baseline_bcom_regular_boy: document.getElementById("fee-bcom-reg-boy").value,
                    fee_baseline_bcom_regular_girl: document.getElementById("fee-bcom-reg-girl").value,
                    fee_baseline_bcom_professional_boy: document.getElementById("fee-bcom-pro-boy").value,
                    fee_baseline_bcom_professional_girl: document.getElementById("fee-bcom-pro-girl").value,
                    fee_baseline_mcom_boy: document.getElementById("fee-mcom-boy").value,
                    fee_baseline_mcom_girl: document.getElementById("fee-mcom-girl").value,
                    fee_penalty: document.getElementById("fee-penalty-rate").value
                };

                try {
                    const saveRes = await fetch('/api/settings/fees', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fees })
                    });
                    const saveData = await saveRes.json();
                    if (saveData.success) {
                        alert(saveData.message);
                    } else {
                        alert(saveData.error || "Failed to save baseline configuration.");
                    }
                } catch (err) {
                    alert("Error saving baseline settings.");
                }
            });
        }
    } catch (err) {
        console.error(err);
        dynamicContentArea.innerHTML = `<div class="glass-card text-center"><p style="color: var(--danger);">Failed to load fees setup.</p></div>`;
    }
};

window.renderAdminProfile = function() {
    window.renderStudentProfile();
};


// =========================================================================
// PROGRAM MANAGEMENT REUSABLE CONSOLE
// =========================================================================

window.renderProgramManagement = async function(programName) {
    dynamicContentArea.innerHTML = `<div class="text-center" style="padding: 50px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i></div>`;

    try {
        // Load initial values (teachers, subjects, notices, timetables)
        const userRes = await fetch('/api/users');
        const userData = await userRes.json();
        const teachers = (userData.users || []).filter(u => u.role === 'teacher' && u.program === programName);

        const subRes = await fetch(`/api/subjects?program=${encodeURIComponent(programName)}`);
        const subData = await subRes.json();
        const subjects = subData.subjects || [];

        const noticeRes = await fetch(`/api/notices?program=${encodeURIComponent(programName)}`);
        const noticeData = await noticeRes.json();
        const notices = noticeData.notices || [];

        const ttRes = await fetch(`/api/timetables?program=${encodeURIComponent(programName)}`);
        const ttData = await ttRes.json();
        const ttRows = ttData.timetables || [];
        const ttMap = {};
        ttRows.forEach(r => {
            ttMap[r.day] = { slot_1: r.slot_1 || '', slot_2: r.slot_2 || '', slot_3: r.slot_3 || '', slot_4: r.slot_4 || '' };
        });

        // HTML Layout for Program tabs
        dynamicContentArea.innerHTML = `
            <div class="glass-card mb-24">
                <div class="card-header-flex mb-16" style="border-bottom: 1.5px solid var(--border-color); padding-bottom: 12px;">
                    <h3 class="card-title"><i class="fa-solid fa-graduation-cap mr-8"></i> ${programName} Console</h3>
                    <div class="tabs-group" style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary btn-sm active" id="btn-tab-teachers">Teachers</button>
                        <button class="btn btn-secondary btn-sm" id="btn-tab-timetable">Timetable</button>
                        <button class="btn btn-secondary btn-sm" id="btn-tab-subjects">Subjects</button>
                        <button class="btn btn-secondary btn-sm" id="btn-tab-notices">Notices</button>
                    </div>
                </div>

                <!-- TAB CONTENTS -->
                <div id="program-tab-content">
                    <!-- Dynamic -->
                </div>
            </div>
        `;

        // Render Teachers Tab
        function showTeachersTab() {
            let rowHTML = teachers.map(t => `
                <tr>
                    <td><strong>${t.id}</strong></td>
                    <td><strong>${t.username}</strong></td>
                    <td>${t.name}</td>
                    <td>${t.email || 'N/A'}</td>
                    <td>${t.phone || 'N/A'}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser(${t.id})" style="padding: 4px 8px; font-size: 11px;">Remove</button>
                    </td>
                </tr>
            `).join("");

            document.getElementById("program-tab-content").innerHTML = `
                <div class="card-header-flex mb-16">
                    <h4 style="margin: 0;">Assigned Faculty Instructors</h4>
                    <button class="btn btn-primary btn-sm" id="add-program-teacher-btn"><i class="fa-solid fa-user-plus mr-4"></i> Add Teacher</button>
                </div>
                <div class="table-responsive">
                    <table class="custom-table" style="font-size: 12px;">
                        <thead>
                            <tr>
                                <th>UID</th>
                                <th>Username</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowHTML.length > 0 ? rowHTML : `<tr><td colspan="6" style="color: var(--text-muted); padding: 16px; text-align: center;">No teachers assigned to this program.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            `;

            document.getElementById("add-program-teacher-btn").addEventListener("click", () => {
                generalModalTitle.textContent = `Register Teacher for ${programName}`;
                generalModalBody.innerHTML = `
                    <form id="add-prog-teacher-form" style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="form-grid">
                            <div>
                                <label>Username (Code)</label>
                                <input type="text" id="apt-username" class="form-control" placeholder="prof_jennifer" required autocomplete="off">
                            </div>
                            <div>
                                <label>Password</label>
                                <input type="password" id="apt-password" class="form-control" placeholder="••••••" required autocomplete="off">
                            </div>
                            <div>
                                <label>Full Name</label>
                                <input type="text" id="apt-name" class="form-control" placeholder="Dr. Jennifer Smith" required autocomplete="off">
                            </div>
                            <div>
                                <label>Gender</label>
                                <select id="apt-gender" class="form-control" required>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                </select>
                            </div>
                            <div>
                                <label>Email Address</label>
                                <input type="email" id="apt-email" class="form-control" placeholder="jennifer@tolani.edu" autocomplete="off">
                            </div>
                            <div>
                                <label>Contact Phone</label>
                                <input type="text" id="apt-phone" class="form-control" placeholder="+91 99988 88877" autocomplete="off">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
                            <i class="fa-solid fa-save mr-8"></i> Save Faculty Record
                        </button>
                    </form>
                `;
                generalModal.classList.add("active");

                document.getElementById("add-prog-teacher-form").addEventListener("submit", async (ev) => {
                    ev.preventDefault();
                    const username = document.getElementById("apt-username").value.trim();
                    const password = document.getElementById("apt-password").value;
                    const name = document.getElementById("apt-name").value.trim();
                    const gender = document.getElementById("apt-gender").value;
                    const email = document.getElementById("apt-email").value.trim();
                    const phone = document.getElementById("apt-phone").value.trim();

                    try {
                        const registerRes = await fetch('/api/users/add', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                username, password, name, email, phone, gender,
                                role: 'teacher',
                                program: programName,
                                division: 'All',
                                class_name: programName + ' Faculty',
                                department: 'Commerce Faculty'
                            })
                        });
                        const registerData = await registerRes.json();
                        if (registerData.success) {
                            alert(registerData.message);
                            generalModal.classList.remove("active");
                            window.renderProgramManagement(programName);
                        } else {
                            alert(registerData.error);
                        }
                    } catch (e) {
                        alert("Error saving teacher.");
                    }
                });
            });
        }

        // Render Timetable Tab
        function showTimetableTab() {
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            let rowHTML = days.map(day => {
                const s = ttMap[day] || { slot_1: '', slot_2: '', slot_3: '', slot_4: '' };
                return `
                    <tr>
                        <td><strong>${day}</strong></td>
                        <td><input type="text" class="form-control tt-input" data-day="${day}" data-slot="slot_1" value="${s.slot_1}" placeholder="Free Slot" style="font-size: 11px; padding: 4px; height: 28px;"></td>
                        <td><input type="text" class="form-control tt-input" data-day="${day}" data-slot="slot_2" value="${s.slot_2}" placeholder="Free Slot" style="font-size: 11px; padding: 4px; height: 28px;"></td>
                        <td><input type="text" class="form-control tt-input" data-day="${day}" data-slot="slot_3" value="${s.slot_3}" placeholder="Free Slot" style="font-size: 11px; padding: 4px; height: 28px;"></td>
                        <td><input type="text" class="form-control tt-input" data-day="${day}" data-slot="slot_4" value="${s.slot_4}" placeholder="Free Slot" style="font-size: 11px; padding: 4px; height: 28px;"></td>
                    </tr>
                `;
            }).join("");

            document.getElementById("program-tab-content").innerHTML = `
                <div class="card-header-flex mb-16">
                    <h4 style="margin: 0;">Weekly Lecture Schedule Registry</h4>
                    <button class="btn btn-primary btn-sm" id="save-program-timetable-btn"><i class="fa-solid fa-floppy-disk mr-4"></i> Save Timetable</button>
                </div>
                <div class="table-responsive">
                    <table class="custom-table text-center">
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Slot 1 (9:00-9:55)</th>
                                <th>Slot 2 (10:00-10:55)</th>
                                <th>Slot 3 (11:00-11:55)</th>
                                <th>Slot 4 (12:00-12:55)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowHTML}
                        </tbody>
                    </table>
                </div>
            `;

            document.getElementById("save-program-timetable-btn").addEventListener("click", async () => {
                const inputs = document.querySelectorAll(".tt-input");
                const gridData = {};

                days.forEach(d => {
                    gridData[d] = { program: programName, day: d, slot_1: '', slot_2: '', slot_3: '', slot_4: '' };
                });

                inputs.forEach(ip => {
                    const day = ip.dataset.day;
                    const slot = ip.dataset.slot;
                    gridData[day][slot] = ip.value.trim();
                });

                try {
                    let errors = 0;
                    for (const row of Object.values(gridData)) {
                        const response = await fetch('/api/timetables/save', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(row)
                        });
                        const resJSON = await response.json();
                        if (!resJSON.success) errors++;
                    }

                    if (errors === 0) {
                        alert("Weekly timetable saved successfully!");
                        window.renderProgramManagement(programName);
                    } else {
                        alert("Encountered errors while saving some slots.");
                    }
                } catch (e) {
                    alert("Failed to save timetable due to API error.");
                }
            });
        }

        // Render Subjects Tab
        function showSubjectsTab() {
            let rowHTML = subjects.map(s => `
                <tr>
                    <td><strong>${s.code}</strong></td>
                    <td>${s.name}</td>
                    <td>${s.year}</td>
                    <td>${s.semester}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" id="del-sub-${s.id}" style="padding: 4px 8px; font-size: 11px;">Delete</button>
                    </td>
                </tr>
            `).join("");

            document.getElementById("program-tab-content").innerHTML = `
                <div class="card-header-flex mb-16">
                    <h4 style="margin: 0;">Academic Subjects Curriculum</h4>
                    <button class="btn btn-primary btn-sm" id="add-program-subject-btn"><i class="fa-solid fa-plus mr-4"></i> Add Subject</button>
                </div>
                <div class="table-responsive" style="max-height: 380px; overflow-y: auto;">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Subject Code</th>
                                <th>Subject Name</th>
                                <th>Academic Year</th>
                                <th>Semester</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowHTML.length > 0 ? rowHTML : `<tr><td colspan="5" style="color: var(--text-muted); padding: 16px; text-align: center;">No subjects configured yet.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            `;

            // Add delete bindings
            subjects.forEach(s => {
                const dBtn = document.getElementById(`del-sub-${s.id}`);
                if (dBtn) {
                    dBtn.addEventListener("click", async () => {
                        if (!confirm(`Are you sure you want to delete ${s.name}?`)) return;
                        try {
                            const res = await fetch('/api/subjects/delete', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: s.id })
                            });
                            const delData = await res.json();
                            if (delData.success) {
                                alert(delData.message);
                                window.renderProgramManagement(programName);
                            }
                        } catch (e) {
                            alert("Failed to delete subject.");
                        }
                    });
                }
            });

            document.getElementById("add-program-subject-btn").addEventListener("click", () => {
                generalModalTitle.textContent = `Add Subject to ${programName}`;
                generalModalBody.innerHTML = `
                    <form id="add-prog-subject-form" style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="form-group">
                            <label>Subject Name</label>
                            <input type="text" id="aps-name" class="form-control" placeholder="Advanced Cost Accounting" required>
                        </div>
                        <div class="form-group">
                            <label>Subject Code</label>
                            <input type="text" id="aps-code" class="form-control" placeholder="BC-105" required>
                        </div>
                        <div class="form-grid">
                            <div>
                                <label>Year</label>
                                <select id="aps-year" class="form-control">
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                </select>
                            </div>
                            <div>
                                <label>Semester</label>
                                <select id="aps-semester" class="form-control">
                                    <option value="Semester 1">Semester 1</option>
                                    <option value="Semester 2">Semester 2</option>
                                    <option value="Semester 3">Semester 3</option>
                                    <option value="Semester 4">Semester 4</option>
                                    <option value="Semester 5">Semester 5</option>
                                    <option value="Semester 6">Semester 6</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
                            <i class="fa-solid fa-save mr-8"></i> Add Curriculum Subject
                        </button>
                    </form>
                `;
                generalModal.classList.add("active");

                document.getElementById("add-prog-subject-form").addEventListener("submit", async (ev) => {
                    ev.preventDefault();
                    const name = document.getElementById("aps-name").value.trim();
                    const code = document.getElementById("aps-code").value.trim();
                    const year = document.getElementById("aps-year").value;
                    const semester = document.getElementById("aps-semester").value;

                    try {
                        const response = await fetch('/api/subjects/add', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, code, program: programName, year, semester })
                        });
                        const resData = await response.json();
                        if (resData.success) {
                            alert(resData.message);
                            generalModal.classList.remove("active");
                            window.renderProgramManagement(programName);
                        } else {
                            alert(resData.error);
                        }
                    } catch (e) {
                        alert("Error adding subject.");
                    }
                });
            });
        }

        // Render Notices Tab
        function showNoticesTab() {
            let rowHTML = notices.map(n => `
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; margin-bottom: 12px; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
                        <div>
                            <strong style="color: var(--text-main); font-size: 14px;">${n.title}</strong>
                            <span style="font-size: 10px; color: var(--text-muted); margin-left: 8px;">(${new Date(n.created_at).toLocaleString()})</span>
                        </div>
                        <button class="btn btn-danger btn-sm" id="del-notice-${n.id}" style="padding: 2px 6px; font-size: 10px; height: 22px;">Delete</button>
                    </div>
                    <p style="color: var(--text-muted); font-size: 12px; margin: 0; line-height: 1.4;">${n.content}</p>
                </div>
            `).join("");

            document.getElementById("program-tab-content").innerHTML = `
                <div class="card-header-flex mb-16">
                    <h4 style="margin: 0;">Published Notices & Circulars</h4>
                    <button class="btn btn-primary btn-sm" id="add-program-notice-btn"><i class="fa-solid fa-plus mr-4"></i> Post Notice</button>
                </div>
                <div style="max-height: 380px; overflow-y: auto; padding-right: 4px;">
                    ${rowHTML.length > 0 ? rowHTML : `<p style="color: var(--text-muted); padding: 16px; text-align: center;">No notices published yet.</p>`}
                </div>
            `;

            // Delete notices
            notices.forEach(n => {
                const dBtn = document.getElementById(`del-notice-${n.id}`);
                if (dBtn) {
                    dBtn.addEventListener("click", async () => {
                        if (!confirm("Are you sure you want to delete this announcement?")) return;
                        try {
                            const res = await fetch('/api/notices/delete', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: n.id })
                            });
                            const delData = await res.json();
                            if (delData.success) {
                                alert(delData.message);
                                window.renderProgramManagement(programName);
                            }
                        } catch (e) {
                            alert("Failed to delete notice.");
                        }
                    });
                }
            });

            document.getElementById("add-program-notice-btn").addEventListener("click", () => {
                generalModalTitle.textContent = `Post Notice for ${programName}`;
                generalModalBody.innerHTML = `
                    <form id="add-prog-notice-form" style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="form-group">
                            <label>Notice Title</label>
                            <input type="text" id="apn-title" class="form-control" placeholder="Mid-Semester Timetable Update" required>
                        </div>
                        <div class="form-group">
                            <label>Notice Content</label>
                            <textarea id="apn-content" class="form-control" rows="5" placeholder="Write notice details here..." required style="background: rgba(0, 0, 0, 0.2); border: 1px solid var(--border-color); color: var(--text-main); font-family: inherit; font-size: 13px; padding: 8px; border-radius: 6px;"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Broadcast Scope</label>
                            <select id="apn-scope" class="form-control">
                                <option value="${programName}">${programName} Students</option>
                                <option value="All">All College Students</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
                            <i class="fa-solid fa-bullhorn mr-8"></i> Publish Announcement
                        </button>
                    </form>
                `;
                generalModal.classList.add("active");

                document.getElementById("add-prog-notice-form").addEventListener("submit", async (ev) => {
                    ev.preventDefault();
                    const title = document.getElementById("apn-title").value.trim();
                    const content = document.getElementById("apn-content").value.trim();
                    const scope = document.getElementById("apn-scope").value;

                    try {
                        const response = await fetch('/api/notices/add', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title, content, program: scope })
                        });
                        const resData = await response.json();
                        if (resData.success) {
                            alert(resData.message);
                            generalModal.classList.remove("active");
                            window.renderProgramManagement(programName);
                        } else {
                            alert(resData.error);
                        }
                    } catch (e) {
                        alert("Error posting notice.");
                    }
                });
            });
        }

        // Tab selection events
        const tBtn = document.getElementById("btn-tab-teachers");
        const ttBtn = document.getElementById("btn-tab-timetable");
        const subBtn = document.getElementById("btn-tab-subjects");
        const nBtn = document.getElementById("btn-tab-notices");

        const clearTabs = () => {
            [tBtn, ttBtn, subBtn, nBtn].forEach(b => b.classList.remove("active"));
        };

        tBtn.addEventListener("click", () => { clearTabs(); tBtn.classList.add("active"); showTeachersTab(); });
        ttBtn.addEventListener("click", () => { clearTabs(); ttBtn.classList.add("active"); showTimetableTab(); });
        subBtn.addEventListener("click", () => { clearTabs(); subBtn.classList.add("active"); showSubjectsTab(); });
        nBtn.addEventListener("click", () => { clearTabs(); nBtn.classList.add("active"); showNoticesTab(); });

        // Default open Teachers tab
        showTeachersTab();

    } catch (e) {
        console.error(e);
        dynamicContentArea.innerHTML = `<div class="glass-card text-center"><p style="color: var(--danger);">Failed to load program details.</p></div>`;
    }
};

// Admin Program Management Routing Wrappers
window.renderAdminBcom = function() {
    window.renderProgramManagement("B.Com (Regular)");
};

window.renderAdminBcompro = function() {
    window.renderProgramManagement("B.Com (Professional)");
};

window.renderAdminMcom = function() {
    window.renderProgramManagement("M.Com");
};

// PostgreSQL terminal commands
window.renderAdminDatabase = function() {
    dynamicContentArea.innerHTML = `
        <div class="glass-card mb-16" style="background: rgba(15,23,42,0.9); border: 1.5px solid var(--accent); padding: 24px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <span style="font-size: 24px; color: var(--accent);"><i class="fa-solid fa-terminal"></i></span>
                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #10b981;">Database Query CLI Terminal</h3>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
                Direct client interface to college SQL schema. Supports <code>SELECT</code>, <code>UPDATE</code>, and <code>DELETE</code> statements.
            </p>
            <div id="postgres-history" style="background: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 12px; height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px; color: #10b981; margin-bottom: 12px; white-space: pre-wrap;">sqlite3=# -- Connected to SQLite database.db
sqlite3=# SELECT id, name, role, program FROM users LIMIT 3;
id | name | role | program
1 | Admin Principal | admin | B.Com (Regular)
2 | Prof. Sarah Jenkins | teacher | B.Com (Regular)
3 | AADITYA HIMMATLAL BALDANIYA | student | B.Com (Regular)
(3 rows)</div>
            <form id="postgres-query-form" style="display: flex; gap: 8px;">
                <span style="font-family: monospace; font-size: 13px; color: #10b981; align-self: center;">sqlite3=#</span>
                <input type="text" id="postgres-query-input" class="form-control" placeholder="SELECT * FROM users WHERE division = 'A' LIMIT 5;" style="background: #020617; color: #10b981; font-family: monospace; border: 1px solid #334155; padding-left: 12px; flex-grow: 1;" autocomplete="off" required>
                <button type="submit" class="btn btn-primary" style="background: #10b981; border-color: #10b981; color: #020617; font-weight: bold; width: 100px;">Execute</button>
            </form>
        </div>
        <div class="glass-card">
            <h4 class="mb-12">Database Schema Guidelines</h4>
            <ul style="color: var(--text-muted); font-size: 12px; line-height: 1.6; padding-left: 20px;">
                <li>Main tables: <code>users</code>, <code>attendance_sessions</code>, <code>attendance_records</code>, <code>settings</code>, <code>subjects</code>, <code>timetables</code>, <code>notices</code>, <code>daily_lectures</code>.</li>
                <li>Make sure to use correct columns names when running manual queries.</li>
            </ul>
        </div>
    `;

    const pgForm = document.getElementById("postgres-query-form");
    const pgInput = document.getElementById("postgres-query-input");
    const pgHistory = document.getElementById("postgres-history");

    if (pgForm) {
        pgForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const query = pgInput.value.trim();
            if (!query) return;

            pgInput.value = "";
            pgHistory.textContent += `\nsqlite3=# ${query}`;
            pgHistory.scrollTop = pgHistory.scrollHeight;

            try {
                const res = await fetch('/api/sql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                });
                const data = await res.json();
                pgHistory.textContent += `\n${data.result || 'No output'}`;
                pgHistory.scrollTop = pgHistory.scrollHeight;
            } catch (err) {
                pgHistory.textContent += `\nERROR: Failed to connect to server.`;
                pgHistory.scrollTop = pgHistory.scrollHeight;
            }
        });
    }
};
