// ==========================================
// EduSphere College Management Portal - Core Client SPA
// ==========================================

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
    // Basic loader inside submit button
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
        { id: "students", label: "User Registry", icon: "fa-users" },
        { id: "timetable", label: "Class Timetable", icon: "fa-calendar" },
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
    // Clear any active polling interval when switching views
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

        dynamicContentArea.innerHTML = `
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
                        <span style="color: var(--text-muted); font-size: 12px; display: block;">SPID</span>
                        <strong style="font-size: 16px;">${currentUser.password}</strong>
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
        `;
    } catch (err) {
        console.error(err);
        dynamicContentArea.innerHTML = `<div class="glass-card text-center"><p style="color: var(--danger);">Failed to load dashboard statistics.</p></div>`;
    }
};

window.renderStudentTimetable = function() {
    dynamicContentArea.innerHTML = `
        <div class="glass-card">
            <div class="card-header-flex mb-16">
                <h3 class="card-title">Class Timetable - Division ${currentUser.division}</h3>
                <span class="attendance-status-pill status-active"><i class="fa-solid fa-clock"></i> Mon - Sat Schedule</span>
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
                        <tr>
                            <td><strong>Monday</strong></td>
                            <td>DSC503A<br><small>Dr. Thapa</small></td>
                            <td>MIC501D<br><small>Prof. M. G.</small></td>
                            <td>DSC502A<br><small>Dr. R. K.</small></td>
                            <td>DSC501A<br><small>Prof. Mehta</small></td>
                        </tr>
                        <tr>
                            <td><strong>Tuesday</strong></td>
                            <td>DSC503A<br><small>Dr. Thapa</small></td>
                            <td>MIC501D<br><small>Prof. M. G.</small></td>
                            <td>DSC501A<br><small>Prof. Mehta</small></td>
                            <td>SEC501A<br><small>Prof. J. R.</small></td>
                        </tr>
                        <tr>
                            <td><strong>Wednesday</strong></td>
                            <td>DSC502A<br><small>Dr. R. K.</small></td>
                            <td>MIC501D<br><small>Prof. M. G.</small></td>
                            <td>SEC501A<br><small>Prof. J. R.</small></td>
                            <td>DSC503A<br><small>Dr. Thapa</small></td>
                        </tr>
                        <tr>
                            <td><strong>Thursday</strong></td>
                            <td>DSC503A<br><small>Dr. Thapa</small></td>
                            <td>MIC501D<br><small>Prof. M. G.</small></td>
                            <td>DSC501A<br><small>Prof. Mehta</small></td>
                            <td style="color: var(--text-muted);">Free Slot</td>
                        </tr>
                        <tr>
                            <td><strong>Friday</strong></td>
                            <td>MIC501D<br><small>Prof. M. G.</small></td>
                            <td>DSC501A<br><small>Prof. Mehta</small></td>
                            <td>M501D<br><small>Prof. M. G.</small></td>
                            <td>DSC502A<br><small>Dr. R. K.</small></td>
                        </tr>
                        <tr>
                            <td><strong>Saturday</strong></td>
                            <td>MIC501D<br><small>Prof. M. G.</small></td>
                            <td>DSC502A<br><small>Dr. R. K.</small></td>
                            <td>M501D<br><small>Prof. M. G.</small></td>
                            <td style="color: var(--text-muted);">Free Slot</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

window.renderStudentAttendance = async function() {
    dynamicContentArea.innerHTML = `<div class="text-center" style="padding: 50px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i></div>`;
    
    try {
        const res = await fetch(`/api/attendance/student/${currentUser.id}/history`);
        const data = await res.json();
        const history = data.records || [];

        let tableRows = history.map(r => `
            <tr>
                <td>${r.subject}</td>
                <td>${r.class_name}</td>
                <td><code>${r.code}</code></td>
                <td>${new Date(r.marked_at).toLocaleString()}</td>
                <td><span class="attendance-status-pill status-active"><i class="fa-solid fa-circle-check"></i> Present</span></td>
            </tr>
        `).join("");

        if (history.length === 0) {
            tableRows = `<tr><td colspan="5" class="text-center" style="color: var(--text-muted); padding: 20px;">No attendance logs found. Enter code above to check in.</td></tr>`;
        }

        dynamicContentArea.innerHTML = `
            <div class="glass-card mb-24" style="border: 1.5px solid var(--primary);">
                <h3 class="card-title text-center mb-16"><i class="fa-solid fa-circle-dot mr-8" style="color: var(--accent);"></i> Dynamic Check-in Portal</h3>
                <p class="text-center" style="color: var(--text-muted); margin-bottom: 20px; font-size: 13.5px;">
                    Enter the 6-digit active attendance code shared by your teacher to register your presence.
                </p>
                <form id="checkin-code-form" style="display: flex; flex-direction: column; gap: 16px; align-items: center; max-width: 360px; margin: 0 auto;">
                    <div class="form-group" style="width: 100%; text-align: center;">
                        <input type="text" id="checkin-code-input" class="form-control attendance-input-large" placeholder="••••••" maxlength="6" pattern="\\d{6}" required autocomplete="off">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        <i class="fa-solid fa-check-to-slot mr-8"></i>
                        <span>Register Presence</span>
                    </button>
                </form>
            </div>

            <div class="glass-card">
                <h3 class="card-title mb-16"><i class="fa-solid fa-clock-rotate-left mr-8"></i> Personal Check-in Logs</h3>
                <div class="table-responsive">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Class</th>
                                <th>Session Code</th>
                                <th>Marked Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Handle check-in form submission
        const checkinForm = document.getElementById("checkin-code-form");
        checkinForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const code = document.getElementById("checkin-code-input").value.trim();
            if (code.length !== 6) {
                alert("Please enter a valid 6-digit number.");
                return;
            }

            try {
                const submitRes = await fetch('/api/attendance/check-in', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, student_id: currentUser.id })
                });
                const submitData = await submitRes.json();

                if (submitData.success) {
                    alert(submitData.message);
                    window.renderStudentAttendance(); // Refresh page list
                } else {
                    alert(submitData.error || "Failed to register presence.");
                }
            } catch (err) {
                console.error(err);
                alert("Network error. Please try again.");
            }
        });

    } catch (err) {
        console.error(err);
        dynamicContentArea.innerHTML = `<div class="glass-card text-center"><p style="color: var(--danger);">Failed to load check-in portal.</p></div>`;
    }
};

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
                    <button class="btn btn-primary" onclick="openPaymentModal(${currentUser.fee_due})" style="max-width: 280px; margin: 0 auto; display: flex;">
                        <i class="fa-solid fa-credit-card mr-8"></i>
                        <span>Pay Outstanding Fees</span>
                    </button>
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
        
        // Mock success database update
        alert("Payment Simulated Successfully! Outstanding balance cleared.");
        feeModal.classList.remove("active");
        
        currentUser.fee_paid = currentUser.fee_total;
        currentUser.fee_due = 0;
        localStorage.setItem("es_current_user", JSON.stringify(currentUser));
        
        // Update user on database via raw SQL simulation
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

window.renderTeacherDashboard = function() {
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
                    <span class="stat-title">Assigned Major</span>
                    <div class="stat-icon" style="background: rgba(20, 184, 166, 0.1); color: var(--accent);"><i class="fa-solid fa-book"></i></div>
                </div>
                <div class="stat-value" style="font-size: 20px; line-height: 38px;">${currentUser.subject || 'Statistics'}</div>
                <div class="stat-desc">Tolani Commerce Faculty</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Department</span>
                    <div class="stat-icon" style="background: rgba(168,85,247,0.1); color: var(--secondary);"><i class="fa-solid fa-building-columns"></i></div>
                </div>
                <div class="stat-value" style="font-size: 20px; line-height: 38px;">${currentUser.department}</div>
                <div class="stat-desc">Commerce & Accountancy</div>
            </div>
        </div>

        <div class="glass-card">
            <h3 class="card-title mb-16"><i class="fa-solid fa-chalkboard-user mr-8"></i> Quick Actions</h3>
            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="navigateTo('schedule')" style="flex-grow: 1; max-width: 250px;">
                    <i class="fa-solid fa-clock-pulse"></i>
                    <span>Generate Check-in Code</span>
                </button>
                <button class="btn btn-secondary" onclick="navigateTo('students')" style="flex-grow: 1; max-width: 250px;">
                    <i class="fa-solid fa-users"></i>
                    <span>Browse Student List</span>
                </button>
            </div>
        </div>
    `;
};

window.renderTeacherStudents = async function() {
    dynamicContentArea.innerHTML = `<div class="text-center" style="padding: 50px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i></div>`;
    
    try {
        const res = await fetch('/api/users');
        const data = await res.json();
        const students = (data.users || []).filter(u => u.role === 'student');

        let tableRows = students.map(s => `
            <tr>
                <td><strong>${s.username}</strong></td>
                <td>${s.name}</td>
                <td>${s.email || 'N/A'}</td>
                <td>Division ${s.division}</td>
                <td>${s.class}</td>
                <td><span class="attendance-status-pill status-active">${s.department}</span></td>
            </tr>
        `).join("");

        dynamicContentArea.innerHTML = `
            <div class="glass-card">
                <div class="card-header-flex mb-16">
                    <h3 class="card-title">Student Registry (Roster List)</h3>
                    <span style="font-size: 13px; color: var(--text-muted);">${students.length} students enrolled</span>
                </div>
                
                <div class="table-responsive" style="max-height: 480px; overflow-y: auto;">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Roll Number</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Division</th>
                                <th>Class</th>
                                <th>Major Subject</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
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
                            <td style="color: var(--text-muted);">Free</td>
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
                    <label for="att-class">Class Name</label>
                    <select id="att-class" class="form-control">
                        <option value="B.Com. Sem-I">B.Com. Sem-I</option>
                        <option value="B.Com. Sem-III">B.Com. Sem-III</option>
                        <option value="B.Com. Sem-V">B.Com. Sem-V</option>
                    </select>
                </div>
                <div>
                    <label for="att-subject">Subject</label>
                    <select id="att-subject" class="form-control">
                        <option value="Statistics">Statistics</option>
                        <option value="Business Administration">Business Administration</option>
                        <option value="Business Management">Business Management</option>
                        <option value="Computer Science">Computer Science</option>
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
                        <option value="All">All Divisions</option>
                    </select>
                </div>
                <div>
                    <label for="att-duration">Expiration Time (Minutes)</label>
                    <select id="att-duration" class="form-control">
                        <option value="5">5 minutes</option>
                        <option value="10" selected>10 minutes</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">60 minutes</option>
                    </select>
                </div>
                <div class="form-grid-full text-center" style="margin-top: 10px;">
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
                <button class="btn btn-danger btn-sm" id="close-session-btn" style="padding: 6px 12px;"><i class="fa-solid fa-power-off"></i> Close Session Early</button>
            </div>

            <div class="attendance-code-container">
                <span class="attendance-status-pill status-active" id="active-session-label"><i class="fa-solid fa-spinner fa-spin"></i> SESSION ACTIVE</span>
                <div class="attendance-code-number" id="active-code-display">000000</div>
                <p style="color: var(--text-muted); font-size: 13px;" id="active-session-desc">
                    Show this code on the classroom projector screen. Students enter it in their dashboard.
                </p>
                <div style="font-size: 12px; margin-top: 8px; color: var(--accent);" id="active-session-timer">Expires at: --:--</div>
            </div>

            <h4 class="mb-12"><i class="fa-solid fa-users-viewfinder mr-8"></i> Checked-in Students (<span id="checked-in-count">0</span>)</h4>
            <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>Roll Number</th>
                            <th>Student Name</th>
                            <th>Division</th>
                            <th>Check-in Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="checked-in-list-body">
                        <tr><td colspan="5" class="text-center" style="color: var(--text-muted); padding: 15px;">Waiting for students to check in...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const genForm = document.getElementById("attendance-gen-form");
    if (genForm) {
        genForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const class_name = document.getElementById("att-class").value;
            const subject = document.getElementById("att-subject").value;
            const division = document.getElementById("att-division").value;
            const duration_minutes = parseInt(document.getElementById("att-duration").value);

            try {
                const res = await fetch('/api/attendance/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        creator_id: currentUser.id,
                        class_name,
                        subject,
                        division,
                        duration_minutes
                    })
                });
                const data = await res.json();

                if (data.success) {
                    // Hide form and display active session widget
                    document.getElementById("code-generation-form-card").style.display = "none";
                    const displayCard = document.getElementById("code-active-display-card");
                    displayCard.style.display = "block";
                    
                    activeSessionCode = data.session.code;
                    document.getElementById("active-code-display").textContent = activeSessionCode;
                    document.getElementById("active-session-label").innerHTML = `<i class="fa-solid fa-circle-dot fa-fade"></i> ACTIVE | ${data.session.subject} (${data.session.division})`;
                    
                    const expiryDate = new Date(data.session.expires_at);
                    document.getElementById("active-session-timer").textContent = `Expires at: ${expiryDate.toLocaleTimeString()}`;

                    // Start Polling checked-in student list every 3 seconds
                    startAttendancePolling(activeSessionCode);
                } else {
                    alert(data.error || "Failed to create session.");
                }
            } catch (err) {
                console.error(err);
                alert("Server connection error.");
            }
        });
    }
};

window.renderTeacherProfile = function() {
    dynamicContentArea.innerHTML = `
        <div class="glass-card">
            <h3 class="card-title mb-16"><i class="fa-solid fa-user-tie mr-8"></i> Faculty Profile</h3>
            <div class="form-grid mb-24">
                <div>
                    <label>Instructor Name</label>
                    <input type="text" class="form-control" value="${currentUser.name}" disabled>
                </div>
                <div>
                    <label>Faculty ID (Username)</label>
                    <input type="text" class="form-control" value="${currentUser.username}" disabled>
                </div>
                <div>
                    <label>Email Address</label>
                    <input type="text" class="form-control" value="${currentUser.email || 'N/A'}" disabled>
                </div>
                <div>
                    <label>Office Number</label>
                    <input type="text" class="form-control" value="${currentUser.office || 'N/A'}" disabled>
                </div>
            </div>
            <p style="font-size: 12px; color: var(--text-muted);"><i class="fa-solid fa-info-circle"></i> To alter faculty details, contact your IT Administrator console.</p>
        </div>
    `;
};


// Helper: Start short polling for checked-in records
function startAttendancePolling(code) {
    if (activeSessionPollingInterval) clearInterval(activeSessionPollingInterval);
    
    // Immediate first call
    pollRecords(code);
    
    activeSessionPollingInterval = setInterval(() => {
        pollRecords(code);
    }, 3000);

    const closeBtn = document.getElementById("close-session-btn");
    if (closeBtn) {
        closeBtn.onclick = async () => {
            if (!confirm("Are you sure you want to close this attendance session? Students will no longer be able to check in.")) {
                return;
            }
            try {
                const res = await fetch('/api/attendance/close', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });
                const data = await res.json();
                if (data.success) {
                    clearInterval(activeSessionPollingInterval);
                    activeSessionPollingInterval = null;
                    activeSessionCode = null;
                    alert("Session closed successfully.");
                    // Return back to configuration panel
                    navigateTo("schedule");
                }
            } catch (err) {
                console.error(err);
                alert("Failed to close session.");
            }
        };
    }
}

async function pollRecords(code) {
    try {
        const res = await fetch(`/api/attendance/session/${code}/records`);
        const data = await res.json();
        
        if (data.success) {
            const listBody = document.getElementById("checked-in-list-body");
            const countDisplay = document.getElementById("checked-in-count");
            
            countDisplay.textContent = data.records.length;
            
            // Check if active session expired in backend
            const now = new Date();
            const expires = new Date(data.session.expires_at);
            if (expires < now || data.session.is_active === 0) {
                document.getElementById("active-session-label").className = "attendance-status-pill status-closed";
                document.getElementById("active-session-label").innerHTML = `<i class="fa-solid fa-circle-xmark"></i> EXPIRED / CLOSED`;
                document.getElementById("active-code-display").style.color = "var(--text-muted)";
                document.getElementById("active-code-display").style.textShadow = "none";
                document.getElementById("active-code-display").style.animation = "none";
                clearInterval(activeSessionPollingInterval);
                activeSessionPollingInterval = null;
            }

            if (data.records.length === 0) {
                listBody.innerHTML = `<tr><td colspan="5" class="text-center" style="color: var(--text-muted); padding: 15px;">Waiting for students to check in...</td></tr>`;
                return;
            }
            
            listBody.innerHTML = data.records.map(r => `
                <tr>
                    <td><strong>${r.roll_no}</strong></td>
                    <td>${r.name}</td>
                    <td>Division ${r.division}</td>
                    <td>${new Date(r.marked_at).toLocaleTimeString()}</td>
                    <td><span class="attendance-status-pill status-active"><i class="fa-solid fa-check"></i> Checked-in</span></td>
                </tr>
            `).join("");
        }
    } catch (err) {
        console.error("Polling error:", err);
    }
}


// =========================================================================
// ADMIN PORTAL MODULES
// =========================================================================

window.renderAdminDashboard = async function() {
    dynamicContentArea.innerHTML = `<div class="text-center" style="padding: 50px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i></div>`;
    
    try {
        const res = await fetch('/api/users');
        const data = await res.json();
        const users = data.users || [];
        const studentCount = users.filter(u => u.role === 'student').length;
        const teacherCount = users.filter(u => u.role === 'teacher').length;

        dynamicContentArea.innerHTML = `
            <div class="stats-grid mb-24">
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Total Enrolled Students</span>
                        <div class="stat-icon" style="background: rgba(20, 184, 166, 0.1); color: var(--accent);"><i class="fa-solid fa-graduation-cap"></i></div>
                    </div>
                    <div class="stat-value">${studentCount}</div>
                    <div class="stat-desc">B.Com Sem-I NEP Roster</div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Faculty Instructors</span>
                        <div class="stat-icon" style="background: rgba(99, 102, 241, 0.1); color: var(--primary);"><i class="fa-solid fa-user-tie"></i></div>
                    </div>
                    <div class="stat-value">${teacherCount}</div>
                    <div class="stat-desc">Department of Accountancy</div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Database System</span>
                        <div class="stat-icon" style="background: rgba(168, 85, 247, 0.1); color: var(--secondary);"><i class="fa-solid fa-server"></i></div>
                    </div>
                    <div class="stat-value" style="font-size: 22px; line-height: 38px;">SQLite 3</div>
                    <div class="stat-desc">tcc_nep_db schema active</div>
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
                        <span>PostgreSQL Emulator</span>
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

        let tableRows = users.map(u => `
            <tr>
                <td><strong>${u.id}</strong></td>
                <td><strong>${u.username}</strong></td>
                <td>${u.name}</td>
                <td><span class="attendance-status-pill ${u.role === 'admin' ? 'status-active' : (u.role === 'teacher' ? 'status-active' : 'status-active')}" style="background: ${u.role === 'admin' ? 'rgba(168,85,247,0.1)' : (u.role === 'teacher' ? 'rgba(99,102,241,0.1)' : 'rgba(20,184,166,0.1)')}; color: ${u.role === 'admin' ? 'var(--secondary)' : (u.role === 'teacher' ? 'var(--primary)' : 'var(--accent)')};">${u.role.toUpperCase()}</span></td>
                <td>${u.email || 'N/A'}</td>
                <td>Division ${u.division || 'N/A'}</td>
                <td>${u.class || 'N/A'}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditUserModal(${JSON.stringify(u).replace(/"/g, '&quot;')})" style="padding: 4px 8px; font-size: 11px;">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})" style="padding: 4px 8px; font-size: 11px;">Delete</button>
                </td>
            </tr>
        `).join("");

        dynamicContentArea.innerHTML = `
            <div class="glass-card">
                <div class="card-header-flex mb-16">
                    <h3 class="card-title">User Registry Console</h3>
                    <button class="btn btn-primary btn-sm" onclick="openAddUserModal()"><i class="fa-solid fa-user-plus"></i> Add New User</button>
                </div>
                
                <div class="table-responsive" style="max-height: 450px; overflow-y: auto;">
                    <table class="custom-table" style="font-size: 12px;">
                        <thead>
                            <tr>
                                <th>UID</th>
                                <th>Username / Roll No</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Email</th>
                                <th>Division</th>
                                <th>Class</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
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
                    </select>
                </div>
                <div>
                    <label>Class Year</label>
                    <input type="text" id="add-user-class" class="form-control" placeholder="B.Com. Sem-I" value="B.Com. Sem-I" autocomplete="off">
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
        const role = document.getElementById("add-user-role").value;
        const email = document.getElementById("add-user-email").value.trim();
        const phone = document.getElementById("add-user-phone").value.trim();
        const division = document.getElementById("add-user-division").value;
        const class_name = document.getElementById("add-user-class").value.trim();

        try {
            const res = await fetch('/api/users/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role, name, email, phone, division, class_name })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                generalModal.classList.remove("active");
                window.renderAdminStudents();
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert("Network connection error.");
        }
    });
};

window.openEditUserModal = function(user) {
    generalModalTitle.textContent = `Edit User: ${user.name}`;
    generalModalBody.innerHTML = `
        <form id="edit-user-form" style="display: flex; flex-direction: column; gap: 16px;">
            <input type="hidden" id="edit-user-id" value="${user.id}">
            <div class="form-grid">
                <div>
                    <label>Full Name</label>
                    <input type="text" id="edit-user-name" class="form-control" value="${user.name}" required autocomplete="off">
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
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
                <i class="fa-solid fa-save mr-8"></i>
                <span>Update Record</span>
            </button>
        </form>
    `;

    generalModal.classList.add("active");

    const editForm = document.getElementById("edit-user-form");
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("edit-user-id").value;
        const name = document.getElementById("edit-user-name").value.trim();
        const email = document.getElementById("edit-user-email").value.trim();
        const phone = document.getElementById("edit-user-phone").value.trim();
        const division = document.getElementById("edit-user-division").value;
        const class_name = document.getElementById("edit-user-class").value.trim();
        const department = document.getElementById("edit-user-dept").value.trim();

        try {
            const res = await fetch('/api/users/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, email, phone, division, class_name, department })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                generalModal.classList.remove("active");
                window.renderAdminStudents();
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert("Network connection error.");
        }
    });
};

window.deleteUser = async function(id) {
    if (!confirm("Are you sure you want to permanently delete this user record from the database?")) {
        return;
    }

    try {
        const res = await fetch('/api/users/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            window.renderAdminStudents();
        } else {
            alert(data.error);
        }
    } catch (e) {
        alert("Failed to connect to the database.");
    }
};

window.renderAdminTimetable = function() {
    // Reuse faculty timetable view for admin overview
    window.renderTeacherTimetable();
};

window.renderAdminSchedule = function() {
    // Admins can also configure attendance codes
    window.renderTeacherSchedule();
};

window.renderAdminProfile = function() {
    dynamicContentArea.innerHTML = `
        <div class="glass-card">
            <h3 class="card-title mb-16"><i class="fa-solid fa-lock mr-8"></i> Security Credentials</h3>
            <div class="form-grid mb-24">
                <div>
                    <label>Administrator ID</label>
                    <input type="text" class="form-control" value="${currentUser.username}" disabled>
                </div>
                <div>
                    <label>Department</label>
                    <input type="text" class="form-control" value="${currentUser.department}" disabled>
                </div>
                <div>
                    <label>Console Access Authority</label>
                    <input type="text" class="form-control" value="ROOT_ADMINISTRATOR" disabled style="border-color: var(--secondary);">
                </div>
            </div>
            <p style="font-size: 11px; color: var(--text-muted);"><i class="fa-solid fa-triangle-exclamation"></i> Security Warning: Keep administrator passwords safe. Root database mutations can corrupt production schemas.</p>
        </div>
    `;
};

window.renderAdminFees = function() {
    dynamicContentArea.innerHTML = `
        <div class="glass-card">
            <h3 class="card-title mb-16"><i class="fa-solid fa-wallet mr-8"></i> Course Fees Setup (B.Com NEP Roster)</h3>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">
                Configure the baseline semester tuition fee rates. Saving applies this baseline structure to any new student registrations.
            </p>
            <div class="form-grid mb-24" style="max-width: 480px;">
                <div>
                    <label>Semester Baseline Tuition Fee (INR)</label>
                    <input type="number" class="form-control" value="6200" id="fee-baseline-amt" required>
                </div>
                <div>
                    <label>Late Application Penalty Rate</label>
                    <input type="number" class="form-control" value="150" id="fee-penalty-amt" required>
                </div>
            </div>
            <button class="btn btn-primary" onclick="alert('Fee configuration saved successfully!')" style="max-width: 200px;">Save Configuration</button>
        </div>
    `;
};

// PostgreSQL Terminal Command Console (Admin view)
window.renderAdminDatabase = function() {
    dynamicContentArea.innerHTML = `
        <div class="glass-card mb-16" style="background: rgba(15,23,42,0.9); border: 1.5px solid var(--accent); padding: 24px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <span style="font-size: 24px; color: var(--accent);"><i class="fa-solid fa-terminal"></i></span>
                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #10b981;">PostgreSQL Command Terminal (SQLite SQL Bridge)</h3>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
                Direct client interface to college SQL schema. Supports <code>SELECT</code>, <code>UPDATE</code>, and <code>DELETE</code>.
            </p>
            <div id="postgres-history" style="background: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 12px; height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px; color: #10b981; margin-bottom: 12px; white-space: pre-wrap;">postgres=# -- Connected to PostgreSQL emulator tcc_nep_db
postgres=# SELECT id, name, role FROM users LIMIT 3;
id | name | role
1 | Admin Principal | admin
2 | Prof. Sarah Jenkins | teacher
3 | AADITYA HIMMATLAL BALDANIYA | student
(3 rows)</div>
            <form id="postgres-query-form" style="display: flex; gap: 8px;">
                <span style="font-family: monospace; font-size: 13px; color: #10b981; align-self: center;">postgres=#</span>
                <input type="text" id="postgres-query-input" class="form-control" placeholder="SELECT * FROM users WHERE division = 'A' LIMIT 5;" style="background: #020617; color: #10b981; font-family: monospace; border: 1px solid #334155; padding-left: 12px; flex-grow: 1;" autocomplete="off" required>
                <button type="submit" class="btn btn-primary" style="background: #10b981; border-color: #10b981; color: #020617; font-weight: bold; width: 100px;">Execute</button>
            </form>
        </div>
    `;

    const sqlForm = document.getElementById("postgres-query-form");
    const sqlHistory = document.getElementById("postgres-history");
    const sqlInput = document.getElementById("postgres-query-input");

    sqlForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const query = sqlInput.value.trim();
        if (!query) return;

        try {
            const res = await fetch('/api/sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            const data = await res.json();

            sqlHistory.textContent += `\n\npostgres=# ${query}\n${data.result}`;
            sqlHistory.scrollTop = sqlHistory.scrollHeight;
            sqlInput.value = "";
        } catch (err) {
            sqlHistory.textContent += `\n\npostgres=# ${query}\nERROR: Network failed to execute.`;
            sqlHistory.scrollTop = sqlHistory.scrollHeight;
        }
    });
};
