// ==========================================
// EduSphere College Management Portal - Core Logic
// ==========================================
if (!localStorage.getItem("es_cleaned_v5")) {
    localStorage.clear();
    localStorage.setItem("es_cleaned_v5", "true");
    window.location.reload();
}

// --- Default Mock Data ---
const DEFAULT_CIRCULARS = [];

const DEFAULT_TIMETABLES = {
    "Division A": {
        "Monday": [
            { slot: 1, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 1", status: "Active" },
            { slot: 2, subject: "MIC501D (MG)", teacher: "Prof. M. G.", room: "Room 1", status: "Active" },
            { slot: 3, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 1", status: "Active" },
            { slot: 4, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 1", status: "Active" }
        ],
        "Tuesday": [
            { slot: 1, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 1", status: "Active" },
            { slot: 2, subject: "MIC501D (MG)", teacher: "Prof. M. G.", room: "Room 1", status: "Active" },
            { slot: 3, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 1", status: "Active" },
            { slot: 4, subject: "SEC501A (JR/RM)", teacher: "Prof. J. R. / R. M.", room: "Room 1", status: "Active" }
        ],
        "Wednesday": [
            { slot: 1, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 1", status: "Active" },
            { slot: 2, subject: "MIC501D (MG)", teacher: "Prof. M. G.", room: "Room 1", status: "Active" },
            { slot: 3, subject: "SEC501A (JR/RM)", teacher: "Prof. J. R. / R. M.", room: "Room 1", status: "Active" },
            { slot: 4, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 1", status: "Active" }
        ],
        "Thursday": [
            { slot: 1, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 1", status: "Active" },
            { slot: 2, subject: "MIC501D (MG)", teacher: "Prof. M. G.", room: "Room 1", status: "Active" },
            { slot: 3, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 1", status: "Active" },
            { slot: 4, subject: "Free Slot", teacher: "", room: "", status: "Active" }
        ],
        "Friday": [
            { slot: 1, subject: "MIC501D (MG)", teacher: "Prof. M. G.", room: "Room 1", status: "Active" },
            { slot: 2, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 1", status: "Active" },
            { slot: 3, subject: "M501D (MG)", teacher: "Prof. M. G.", room: "Room 1", status: "Active" },
            { slot: 4, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 1", status: "Active" }
        ],
        "Saturday": [
            { slot: 1, subject: "MIC501D (MG)", teacher: "Prof. M. G.", room: "Room 1", status: "Active" },
            { slot: 2, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 1", status: "Active" },
            { slot: 3, subject: "M501D (MG)", teacher: "Prof. M. G.", room: "Room 1", status: "Active" },
            { slot: 4, subject: "Free Slot", teacher: "", room: "", status: "Active" }
        ]
    },
    "Division B": {
        "Monday": [
            { slot: 1, subject: "SEC501A (JKR)", teacher: "Prof. J. K. R.", room: "Room 2", status: "Active" },
            { slot: 2, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 2", status: "Active" },
            { slot: 3, subject: "M501BD (MG/PBC)", teacher: "Prof. M. G. / P. B. C.", room: "Room 2", status: "Active" },
            { slot: 4, subject: "M502BD (MG/JRR)", teacher: "Prof. M. G. / J. R. R.", room: "Room 2", status: "Active" }
        ],
        "Tuesday": [
            { slot: 1, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 2", status: "Active" },
            { slot: 2, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 2", status: "Active" },
            { slot: 3, subject: "M502BD (MG/JRR)", teacher: "Prof. M. G. / J. R. R.", room: "Room 2", status: "Active" },
            { slot: 4, subject: "M501BD (MG/PBC)", teacher: "Prof. M. G. / P. B. C.", room: "Room 2", status: "Active" }
        ],
        "Wednesday": [
            { slot: 1, subject: "SEC501A (JKR)", teacher: "Prof. J. K. R.", room: "Room 2", status: "Active" },
            { slot: 2, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 2", status: "Active" },
            { slot: 3, subject: "M501BD (MG/PBC)", teacher: "Prof. M. G. / P. B. C.", room: "Room 2", status: "Active" },
            { slot: 4, subject: "M502BD (MG/JRR)", teacher: "Prof. M. G. / J. R. R.", room: "Room 2", status: "Active" }
        ],
        "Thursday": [
            { slot: 1, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 2", status: "Active" },
            { slot: 2, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 2", status: "Active" },
            { slot: 3, subject: "M502BD (MG/JRR)", teacher: "Prof. M. G. / J. R. R.", room: "Room 2", status: "Active" },
            { slot: 4, subject: "M501BD (MG/PBC)", teacher: "Prof. M. G. / P. B. C.", room: "Room 2", status: "Active" }
        ],
        "Friday": [
            { slot: 1, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 2", status: "Active" },
            { slot: 2, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 2", status: "Active" },
            { slot: 3, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 2", status: "Active" },
            { slot: 4, subject: "Free Slot", teacher: "", room: "", status: "Active" }
        ],
        "Saturday": [
            { slot: 1, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 2", status: "Active" },
            { slot: 2, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 2", status: "Active" },
            { slot: 3, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 2", status: "Active" },
            { slot: 4, subject: "Free Slot", teacher: "", room: "", status: "Active" }
        ]
    },
    "Division C": {
        "Monday": [
            { slot: 1, subject: "MIC501A (PBC)", teacher: "Prof. P. B. C.", room: "Room 3", status: "Active" },
            { slot: 2, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 3", status: "Active" },
            { slot: 3, subject: "MIC502A (JRR)", teacher: "Prof. J. R. R.", room: "Room 3", status: "Active" },
            { slot: 4, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 3", status: "Active" }
        ],
        "Tuesday": [
            { slot: 1, subject: "SEC501A (JKR)", teacher: "Prof. J. K. R.", room: "Room 3", status: "Active" },
            { slot: 2, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 3", status: "Active" },
            { slot: 3, subject: "MIC501A (PBC)", teacher: "Prof. P. B. C.", room: "Room 3", status: "Active" },
            { slot: 4, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 3", status: "Active" }
        ],
        "Wednesday": [
            { slot: 1, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 3", status: "Active" },
            { slot: 2, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 3", status: "Active" },
            { slot: 3, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 3", status: "Active" },
            { slot: 4, subject: "Free Slot", teacher: "", room: "", status: "Active" }
        ],
        "Thursday": [
            { slot: 1, subject: "MIC502A (JRR)", teacher: "Prof. J. R. R.", room: "Room 3", status: "Active" },
            { slot: 2, subject: "MIC501A (PBC)", teacher: "Prof. P. B. C.", room: "Room 3", status: "Active" },
            { slot: 3, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 3", status: "Active" },
            { slot: 4, subject: "SEC501A (JKR)", teacher: "Prof. J. K. R.", room: "Room 3", status: "Active" }
        ],
        "Friday": [
            { slot: 1, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 3", status: "Active" },
            { slot: 2, subject: "MIC501A (PBC)", teacher: "Prof. P. B. C.", room: "Room 3", status: "Active" },
            { slot: 3, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 3", status: "Active" },
            { slot: 4, subject: "MIC502A (JRR)", teacher: "Prof. J. R. R.", room: "Room 3", status: "Active" }
        ],
        "Saturday": [
            { slot: 1, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 3", status: "Active" },
            { slot: 2, subject: "MIC502A (JRR)", teacher: "Prof. J. R. R.", room: "Room 3", status: "Active" },
            { slot: 3, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 3", status: "Active" },
            { slot: 4, subject: "Free Slot", teacher: "", room: "", status: "Active" }
        ]
    },
    "Division D": {
        "Monday": [
            { slot: 1, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 4", status: "Active" },
            { slot: 2, subject: "SEC501A (JKR)", teacher: "Prof. J. K. R.", room: "Room 4", status: "Active" },
            { slot: 3, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 4", status: "Active" },
            { slot: 4, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 4", status: "Active" }
        ],
        "Tuesday": [
            { slot: 1, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 4", status: "Active" },
            { slot: 2, subject: "MIC502A (JRR)", teacher: "Prof. J. R. R.", room: "Room 4", status: "Active" },
            { slot: 3, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 4", status: "Active" },
            { slot: 4, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 4", status: "Active" }
        ],
        "Wednesday": [
            { slot: 1, subject: "MIC502A (JRR)", teacher: "Prof. J. R. R.", room: "Room 4", status: "Active" },
            { slot: 2, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 4", status: "Active" },
            { slot: 3, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 4", status: "Active" },
            { slot: 4, subject: "MIC501A (PBC)", teacher: "Prof. P. B. C.", room: "Room 4", status: "Active" }
        ],
        "Thursday": [
            { slot: 1, subject: "MIC501A (PBC)", teacher: "Prof. P. B. C.", room: "Room 4", status: "Active" },
            { slot: 2, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 4", status: "Active" },
            { slot: 3, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 4", status: "Active" },
            { slot: 4, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 4", status: "Active" }
        ],
        "Friday": [
            { slot: 1, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 4", status: "Active" },
            { slot: 2, subject: "MIC502A (JRR)", teacher: "Prof. J. R. R.", room: "Room 4", status: "Active" },
            { slot: 3, subject: "MIC501A (PBC)", teacher: "Prof. P. B. C.", room: "Room 4", status: "Active" },
            { slot: 4, subject: "Free Slot", teacher: "", room: "", status: "Active" }
        ],
        "Saturday": [
            { slot: 1, subject: "MIC501A (PBC)", teacher: "Prof. P. B. C.", room: "Room 4", status: "Active" },
            { slot: 2, subject: "SEC501A (JKR)", teacher: "Prof. J. K. R.", room: "Room 4", status: "Active" },
            { slot: 3, subject: "MIC502A (JRR)", teacher: "Prof. J. R. R.", room: "Room 4", status: "Active" },
            { slot: 4, subject: "Free Slot", teacher: "", room: "", status: "Active" }
        ]
    },
    "Division E": {
        "Monday": [
            { slot: 1, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 5", status: "Active" },
            { slot: 2, subject: "MIC501D (MG)", teacher: "Prof. M. G.", room: "Room 5", status: "Active" },
            { slot: 3, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 5", status: "Active" },
            { slot: 4, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 5", status: "Active" }
        ],
        "Tuesday": [
            { slot: 1, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 5", status: "Active" },
            { slot: 2, subject: "MIC501D (MG)", teacher: "Prof. M. G.", room: "Room 5", status: "Active" },
            { slot: 3, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 5", status: "Active" },
            { slot: 4, subject: "SEC501A (JR/RM)", teacher: "Prof. J. R. / R. M.", room: "Room 5", status: "Active" }
        ],
        "Wednesday": [
            { slot: 1, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 5", status: "Active" },
            { slot: 2, subject: "MIC501D (MG)", teacher: "Prof. M. G.", room: "Room 5", status: "Active" },
            { slot: 3, subject: "SEC501A (JR/RM)", teacher: "Prof. J. R. / R. M.", room: "Room 5", status: "Active" },
            { slot: 4, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 5", status: "Active" }
        ],
        "Thursday": [
            { slot: 1, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 5", status: "Active" },
            { slot: 2, subject: "MIC501D (MG)", teacher: "Prof. M. G.", room: "Room 5", status: "Active" },
            { slot: 3, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 5", status: "Active" },
            { slot: 4, subject: "Free Slot", teacher: "", room: "", status: "Active" }
        ],
        "Friday": [
            { slot: 1, subject: "MIC501D (MG)", teacher: "Prof. M. G.", room: "Room 5", status: "Active" },
            { slot: 2, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 5", status: "Active" },
            { slot: 3, subject: "M501D (MG)", teacher: "Prof. M. G.", room: "Room 5", status: "Active" },
            { slot: 4, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 5", status: "Active" }
        ],
        "Saturday": [
            { slot: 1, subject: "MIC501D (MG)", teacher: "Prof. M. G.", room: "Room 5", status: "Active" },
            { slot: 2, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 5", status: "Active" },
            { slot: 3, subject: "M501D (MG)", teacher: "Prof. M. G.", room: "Room 5", status: "Active" },
            { slot: 4, subject: "Free Slot", teacher: "", room: "", status: "Active" }
        ]
    },
    "Division F": {
        "Monday": [
            { slot: 1, subject: "SEC501A (JKR)", teacher: "Prof. J. K. R.", room: "Room 6", status: "Active" },
            { slot: 2, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 6", status: "Active" },
            { slot: 3, subject: "M501BD (MG/PBC)", teacher: "Prof. M. G. / P. B. C.", room: "Room 6", status: "Active" },
            { slot: 4, subject: "M502BD (MG/JRR)", teacher: "Prof. M. G. / J. R. R.", room: "Room 6", status: "Active" }
        ],
        "Tuesday": [
            { slot: 1, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 6", status: "Active" },
            { slot: 2, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 6", status: "Active" },
            { slot: 3, subject: "M502BD (MG/JRR)", teacher: "Prof. M. G. / J. R. R.", room: "Room 6", status: "Active" },
            { slot: 4, subject: "M501BD (MG/PBC)", teacher: "Prof. M. G. / P. B. C.", room: "Room 6", status: "Active" }
        ],
        "Wednesday": [
            { slot: 1, subject: "SEC501A (JKR)", teacher: "Prof. J. K. R.", room: "Room 6", status: "Active" },
            { slot: 2, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 6", status: "Active" },
            { slot: 3, subject: "M501BD (MG/PBC)", teacher: "Prof. M. G. / P. B. C.", room: "Room 6", status: "Active" },
            { slot: 4, subject: "M502BD (MG/JRR)", teacher: "Prof. M. G. / J. R. R.", room: "Room 6", status: "Active" }
        ],
        "Thursday": [
            { slot: 1, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 6", status: "Active" },
            { slot: 2, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 6", status: "Active" },
            { slot: 3, subject: "M502BD (MG/JRR)", teacher: "Prof. M. G. / J. R. R.", room: "Room 6", status: "Active" },
            { slot: 4, subject: "M501BD (MG/PBC)", teacher: "Prof. M. G. / P. B. C.", room: "Room 6", status: "Active" }
        ],
        "Friday": [
            { slot: 1, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 6", status: "Active" },
            { slot: 2, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 6", status: "Active" },
            { slot: 3, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 6", status: "Active" },
            { slot: 4, subject: "Free Slot", teacher: "", room: "", status: "Active" }
        ],
        "Saturday": [
            { slot: 1, subject: "DSC503A (PMC)", teacher: "Dr. P M Thapa", room: "Room 6", status: "Active" },
            { slot: 2, subject: "DSC501A (KT)", teacher: "Prof. K. T. Mehta", room: "Room 6", status: "Active" },
            { slot: 3, subject: "DSC502A (RK)", teacher: "Dr. R. K. Thapa", room: "Room 6", status: "Active" },
            { slot: 4, subject: "Free Slot", teacher: "", room: "", status: "Active" }
        ]
    }
};

const DEFAULT_USERS = [
    {
        username: "admin",
        password: "okokokok",
        role: "admin",
        name: "Admin Principal",
        email: "daveneel1405@gmail.com",
        phone: "+91 99999 88888",
        department: "Administration",
        office: "Building A, Room 101"
    },
    {
        username: "teacher",
        password: "okokokok",
        role: "teacher",
        name: "Prof. Sarah Jenkins",
        email: "khushichovatiya489@gmail.com",
        phone: "+91 99999 77777",
        department: "Commerce & Accountancy",
        office: "Commerce Block, Room 204",
        classes: ["Stat", "BA", "BM", "CS"],
        subjects: ["Statistics", "Business Administration", "Business Management", "Computer Science"],
        schedule: [
            { day: "Monday", slot: 1, class: "Stat", room: "Room 101" },
            { day: "Monday", slot: 2, class: "BA", room: "Room 102" },
            { day: "Tuesday", slot: 1, class: "BM", room: "Room 103" },
            { day: "Tuesday", slot: 2, class: "CS", room: "Room 104" },
            { day: "Wednesday", slot: 1, class: "Stat", room: "Room 101" },
            { day: "Thursday", slot: 2, class: "BA", room: "Room 102" },
            { day: "Friday", slot: 1, class: "BM", room: "Room 103" }
        ]
    },
    ...TOLANI_STUDENTS.map(s => ({
        ...s,
        username: s.rollNo.toString().trim(),
        password: s.spdid.toString().trim(),
        program: "B.Com (Professional)",
        year: "3rd Year",
        semester: "Semester 5",
        enrolmentNo: s.enrolmentNo || "ENR" + s.spdid,
        admAppNo: s.admAppNo || "APP" + s.spdid,
        admissionYear: "2024",
        class: s.class || "Division A",
        division: "A"
    }))
];

const DEFAULT_COURSES = [
    { code: "BC-101", name: "Financial Accounting", credits: 4, department: "Commerce & Accountancy" },
    { code: "BC-102", name: "Business Organisation", credits: 4, department: "Commerce & Accountancy" },
    { code: "BC-103", name: "Microeconomics", credits: 3, department: "Economics" },
    { code: "BC-Stat-104", name: "Statistics", credits: 4, department: "Statistics" },
    { code: "BC-BA-104", name: "Business Administration", credits: 4, department: "Commerce & Accountancy" },
    { code: "BC-BM-104", name: "Business Management", credits: 4, department: "Commerce & Accountancy" },
    { code: "BC-CS-104", name: "Computer Science", credits: 4, department: "Computer Science" }
];

const DEFAULT_SUBJECTS = [
    { id: "sub-1", name: "Financial Accounting I", program: "B.Com (Regular)", year: "1st Year", semester: "Semester 1" },
    { id: "sub-2", name: "Microeconomics", program: "B.Com (Regular)", year: "1st Year", semester: "Semester 1" },
    { id: "sub-3", name: "Business Law", program: "B.Com (Regular)", year: "1st Year", semester: "Semester 2" },
    { id: "sub-4", name: "Macroeconomics", program: "B.Com (Regular)", year: "1st Year", semester: "Semester 2" },
    { id: "sub-5", name: "Corporate Accounting", program: "B.Com (Regular)", year: "2nd Year", semester: "Semester 3" },
    { id: "sub-6", name: "Business Statistics", program: "B.Com (Regular)", year: "2nd Year", semester: "Semester 3" },
    { id: "sub-7", name: "Cost Accounting", program: "B.Com (Regular)", year: "2nd Year", semester: "Semester 4" },
    { id: "sub-8", name: "Income Tax Law", program: "B.Com (Regular)", year: "2nd Year", semester: "Semester 4" },
    { id: "sub-9", name: "Auditing", program: "B.Com (Regular)", year: "3rd Year", semester: "Semester 5" },
    { id: "sub-10", name: "Management Accounting", program: "B.Com (Regular)", year: "3rd Year", semester: "Semester 5" },
    { id: "sub-11", name: "Financial Markets", program: "B.Com (Regular)", year: "3rd Year", semester: "Semester 6" },
    { id: "sub-12", name: "Indirect Taxes", program: "B.Com (Regular)", year: "3rd Year", semester: "Semester 6" },

    { id: "sub-13", name: "Advanced Accounting", program: "B.Com (Professional)", year: "1st Year", semester: "Semester 1" },
    { id: "sub-14", name: "Economics for Finance", program: "B.Com (Professional)", year: "1st Year", semester: "Semester 1" },
    { id: "sub-15", name: "Mercantile Law", program: "B.Com (Professional)", year: "1st Year", semester: "Semester 2" },
    { id: "sub-16", name: "Business Mathematics", program: "B.Com (Professional)", year: "1st Year", semester: "Semester 2" },
    { id: "sub-17", name: "Corporate Law", program: "B.Com (Professional)", year: "2nd Year", semester: "Semester 3" },
    { id: "sub-18", name: "Auditing & Assurance", program: "B.Com (Professional)", year: "2nd Year", semester: "Semester 3" },
    { id: "sub-19", name: "Financial Management", program: "B.Com (Professional)", year: "2nd Year", semester: "Semester 4" },
    { id: "sub-20", name: "Strategic Management", program: "B.Com (Professional)", year: "2nd Year", semester: "Semester 4" },
    { id: "sub-21", name: "Direct Tax Laws", program: "B.Com (Professional)", year: "3rd Year", semester: "Semester 5" },
    { id: "sub-22", name: "International Finance", program: "B.Com (Professional)", year: "3rd Year", semester: "Semester 5" },
    { id: "sub-23", name: "Indirect Tax Laws", program: "B.Com (Professional)", year: "3rd Year", semester: "Semester 6" },
    { id: "sub-24", name: "Professional Ethics", program: "B.Com (Professional)", year: "3rd Year", semester: "Semester 6" },

    { id: "sub-25", name: "Managerial Economics", program: "M.Com", year: "1st Year", semester: "Semester 1" },
    { id: "sub-26", name: "Financial Management", program: "M.Com", year: "1st Year", semester: "Semester 1" },
    { id: "sub-27", name: "Research Methodology", program: "M.Com", year: "1st Year", semester: "Semester 2" },
    { id: "sub-28", name: "Quantitative Techniques", program: "M.Com", year: "1st Year", semester: "Semester 2" },
    { id: "sub-29", name: "Strategic Cost Management", program: "M.Com", year: "2nd Year", semester: "Semester 3" },
    { id: "sub-30", name: "Corporate Tax Planning", program: "M.Com", year: "2nd Year", semester: "Semester 3" },
    { id: "sub-31", name: "International Business", program: "M.Com", year: "2nd Year", semester: "Semester 4" },
    { id: "sub-32", name: "Corporate Governance", program: "M.Com", year: "2nd Year", semester: "Semester 4" }
];

const DEFAULT_ASSIGNMENTS = [];
const DEFAULT_MATERIALS = [];
const DEFAULT_LEAVES = [];
const DEFAULT_PLACEMENTS = [];
const DEFAULT_MESSAGES = [];

// --- Encryption Helpers (Obfuscates database parameters in localStorage) ---
const CRYPTO_KEY = 42;

function encrypt(text) {
    if (!text) return text;
    let result = "";
    for (let i = 0; i < text.length; i++) {
        let charCode = text.charCodeAt(i) ^ CRYPTO_KEY;
        result += ("0" + charCode.toString(16)).slice(-2);
    }
    return "enc_" + result;
}

function decrypt(text) {
    if (!text || !text.startsWith("enc_")) return text;
    let hex = text.substring(4);
    let result = "";
    for (let i = 0; i < hex.length; i += 2) {
        let charCode = parseInt(hex.substr(i, 2), 16) ^ CRYPTO_KEY;
        result += String.fromCharCode(charCode);
    }
    return result;
}

// --- State Management Wrapper ---
class StateManager {
    constructor() {
        this.loadState();
    }

    loadState() {
        try {
            const users = localStorage.getItem("es_users");
            const circulars = localStorage.getItem("es_circulars");
            const timetables = localStorage.getItem("es_timetables");
            
            // New collections
            const courses = localStorage.getItem("es_courses");
            const assignments = localStorage.getItem("es_assignments");
            const materials = localStorage.getItem("es_materials");
            const leaves = localStorage.getItem("es_leaves");
            const placements = localStorage.getItem("es_placements");
            const messages = localStorage.getItem("es_messages");
            const attendanceCodes = localStorage.getItem("es_attendance_codes");
            const feePaymentLink = localStorage.getItem("es_fee_payment_link");
            const subjects = localStorage.getItem("es_subjects");

            let parsedUsers = users ? JSON.parse(users) : null;
            if (parsedUsers) {
                parsedUsers.forEach(u => {
                    u.password = decrypt(u.password);
                    u.email = decrypt(u.email);
                    u.phone = decrypt(u.phone);
                });
            }
            if (!parsedUsers || parsedUsers.length === 0 || parsedUsers.length !== DEFAULT_USERS.length || !parsedUsers.some(u => u.role === 'admin')) {
                parsedUsers = DEFAULT_USERS;
                localStorage.removeItem("es_assignments");
                localStorage.removeItem("es_materials");
                localStorage.removeItem("es_leaves");
                localStorage.removeItem("es_messages");
                localStorage.removeItem("es_attendance_codes");
            }
            this.users = parsedUsers;

            this.circulars = circulars ? JSON.parse(circulars) : DEFAULT_CIRCULARS;

            let parsedTimetables = timetables ? JSON.parse(timetables) : null;
            if (!parsedTimetables || parsedTimetables["CS-A"] || parsedTimetables["Stat"] || !parsedTimetables["Division A"]) {
                parsedTimetables = DEFAULT_TIMETABLES;
                localStorage.setItem("es_timetables", JSON.stringify(parsedTimetables));
            }
            this.timetables = parsedTimetables;

            // Seed divisions, program, year, and semester dynamically to students
            this.users.forEach(u => {
                if (u.role === 'student') {
                    if (!u.division) {
                        const rollNum = parseInt(u.rollNo);
                        let div = "A";
                        if (!isNaN(rollNum)) {
                            if (rollNum <= 170) div = "A";
                            else if (rollNum <= 340) div = "B";
                            else if (rollNum <= 510) div = "C";
                            else if (rollNum <= 680) div = "D";
                            else if (rollNum <= 850) div = "E";
                            else div = "F";
                        }
                        u.division = div;
                    }
                    if (!u.program) {
                        u.program = "B.Com (Regular)";
                    }
                    if (!u.year) {
                        u.year = "1st Year";
                    }
                    if (!u.semester) {
                        u.semester = "Semester 1";
                    }
                }
            });

            // New Collections Seeding
            this.courses = courses ? JSON.parse(courses) : DEFAULT_COURSES;
            this.assignments = assignments ? JSON.parse(assignments) : DEFAULT_ASSIGNMENTS;
            this.materials = materials ? JSON.parse(materials) : DEFAULT_MATERIALS;
            this.leaves = leaves ? JSON.parse(leaves) : DEFAULT_LEAVES;
            this.placements = placements ? JSON.parse(placements) : DEFAULT_PLACEMENTS;
            this.messages = messages ? JSON.parse(messages) : DEFAULT_MESSAGES;
            this.attendanceCodes = attendanceCodes ? JSON.parse(attendanceCodes) : [];
            this.feePaymentLink = feePaymentLink || "https://pay.tolani.edu/fees";
            this.subjects = subjects ? JSON.parse(subjects) : DEFAULT_SUBJECTS;

            this.saveState();
        } catch (e) {
            console.error("Local Storage is corrupt or disabled. Using memory stores.", e);
            this.users = DEFAULT_USERS;
            this.circulars = DEFAULT_CIRCULARS;
            this.timetables = DEFAULT_TIMETABLES;
            this.courses = DEFAULT_COURSES;
            this.assignments = DEFAULT_ASSIGNMENTS;
            this.materials = DEFAULT_MATERIALS;
            this.leaves = DEFAULT_LEAVES;
            this.placements = DEFAULT_PLACEMENTS;
            this.messages = DEFAULT_MESSAGES;
            this.attendanceCodes = [];
            this.feePaymentLink = "https://pay.tolani.edu/fees";
            this.subjects = DEFAULT_SUBJECTS;
        }
    }

    saveState() {
        try {
            const encryptedUsers = this.users.map(u => {
                return {
                    ...u,
                    password: encrypt(u.password),
                    email: encrypt(u.email),
                    phone: encrypt(u.phone)
                };
            });
            localStorage.setItem("es_users", JSON.stringify(encryptedUsers));
            localStorage.setItem("es_circulars", JSON.stringify(this.circulars));
            localStorage.setItem("es_timetables", JSON.stringify(this.timetables));
            localStorage.setItem("es_courses", JSON.stringify(this.courses));
            localStorage.setItem("es_assignments", JSON.stringify(this.assignments));
            localStorage.setItem("es_materials", JSON.stringify(this.materials));
            localStorage.setItem("es_leaves", JSON.stringify(this.leaves));
            localStorage.setItem("es_placements", JSON.stringify(this.placements));
            localStorage.setItem("es_messages", JSON.stringify(this.messages));
            localStorage.setItem("es_attendance_codes", JSON.stringify(this.attendanceCodes));
            localStorage.setItem("es_fee_payment_link", this.feePaymentLink);
            localStorage.setItem("es_subjects", JSON.stringify(this.subjects));
        } catch (e) {
            console.error("Failed to write to localStorage", e);
        }
    }

    resetDatabaseDefaults() {
        if (confirm("This will recover all deleted accounts, timetables, and restore the default state. Do you want to proceed?")) {
            localStorage.clear();
            this.users = DEFAULT_USERS;
            this.timetables = DEFAULT_TIMETABLES;
            this.courses = DEFAULT_COURSES;
            this.assignments = DEFAULT_ASSIGNMENTS;
            this.materials = DEFAULT_MATERIALS;
            this.leaves = DEFAULT_LEAVES;
            this.placements = DEFAULT_PLACEMENTS;
            this.messages = DEFAULT_MESSAGES;
            this.attendanceCodes = [];
            this.feePaymentLink = "https://pay.tolani.edu/fees";
            this.subjects = DEFAULT_SUBJECTS;
            this.saveState();
            alert("Database templates successfully restored! The page will reload now.");
            window.location.reload();
        }
    }

    addSubject(sub) {
        if (this.subjects.some(s => s.name.toLowerCase() === sub.name.toLowerCase() && s.program === sub.program && s.year === sub.year && s.semester === sub.semester)) {
            return false;
        }
        this.subjects.push(sub);
        this.saveState();
        return true;
    }

    deleteSubject(id) {
        this.subjects = this.subjects.filter(s => s.id !== id);
        this.saveState();
    }

    addAssignment(asm) {
        this.assignments.unshift(asm);
        this.saveState();
    }
    
    updateAssignment(asm) {
        const idx = this.assignments.findIndex(a => a.id === asm.id);
        if (idx !== -1) {
            this.assignments[idx] = asm;
            this.saveState();
        }
    }

    addMaterial(mat) {
        this.materials.unshift(mat);
        this.saveState();
    }

    addLeave(lv) {
        this.leaves.unshift(lv);
        this.saveState();
    }

    updateLeave(lv) {
        const idx = this.leaves.findIndex(l => l.id === lv.id);
        if (idx !== -1) {
            this.leaves[idx] = lv;
            this.saveState();
        }
    }

    addMessage(msg) {
        this.messages.push(msg);
        this.saveState();
    }

    findUser(username, password) {
        const lowerUser = username.toLowerCase().trim();
        return this.users.find(u => (u.username.toLowerCase() === lowerUser || u.email.toLowerCase() === lowerUser) && u.password === password);
    }

    updateUser(updatedUser) {
        const index = this.users.findIndex(u => u.username === updatedUser.username);
        if (index !== -1) {
            this.users[index] = updatedUser;
            this.saveState();
            return true;
        }
        return false;
    }

    addUser(newUser) {
        if (this.users.some(u => u.username === newUser.username)) {
            return false; // User already exists
        }
        this.users.push(newUser);
        this.saveState();
        return true;
    }

    deleteUser(username) {
        this.users = this.users.filter(u => u.username !== username);
        this.saveState();
    }

    addCircular(newCircular) {
        this.circulars.unshift(newCircular);
        this.saveState();
    }

    deleteCircular(id) {
        this.circulars = this.circulars.filter(c => c.id !== id);
        this.saveState();
    }
}

// Instantiate state
const state = new StateManager();
let currentUser = null;
let currentView = "dashboard";

// Pagination and filter state variables for Admin Console
let adminUsersPage = 1;
const ADMIN_USERS_PER_PAGE = 15;
let adminUsersSearch = "";
let adminUsersRoleFilter = "";
let adminUsersSubjectFilter = "";
let adminUsersProgramFilter = "";
let adminUsersYearFilter = "";
let adminUsersSemFilter = "";

let adminFeesPage = 1;
const ADMIN_FEES_PER_PAGE = 15;
let adminFeesSearch = "";
let adminFeesStatusFilter = "";

// --- DOM References ---
const authView = document.getElementById("auth-view");
const dashboardView = document.getElementById("dashboard-view");
const loginForm = document.getElementById("login-form");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");

const appSidebar = document.getElementById("app-sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarMenuList = document.getElementById("sidebar-menu-list");
const sidebarUserName = document.getElementById("sidebar-user-name");
const sidebarUserRole = document.getElementById("sidebar-user-role");
const sidebarUserAvatar = document.getElementById("sidebar-user-avatar");
const logoutButton = document.getElementById("logout-button");

const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");
const currentDateDisplay = document.getElementById("current-date-display");
const dynamicContentArea = document.getElementById("dynamic-content-area");

// Modals
const generalModal = document.getElementById("general-modal");
const generalModalTitle = document.getElementById("general-modal-title");
const generalModalBody = document.getElementById("general-modal-body");
const generalModalClose = document.getElementById("general-modal-close");

const feeModal = document.getElementById("fee-modal");
const feeModalClose = document.getElementById("fee-modal-close");
const feePayForm = document.getElementById("fee-pay-form");
const feeModalDueAmt = document.getElementById("fee-modal-due-amt");
const feeModalDesc = document.getElementById("fee-modal-desc");
const feePayStudentId = document.getElementById("fee-pay-student-id");

// --- Helper Functions ---
function getInitials(name) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function setDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
}

// Calculate attendance stats
function calculateAttendance(student) {
    const records = Object.values(student.attendance || {});
    if (records.length === 0) return { present: 0, absent: 0, total: 0, percentage: 100 };
    const present = records.filter(r => r === 'present' || r === 'late').length;
    const total = records.length;
    const percentage = Math.round((present / total) * 100);
    return {
        present,
        absent: total - present,
        total,
        percentage
    };
}

// Setup responsive sidebar toggle
sidebarToggle.addEventListener("click", () => {
    appSidebar.classList.toggle("active");
});

document.addEventListener("click", (e) => {
    if (window.innerWidth <= 992) {
        if (!appSidebar.contains(e.target) && !sidebarToggle.contains(e.target) && appSidebar.classList.contains("active")) {
            appSidebar.classList.remove("active");
        }
    }
});

// Modal Actions
function openModal(title, bodyHTML) {
    generalModalTitle.textContent = title;
    generalModalBody.innerHTML = bodyHTML;
    generalModal.classList.add("active");
}

function closeModal() {
    generalModal.classList.remove("active");
    generalModalBody.innerHTML = "";
}

generalModalClose.addEventListener("click", closeModal);
feeModalClose.addEventListener("click", () => feeModal.classList.remove("active"));

// --- Authentication Controllers ---
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = state.findUser(loginUsername.value, loginPassword.value);
    
    if (user) {
        loginUser(user);
    } else {
        alert("Invalid credentials. Please check your username/email and password.");
    }
});

function loginUser(user) {
    currentUser = user;
    localStorage.setItem("tcc_logged_in_username", user.username);
    
    // Setup Sidebar User Profile
    sidebarUserName.textContent = user.name;
    sidebarUserRole.textContent = user.role;
    sidebarUserAvatar.textContent = getInitials(user.name);

    // Switch Views
    authView.style.display = "none";
    dashboardView.style.display = "flex";

    // Clean inputs
    loginUsername.value = "";
    loginPassword.value = "";

    buildSidebarMenu(user.role);
    navigateTo("dashboard");
}

logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("tcc_logged_in_username");
    currentUser = null;
    currentView = "dashboard";
    dashboardView.style.display = "none";
    authView.style.display = "flex";
});

// --- Navigation Routing ---
const ROLE_NAV = {
    student: [
        { id: "dashboard", label: "Overview", icon: "fa-chart-pie" },
        { id: "courses", label: "View Courses", icon: "fa-book" },
        { id: "timetable", label: "Class Timetable", icon: "fa-calendar-days" },
        { id: "attendance", label: "Attendance Record", icon: "fa-calendar-check" },
        { id: "assignments", label: "Assignments", icon: "fa-file-pen" },
        { id: "materials", label: "Study Materials", icon: "fa-book-open-reader" },
        { id: "internalmarks", label: "Internal Marks", icon: "fa-circle-dot" },
        { id: "fees", label: "Fee Payment", icon: "fa-credit-card" },
        { id: "chat", label: "Chat with Teacher", icon: "fa-comments" },
        { id: "circulars", label: "College Notices", icon: "fa-bullhorn" },
        { id: "leave", label: "Application", icon: "fa-file-signature" },
        { id: "placements", label: "Placement Updates", icon: "fa-graduation-cap" },
        { id: "profile", label: "Profile Settings", icon: "fa-user-gear" }
    ],
    teacher: [
        { id: "dashboard", label: "Dashboard", icon: "fa-gauge" },
        { id: "students", label: "Student Registry", icon: "fa-users" },
        { id: "courses", label: "Courses & Syllabus", icon: "fa-book" },
        { id: "timetable", label: "Class Timetable", icon: "fa-calendar" },
        { id: "schedule", label: "Manage Schedule", icon: "fa-calendar-plus" },
        { id: "attendance", label: "Manage Attendance", icon: "fa-clipboard-user" },
        { id: "assignments", label: "Manage Assignments", icon: "fa-file-pen" },
        { id: "marks", label: "Marks Registry", icon: "fa-circle-dot" },
        { id: "materials", label: "Upload Study Material", icon: "fa-book-open-reader" },
        { id: "communication", label: "Communication Hub", icon: "fa-comments" },
        { id: "leave", label: "Applications", icon: "fa-envelope-open-text" },
        { id: "profile", label: "Profile Settings", icon: "fa-user-gear" }
    ],
    admin: [
        { id: "dashboard", label: "Admin Console", icon: "fa-sliders" },
        { id: "students", label: "User Registry", icon: "fa-users" },
        { id: "courses", label: "Courses & Syllabus", icon: "fa-book" },
        { id: "timetable", label: "Class Timetable", icon: "fa-calendar" },
        { id: "schedule", label: "Manage Schedule", icon: "fa-calendar-plus" },
        { id: "attendance", label: "Manage Attendance", icon: "fa-clipboard-user" },
        { id: "assignments", label: "Manage Assignments", icon: "fa-file-pen" },
        { id: "marks", label: "Marks Registry", icon: "fa-circle-dot" },
        { id: "materials", label: "Upload Study Material", icon: "fa-book-open-reader" },
        { id: "communication", label: "Communication Hub", icon: "fa-comments" },
        { id: "leave", label: "Applications", icon: "fa-envelope-open-text" },
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
    currentView = viewId;
    
    // Set active class on menu items (for programmatic calls)
    const activeItem = sidebarMenuList.querySelector(`[data-view="${viewId}"]`);
    if (activeItem) {
        document.querySelectorAll(".sidebar-menu-item").forEach(el => el.classList.remove("active"));
        activeItem.classList.add("active");
    }

    // Set document title
    const activeRoute = ROLE_NAV[currentUser.role].find(item => item.id === viewId);
    pageTitle.textContent = activeRoute ? activeRoute.label : "Portal";
    pageSubtitle.textContent = `EduSphere Workspace for ${currentUser.name}`;

    // Render corresponding view module
    const renderFn = `render${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}${viewId.charAt(0).toUpperCase() + viewId.slice(1)}`;
    
    // Customize page subtitle for B.Com portal
    pageSubtitle.textContent = `${currentUser.name} | ${currentUser.role.toUpperCase()} Portal`;
    if (typeof window[renderFn] === "function") {
        window[renderFn]();
    } else {
        dynamicContentArea.innerHTML = `<div class="glass-card text-center"><i class="fa-solid fa-triangle-exclamation" style="font-size: 32px; color: var(--warning); margin-bottom: 12px;"></i><p>View '${viewId}' is under construction.</p></div>`;
    }
}

// =========================================================================
// STUDENT MODULE VIEWS
// =========================================================================

// Calculate CGPA dynamically from student grades
function calculateCGPA(grades) {
    if (!grades || grades.length === 0) return "0.00";
    const gradePoints = { "A+": 10, "A": 9, "B+": 8, "B": 7, "C": 6, "D": 5, "F": 0 };
    let totalPoints = 0;
    let totalCredits = 0;
    
    grades.forEach(g => {
        const pt = gradePoints[g.grade] || 7;
        totalPoints += pt * g.credits;
        totalCredits += g.credits;
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
}

// Generate deterministic internal marks based on student grades
function getInternalMarks(student, courseCode) {
    const courseGradeObj = student.grades.find(g => g.code === courseCode || g.subject === courseCode);
    const grade = courseGradeObj ? courseGradeObj.grade : "B";
    const seed = parseInt(student.rollNo) + courseCode.length;
    const rand = Math.abs(Math.sin(seed)) * 10;
    const offset = Math.floor(rand) % 3; // 0, 1, 2
    
    if (grade === "A+") return 27 + offset;
    if (grade === "A") return 24 + offset;
    if (grade === "B+") return 21 + offset;
    if (grade === "B") return 18 + offset;
    if (grade === "C") return 15 + offset;
    return 12 + offset;
}

window.renderStudentDashboard = function() {
    const attStats = calculateAttendance(currentUser);
    const fee = currentUser.feeStatus;
    const cgpaVal = calculateCGPA(currentUser.grades);
    const latestAnnouncements = state.circulars.slice(0, 2);
    
    let announcementsHTML = "";
    if (latestAnnouncements.length === 0) {
        announcementsHTML = `<p style="color: var(--text-muted); font-size: 13px;">No notices posted.</p>`;
    } else {
        latestAnnouncements.forEach(c => {
            announcementsHTML += `
                <div class="announcement-item announce-${c.category}">
                    <div class="announce-header">
                        <span class="announce-type type-${c.category}">${c.category}</span>
                        <span class="announce-date">${formatDate(c.date)}</span>
                    </div>
                    <h4 class="announce-title">${c.title}</h4>
                    <p class="announce-desc">${c.content.substring(0, 80)}...</p>
                </div>
            `;
        });
    }

    // Today's timetable slot
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()] || "Monday";
    const todaySchedule = (state.timetables["Division " + (currentUser.division || "A")] || {})[today] || [];
    
    let schedHTML = "";
    if (todaySchedule.length === 0) {
        schedHTML = `<div style="text-align: center; color: var(--text-muted); padding: 12px; font-size: 13px;">No classes scheduled today.</div>`;
    } else {
        todaySchedule.forEach(slot => {
            if (slot.subject) {
                const isCancelled = slot.status === "Cancelled";
                const badge = isCancelled ? '<span class="badge badge-danger" style="font-size: 10px;">CANCELLED</span>' : '<span class="badge badge-info" style="font-size: 10px;">Scheduled</span>';
                const details = isCancelled ? '<span style="color: var(--danger); font-weight: bold;">NO LECTURE TODAY</span>' : `${slot.teacher} | Room: ${slot.room}`;
                
                schedHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed var(--border-color);">
                        <div>
                            <div style="font-weight: 600; font-size: 13px; text-decoration: ${isCancelled ? 'line-through' : 'none'};">Slot ${slot.slot}: ${slot.subject}</div>
                            <div style="font-size: 11px; color: var(--text-muted);">${details}</div>
                        </div>
                        ${badge}
                    </div>
                `;
            }
        });
    }

    // Filter student assignments
    const myAssignments = state.assignments.filter(a => 
        a.subject === "General" || 
        currentUser.grades.some(g => g.subject === a.subject || g.code === a.courseCode)
    ).slice(0, 2);

    let assignHTML = "";
    if (myAssignments.length === 0) {
        assignHTML = `<div style="color: var(--text-muted); font-size: 13px; padding: 6px;">No upcoming assignments.</div>`;
    } else {
        myAssignments.forEach(a => {
            const sub = a.submissions.find(s => s.studentUsername === currentUser.username);
            const statusText = sub ? `Submitted (${sub.status})` : "Pending Submission";
            const badgeClass = sub ? "badge-success" : "badge-danger";
            assignHTML += `
                <div style="padding: 10px 0; border-bottom: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 600; font-size: 13px;">${a.title}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">Due: ${formatDate(a.dueDate)} | ${a.subject}</div>
                    </div>
                    <span class="badge ${badgeClass}" style="font-size: 10px;">${statusText}</span>
                </div>
            `;
        });
    }

    dynamicContentArea.innerHTML = `
        <div class="glass-card mb-20" style="padding: 24px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%);">
            <div>
                <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 6px;">Welcome Back, ${currentUser.name}!</h2>
                <p style="color: var(--text-muted); font-size: 13px;">B.Com NEP Student | Roll Number: <strong>${currentUser.rollNo}</strong> | Major: <strong>${currentUser.subject}</strong> | Division: <strong>${currentUser.division || 'A'}</strong></p>
            </div>
            <div style="display: flex; gap: 16px;">
                <div class="text-center" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 10px 18px; border-radius: 12px;">
                    <span style="font-size: 18px; font-weight: 700; color: var(--primary);">${attStats.percentage}%</span>
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-top: 2px;">Attendance</div>
                </div>
            </div>
        </div>

        <div class="grid-3">
            <!-- Notices -->
            <div class="glass-card">
                <div class="card-header-flex">
                    <h3 class="card-title"><i class="fa-solid fa-bullhorn" style="margin-right: 8px; color: var(--primary);"></i>Notices</h3>
                    <button class="btn btn-secondary btn-sm" onclick="navigateTo('circulars')">View All</button>
                </div>
                <div class="announcement-list">
                    ${announcementsHTML}
                </div>
            </div>

            <!-- Schedule -->
            <div class="glass-card">
                <div class="card-header-flex">
                    <h3 class="card-title"><i class="fa-solid fa-clock" style="margin-right: 8px; color: var(--teal);"></i>Classes today (${today})</h3>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${schedHTML}
                </div>
            </div>

            <!-- Assignments -->
            <div class="glass-card">
                <div class="card-header-flex">
                    <h3 class="card-title"><i class="fa-solid fa-file-signature" style="margin-right: 8px; color: var(--accent);"></i>Assignments</h3>
                    <button class="btn btn-secondary btn-sm" onclick="navigateTo('assignments')">View All</button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${assignHTML}
                </div>
            </div>
        </div>
    `;
};

window.renderStudentCourses = function() {
    const list = state.courses.filter(c => {
        // Core courses apply to all. Major course matches student subject.
        if (c.code === "BC-101" || c.code === "BC-102" || c.code === "BC-103") return true;
        return c.code.includes(`-${currentUser.subject}-`) || c.code === `BC-${currentUser.subject}-104`;
    });

    let coursesHTML = "";
    list.forEach(c => {
        let syllabusHTML = "";
        if (c.attachmentName) {
            syllabusHTML = `
                <div style="margin-top: 12px; padding: 10px; background: rgba(99, 102, 241, 0.05); border-radius: 6px; border: 1.5px dashed rgba(99, 102, 241, 0.25); display: flex; flex-direction: column; gap: 6px;">
                    <span style="font-size: 11px; font-weight: 600; color: var(--primary);"><i class="fa-solid fa-file-pdf" style="margin-right: 4px;"></i>Syllabus Details:</span>
                    <div style="font-size: 11px; color: var(--text-main); font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.attachmentName}</div>
                    <a href="#" class="btn btn-secondary btn-sm text-center" style="font-size: 10px; padding: 4px 8px; margin-top: 4px;" onclick="alert('Opening syllabus file: ${c.attachmentName}\\n\\nDetails: ${c.attachmentDetails || 'No additional syllabus notes.'}')">
                        <i class="fa-solid fa-folder-open" style="margin-right: 4px;"></i> View Syllabus
                    </a>
                </div>
            `;
        } else {
            syllabusHTML = `
                <div style="margin-top: 12px; padding: 8px; font-size: 11px; color: var(--text-muted); font-style: italic; text-align: center; background: rgba(0,0,0,0.02); border-radius: 6px;">
                    No syllabus files uploaded yet.
                </div>
            `;
        }

        coursesHTML += `
            <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div class="flex-space mb-16">
                        <span style="font-size: 11px; font-weight: 700; color: var(--primary); text-transform: uppercase;">${c.code}</span>
                        <span class="badge badge-info">${c.credits} Credits</span>
                    </div>
                    <h3 class="card-title mb-16" style="font-size: 15px;">${c.name}</h3>
                    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Department: ${c.department}</p>
                </div>
                <div>
                    <div style="border-top: 1px solid var(--border-color); padding-top: 12px; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-user-tie" style="color: var(--text-muted);"></i>
                        <span>Primary Faculty: <strong>Prof. Sarah Jenkins</strong></span>
                    </div>
                    ${syllabusHTML}
                </div>
            </div>
        `;
    });

    dynamicContentArea.innerHTML = `
        <div class="grid-3">
            ${coursesHTML}
        </div>
    `;
};

function renderFacultyCourses(isAdmin) {
    if (isAdmin) {
        window.activeCoursesSubTab = window.activeCoursesSubTab || 'syllabus';
        
        let tabHeader = `
            <div style="display: flex; gap: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 20px;">
                <button class="btn ${window.activeCoursesSubTab === 'syllabus' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="subtab-syllabus">
                    <i class="fa-solid fa-file-invoice" style="margin-right: 6px;"></i> Syllabus Uploads
                </button>
                <button class="btn ${window.activeCoursesSubTab === 'subjects' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="subtab-subjects">
                    <i class="fa-solid fa-book-bookmark" style="margin-right: 6px;"></i> Subject Database
                </button>
            </div>
        `;

        if (window.activeCoursesSubTab === 'subjects') {
            // --- Subject Management View ---
            if (!window.adminSubProgFilter) window.adminSubProgFilter = "";
            if (!window.adminSubYearFilter) window.adminSubYearFilter = "";
            if (!window.adminSubSemFilter) window.adminSubSemFilter = "";

            const filteredSubjects = state.subjects.filter(s => {
                const matchProg = !window.adminSubProgFilter || s.program === window.adminSubProgFilter;
                const matchYear = !window.adminSubYearFilter || s.year === window.adminSubYearFilter;
                const matchSem = !window.adminSubSemFilter || s.semester === window.adminSubSemFilter;
                return matchProg && matchYear && matchSem;
            });

            let subjectRowsHTML = "";
            filteredSubjects.forEach((sub, index) => {
                subjectRowsHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${sub.name}</strong></td>
                        <td>${sub.program}</td>
                        <td><span class="badge badge-secondary">${sub.year}</span></td>
                        <td><span class="badge badge-info">${sub.semester}</span></td>
                        <td>
                            <button class="btn btn-secondary btn-sm" style="color: var(--danger); border-color: rgba(239,68,68,0.15); padding: 4px 8px;" onclick="handleDeleteSubject('${sub.id}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            if (subjectRowsHTML === "") {
                subjectRowsHTML = `<tr><td colspan="6" class="text-center" style="color: var(--text-muted); padding: 24px;">No subjects registered matching this filter.</td></tr>`;
            }

            dynamicContentArea.innerHTML = `
                ${tabHeader}
                <div class="grid-3 mb-20">
                    <div class="glass-card" style="grid-column: span 1;">
                        <h3 class="card-title mb-16">Register New Subject</h3>
                        <form id="subject-register-form">
                            <div class="form-group">
                                <label for="reg-sub-name">Subject Name</label>
                                <input type="text" id="reg-sub-name" class="form-control" placeholder="e.g. Corporate Finance" style="padding-left: 16px;" required>
                            </div>
                            <div class="form-group">
                                <label for="reg-sub-program">Academic Program</label>
                                <select id="reg-sub-program" class="form-control" style="padding-left: 16px;">
                                    <option value="B.Com (Regular)">B.Com (Regular)</option>
                                    <option value="B.Com (Professional)">B.Com (Professional)</option>
                                    <option value="M.Com">M.Com</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="reg-sub-year">Year</label>
                                <select id="reg-sub-year" class="form-control" style="padding-left: 16px;">
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="reg-sub-semester">Semester</label>
                                <select id="reg-sub-semester" class="form-control" style="padding-left: 16px;">
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 12px;">
                                <i class="fa-solid fa-circle-plus"></i> Add Subject to Database
                            </button>
                        </form>
                    </div>

                    <div class="glass-card" style="grid-column: span 2;">
                        <div class="flex-space mb-16" style="flex-wrap: wrap; gap: 12px;">
                            <h3 class="card-title">Subject Database Records</h3>
                            <div style="display: flex; gap: 8px;">
                                <select id="filter-sub-prog" class="form-control form-control-sm" style="width: auto; padding: 4px 8px; font-size: 11.5px; height: 32px;">
                                    <option value="">All Programs</option>
                                    <option value="B.Com (Regular)" ${window.adminSubProgFilter === 'B.Com (Regular)' ? 'selected' : ''}>B.Com (Reg)</option>
                                    <option value="B.Com (Professional)" ${window.adminSubProgFilter === 'B.Com (Professional)' ? 'selected' : ''}>B.Com (Pro)</option>
                                    <option value="M.Com" ${window.adminSubProgFilter === 'M.Com' ? 'selected' : ''}>M.Com</option>
                                </select>
                                <select id="filter-sub-year" class="form-control form-control-sm" style="width: auto; padding: 4px 8px; font-size: 11.5px; height: 32px;">
                                    <option value="">All Years</option>
                                    <option value="1st Year" ${window.adminSubYearFilter === '1st Year' ? 'selected' : ''}>1st Year</option>
                                    <option value="2nd Year" ${window.adminSubYearFilter === '2nd Year' ? 'selected' : ''}>2nd Year</option>
                                    <option value="3rd Year" ${window.adminSubYearFilter === '3rd Year' ? 'selected' : ''}>3rd Year</option>
                                </select>
                            </div>
                        </div>

                        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                            <table class="custom-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Subject Title</th>
                                        <th>Program</th>
                                        <th>Year</th>
                                        <th>Semester</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${subjectRowsHTML}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            // Setup dynamic dropdowns for adding subject
            const pEl = document.getElementById("reg-sub-program");
            const yEl = document.getElementById("reg-sub-year");
            const sEl = document.getElementById("reg-sub-semester");

            const updateRegOpts = () => {
                const prog = pEl.value;
                const curY = yEl.value;
                const curS = sEl.value;

                let years = ["1st Year", "2nd Year"];
                if (prog.includes("B.Com")) {
                    years.push("3rd Year");
                }
                yEl.innerHTML = years.map(y => `<option value="${y}" ${y === curY ? 'selected' : ''}>${y}</option>`).join("");

                const activeY = yEl.value;
                let semesters = [];
                if (activeY === "1st Year") {
                    semesters = ["Semester 1", "Semester 2"];
                } else if (activeY === "2nd Year") {
                    semesters = ["Semester 3", "Semester 4"];
                } else if (activeY === "3rd Year") {
                    semesters = ["Semester 5", "Semester 6"];
                }
                sEl.innerHTML = semesters.map(s => `<option value="${s}" ${s === curS ? 'selected' : ''}>${s}</option>`).join("");
            };

            updateRegOpts();
            pEl.addEventListener("change", updateRegOpts);
            yEl.addEventListener("change", updateRegOpts);

            // Hook adding subject form submit
            document.getElementById("subject-register-form").addEventListener("submit", (e) => {
                e.preventDefault();
                const name = document.getElementById("reg-sub-name").value.trim();
                const prog = pEl.value;
                const year = yEl.value;
                const sem = sEl.value;

                const newSub = {
                    id: "sub-" + Date.now(),
                    name,
                    program: prog,
                    year,
                    semester: sem
                };

                const added = state.addSubject(newSub);
                if (added) {
                    alert(`Subject "${name}" registered successfully under ${prog} - ${sem}!`);
                    renderFacultyCourses(isAdmin);
                } else {
                    alert(`A subject named "${name}" already exists for this semester.`);
                }
            });

            // Bind filters
            document.getElementById("filter-sub-prog").addEventListener("change", (e) => {
                window.adminSubProgFilter = e.target.value;
                renderFacultyCourses(isAdmin);
            });
            document.getElementById("filter-sub-year").addEventListener("change", (e) => {
                window.adminSubYearFilter = e.target.value;
                renderFacultyCourses(isAdmin);
            });

            // Hook sub-tab click triggers
            document.getElementById("subtab-syllabus").addEventListener("click", () => {
                window.activeCoursesSubTab = 'syllabus';
                renderFacultyCourses(isAdmin);
            });
            document.getElementById("subtab-subjects").addEventListener("click", () => {
                window.activeCoursesSubTab = 'subjects';
                renderFacultyCourses(isAdmin);
            });

            return;
        }

        // Render original syllabus tab triggers
        dynamicContentArea.innerHTML = tabHeader;
        // Proceed with original courses content rendering...
    }

    const list = state.courses || [];
    let optionsHTML = list.map(c => `<option value="${c.code}">${c.code}: ${c.name}</option>`).join("");

    let coursesCardsHTML = "";
    list.forEach(c => {
        let attachmentHTML = "";
        if (c.attachmentName) {
            attachmentHTML = `
                <div style="margin-top: 12px; padding: 10px; background: rgba(99, 102, 241, 0.05); border-radius: 6px; border: 1px dashed rgba(99, 102, 241, 0.25);">
                    <div style="font-size: 11px; color: var(--primary); font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><i class="fa-solid fa-file" style="margin-right: 4px;"></i>${c.attachmentName}</div>
                    <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">${c.attachmentDetails || 'No details provided.'}</div>
                </div>
            `;
        } else {
            attachmentHTML = `
                <div style="margin-top: 12px; padding: 8px; font-size: 11px; color: var(--text-muted); font-style: italic; text-align: center; background: rgba(0,0,0,0.02); border-radius: 6px;">
                    No syllabus or files uploaded yet.
                </div>
            `;
        }

        coursesCardsHTML += `
            <div class="glass-card">
                <div class="flex-space mb-12">
                    <span style="font-size: 11px; font-weight: 700; color: var(--primary);">${c.code}</span>
                    <span class="badge badge-info">${c.credits} Credits</span>
                </div>
                <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 6px;">${c.name}</h4>
                <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 12px;">Dept: ${c.department}</p>
                ${attachmentHTML}
            </div>
        `;
    });

    const bodyHTML = `
        <div class="grid-3 mb-20">
            <div class="glass-card" style="grid-column: span 1;">
                <h3 class="card-title mb-16">Upload Syllabus & Details</h3>
                <form id="course-upload-form">
                    <div class="form-group">
                        <label for="course-select">Select Course Subject</label>
                        <select id="course-select" class="form-control" style="padding-left: 16px;">
                            ${optionsHTML}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="course-file">Select Syllabus/Details File</label>
                        <input type="file" id="course-file" class="form-control" style="padding: 6px 12px; background: rgba(255,255,255,0.01);" required>
                    </div>
                    <div class="form-group">
                        <label for="course-details">Course Details & Syllabus Updates</label>
                        <textarea id="course-details" class="form-control" rows="3" placeholder="Enter details or changes about this course..." style="height: auto; padding-left: 16px;" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 12px;">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Upload Details
                    </button>
                </form>
            </div>

            <div class="glass-card" style="grid-column: span 2;">
                <h3 class="card-title mb-16">Active Academic Course List</h3>
                <div class="grid-2" style="gap: 16px; max-height: 480px; overflow-y: auto; padding-right: 6px;">
                    ${coursesCardsHTML}
                </div>
            </div>
        </div>
    `;

    if (isAdmin) {
        // Append body content below the tab header
        const container = document.createElement("div");
        container.innerHTML = bodyHTML;
        dynamicContentArea.appendChild(container.firstElementChild);
    } else {
        dynamicContentArea.innerHTML = bodyHTML;
    }

    // Bind subtab triggers in syllabus view too if admin
    if (isAdmin) {
        document.getElementById("subtab-syllabus").addEventListener("click", () => {
            window.activeCoursesSubTab = 'syllabus';
            renderFacultyCourses(isAdmin);
        });
        document.getElementById("subtab-subjects").addEventListener("click", () => {
            window.activeCoursesSubTab = 'subjects';
            renderFacultyCourses(isAdmin);
        });
    }

    document.getElementById("course-upload-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const code = document.getElementById("course-select").value;
        const fileInput = document.getElementById("course-file");
        const details = document.getElementById("course-details").value.trim();
        const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : "syllabus.pdf";

        const course = state.courses.find(c => c.code === code);
        if (course) {
            course.attachmentName = fileName;
            course.attachmentDetails = details;
            
            const idx = state.courses.findIndex(c => c.code === code);
            if (idx !== -1) {
                state.courses[idx] = course;
                state.saveState();
                alert(`Course syllabus/details updated successfully for ${course.name}!`);
                renderFacultyCourses(isAdmin);
            }
        }
    });
}

// Global window handle for deleting subject
window.handleDeleteSubject = function(id) {
    if (confirm("Are you sure you want to delete this subject?")) {
        state.deleteSubject(id);
        renderFacultyCourses(true);
    }
};

window.renderTeacherCourses = function() {
    renderFacultyCourses(false);
};

window.renderAdminCourses = function() {
    renderFacultyCourses(true);
};

window.renderStudentTimetable = function() {
    const division = currentUser.division || "A";
    const divKey = "Division " + division;
    const timetable = state.timetables[divKey] || {};
    const defaultTimetable = DEFAULT_TIMETABLES[divKey] || {};
    const slots = [
        { id: 1, time: "08:00 - 09:00 AM" },
        { id: 2, time: "09:00 - 10:00 AM" },
        { id: 3, time: "10:20 - 11:20 AM" },
        { id: 4, time: "11:20 AM - 12:20 PM" }
    ];
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayName = daysOfWeek[new Date().getDay()] || "Monday";

    let gridHTML = "";
    
    // Headers
    gridHTML += `<div class="timetable-header" style="grid-column: 1;">Slot / Time</div>`;
    weekdays.forEach(day => {
        const isToday = day === currentDayName;
        gridHTML += `<div class="timetable-header" style="${isToday ? 'border-bottom: 2px solid var(--primary); font-weight: bold; color: var(--primary);' : ''}">${day}${isToday ? ' (Today)' : ''}</div>`;
    });

    // Populate rows
    slots.forEach(slot => {
        gridHTML += `
            <div class="timetable-row-label">
                <div class="text-center">
                    <div style="font-weight: 700; color: var(--text-main);">P${slot.id}</div>
                    <div style="font-size: 9px; white-space: nowrap;">${slot.time}</div>
                </div>
            </div>
        `;
        
        weekdays.forEach(day => {
            const isToday = day === currentDayName;
            // Load from modified state schedule only if it is today; otherwise load default read-only schedule
            const classesOnDay = (isToday ? timetable[day] : defaultTimetable[day]) || [];
            const details = classesOnDay.find(c => c.slot === slot.id);
            
            if (details && details.subject) {
                const isCancelled = details.status === "Cancelled";
                if (isCancelled) {
                    gridHTML += `
                        <div class="timetable-slot" style="background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.25);">
                            <div class="timetable-subject" style="text-decoration: line-through; color: var(--danger); font-size: 11px;">${details.subject}</div>
                            <div class="timetable-teacher" style="color: var(--danger); font-weight: bold; font-size: 10px;">CANCELLED</div>
                            <div class="timetable-room" style="font-size: 9px; color: var(--text-muted);"><i class="fa-solid fa-ban" style="margin-right: 4px;"></i>No Class</div>
                        </div>
                    `;
                } else {
                    const isSwapped = isToday && (details.subject !== (defaultTimetable[day]?.find(c => c.slot === slot.id)?.subject));
                    const borderStyle = isSwapped ? 'border: 1.5px solid var(--accent); background: rgba(99, 102, 241, 0.08);' : '';
                    
                    gridHTML += `
                        <div class="timetable-slot" style="${borderStyle}">
                            <div class="timetable-subject" style="font-size: 11px; font-weight: 700; color: ${isSwapped ? 'var(--accent)' : 'var(--primary)'};">${details.subject}</div>
                            <div class="timetable-teacher" style="font-size: 10px;">${details.teacher}</div>
                            <div class="timetable-room" style="font-size: 9px;"><i class="fa-solid fa-location-dot" style="margin-right: 4px;"></i>${details.room} ${isSwapped ? '<span class="badge badge-warning" style="font-size: 8px; padding: 1px 3px; margin-left: 2px;">SWAPPED</span>' : ''}</div>
                        </div>
                    `;
                }
            } else {
                gridHTML += `
                    <div class="timetable-slot timetable-empty">
                        <span>Free Slot</span>
                    </div>
                `;
            }
        });
    });

    dynamicContentArea.innerHTML = `
        <div class="glass-card">
            <div class="card-header-flex">
                <div>
                    <h3 class="card-title">Class Timetable - Division ${division}</h3>
                    <p style="font-size: 13px; color: var(--text-muted);">
                        Schedules mapped automatically. Only the schedule updates for today (<strong>${currentDayName}</strong>) are visible to students.
                    </p>
                </div>
            </div>
            <div class="timetable-container">
                <div class="timetable-grid" style="grid-template-columns: 100px repeat(6, 1fr);">
                    ${gridHTML}
                </div>
            </div>
        </div>
    `;
};

window.renderStudentAttendance = function() {
    const att = currentUser.attendance || {};
    const stats = calculateAttendance(currentUser);
    const radius = 60;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (stats.percentage / 100) * circ;

    let calendarRowsHTML = "";
    const dates = Object.keys(att).sort().reverse();
    
    if (dates.length === 0) {
        calendarRowsHTML = `<tr><td colspan="3" class="text-center" style="color: var(--text-muted);">No attendance logged yet.</td></tr>`;
    } else {
        dates.forEach(d => {
            const status = att[d];
            const badgeClass = status === 'present' ? 'badge-success' : 'badge-danger';
            calendarRowsHTML += `
                <tr>
                    <td>${formatDate(d)}</td>
                    <td>B.Com Sem-V Core Lectures</td>
                    <td><span class="badge ${badgeClass}">${status}</span></td>
                </tr>
            `;
        });
    }

    dynamicContentArea.innerHTML = `
        <div class="glass-card mb-20" style="padding: 20px;">
            <h3 class="card-title">Mark Attendance via Verification Code</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">Enter the code generated by your teacher for today's lecture.</p>
            <form id="student-attendance-checkin-form" style="display: flex; gap: 12px; align-items: flex-end; max-width: 500px;">
                <div class="form-group" style="flex-grow: 1; margin-bottom: 0;">
                    <label for="att-checkin-code" style="font-size: 11px;">Verification Code (e.g. TCC7A9)</label>
                    <input type="text" id="att-checkin-code" class="form-control" placeholder="Enter 6-character code" style="padding-left: 16px; text-transform: uppercase;" required>
                </div>
                <button type="submit" class="btn btn-primary" style="height: 42px; padding: 0 24px;">
                    <i class="fa-solid fa-circle-check"></i> Check In
                </button>
            </form>
        </div>

        <div class="grid-3">
            <div class="glass-card attendance-overview">
                <h3 class="card-title">Attendance Ratio</h3>
                <div class="progress-circle">
                    <svg>
                        <circle class="progress-circle-bg" cx="75" cy="75" r="${radius}"></circle>
                        <circle class="progress-circle-bar" cx="75" cy="75" r="${radius}" 
                            style="stroke-dasharray: ${circ}; stroke-dashoffset: ${offset};"></circle>
                    </svg>
                    <div class="progress-circle-value">
                        <h2>${stats.percentage}%</h2>
                        <p>Ratio</p>
                    </div>
                </div>
                
                <div style="display: flex; gap: 20px; justify-content: center; width: 100%;">
                    <div class="text-center">
                        <span style="color: var(--success); font-size: 18px; font-weight: 700;">${stats.present}</span>
                        <p style="font-size: 11px; color: var(--text-muted);">Present</p>
                    </div>
                    <div class="text-center" style="border-left: 1px solid var(--border-color); padding-left: 20px;">
                        <span style="color: var(--danger); font-size: 18px; font-weight: 700;">${stats.absent}</span>
                        <p style="font-size: 11px; color: var(--text-muted);">Absent</p>
                    </div>
                </div>
            </div>

            <div class="glass-card" style="grid-column: span 2;">
                <h3 class="card-title mb-16">Detailed Logs</h3>
                <div class="table-responsive">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category / Class</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${calendarRowsHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Hook checkin submit
    const checkinForm = document.getElementById("student-attendance-checkin-form");
    if (checkinForm) {
        checkinForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const inputCode = document.getElementById("att-checkin-code").value.trim().toUpperCase();
            const todayStr = new Date().toISOString().split("T")[0];
            
            let divLetter = (currentUser.division || currentUser.class || "A").toString().replace("Division ", "").trim();
            if (divLetter.length > 1) {
                divLetter = "A"; // fallback
            }

            // Show temporary loading indicator
            const submitBtn = checkinForm.querySelector("button[type='submit']");
            const originalBtnHTML = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verifying...`;

            const validKey = `${inputCode}-valid-div-${divLetter}`;
            
            // 1. Verify Code Validity
            fetch(`https://api.counterapi.dev/v1/TolaniNEPAttendance/${validKey}`)
                .then(res => {
                    if (!res.ok) throw new Error("not_found");
                    return res.json();
                })
                .then(data => {
                    if (!data || data.count === 0) {
                        alert("Invalid verification code. Please check with your professor.");
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnHTML;
                        return;
                    }

                    // 2. Check if student already checked in
                    const studentKey = `${inputCode}-student-${currentUser.username}`;
                    fetch(`https://api.counterapi.dev/v1/TolaniNEPAttendance/${studentKey}/up`)
                        .then(res => res.json())
                        .then(studentData => {
                            if (studentData.count > 1) {
                                alert("You have already checked-in and marked attendance for this lecture.");
                                submitBtn.disabled = false;
                                submitBtn.innerHTML = originalBtnHTML;
                                return;
                            }

                            // 3. Decrement Capacity
                            fetch(`https://api.counterapi.dev/v1/TolaniNEPAttendance/${inputCode}/down`)
                                .then(res => res.json())
                                .then(capacityData => {
                                    if (capacityData.count < 0) {
                                        alert("Attendance code limit has been reached. You are marked as Absent.");
                                        if (!currentUser.attendance) currentUser.attendance = {};
                                        currentUser.attendance[todayStr] = "absent";
                                        state.updateUser(currentUser);
                                        state.saveState();
                                        submitBtn.disabled = false;
                                        submitBtn.innerHTML = originalBtnHTML;
                                        renderStudentAttendance();
                                        return;
                                    }

                                    // Mark student check-in present locally
                                    if (!currentUser.attendance) currentUser.attendance = {};
                                    currentUser.attendance[todayStr] = "present";
                                    state.updateUser(currentUser);
                                    state.saveState();

                                    // Also register student-specific attendance state on CounterAPI for teacher list sync
                                    const recordKey = `student-${currentUser.username}-date-${todayStr}`;
                                    fetch(`https://api.counterapi.dev/v1/TolaniNEPAttendance/${recordKey}/up`)
                                        .catch(err => console.error("Sync error:", err));

                                    alert(`Checked-in successfully! You have been marked as Present for Division ${divLetter} on today's lecture.`);
                                    submitBtn.disabled = false;
                                    submitBtn.innerHTML = originalBtnHTML;
                                    renderStudentAttendance();
                                });
                        });
                })
                .catch(err => {
                    alert("Invalid verification code. Please check with your professor.");
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHTML;
                });
        });
    }
};

window.renderStudentAssignments = function() {
    const list = state.assignments.filter(a => 
        a.subject === "General" || 
        currentUser.grades.some(g => g.subject === a.subject || g.code === a.courseCode)
    );

    let rowsHTML = "";
    list.forEach(a => {
        const sub = a.submissions.find(s => s.studentUsername === currentUser.username);
        let statusHTML = "";
        let actionHTML = "";

        if (sub) {
            const badgeClass = sub.status === "Graded" ? "badge-success" : "badge-warning";
            const gradeText = sub.status === "Graded" ? `Graded: <strong>${sub.marks} / 10</strong>` : "Submitted Offline";
            statusHTML = `<span class="badge ${badgeClass}">${sub.status === "Graded" ? "Graded" : "Submitted"}</span>`;
            actionHTML = `<span style="font-size: 12px; color: var(--text-muted);">${gradeText}</span>`;
        } else {
            statusHTML = `<span class="badge badge-danger">Pending (Offline)</span>`;
            actionHTML = `<span style="font-size: 12px; color: var(--text-muted);">Please submit to your professor offline.</span>`;
        }

        rowsHTML += `
            <tr>
                <td>
                    <div style="font-weight: 600; font-size: 14px;">${a.title}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${a.description}</div>
                </td>
                <td>${a.subject}</td>
                <td>${formatDate(a.dueDate)}</td>
                <td>${statusHTML}</td>
                <td>${actionHTML}</td>
            </tr>
        `;
    });

    if (rowsHTML === "") {
        rowsHTML = `<tr><td colspan="5" class="text-center" style="color: var(--text-muted); padding: 24px;">No assignments uploaded yet.</td></tr>`;
    }

    dynamicContentArea.innerHTML = `
        <div class="glass-card">
            <h3 class="card-title mb-16">Active Homework & Assignments</h3>
            <div class="table-responsive">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>Assignment / Details</th>
                            <th>Course</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Action / Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

window.simulateAssignmentSubmit = function(id) {
    const filename = prompt("Enter the name of your answer sheet file to upload:", "my_answers.pdf");
    if (filename) {
        const asm = state.assignments.find(a => a.id === id);
        if (asm) {
            asm.submissions.push({
                studentUsername: currentUser.username,
                file: filename.trim(),
                marks: null,
                maxMarks: 10,
                status: "Submitted"
            });
            state.updateAssignment(asm);
            alert("File uploaded successfully. Status updated to Submitted!");
            renderStudentAssignments();
        }
    }
};

window.renderStudentMaterials = function() {
    const list = state.materials || [];

    let cardsHTML = "";
    list.forEach(m => {
        let fileIcon = "fa-file-pdf";
        let iconColor = "#ef4444";
        if (m.type === "PPT") {
            fileIcon = "fa-file-powerpoint";
            iconColor = "#eab308";
        } else if (m.type === "Video") {
            fileIcon = "fa-file-video";
            iconColor = "#3b82f6";
        }

        cardsHTML += `
            <div class="glass-card">
                <div class="flex-space mb-16">
                    <span style="font-size: 32px; color: ${iconColor};"><i class="fa-solid ${fileIcon}"></i></span>
                    <span class="badge badge-secondary">${m.type}</span>
                </div>
                <h4 style="font-weight: 600; font-size: 15px; margin-bottom: 8px;">${m.title}</h4>
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">Course: ${m.subject} | Uploaded by: ${m.uploadedBy}</p>
                <a href="#" class="btn btn-secondary btn-sm text-center" onclick="alert('Downloading ${m.link} ...')">
                    <i class="fa-solid fa-download"></i> Download Handout
                </a>
            </div>
        `;
    });

    if (cardsHTML === "") {
        cardsHTML = `<div style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 32px;">No study materials shared yet.</div>`;
    }

    dynamicContentArea.innerHTML = `
        <div class="grid-3">
            ${cardsHTML}
        </div>
    `;
};

window.renderStudentInternalmarks = function() {
    let rowsHTML = "";
    
    // Core courses mapping
    const studentCourses = state.courses.filter(c => {
        if (c.code === "BC-101" || c.code === "BC-102" || c.code === "BC-103") return true;
        return c.code.includes(`-${currentUser.subject}-`) || c.code === `BC-${currentUser.subject}-104`;
    });

    studentCourses.forEach(c => {
        const mark = getInternalMarks(currentUser, c.code);
        const percent = Math.round((mark / 30) * 100);
        
        // Split marks categories deterministically for visual details
        const testMarks = Math.round((mark / 30) * 15);
        const assignMarks = Math.round((mark / 30) * 10);
        const attMarks = mark - testMarks - assignMarks;

        rowsHTML += `
            <tr>
                <td><strong>${c.code}</strong></td>
                <td>${c.name}</td>
                <td>${testMarks} / 15</td>
                <td>${assignMarks} / 10</td>
                <td>${attMarks} / 5</td>
                <td><strong>${mark} / 30</strong></td>
                <td>
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; height: 8px; overflow: hidden; width: 120px;">
                        <div style="background: var(--primary); width: ${percent}%; height: 100%;"></div>
                    </div>
                </td>
            </tr>
        `;
    });

    dynamicContentArea.innerHTML = `
        <div class="glass-card">
            <h3 class="card-title mb-16">Continuous Evaluation (Internal Term Marks)</h3>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">Maximum internal credit points: 30 (Passing requirement: 12)</p>
            <div class="table-responsive">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Subject Title</th>
                            <th>Tests (15)</th>
                            <th>Assignments (10)</th>
                            <th>Attendance (5)</th>
                            <th>Obtained Marks</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};



window.renderStudentFees = function() {
    const eshikshaURL = "https://share.google/x83WwiwJV409pKHzP";

    dynamicContentArea.innerHTML = `
        <div class="glass-card" style="padding: 40px; max-width: 650px; margin: 20px auto; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 24px; border: 1.5px solid rgba(99, 102, 241, 0.25);">
            <div class="brand-icon" style="width: 64px; height: 64px; font-size: 30px; background: linear-gradient(135deg, var(--primary), var(--secondary));">
                <i class="fa-solid fa-credit-card"></i>
            </div>
            <div>
                <h2 style="font-size: 26px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">eShiksa Fee Payment Portal</h2>
                <p style="color: var(--text-muted); font-size: 13.5px; max-width: 480px; margin: 0 auto; line-height: 1.6;">
                    All college term fees, semester fees, and registrations are managed through the official eShiksa platform. Click the portal link below to log in and pay your college fees online.
                </p>
            </div>
            
            <div style="width: 100%; display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
                <a href="${eshikshaURL}" target="_blank" class="btn btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; font-size: 15px; padding: 12px 24px;">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    <span>eShiksa - Login & Pay Fees</span>
                </a>
            </div>
            
            <div style="font-size: 12px; color: var(--text-muted); border-top: 1px dashed var(--border-color); width: 100%; padding-top: 16px; margin-top: 8px; line-height: 1.5;">
                Important: Once payment is completed on the eShiksa website, your college fee status will automatically update. For any payment disputes or issues, please contact the college accounts desk.
            </div>
        </div>
    `;
};

window.renderStudentCirculars = function() {
    renderCircularListBoard(false);
};

window.renderStudentProfile = function() {
    renderProfileBase(currentUser);
};

window.renderStudentLeave = function() {
    const studentApps = state.leaves.filter(l => l.studentUsername === currentUser.username);
    
    let tableRowsHTML = "";
    if (studentApps.length === 0) {
        tableRowsHTML = `<tr><td colspan="5" class="text-center" style="color: var(--text-muted);">No applications submitted yet.</td></tr>`;
    } else {
        studentApps.forEach(app => {
            const statusClass = app.status === 'Approved' ? 'badge-success' : (app.status === 'Rejected' ? 'badge-danger' : 'badge-warning');
            const fileBadge = app.fileName && app.fileName !== 'No file attached'
                ? `<span class="badge badge-info" style="font-size: 11px;"><i class="fa-solid fa-file-arrow-down" style="margin-right: 4px;"></i>${app.fileName}</span>`
                : `<span style="font-size: 11px; color: var(--text-muted);">None</span>`;
            
            tableRowsHTML += `
                <tr>
                    <td>${formatDate(app.startDate || new Date().toISOString().substring(0, 10))}</td>
                    <td><strong>${app.title || 'General Application'}</strong></td>
                    <td>${app.reason}</td>
                    <td>${fileBadge}</td>
                    <td><span class="badge ${statusClass}">${app.status}</span></td>
                </tr>
            `;
        });
    }

    dynamicContentArea.innerHTML = `
        <div class="grid-3" style="gap: 20px;">
            <div class="glass-card" style="grid-column: span 1;">
                <h3 class="card-title mb-16">Submit Application</h3>
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">Write an application to the administration. You can upload proof or supportive documents below.</p>
                
                <form id="student-app-form">
                    <div class="form-group">
                        <label for="app-title">Subject / Title</label>
                        <input type="text" id="app-title" class="form-control" placeholder="e.g. Leave Request, Fee Installment" style="padding-left: 16px;" required>
                    </div>
                    <div class="form-group">
                        <label for="app-body">Application Content</label>
                        <textarea id="app-body" class="form-control" rows="5" placeholder="Provide full details of your request..." style="padding: 12px 16px;" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="app-file">Attach Document (Optional)</label>
                        <input type="file" id="app-file" class="form-control" style="padding: 8px 16px; border: 1px dashed var(--border-color); background: rgba(255,255,255,0.01);">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 12px;">
                        <i class="fa-solid fa-paper-plane"></i> Submit Application
                    </button>
                </form>
            </div>
            
            <div class="glass-card" style="grid-column: span 2;">
                <h3 class="card-title mb-16">Application Tracker</h3>
                <div class="table-responsive">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Subject</th>
                                <th>Reason / Details</th>
                                <th>Attachment</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRowsHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.getElementById("student-app-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const titleVal = document.getElementById("app-title").value.trim();
        const bodyVal = document.getElementById("app-body").value.trim();
        const fileInput = document.getElementById("app-file");
        
        let attachedFileName = "No file attached";
        if (fileInput.files && fileInput.files.length > 0) {
            attachedFileName = fileInput.files[0].name;
        }

        const todayStr = new Date().toISOString().substring(0, 10);
        const newAppRecord = {
            id: "app-" + Date.now(),
            studentUsername: currentUser.username,
            studentName: currentUser.name,
            title: titleVal,
            reason: bodyVal,
            fileName: attachedFileName,
            startDate: todayStr,
            endDate: todayStr,
            status: "Pending"
        };

        state.addLeave(newAppRecord);
        alert("Application submitted successfully to college registry.");
        renderStudentLeave();
    });
};


// =========================================================================
// =========================================================================
// TEACHER & ADMIN PORTAL SHARED UTILITIES & VIEWS
// =========================================================================

// Shared Dashboard View
function renderFacultyDashboard(isAdmin) {
    const studentsList = state.users.filter(u => u.role === 'student');
    const teachersList = state.users.filter(u => u.role === 'teacher');
    
    // Stats calculation
    const totalStudents = studentsList.length;
    const totalTeachers = teachersList.length + 1; // Sarah + Rajesh + Admin
    const totalCourses = state.courses.length;
    
    // Calculate overall attendance ratio
    let totalPresent = 0;
    let totalLogs = 0;
    studentsList.forEach(s => {
        const att = Object.values(s.attendance || {});
        att.forEach(val => {
            if (val === 'present') totalPresent++;
            totalLogs++;
        });
    });
    const avgAttendance = totalLogs > 0 ? Math.round((totalPresent / totalLogs) * 100) : 85;

    // Calculate pending fees
    let pendingFees = 0;
    studentsList.forEach(s => {
        pendingFees += s.feeStatus ? s.feeStatus.due : 0;
    });

    // Recent circulars
    const latestAnnouncements = state.circulars.slice(0, 3);
    let announcementsHTML = "";
    latestAnnouncements.forEach(c => {
        announcementsHTML += `
            <div class="announcement-item announce-${c.category}" style="padding: 12px 16px;">
                <div class="announce-header">
                    <span class="announce-type type-${c.category}">${c.category}</span>
                    <span class="announce-date">${formatDate(c.date)}</span>
                </div>
                <h4 class="announce-title" style="font-size: 14px;">${c.title}</h4>
                <p class="announce-desc">${c.content.substring(0, 90)}...</p>
            </div>
        `;
    });

    const statsGridHTML = `
        <div class="grid-3 mb-20">
            <div class="glass-card stat-card">
                <div class="stat-info">
                    <h3>Total Students</h3>
                    <div class="stat-value">${totalStudents}</div>
                </div>
                <div class="stat-icon icon-blue"><i class="fa-solid fa-users"></i></div>
            </div>
            <div class="glass-card stat-card">
                <div class="stat-info">
                    <h3>Total Faculty</h3>
                    <div class="stat-value">${totalTeachers}</div>
                </div>
                <div class="stat-icon icon-teal"><i class="fa-solid fa-chalkboard-user"></i></div>
            </div>
            <div class="glass-card stat-card">
                <div class="stat-info">
                    <h3>Today's Attendance</h3>
                    <div class="stat-value">${avgAttendance}%</div>
                </div>
                <div class="stat-icon icon-green"><i class="fa-solid fa-calendar-check"></i></div>
            </div>
        </div>
    `;

    dynamicContentArea.innerHTML = `
        ${statsGridHTML}

        <div class="grid-3">
            <!-- Notices -->
            <div class="glass-card" style="grid-column: span 2;">
                <div class="card-header-flex">
                    <h3 class="card-title">Notice Board Circulars</h3>
                    <button class="btn btn-secondary btn-sm" onclick="navigateTo('communication')">Write Notice</button>
                </div>
                <div class="announcement-list">
                    ${announcementsHTML}
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="glass-card">
                <h3 class="card-title mb-16">Quick Controls</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button class="btn btn-primary" onclick="navigateTo('attendance')" style="text-align: left; padding: 12px 16px;">
                        <i class="fa-solid fa-clipboard-user" style="margin-right: 8px;"></i> Roll Call Attendance
                    </button>
                    <button class="btn btn-secondary" onclick="navigateTo('assignments')" style="text-align: left; padding: 12px 16px;">
                        <i class="fa-solid fa-file-pen" style="margin-right: 8px;"></i> Create Assignment
                    </button>
                    <button class="btn btn-secondary" onclick="navigateTo('marks')" style="text-align: left; padding: 12px 16px;">
                        <i class="fa-solid fa-circle-dot" style="margin-right: 8px;"></i> Enter Term Marks
                    </button>
                    ${isAdmin ? `
                        <button class="btn btn-secondary" onclick="navigateTo('fees')" style="text-align: left; padding: 12px 16px; color: var(--accent); border-color: rgba(245, 158, 11, 0.2);">
                            <i class="fa-solid fa-wallet" style="margin-right: 8px;"></i> Fees Link Setup
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Student Applications shared manager views for faculty/admins
function renderFacultyApplications(isAdmin) {
    const list = state.leaves || [];
    let rowsHTML = "";
    
    if (list.length === 0) {
        rowsHTML = `<tr><td colspan="7" class="text-center" style="color: var(--text-muted); padding: 24px;">No student applications registered.</td></tr>`;
    } else {
        list.forEach((app, i) => {
            const statusClass = app.status === 'Approved' ? 'badge-success' : (app.status === 'Rejected' ? 'badge-danger' : 'badge-warning');
            const fileBadge = app.fileName && app.fileName !== 'No file attached'
                ? `<span class="badge badge-info" style="font-size: 11px;"><i class="fa-solid fa-file-arrow-down" style="margin-right: 4px;"></i>${app.fileName}</span>`
                : `<span style="font-size: 11px; color: var(--text-muted);">None</span>`;
            
            const actionsHTML = app.status === 'Pending'
                ? `
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-primary btn-sm" onclick="handleUpdateAppStatus('${app.id}', 'Approved')" style="padding: 4px 10px;">Approve</button>
                        <button class="btn btn-secondary btn-sm" onclick="handleUpdateAppStatus('${app.id}', 'Rejected')" style="padding: 4px 10px; color: var(--danger); border-color: rgba(239, 68, 68, 0.2);">Reject</button>
                    </div>
                  `
                : `<span style="font-size: 12px; color: var(--text-muted);">Handled</span>`;

            rowsHTML += `
                <tr>
                    <td>${formatDate(app.startDate || new Date().toISOString().substring(0, 10))}</td>
                    <td>
                        <div style="font-weight:600;">${app.studentName}</div>
                        <div style="font-size:11px; color: var(--text-muted);">Roll No: ${app.studentUsername}</div>
                    </td>
                    <td><strong>${app.title || 'General Application'}</strong></td>
                    <td>${app.reason}</td>
                    <td>${fileBadge}</td>
                    <td><span class="badge ${statusClass}">${app.status}</span></td>
                    <td>${actionsHTML}</td>
                </tr>
            `;
        });
    }

    dynamicContentArea.innerHTML = `
        <div class="glass-card">
            <h3 class="card-title mb-16">Student Applications Registry</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 20px;">Review and manage student applications, leaves, and requests.</p>
            <div class="table-responsive">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Student Details</th>
                            <th>Subject</th>
                            <th>Reason / Content</th>
                            <th>Attachment</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

window.handleUpdateAppStatus = function(appId, newStatus) {
    const app = state.leaves.find(l => l.id === appId);
    if (app) {
        app.status = newStatus;
        state.updateLeave(app);
        alert(`Application status updated to ${newStatus}!`);
        // Refresh view
        if (currentUser.role === 'admin') {
            renderAdminLeave();
        } else {
            renderTeacherLeave();
        }
    }
};

window.renderTeacherLeave = function() {
    renderFacultyApplications(false);
};

window.renderAdminLeave = function() {
    renderFacultyApplications(true);
};

// Student Registry view
function renderRegistryUsers(isAdmin) {
    const searchLower = adminUsersSearch.toLowerCase().trim();
    const filtered = state.users.filter(u => {
        const matchesSearch = !searchLower || 
            u.name.toLowerCase().includes(searchLower) ||
            u.username.toLowerCase().includes(searchLower) ||
            (u.email && u.email.toLowerCase().includes(searchLower)) ||
            (u.rollNo && u.rollNo.toLowerCase().includes(searchLower));
        
        const matchesRole = !adminUsersRoleFilter || u.role === adminUsersRoleFilter;
        const matchesSubject = !adminUsersSubjectFilter || u.subject === adminUsersSubjectFilter;
        const matchesProgram = !adminUsersProgramFilter || (u.role === 'student' && (u.program || 'B.Com (Regular)') === adminUsersProgramFilter);
        const matchesYear = !adminUsersYearFilter || (u.role === 'student' && (u.year || '1st Year') === adminUsersYearFilter);
        const matchesSem = !adminUsersSemFilter || (u.role === 'student' && (u.semester || 'Semester 1') === adminUsersSemFilter);
        
        return matchesSearch && matchesRole && matchesSubject && matchesProgram && matchesYear && matchesSem;
    });

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ADMIN_USERS_PER_PAGE));
    
    if (adminUsersPage > totalPages) adminUsersPage = totalPages;
    if (adminUsersPage < 1) adminUsersPage = 1;
    
    const startIndex = (adminUsersPage - 1) * ADMIN_USERS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ADMIN_USERS_PER_PAGE);

    let listHTML = "";
    paginated.forEach((usr, i) => {
        const globalIndex = startIndex + i + 1;
        let roleBadge = usr.role === 'admin' ? 'badge-danger' : (usr.role === 'teacher' ? 'badge-warning' : 'badge-info');
        let detailsText = "";
        let yearText = "--";
        let semText = "--";
        
        if (usr.role === 'student') {
            detailsText = `Prog: <strong>${usr.program || 'B.Com (Regular)'}</strong> | Class: <strong>${usr.class || 'Division A'}</strong> | Roll: <strong>${usr.rollNo || 'N/A'}</strong>`;
            yearText = `<span class="badge badge-secondary">${usr.year || '1st Year'}</span>`;
            semText = `<span class="badge badge-info">${usr.semester || 'Semester 1'}</span>`;
        } else if (usr.role === 'teacher') {
            detailsText = `Dept: <strong>${usr.department}</strong> | Classes: <strong>${usr.classes.join(", ")}</strong>`;
        } else {
            detailsText = `System Level Administrator`;
        }

        listHTML += `
            <tr>
                <td>${globalIndex}</td>
                <td>
                    <div style="font-weight: 600; font-size: 14px;">${usr.name}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${usr.email}</div>
                </td>
                <td><span class="badge ${roleBadge}">${usr.role}</span></td>
                <td><span style="font-size: 12px;">${detailsText}</span></td>
                <td><span style="font-size: 12px; font-weight: bold;">${yearText}</span></td>
                <td><span style="font-size: 12px; font-weight: bold;">${semText}</span></td>
                <td><code>${usr.username}</code></td>
                <td>
                    <div style="display: flex; gap: 4px;">
                        <button class="btn btn-secondary btn-sm" onclick="viewDetailedUserProfile('${usr.username}')" style="padding: 4px 8px;">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        ${isAdmin && usr.username !== currentUser.username ? `
                            <button class="btn btn-secondary btn-sm" style="color: var(--danger); padding: 4px 8px; border-color: rgba(239, 68, 68, 0.15);" onclick="handleDeleteUser('${usr.username}')">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    });

    if (listHTML === "") {
        listHTML = `<tr><td colspan="8" class="text-center" style="color: var(--text-muted); padding: 24px;">No records match your search.</td></tr>`;
    }

    dynamicContentArea.innerHTML = `
        <div class="glass-card mb-16">
            <h3 class="card-title mb-16">Filter Registry</h3>
            <div class="form-grid" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr; gap: 12px;">
                <div>
                    <label for="users-search">Search Name, Roll No, or Email</label>
                    <input type="text" id="users-search" class="form-control" placeholder="Search..." value="${adminUsersSearch}" style="padding-left: 16px;">
                </div>
                <div>
                    <label for="users-role-filter">Role</label>
                    <select id="users-role-filter" class="form-control" style="padding-left: 16px;">
                        <option value="">All Roles</option>
                        <option value="admin" ${adminUsersRoleFilter === 'admin' ? 'selected' : ''}>Admin</option>
                        <option value="teacher" ${adminUsersRoleFilter === 'teacher' ? 'selected' : ''}>Teacher</option>
                        <option value="student" ${adminUsersRoleFilter === 'student' ? 'selected' : ''}>Student</option>
                    </select>
                </div>
                <div>
                    <label for="users-subject-filter">Subject (Students)</label>
                    <select id="users-subject-filter" class="form-control" style="padding-left: 16px;">
                        <option value="">All Subjects</option>
                        <option value="Stat" ${adminUsersSubjectFilter === 'Stat' ? 'selected' : ''}>Stat</option>
                        <option value="BA" ${adminUsersSubjectFilter === 'BA' ? 'selected' : ''}>BA</option>
                        <option value="BM" ${adminUsersSubjectFilter === 'BM' ? 'selected' : ''}>BM</option>
                        <option value="CS" ${adminUsersSubjectFilter === 'CS' ? 'selected' : ''}>CS</option>
                    </select>
                </div>
                <div>
                    <label for="users-program-filter">Program</label>
                    <select id="users-program-filter" class="form-control" style="padding-left: 16px;">
                        <option value="">All Programs</option>
                        <option value="B.Com (Regular)" ${adminUsersProgramFilter === 'B.Com (Regular)' ? 'selected' : ''}>B.Com (Regular)</option>
                        <option value="B.Com (Professional)" ${adminUsersProgramFilter === 'B.Com (Professional)' ? 'selected' : ''}>B.Com (Professional)</option>
                        <option value="M.Com" ${adminUsersProgramFilter === 'M.Com' ? 'selected' : ''}>M.Com</option>
                    </select>
                </div>
                <div>
                    <label for="users-year-filter">Year</label>
                    <select id="users-year-filter" class="form-control" style="padding-left: 16px;">
                        <option value="">All Years</option>
                        <option value="1st Year" ${adminUsersYearFilter === '1st Year' ? 'selected' : ''}>1st Year</option>
                        <option value="2nd Year" ${adminUsersYearFilter === '2nd Year' ? 'selected' : ''}>2nd Year</option>
                        <option value="3rd Year" ${adminUsersYearFilter === '3rd Year' ? 'selected' : ''}>3rd Year</option>
                    </select>
                </div>
                <div>
                    <label for="users-sem-filter">Semester</label>
                    <select id="users-sem-filter" class="form-control" style="padding-left: 16px;">
                        <option value="">All Semesters</option>
                        <option value="Semester 1" ${adminUsersSemFilter === 'Semester 1' ? 'selected' : ''}>Semester 1</option>
                        <option value="Semester 2" ${adminUsersSemFilter === 'Semester 2' ? 'selected' : ''}>Semester 2</option>
                        <option value="Semester 3" ${adminUsersSemFilter === 'Semester 3' ? 'selected' : ''}>Semester 3</option>
                        <option value="Semester 4" ${adminUsersSemFilter === 'Semester 4' ? 'selected' : ''}>Semester 4</option>
                        <option value="Semester 5" ${adminUsersSemFilter === 'Semester 5' ? 'selected' : ''}>Semester 5</option>
                        <option value="Semester 6" ${adminUsersSemFilter === 'Semester 6' ? 'selected' : ''}>Semester 6</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="glass-card">
            <div class="card-header-flex">
                <div>
                    <h3 class="card-title">User Registry Records (Showing ${startIndex + 1}-${Math.min(startIndex + paginated.length, totalItems)} of ${totalItems})</h3>
                    <p style="font-size: 12px; color: var(--text-muted);">Manage login keys, profiles, and roles across the portal</p>
                </div>
                ${isAdmin ? `
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="btn btn-primary btn-sm" onclick="openAddUserForm('student')">
                            <i class="fa-solid fa-plus"></i>
                            <span>Register Student</span>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="openAddUserForm('teacher')">
                            <i class="fa-solid fa-plus"></i>
                            <span>Register Teacher</span>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="triggerBulkImport()" style="color: var(--primary); border-color: rgba(99, 102, 241, 0.15);">
                            <i class="fa-solid fa-file-import"></i>
                            <span>Bulk Import (CSV/JSON)</span>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="deleteAllStudents()" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.15);">
                            <i class="fa-solid fa-trash-can"></i>
                            <span>Delete All Students</span>
                        </button>
                        <input type="file" id="bulk-import-file-input" style="display: none;" accept=".csv,.json" onchange="handleBulkImportFile(event)">
                    </div>
                ` : ''}
            </div>
            
            <div class="table-responsive">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Full Name / Email</th>
                            <th>Access Level</th>
                            <th>Program Details</th>
                            <th>Year</th>
                            <th>Semester</th>
                            <th>Username</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${listHTML}
                    </tbody>
                </table>
            </div>

            <!-- Pagination Bar -->
            <div class="flex-space" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                <button class="btn btn-secondary btn-sm" id="users-prev-page" ${adminUsersPage === 1 ? 'disabled' : ''}>
                    <i class="fa-solid fa-chevron-left" style="margin-right: 6px;"></i> Prev
                </button>
                <span style="font-size: 13px; color: var(--text-muted);">Page <strong>${adminUsersPage}</strong> of <strong>${totalPages}</strong></span>
                <button class="btn btn-secondary btn-sm" id="users-next-page" ${adminUsersPage === totalPages ? 'disabled' : ''}>
                    Next <i class="fa-solid fa-chevron-right" style="margin-left: 6px;"></i>
                </button>
            </div>
        </div>
    `;

    document.getElementById("users-search").addEventListener("input", (e) => {
        adminUsersSearch = e.target.value;
        adminUsersPage = 1;
        renderRegistryUsers(isAdmin);
    });
    document.getElementById("users-role-filter").addEventListener("change", (e) => {
        adminUsersRoleFilter = e.target.value;
        adminUsersPage = 1;
        renderRegistryUsers(isAdmin);
    });
    document.getElementById("users-subject-filter").addEventListener("change", (e) => {
        adminUsersSubjectFilter = e.target.value;
        adminUsersPage = 1;
        renderRegistryUsers(isAdmin);
    });
    document.getElementById("users-program-filter").addEventListener("change", (e) => {
        adminUsersProgramFilter = e.target.value;
        adminUsersPage = 1;
        renderRegistryUsers(isAdmin);
    });
    document.getElementById("users-year-filter").addEventListener("change", (e) => {
        adminUsersYearFilter = e.target.value;
        adminUsersPage = 1;
        renderRegistryUsers(isAdmin);
    });
    document.getElementById("users-sem-filter").addEventListener("change", (e) => {
        adminUsersSemFilter = e.target.value;
        adminUsersPage = 1;
        renderRegistryUsers(isAdmin);
    });

    const prevBtn = document.getElementById("users-prev-page");
    const nextBtn = document.getElementById("users-next-page");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            adminUsersPage--;
            renderRegistryUsers(isAdmin);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            adminUsersPage++;
            renderRegistryUsers(isAdmin);
        });
    }
}

window.viewDetailedUserProfile = function(username) {
    const userObj = state.users.find(u => u.username === username);
    if (!userObj) return;

    let bodyHTML = "";
    if (userObj.role === 'student') {
        const attStats = calculateAttendance(userObj);
        const cgpaVal = calculateCGPA(userObj.grades);
        
        let gradesRowsHTML = "";
        (userObj.grades || []).forEach(g => {
            gradesRowsHTML += `
                <div class="flex-space" style="font-size: 13px; padding: 6px 0; border-bottom: 1px dashed var(--border-color);">
                    <span>${g.subject} (${g.code})</span>
                    <strong class="badge badge-info">${g.grade}</strong>
                </div>
            `;
        });

        bodyHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; color: var(--text-main);">
                <div>
                    <h4 style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 12px; color: var(--primary);">Official Credentials</h4>
                    <div class="profile-detail-item" style="margin-bottom: 8px;"><strong>Full Name:</strong> ${userObj.name}</div>
                    <div class="profile-detail-item" style="margin-bottom: 8px;"><strong>Roll Number:</strong> ${userObj.rollNo}</div>
                    <div class="profile-detail-item" style="margin-bottom: 8px;"><strong>SPDID:</strong> <code>${userObj.spdid}</code></div>
                    <div class="profile-detail-item" style="margin-bottom: 8px;"><strong>Enrolment Number:</strong> <code>${userObj.enrolmentNo}</code></div>
                    <div class="profile-detail-item" style="margin-bottom: 8px;"><strong>Admission App No:</strong> <code>${userObj.admAppNo}</code></div>
                    <div class="profile-detail-item" style="margin-bottom: 8px;"><strong>Major Subject Group:</strong> ${userObj.subject}</div>
                </div>
                <div>
                    <h4 style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 12px; color: var(--secondary);">Academic Metrics</h4>
                    <div class="profile-detail-item" style="margin-bottom: 8px;"><strong>Email:</strong> ${userObj.email}</div>
                    <div class="profile-detail-item" style="margin-bottom: 8px;"><strong>Phone:</strong> ${userObj.phone}</div>
                    <div class="profile-detail-item" style="margin-bottom: 8px;"><strong>Attendance Ratio:</strong> <strong style="color: var(--success);">${attStats.percentage}%</strong></div>
                    <div class="profile-detail-item" style="margin-bottom: 8px;"><strong>Tuition Dues:</strong> <strong style="color: var(--danger);">₹${userObj.feeStatus ? userObj.feeStatus.due : 0}</strong></div>
                </div>
            </div>
        `;
    } else {
        bodyHTML = `
            <div style="color: var(--text-main);">
                <div style="margin-bottom: 8px;"><strong>Full Name:</strong> ${userObj.name}</div>
                <div style="margin-bottom: 8px;"><strong>Role:</strong> ${userObj.role.toUpperCase()}</div>
                <div style="margin-bottom: 8px;"><strong>Email:</strong> ${userObj.email}</div>
                <div style="margin-bottom: 8px;"><strong>Phone:</strong> ${userObj.phone}</div>
                <div style="margin-bottom: 8px;"><strong>Department:</strong> ${userObj.department || 'N/A'}</div>
                <div style="margin-bottom: 8px;"><strong>Office Cubicle:</strong> ${userObj.office || 'N/A'}</div>
            </div>
        `;
    }

    openModal(`${userObj.role.toUpperCase()} Profile: ${userObj.name}`, bodyHTML);
};

// Manage Attendance view
function renderAttendancePortal(isAdmin) {
    dynamicContentArea.innerHTML = `
        <div class="glass-card mb-20" style="padding: 16px;">
            <div style="display: flex; gap: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 20px;">
                <button class="btn btn-primary btn-sm" id="tab-take-att">Roll Call</button>
                <button class="btn btn-secondary btn-sm" id="tab-monthly-att">Monthly Report</button>
            </div>
            
            <div id="attendance-portal-body">
                <!-- Tab body populated dynamically -->
            </div>
        </div>
    `;

    // Hook tab switches
    document.getElementById("tab-take-att").addEventListener("click", () => {
        loadTakeAttendanceTab();
    });
    document.getElementById("tab-monthly-att").addEventListener("click", () => {
        loadMonthlyAttendanceTab();
    });

    // Load initial
    loadTakeAttendanceTab();
}

function loadTakeAttendanceTab(activeMode = 'code') {
    const body = document.getElementById("attendance-portal-body");
    const classes = ["Division A", "Division B", "Division C", "Division D", "Division E", "Division F"];
    const todayStr = new Date().toISOString().substring(0, 10);
    
    // Tab switching header
    let html = `
        <div style="display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
            <button class="btn ${activeMode === 'code' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="loadTakeAttendanceTab('code')">
                <i class="fa-solid fa-qrcode" style="margin-right: 6px;"></i> Code-Based Verification
            </button>
            <button class="btn ${activeMode === 'manual' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="loadTakeAttendanceTab('manual')">
                <i class="fa-solid fa-list-check" style="margin-right: 6px;"></i> Manual Roll Call
            </button>
        </div>
    `;

    if (activeMode === 'code') {
        // --- Code-Based UI ---
        let optionsHTML = classes.map(c => `<option value="${c}">${c}</option>`).join("");
        let codesHTML = "";
        const teacherCodes = state.attendanceCodes || [];

        if (teacherCodes.length === 0) {
            codesHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">No attendance codes generated yet.</div>`;
        } else {
            teacherCodes.forEach(record => {
                const isFull = record.usedBy.length >= record.capacity;
                const badgeClass = isFull ? "badge-danger" : "badge-success";
                const badgeLabel = isFull ? "Expired (Limit Reached)" : "Active";
                
                const studentBadges = record.usedBy.length > 0
                    ? record.usedBy.map(username => {
                          const student = state.users.find(u => u.username === username);
                          return `<span class="badge badge-secondary" style="font-size: 11px; margin: 2px;">${student ? student.name : username} (Roll: ${username})</span>`;
                      }).join("")
                    : `<span style="font-size: 12px; color: var(--text-muted);">No student check-ins yet.</span>`;

                codesHTML += `
                    <div class="glass-card mb-16" style="padding: 16px; border-left: 4px solid ${isFull ? 'var(--danger)' : 'var(--success)'};">
                        <div class="flex-space mb-12">
                            <div>
                                <span class="badge ${badgeClass}" style="margin-bottom: 4px;">${badgeLabel}</span>
                                <h4 style="font-size: 16px; font-weight: 700;">Code: <span style="color: var(--primary); font-size: 18px; font-family: monospace; letter-spacing: 1px;">${record.code}</span></h4>
                                <p style="font-size: 12px; color: var(--text-muted);">Division: <strong>${record.division}</strong> | Subject: <strong>${record.subject || 'N/A'}</strong> | Date: <strong>${formatDate(record.date)}</strong></p>
                            </div>
                            <div class="text-right">
                                <span style="font-size: 12px; color: var(--text-muted);">Check-in Capacity</span>
                                <div style="font-size: 20px; font-weight: 800; color: var(--text-main);">${record.usedBy.length} / ${record.capacity}</div>
                            </div>
                        </div>
                        <hr style="border: none; border-top: 1px dashed var(--border-color); margin: 12px 0;">
                        <div>
                            <div style="font-size: 12px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">Checked-in Students:</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                ${studentBadges}
                            </div>
                        </div>
                        <div style="margin-top: 12px; display: flex; justify-content: flex-end; gap: 8px;">
                            <button class="btn btn-secondary btn-sm" onclick="refreshAttendanceCode('${record.code}')" style="padding: 4px 10px;">
                                <i class="fa-solid fa-arrows-rotate"></i> Refresh
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="deleteAttendanceCode('${record.code}')" style="color: var(--danger); border-color: rgba(239,68,68,0.15); padding: 4px 10px;">
                                <i class="fa-solid fa-trash"></i> Delete Code
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        html += `
            <div class="grid-3" style="gap: 20px;">
                <div class="glass-card" style="grid-column: span 1;">
                    <h3 class="card-title mb-16">Generate Attendance Code</h3>
                    <form id="attendance-generate-form">
                        <div class="form-group">
                            <label for="select-class">Division Section</label>
                            <select id="select-class" class="form-control" style="padding-left: 16px;">
                                ${optionsHTML}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="select-program">Academic Program</label>
                            <select id="select-program" class="form-control" style="padding-left: 16px;">
                                <option value="B.Com (Regular)">B.Com (Regular)</option>
                                <option value="B.Com (Professional)">B.Com (Professional)</option>
                                <option value="M.Com">M.Com</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="select-year">Year</label>
                            <select id="select-year" class="form-control" style="padding-left: 16px;">
                                <!-- Populated dynamically -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="select-semester">Semester</label>
                            <select id="select-semester" class="form-control" style="padding-left: 16px;">
                                <!-- Populated dynamically -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="select-subject">Subject</label>
                            <select id="select-subject" class="form-control" style="padding-left: 16px;">
                                <!-- Populated dynamically -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="select-date">Date</label>
                            <input type="date" id="select-date" class="form-control" style="padding-left: 16px;" value="${todayStr}">
                        </div>
                        <div class="form-group">
                            <label for="select-capacity">Number of Students Present</label>
                            <input type="number" id="select-capacity" class="form-control" style="padding-left: 16px;" placeholder="e.g. 20" min="1" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 8px;">
                            <i class="fa-solid fa-qrcode"></i> Generate Code
                        </button>
                    </form>
                </div>
                
                <div style="grid-column: span 2;">
                    <div class="flex-space mb-16" style="flex-wrap: wrap; gap: 8px;">
                        <h3 class="card-title">Verification Code Registrar</h3>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-secondary btn-sm" onclick="loadTakeAttendanceTab('code')"><i class="fa-solid fa-arrows-rotate"></i> Refresh All</button>
                            <button class="btn btn-secondary btn-sm" onclick="handleDeleteAllCodes()" style="color: var(--danger); border-color: rgba(239,68,68,0.15);"><i class="fa-solid fa-trash-can"></i> Delete All</button>
                        </div>
                    </div>
                    <div id="attendance-codes-list">
                        ${codesHTML}
                    </div>
                </div>
            </div>
        `;

        body.innerHTML = html;

        // Dynamic dropdown listeners for code generation
        const progEl = document.getElementById("select-program");
        const yearEl = document.getElementById("select-year");
        const semEl = document.getElementById("select-semester");
        const subEl = document.getElementById("select-subject");

        const updateOpts = () => {
            const prog = progEl.value;
            const currentYear = yearEl.value;
            const currentSem = semEl.value;

            // 1. Re-render Year Options
            let years = ["1st Year", "2nd Year"];
            if (prog.includes("B.Com")) {
                years.push("3rd Year");
            }
            let yearHTML = years.map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`).join("");
            yearEl.innerHTML = yearHTML;

            // 2. Re-render Semester Options
            const activeYear = yearEl.value;
            let semesters = [];
            if (activeYear === "1st Year") {
                semesters = ["Semester 1", "Semester 2"];
            } else if (activeYear === "2nd Year") {
                semesters = ["Semester 3", "Semester 4"];
            } else if (activeYear === "3rd Year") {
                semesters = ["Semester 5", "Semester 6"];
            }
            let semHTML = semesters.map(s => `<option value="${s}" ${s === currentSem ? 'selected' : ''}>${s}</option>`).join("");
            semEl.innerHTML = semHTML;

            // 3. Re-render Subjects
            const activeSem = semEl.value;
            const activeSubjects = state.subjects.filter(s => 
                s.program === prog && 
                s.year === activeYear && 
                s.semester === activeSem
            );

            let subHTML = "";
            if (activeSubjects.length === 0) {
                subHTML = `<option value="">No subjects registered</option>`;
            } else {
                subHTML = activeSubjects.map(s => `<option value="${s.name}">${s.name}</option>`).join("");
            }
            subEl.innerHTML = subHTML;
        };

        // Initialize and bind
        updateOpts();
        progEl.addEventListener("change", updateOpts);
        yearEl.addEventListener("change", updateOpts);
        semEl.addEventListener("change", updateOpts);

        // Hook generate form submit
        document.getElementById("attendance-generate-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const selectedClass = document.getElementById("select-class").value;
            const selectedDate = document.getElementById("select-date").value;
            const capacityVal = parseInt(document.getElementById("select-capacity").value);
            const selectedSubject = document.getElementById("select-subject").value;

            if (isNaN(capacityVal) || capacityVal <= 0) {
                alert("Please enter a valid positive number for students count.");
                return;
            }

            if (!selectedSubject) {
                alert("Please select or register a subject first.");
                return;
            }

            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            let uniqueCode = "";
            for (let idx = 0; idx < 6; idx++) {
                uniqueCode += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            const dup = state.attendanceCodes.find(c => c.code === uniqueCode);
            if (dup) {
                uniqueCode = "";
                for (let idx = 0; idx < 6; idx++) {
                    uniqueCode += chars.charAt(Math.floor(Math.random() * chars.length));
                }
            }

            const divLetter = selectedClass.replace("Division ", "").trim();
            const studentsInDiv = state.users.filter(u => u.role === 'student' && u.division === divLetter);
            
            studentsInDiv.forEach(s => {
                if (!s.attendance) s.attendance = {};
                s.attendance[selectedDate] = "absent";
                state.updateUser(s);
            });

            const newRecord = {
                id: "code-" + Date.now(),
                code: uniqueCode,
                division: selectedClass,
                date: selectedDate,
                capacity: capacityVal,
                subject: selectedSubject,
                usedBy: []
            };

            state.attendanceCodes.push(newRecord);
            state.saveState();

            // Register valid key and capacity on CounterAPI
            const divCode = selectedClass.replace("Division ", "").trim();
            const validKey = `${uniqueCode}-valid-div-${divCode}`;
            fetch(`https://api.counterapi.dev/v1/TolaniNEPAttendance/${validKey}/up`)
                .then(() => {
                    const seedPromises = [];
                    for (let i = 0; i < capacityVal; i++) {
                        seedPromises.push(fetch(`https://api.counterapi.dev/v1/TolaniNEPAttendance/${uniqueCode}/up`));
                    }
                    return Promise.all(seedPromises);
                })
                .catch(err => console.error("Counter API seed error:", err));

            alert(`Verification Code ${uniqueCode} generated successfully! All ${studentsInDiv.length} students in Division ${divLetter} have been set to 'absent' by default. Tell your students to check-in using this code.`);
            loadTakeAttendanceTab('code');
        });

    } else {
        // --- Manual Roll Call UI ---
        if (!window.selectedManualDiv) window.selectedManualDiv = "Division A";
        if (!window.selectedManualDate) window.selectedManualDate = todayStr;
        if (!window.selectedManualProg) window.selectedManualProg = "B.Com (Regular)";
        if (!window.selectedManualYear) window.selectedManualYear = "1st Year";
        if (!window.selectedManualSem) window.selectedManualSem = "Semester 1";
        if (!window.selectedManualSub) window.selectedManualSub = "";

        const divOptionsHTML = classes.map(c => `<option value="${c}" ${c === window.selectedManualDiv ? 'selected' : ''}>${c}</option>`).join("");
        
        const divLetter = window.selectedManualDiv.replace("Division ", "").trim();
        
        // Filter students dynamically based on Division, Program, Year, and Semester
        const studentsInDiv = state.users.filter(u => 
            u.role === 'student' && 
            u.division === divLetter &&
            (u.program || 'B.Com (Regular)') === window.selectedManualProg &&
            (u.year || '1st Year') === window.selectedManualYear &&
            (u.semester || 'Semester 1') === window.selectedManualSem
        );
        
        let studentRowsHTML = "";
        if (studentsInDiv.length === 0) {
            studentRowsHTML = `<tr><td colspan="4" class="text-center" style="color: var(--text-muted); padding: 24px;">No students registered in Division ${divLetter} for ${window.selectedManualProg}, ${window.selectedManualYear}, ${window.selectedManualSem}.</td></tr>`;
        } else {
            studentsInDiv.forEach((std, index) => {
                const isPresent = std.attendance && std.attendance[window.selectedManualDate] === "present";
                studentRowsHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${std.rollNo}</strong></td>
                        <td>${std.name}</td>
                        <td>
                            <input type="checkbox" class="manual-present-checkbox" data-username="${std.username}" ${isPresent ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
                        </td>
                    </tr>
                `;
            });
        }

        html += `
            <div class="grid-3" style="gap: 20px;">
                <div class="glass-card" style="grid-column: span 1;">
                    <h3 class="card-title mb-16">Select Details</h3>
                    <div class="form-group">
                        <label for="manual-select-class">Division Section</label>
                        <select id="manual-select-class" class="form-control" style="padding-left: 16px;">
                            ${divOptionsHTML}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="manual-select-program">Academic Program</label>
                        <select id="manual-select-program" class="form-control" style="padding-left: 16px;">
                            <option value="B.Com (Regular)" ${window.selectedManualProg === 'B.Com (Regular)' ? 'selected' : ''}>B.Com (Regular)</option>
                            <option value="B.Com (Professional)" ${window.selectedManualProg === 'B.Com (Professional)' ? 'selected' : ''}>B.Com (Professional)</option>
                            <option value="M.Com" ${window.selectedManualProg === 'M.Com' ? 'selected' : ''}>M.Com</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="manual-select-year">Year</label>
                        <select id="manual-select-year" class="form-control" style="padding-left: 16px;">
                            <!-- Populated dynamically -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="manual-select-semester">Semester</label>
                        <select id="manual-select-semester" class="form-control" style="padding-left: 16px;">
                            <!-- Populated dynamically -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="manual-select-subject">Subject</label>
                        <select id="manual-select-subject" class="form-control" style="padding-left: 16px;">
                            <!-- Populated dynamically -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="manual-select-date">Date</label>
                        <input type="date" id="manual-select-date" class="form-control" style="padding-left: 16px;" value="${window.selectedManualDate}">
                    </div>
                    <button class="btn btn-secondary" id="manual-refresh-btn" style="width: 100%; margin-top: 8px;">
                        <i class="fa-solid fa-arrows-rotate"></i> Load Student List
                    </button>
                </div>
                
                <div class="glass-card" style="grid-column: span 2;">
                    <h3 class="card-title mb-16">Manual Roll Call (Division ${divLetter} - ${window.selectedManualSub || 'No Subject'})</h3>
                    <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">Check the box to mark a student Present, uncheck to mark them Absent.</p>
                    
                    <div class="table-responsive" style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px;">
                        <table class="custom-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Roll No</th>
                                    <th>Student Name</th>
                                    <th>Mark Present</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${studentRowsHTML}
                            </tbody>
                        </table>
                    </div>
                    
                    <button class="btn btn-primary" id="manual-save-attendance-btn" style="width: 100%; margin-top: 16px;">
                        <i class="fa-solid fa-circle-check"></i> Save Attendance Logs
                    </button>
                </div>
            </div>
        `;

        body.innerHTML = html;

        // Dynamic manual selection binding
        const mProgEl = document.getElementById("manual-select-program");
        const mYearEl = document.getElementById("manual-select-year");
        const mSemEl = document.getElementById("manual-select-semester");
        const mSubEl = document.getElementById("manual-select-subject");

        const updateManualOpts = () => {
            const prog = mProgEl.value;
            const currentYear = mYearEl.value || window.selectedManualYear;
            const currentSem = mSemEl.value || window.selectedManualSem;
            const currentSub = mSubEl.value || window.selectedManualSub;

            // 1. Year
            let years = ["1st Year", "2nd Year"];
            if (prog.includes("B.Com")) {
                years.push("3rd Year");
            }
            let yearHTML = years.map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`).join("");
            mYearEl.innerHTML = yearHTML;

            // 2. Semester
            const activeYear = mYearEl.value;
            let semesters = [];
            if (activeYear === "1st Year") {
                semesters = ["Semester 1", "Semester 2"];
            } else if (activeYear === "2nd Year") {
                semesters = ["Semester 3", "Semester 4"];
            } else if (activeYear === "3rd Year") {
                semesters = ["Semester 5", "Semester 6"];
            }
            let semHTML = semesters.map(s => `<option value="${s}" ${s === currentSem ? 'selected' : ''}>${s}</option>`).join("");
            mSemEl.innerHTML = semHTML;

            // 3. Subject
            const activeSem = mSemEl.value;
            const activeSubjects = state.subjects.filter(s => 
                s.program === prog && 
                s.year === activeYear && 
                s.semester === activeSem
            );

            let subHTML = "";
            if (activeSubjects.length === 0) {
                subHTML = `<option value="">No subjects registered</option>`;
            } else {
                subHTML = activeSubjects.map(s => `<option value="${s.name}" ${s.name === currentSub ? 'selected' : ''}>${s.name}</option>`).join("");
            }
            mSubEl.innerHTML = subHTML;

            // Save variables to window scope
            window.selectedManualProg = prog;
            window.selectedManualYear = activeYear;
            window.selectedManualSem = activeSem;
            window.selectedManualSub = mSubEl.value;
        };

        // Initialize and bind
        updateManualOpts();
        mProgEl.addEventListener("change", () => { updateManualOpts(); loadTakeAttendanceTab('manual'); });
        mYearEl.addEventListener("change", () => { updateManualOpts(); loadTakeAttendanceTab('manual'); });
        mSemEl.addEventListener("change", () => { updateManualOpts(); loadTakeAttendanceTab('manual'); });
        mSubEl.addEventListener("change", (e) => { window.selectedManualSub = e.target.value; loadTakeAttendanceTab('manual'); });

        // Change handlers
        document.getElementById("manual-select-class").addEventListener("change", (e) => {
            window.selectedManualDiv = e.target.value;
            loadTakeAttendanceTab('manual');
        });
        document.getElementById("manual-select-date").addEventListener("change", (e) => {
            window.selectedManualDate = e.target.value;
        });
        
        document.getElementById("manual-refresh-btn").addEventListener("click", () => {
            const btn = document.getElementById("manual-refresh-btn");
            const originalHTML = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Syncing...`;

            const syncPromises = studentsInDiv.map(std => {
                const recordKey = `student-${std.username}-date-${window.selectedManualDate}`;
                return fetch(`https://api.counterapi.dev/v1/TolaniNEPAttendance/${recordKey}`)
                    .then(res => {
                        if (res.ok) return res.json();
                    })
                    .then(data => {
                        if (data && data.count > 0) {
                            if (!std.attendance) std.attendance = {};
                            std.attendance[window.selectedManualDate] = "present";
                            state.updateUser(std);
                        }
                    })
                    .catch(() => {});
            });

            Promise.all(syncPromises).then(() => {
                state.saveState();
                loadTakeAttendanceTab('manual');
            });
        });

        // Save action
        document.getElementById("manual-save-attendance-btn").addEventListener("click", () => {
            const checkboxes = document.querySelectorAll(".manual-present-checkbox");
            let countSaved = 0;
            checkboxes.forEach(cb => {
                const username = cb.getAttribute("data-username");
                const isChecked = cb.checked;
                const student = state.users.find(u => u.username === username);
                if (student) {
                    if (!student.attendance) student.attendance = {};
                    student.attendance[window.selectedManualDate] = isChecked ? "present" : "absent";
                    state.updateUser(student);
                    countSaved++;
                }
            });
            state.saveState();
            alert(`Attendance logs saved successfully for ${countSaved} students on ${formatDate(window.selectedManualDate)}!`);
            loadTakeAttendanceTab('manual');
        });
    }
}


window.refreshAttendanceCode = function(code) {
    const record = state.attendanceCodes.find(c => c.code === code);
    if (!record) {
        loadTakeAttendanceTab();
        return;
    }

    const divLetter = record.division.replace("Division ", "").trim();
    const studentsInDiv = state.users.filter(u => u.role === 'student' && u.division === divLetter);
    
    const syncPromises = studentsInDiv.map(std => {
        const studentKey = `${code}-student-${std.username}`;
        return fetch(`https://api.counterapi.dev/v1/TolaniNEPAttendance/${studentKey}`)
            .then(res => {
                if (res.ok) return res.json();
            })
            .then(data => {
                if (data && data.count > 0) {
                    if (!record.usedBy.includes(std.username)) {
                        record.usedBy.push(std.username);
                    }
                    if (!std.attendance) std.attendance = {};
                    std.attendance[record.date] = "present";
                    state.updateUser(std);
                }
            })
            .catch(() => {});
    });

    Promise.all(syncPromises).then(() => {
        state.saveState();
        loadTakeAttendanceTab();
    });
};

window.deleteAttendanceCode = function(code) {
    if (confirm(`Are you sure you want to delete verification code ${code}? This will not revert attendance logs that have already been marked.`)) {
        state.attendanceCodes = state.attendanceCodes.filter(c => c.code !== code);
        state.saveState();
        loadTakeAttendanceTab();
    }
};

window.handleDeleteAllCodes = function() {
    if (confirm("Are you sure you want to delete ALL generated verification codes? This action cannot be undone.")) {
        state.attendanceCodes = [];
        state.saveState();
        loadTakeAttendanceTab();
    }
};

function loadMonthlyAttendanceTab() {
    const body = document.getElementById("attendance-portal-body");
    const groups = ["Division A", "Division B", "Division C", "Division D", "Division E", "Division F"];
    
    let reportCards = "";
    groups.forEach(g => {
        const divLetter = g.replace("Division ", "").trim();
        const students = state.users.filter(u => u.role === 'student' && u.division === divLetter);
        let totalPresent = 0;
        let totalLogs = 0;

        students.forEach(s => {
            Object.values(s.attendance || {}).forEach(val => {
                if (val === 'present') totalPresent++;
                totalLogs++;
            });
        });

        const percent = totalLogs > 0 ? Math.round((totalPresent / totalLogs) * 100) : 85;
        reportCards += `
            <div class="glass-card" style="padding: 16px; text-align: center;">
                <h4 style="margin-bottom: 8px;">Division ${divLetter}</h4>
                <div style="font-size: 32px; font-weight: 800; color: var(--primary); margin-bottom: 8px;">${percent}%</div>
                <p style="font-size: 11px; color: var(--text-muted);">Calculated over ${totalLogs} logged lectures</p>
            </div>
        `;
    });

    body.innerHTML = `
        <div class="grid-4" style="margin-top: 16px; margin-bottom: 24px;">
            ${reportCards}
        </div>
        
        <div class="glass-card">
            <h3 class="card-title mb-16"><i class="fa-solid fa-file-excel" style="color: var(--success); margin-right: 8px;"></i> Export Detailed Attendance Ledger</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 20px;">Download a comprehensive daily logs sheet compatible with Microsoft Excel.</p>
            
            <div class="form-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr auto; gap: 12px; align-items: flex-end;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="export-div">Division Section</label>
                    <select id="export-div" class="form-control" style="padding-left: 16px;">
                        <option value="Division A">Division A</option>
                        <option value="Division B">Division B</option>
                        <option value="Division C">Division C</option>
                        <option value="Division D">Division D</option>
                        <option value="Division E">Division E</option>
                        <option value="Division F">Division F</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="export-program">Academic Program</label>
                    <select id="export-program" class="form-control" style="padding-left: 16px;">
                        <option value="B.Com (Regular)">B.Com (Regular)</option>
                        <option value="B.Com (Professional)">B.Com (Professional)</option>
                        <option value="M.Com">M.Com</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="export-year">Year</label>
                    <select id="export-year" class="form-control" style="padding-left: 16px;">
                        <!-- Populated dynamically -->
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="export-semester">Semester</label>
                    <select id="export-semester" class="form-control" style="padding-left: 16px;">
                        <!-- Populated dynamically -->
                    </select>
                </div>
                <button class="btn btn-primary" onclick="handleExportCSV()" style="height: 38px; padding: 0 16px; font-size: 13px;">
                    <i class="fa-solid fa-download"></i> Download CSV
                </button>
            </div>
        </div>
    `;

    // Dynamic dropdown values binding for export
    const epEl = document.getElementById("export-program");
    const eyEl = document.getElementById("export-year");
    const esEl = document.getElementById("export-semester");

    const updateExportOpts = () => {
        const prog = epEl.value;
        const curY = eyEl.value;
        const curS = esEl.value;

        let years = ["1st Year", "2nd Year"];
        if (prog.includes("B.Com")) {
            years.push("3rd Year");
        }
        eyEl.innerHTML = years.map(y => `<option value="${y}" ${y === curY ? 'selected' : ''}>${y}</option>`).join("");

        const activeY = eyEl.value;
        let semesters = [];
        if (activeY === "1st Year") {
            semesters = ["Semester 1", "Semester 2"];
        } else if (activeY === "2nd Year") {
            semesters = ["Semester 3", "Semester 4"];
        } else if (activeY === "3rd Year") {
            semesters = ["Semester 5", "Semester 6"];
        }
        esEl.innerHTML = semesters.map(s => `<option value="${s}" ${s === curS ? 'selected' : ''}>${s}</option>`).join("");
    };

    updateExportOpts();
    epEl.addEventListener("change", updateExportOpts);
    eyEl.addEventListener("change", updateExportOpts);
}

// Global window handle for exporting CSV
window.handleExportCSV = function() {
    const selectedDiv = document.getElementById("export-div").value;
    const selectedProg = document.getElementById("export-program").value;
    const selectedYear = document.getElementById("export-year").value;
    const selectedSem = document.getElementById("export-semester").value;
    
    const divLetter = selectedDiv.replace("Division ", "").trim();
    const students = state.users.filter(u => 
        u.role === 'student' && 
        u.division === divLetter &&
        (u.program || 'B.Com (Regular)') === selectedProg &&
        (u.year || '1st Year') === selectedYear &&
        (u.semester || 'Semester 1') === selectedSem
    );
    
    if (students.length === 0) {
        alert("No students found in this division / program configuration.");
        return;
    }
    
    const datesSet = new Set();
    students.forEach(s => {
        if (s.attendance) {
            Object.keys(s.attendance).forEach(d => datesSet.add(d));
        }
    });
    const sortedDates = Array.from(datesSet).sort();
    
    let csvContent = "Roll No,SPDID,Student Name,Program,Year,Semester,Division," + sortedDates.join(",") + ",Total Present,Total Lectures,Attendance %\r\n";
    
    students.forEach(s => {
        let presentCount = 0;
        let totalCount = 0;
        let rowValues = [
            s.rollNo,
            s.spdid || s.username,
            `"${s.name.replace(/"/g, '""')}"`,
            `"${s.program || 'B.Com (Professional)'}"`,
            `"${s.year || '3rd Year'}"`,
            `"${s.semester || 'Semester 5'}"`,
            s.division || "A"
        ];
        
        sortedDates.forEach(date => {
            const status = s.attendance ? s.attendance[date] : "";
            if (status === "present") {
                rowValues.push("P");
                presentCount++;
                totalCount++;
            } else if (status === "absent") {
                rowValues.push("A");
                totalCount++;
            } else {
                rowValues.push("-");
            }
        });
        
        const pct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) + "%" : "100%";
        rowValues.push(presentCount);
        rowValues.push(totalCount);
        rowValues.push(pct);
        
        csvContent += rowValues.join(",") + "\r\n";
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendance_Report_Div_${divLetter}_${selectedProg.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Manage Assignments View
function renderAssignmentsPortal(isAdmin) {
    const body = dynamicContentArea;
    
    body.innerHTML = `
        <div class="glass-card mb-20">
            <div class="card-header-flex">
                <div>
                    <h3 class="card-title">Manage Assignments</h3>
                    <p style="font-size: 12px; color: var(--text-muted);">Post coursework, homework, worksheets, and grade student replies</p>
                </div>
                <button class="btn btn-primary btn-sm" onclick="openCreateAssignmentModal()">
                    <i class="fa-solid fa-plus"></i> Post Assignment
                </button>
            </div>
        </div>

        <div class="glass-card">
            <h3 class="card-title mb-16">Active Assignments Registry</h3>
            <div id="assignments-list-container">
                <!-- Loaded dynamically -->
            </div>
        </div>
    `;

    loadAssignmentsRegistryList();
}

function loadAssignmentsRegistryList() {
    const container = document.getElementById("assignments-list-container");
    let rowsHTML = "";
    
    state.assignments.forEach(a => {
        const division = a.targetDivision || "A";
        const totalStudents = state.users.filter(u => u.role === 'student' && u.division === division).length;
        const gradedCount = a.submissions.filter(s => s.status === "Graded").length;
        
        rowsHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px dashed var(--border-color);">
                <div>
                    <strong>${a.title}</strong>
                    <div style="font-size: 11px; color: var(--text-muted);">Subject: ${a.subject} | Target: Division ${division} | Due: ${formatDate(a.dueDate)}</div>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <span class="badge badge-info">${gradedCount} / ${totalStudents} Graded</span>
                    <button class="btn btn-secondary btn-sm" onclick="openGradingDeskModal('${a.id}')">Grading Panel</button>
                </div>
            </div>
        `;
    });

    if (rowsHTML === "") {
        rowsHTML = `<div style="text-align: center; color: var(--text-muted); padding: 24px;">No assignments created yet.</div>`;
    }

    container.innerHTML = rowsHTML;
}

window.openCreateAssignmentModal = function() {
    const formHTML = `
        <form id="create-assignment-form">
            <div class="form-group">
                <label for="asm-title">Assignment Title</label>
                <input type="text" id="asm-title" class="form-control" style="padding-left: 16px;" required>
            </div>
            <div class="form-group">
                <label for="asm-subject">Course Subject</label>
                <select id="asm-subject" class="form-control" style="padding-left: 16px;">
                    <option value="Financial Accounting">Financial Accounting</option>
                    <option value="Business Organisation">Business Organisation</option>
                    <option value="Microeconomics">Microeconomics</option>
                    <option value="Statistics">Statistics</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Business Management">Business Management</option>
                    <option value="Computer Science">Computer Science</option>
                </select>
            </div>
            <div class="form-group">
                <label for="asm-division">Target Division</label>
                <select id="asm-division" class="form-control" style="padding-left: 16px;">
                    <option value="A">Division A</option>
                    <option value="B">Division B</option>
                    <option value="C">Division C</option>
                    <option value="D">Division D</option>
                    <option value="E">Division E</option>
                    <option value="F">Division F</option>
                </select>
            </div>
            <div class="form-group">
                <label for="asm-duedate">Due Date</label>
                <input type="date" id="asm-duedate" class="form-control" style="padding-left: 16px;" required>
            </div>
            <div class="form-group">
                <label for="asm-desc">Instructions & Description</label>
                <textarea id="asm-desc" class="form-control" rows="3" style="padding-left: 16px; height: auto;" required></textarea>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" style="width: auto;">Publish Assignment</button>
            </div>
        </form>
    `;
    
    openModal("Create Assignment Workspace", formHTML);

    document.getElementById("create-assignment-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("asm-title").value;
        const subject = document.getElementById("asm-subject").value;
        const division = document.getElementById("asm-division").value;
        const due = document.getElementById("asm-duedate").value;
        const desc = document.getElementById("asm-desc").value;

        const newAsm = {
            id: `asm-${Date.now()}`,
            title: title.trim(),
            subject: subject,
            targetDivision: division,
            dueDate: due,
            description: desc.trim(),
            submissions: []
        };
        state.addAssignment(newAsm);
        alert(`Published assignment '${title}' for Division ${division} successfully!`);
        closeModal();
        loadAssignmentsRegistryList();
    });
};

window.openGradingDeskModal = function(asmId) {
    const asm = state.assignments.find(a => a.id === asmId);
    if (!asm) return;

    let listHTML = "";
    const targetDiv = asm.targetDivision || "A";
    const studentsInDiv = state.users.filter(u => u.role === 'student' && u.division === targetDiv);

    studentsInDiv.forEach((std, i) => {
        const sub = asm.submissions.find(s => s.studentUsername === std.username);
        const gradeInputId = `grade-${asmId}-${std.username}`;
        const currentMarks = sub ? sub.marks : "";
        const statusText = sub ? `<span class="badge badge-success">Graded</span>` : `<span class="badge badge-warning">Pending</span>`;
        
        listHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px dashed var(--border-color);">
                <div>
                    <strong>${std.name}</strong> (Roll: ${std.rollNo})
                    <div style="font-size: 11px; color: var(--text-muted);">Status: ${statusText}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="number" id="${gradeInputId}" class="form-control" style="width: 70px; text-align: center; height: 32px; padding: 4px;" 
                        min="0" max="10" placeholder="0-10" value="${currentMarks}">
                    <button class="btn btn-primary btn-sm" onclick="saveOfflineSubmissionGrade('${asmId}', '${std.username}', '${gradeInputId}')" style="height: 32px;">
                        Save
                    </button>
                </div>
            </div>
        `;
    });

    if (listHTML === "") {
        listHTML = `<div style="text-align: center; color: var(--text-muted); padding: 24px;">No students registered in Division ${targetDiv}.</div>`;
    }

    const deskHTML = `
        <div style="color: var(--text-main);">
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;">
                <strong>${asm.title}</strong> (Division ${targetDiv})<br>
                <span style="color: var(--text-muted);">${asm.description}</span>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px dashed var(--border-color); padding: 16px; border-radius: 12px; margin-bottom: 20px;">
                <h5 style="margin-bottom: 8px; font-weight: 600; font-size: 13px; color: var(--primary);"><i class="fa-solid fa-file-excel" style="margin-right: 6px; color: var(--teal);"></i>Bulk Import Grades (Excel/CSV)</h5>
                <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">Select a CSV file containing student roll numbers and grade scores (format: <strong>RollNo,Marks</strong>) to grade the entire class division at once.</p>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="file" id="grading-excel-upload" class="form-control" accept=".csv, .txt" style="padding: 4px 8px; height: 32px; font-size: 12px;">
                    <button class="btn btn-secondary btn-sm" onclick="handleAssignmentCSVUpload('${asmId}')" style="height: 32px; white-space: nowrap;">
                        Upload & Import
                    </button>
                </div>
            </div>
            
            <h4 style="margin-bottom: 12px; color: var(--primary);">Division ${targetDiv} Grading Sheet</h4>
            <div style="max-height: 250px; overflow-y: auto; padding-right: 6px;">
                ${listHTML}
            </div>
        </div>
    `;

    openModal("Grading Desk Workspace", deskHTML);
};

window.saveOfflineSubmissionGrade = function(asmId, studentUsername, inputId) {
    const marksVal = document.getElementById(inputId).value;
    if (marksVal === "") {
        alert("Please enter a numeric grade score (0 to 10) first.");
        return;
    }
    const marks = parseInt(marksVal);
    if (marks < 0 || marks > 10) {
        alert("Grade score must be between 0 and 10.");
        return;
    }

    const asm = state.assignments.find(a => a.id === asmId);
    if (asm) {
        let sub = asm.submissions.find(s => s.studentUsername === studentUsername);
        if (!sub) {
            sub = {
                studentUsername: studentUsername,
                file: "Offline Submission",
                marks: marks,
                maxMarks: 10,
                status: "Graded"
            };
            asm.submissions.push(sub);
        } else {
            sub.marks = marks;
            sub.status = "Graded";
        }
        state.updateAssignment(asm);
        alert("Offline grade saved successfully!");
        openGradingDeskModal(asmId); // Refresh modal view
        loadAssignmentsRegistryList(); // Refresh underlying view
    }
};

window.handleAssignmentCSVUpload = function(asmId) {
    const fileInput = document.getElementById("grading-excel-upload");
    if (!fileInput || fileInput.files.length === 0) {
        alert("Please select a CSV or text marks sheet file to import.");
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split(/\r?\n/);
        let importCount = 0;
        let skipCount = 0;
        
        const asm = state.assignments.find(a => a.id === asmId);
        if (!asm) {
            alert("Assignment not found.");
            return;
        }

        const targetDiv = asm.targetDivision || "A";
        const studentsInDiv = state.users.filter(u => u.role === 'student' && u.division === targetDiv);

        lines.forEach((line, index) => {
            if (index === 0) return; // skip header row
            if (!line.trim()) return;

            const parts = line.split(/[,\t;]+/);
            if (parts.length >= 2) {
                const rollNoRaw = parts[0].trim();
                const marksRaw = parseInt(parts[1].trim());

                if (rollNoRaw && !isNaN(marksRaw)) {
                    // Find student in this division with matching rollNo
                    const student = studentsInDiv.find(s => s.rollNo === rollNoRaw || s.username === rollNoRaw);
                    if (student) {
                        let sub = asm.submissions.find(s => s.studentUsername === student.username);
                        if (!sub) {
                            sub = {
                                studentUsername: student.username,
                                file: "Excel/CSV Bulk Import",
                                marks: Math.min(10, Math.max(0, marksRaw)),
                                maxMarks: 10,
                                status: "Graded"
                            };
                            asm.submissions.push(sub);
                        } else {
                            sub.marks = Math.min(10, Math.max(0, marksRaw));
                            sub.status = "Graded";
                        }
                        importCount++;
                    } else {
                        skipCount++;
                    }
                } else {
                    skipCount++;
                }
            }
        });

        if (importCount > 0) {
            state.updateAssignment(asm);
            alert(`Bulk grading successful! Imported marks for ${importCount} students from '${file.name}'. (Skipped/unmatched: ${skipCount})`);
            openGradingDeskModal(asmId);
            loadAssignmentsRegistryList();
        } else {
            alert("No matching student roll numbers or marks found in the file. Format must be: RollNo,Marks");
        }
    };
    reader.onerror = function() {
        alert("Failed to read file.");
    };
    reader.readAsText(file);
};

// Marks Registry view
function renderMarksPortal(isAdmin) {
    const students = state.users.filter(u => u.role === 'student');
    let optionsHTML = students.map(s => `<option value="${s.username}">${s.name} (Roll: ${s.rollNo})</option>`).join("");
    
    dynamicContentArea.innerHTML = `
        <div class="grid-3">
            <div class="glass-card mb-20" style="grid-column: span 3; background: rgba(255,255,255,0.03); border: 1.5px dashed var(--border-color); padding: 20px; border-radius: 12px; display: flex; flex-direction: column; gap: 8px;">
                <h4 style="margin: 0; font-weight: 600; font-size: 14px; color: var(--primary);"><i class="fa-solid fa-file-excel" style="margin-right: 6px; color: var(--teal);"></i>Bulk Import Marks (Excel/CSV)</h4>
                <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 4px 0;">Select a CSV file containing student marks. Format: <strong>RollNo,CourseCode,Internal,Practical,Final</strong> (e.g. <code>1,BC-101,24,18,42</code>) to import grades in bulk.</p>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <input type="file" id="marks-excel-upload" class="form-control" accept=".csv, .txt" style="padding: 6px 12px; height: 38px; font-size: 12px; max-width: 320px;">
                    <button class="btn btn-secondary" onclick="handleMarksCSVUpload()" style="height: 38px;">
                        <i class="fa-solid fa-cloud-arrow-up" style="margin-right: 6px;"></i> Import Grade Sheet
                    </button>
                </div>
            </div>
            
            <div class="glass-card">
                <h3 class="card-title mb-16">Marks Input Register</h3>
                <form id="marks-entry-form">
                    <div class="form-group">
                        <label for="marks-student">Select Student</label>
                        <select id="marks-student" class="form-control" style="padding-left: 16px;">
                            ${optionsHTML}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="marks-course">Course Code</label>
                        <select id="marks-course" class="form-control" style="padding-left: 16px;">
                            <option value="BC-101">BC-101: Financial Accounting</option>
                            <option value="BC-102">BC-102: Business Organisation</option>
                            <option value="BC-103">BC-103: Microeconomics</option>
                            <option value="BC-Stat-104">BC-Stat-104: Statistics</option>
                            <option value="BC-BA-104">BC-BA-104: Business Administration</option>
                            <option value="BC-BM-104">BC-BM-104: Business Management</option>
                            <option value="BC-CS-104">BC-CS-104: Computer Science</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="marks-internal">Internal Assessment Marks (0-30)</label>
                        <input type="number" id="marks-internal" class="form-control" style="padding-left: 16px;" min="0" max="30" value="22" required>
                    </div>
                    <div class="form-group">
                        <label for="marks-practical">Practical/Project Marks (0-20)</label>
                        <input type="number" id="marks-practical" class="form-control" style="padding-left: 16px;" min="0" max="20" value="16" required>
                    </div>
                    <div class="form-group">
                        <label for="marks-final">Semester Exam Marks (0-50)</label>
                        <input type="number" id="marks-final" class="form-control" style="padding-left: 16px;" min="0" max="50" value="38" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">
                        <i class="fa-solid fa-square-plus"></i> Generate and Publish Result
                    </button>
                </form>
            </div>
            
            <div class="glass-card" style="grid-column: span 2;">
                <h3 class="card-title mb-16">Published Grade Registry</h3>
                <div class="table-responsive">
                    <table class="custom-table" id="grades-registry-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Course</th>
                                <th>Credits</th>
                                <th>Internal (30)</th>
                                <th>Practical (20)</th>
                                <th>Final (50)</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody id="grades-registry-tbody">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.getElementById("marks-entry-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const stdUser = document.getElementById("marks-student").value;
        const code = document.getElementById("marks-course").value;
        const internal = parseInt(document.getElementById("marks-internal").value);
        const practical = parseInt(document.getElementById("marks-practical").value);
        const final = parseInt(document.getElementById("marks-final").value);

        const total = internal + practical + final;
        
        // Map grade
        let grade = "F";
        if (total >= 90) grade = "A+";
        else if (total >= 80) grade = "A";
        else if (total >= 70) grade = "B+";
        else if (total >= 60) grade = "B";
        else if (total >= 50) grade = "C";
        else if (total >= 40) grade = "D";

        const student = state.users.find(u => u.username === stdUser);
        const courseObj = state.courses.find(c => c.code === code) || { name: "Special Major" };
        
        if (student) {
            if (!student.grades) student.grades = [];
            
            // Check if grade already exists, override it
            const existingIdx = student.grades.findIndex(g => g.code === code);
            const gradeItem = {
                code: code,
                subject: courseObj.name,
                grade: grade,
                credits: courseObj.credits || 4
            };

            if (existingIdx !== -1) {
                student.grades[existingIdx] = gradeItem;
            } else {
                student.grades.push(gradeItem);
            }
            
            state.updateUser(student);
            alert(`Result generated successfully for ${student.name}! Total marks: ${total}/100. Grade: ${grade}`);
            loadPublishedGradesRegistry();
        }
    });

    loadPublishedGradesRegistry();
}

function loadPublishedGradesRegistry() {
    const tbody = document.getElementById("grades-registry-tbody");
    let rowsHTML = "";

    const students = state.users.filter(u => u.role === 'student');
    let limitCount = 0;
    
    students.forEach(std => {
        if (std.grades && std.grades.length > 0 && limitCount < 12) {
            std.grades.forEach(g => {
                const mark = getInternalMarks(std, g.code);
                rowsHTML += `
                    <tr>
                        <td><strong>${std.name}</strong> (Roll: ${std.rollNo})</td>
                        <td>${g.code}</td>
                        <td>${g.credits}</td>
                        <td>${mark}</td>
                        <td>${Math.round(mark * 0.6)}</td>
                        <td>--</td>
                        <td><span class="badge badge-info">${g.grade}</span></td>
                    </tr>
                `;
            });
            limitCount++;
        }
    });

    if (rowsHTML === "") {
        rowsHTML = `<tr><td colspan="7" class="text-center" style="color: var(--text-muted); padding: 24px;">No grades published yet.</td></tr>`;
    }

    tbody.innerHTML = rowsHTML;
}

window.handleMarksCSVUpload = function() {
    const fileInput = document.getElementById("marks-excel-upload");
    if (!fileInput || fileInput.files.length === 0) {
        alert("Please select a CSV or text marks sheet file to import.");
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split(/\r?\n/);
        let importCount = 0;
        let skipCount = 0;

        lines.forEach((line, index) => {
            if (index === 0) return; // skip header row
            if (!line.trim()) return;

            const parts = line.split(/[,\t;]+/);
            if (parts.length >= 5) {
                const rollNoRaw = parts[0].trim();
                const courseCode = parts[1].trim();
                const internal = parseInt(parts[2].trim());
                const practical = parseInt(parts[3].trim());
                const final = parseInt(parts[4].trim());

                if (rollNoRaw && courseCode && !isNaN(internal) && !isNaN(practical) && !isNaN(final)) {
                    // Find student
                    const student = state.users.find(u => u.role === 'student' && (u.rollNo === rollNoRaw || u.username === rollNoRaw));
                    const course = state.courses.find(c => c.code === courseCode);

                    if (student && course) {
                        // Calculate grade letter matching existing logic
                        const total = internal + practical + final;
                        let gradeLetter = "F";
                        if (total >= 90) gradeLetter = "A+";
                        else if (total >= 80) gradeLetter = "A";
                        else if (total >= 70) gradeLetter = "B+";
                        else if (total >= 60) gradeLetter = "B";
                        else if (total >= 50) gradeLetter = "C";
                        else if (total >= 40) gradeLetter = "D";

                        // Update or add grade entry
                        if (!student.grades) student.grades = [];
                        let existingIdx = student.grades.findIndex(g => g.code === courseCode);
                        const gradeItem = {
                            code: courseCode,
                            subject: course.name,
                            grade: gradeLetter,
                            credits: course.credits || 4
                        };

                        if (existingIdx !== -1) {
                            student.grades[existingIdx] = gradeItem;
                        } else {
                            student.grades.push(gradeItem);
                        }

                        state.updateUser(student);
                        importCount++;
                    } else {
                        skipCount++;
                    }
                } else {
                    skipCount++;
                }
            } else {
                skipCount++;
            }
        });

        if (importCount > 0) {
            alert(`Bulk marks import successful! Imported grades for ${importCount} students from '${file.name}'. (Skipped/unmatched: ${skipCount})`);
            renderMarksPortal(false);
        } else {
            alert("No matching student records found. Check format: RollNo,CourseCode,Internal,Practical,Final");
        }
    };
    reader.onerror = function() {
        alert("Failed to read file.");
    };
    reader.readAsText(file);
};

// Upload Study Material view
function renderStudyMaterialsPortal(isAdmin) {
    dynamicContentArea.innerHTML = `
        <div class="grid-3">
            <div class="glass-card">
                <h3 class="card-title mb-16">Distribute Study Materials</h3>
                <form id="material-upload-form">
                    <div class="form-group">
                        <label for="mat-title">Document Title</label>
                        <input type="text" id="mat-title" class="form-control" style="padding-left: 16px;" placeholder="e.g. Chapter 2 Ledger Book notes" required>
                    </div>
                    <div class="form-group">
                        <label for="mat-subject">Course Subject</label>
                        <select id="mat-subject" class="form-control" style="padding-left: 16px;">
                            <option value="Financial Accounting">Financial Accounting</option>
                            <option value="Business Organisation">Business Organisation</option>
                            <option value="Microeconomics">Microeconomics</option>
                            <option value="Statistics">Statistics</option>
                            <option value="Business Administration">Business Administration</option>
                            <option value="Business Management">Business Management</option>
                            <option value="Computer Science">Computer Science</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="mat-type">Material Type</label>
                        <select id="mat-type" class="form-control" style="padding-left: 16px;">
                            <option value="PDF">PDF Handout</option>
                            <option value="PPT">Powerpoint Slides</option>
                            <option value="Video">Video Link</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="mat-file">Upload Handout File</label>
                        <input type="file" id="mat-file" class="form-control" style="padding: 8px 16px; border: 1px dashed var(--border-color); background: rgba(255,255,255,0.01);" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Upload Document
                    </button>
                </form>
            </div>
            
            <div class="glass-card" style="grid-column: span 2;">
                <h3 class="card-title mb-16">Shared Materials Library</h3>
                <div class="table-responsive">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Title / Details</th>
                                <th>Subject</th>
                                <th>Format</th>
                                <th>Uploaded By</th>
                            </tr>
                        </thead>
                        <tbody id="materials-library-tbody">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.getElementById("material-upload-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("mat-title").value;
        const subject = document.getElementById("mat-subject").value;
        const type = document.getElementById("mat-type").value;
        const fileInput = document.getElementById("mat-file");
        const file = fileInput.files && fileInput.files.length > 0 ? fileInput.files[0].name : "No file attached";

        const newMat = {
            id: `mat-${Date.now()}`,
            title: title.trim(),
            subject: subject,
            type: type,
            link: file.trim(),
            uploadedBy: currentUser.name
        };

        state.addMaterial(newMat);
        alert(`Document '${title}' uploaded successfully and is now active!`);
        document.getElementById("material-upload-form").reset();
        loadMaterialsLibrary();
    });

    loadMaterialsLibrary();
}

function loadMaterialsLibrary() {
    const tbody = document.getElementById("materials-library-tbody");
    let rowsHTML = "";
    
    state.materials.forEach(m => {
        rowsHTML += `
            <tr>
                <td><strong>${m.title}</strong><br><span style="font-size: 11px; color: var(--text-muted);">Filename: ${m.link}</span></td>
                <td>${m.subject}</td>
                <td><span class="badge badge-info">${m.type}</span></td>
                <td>${m.uploadedBy}</td>
            </tr>
        `;
    });

    if (rowsHTML === "") {
        rowsHTML = `<tr><td colspan="4" class="text-center" style="color: var(--text-muted); padding: 24px;">No files shared yet.</td></tr>`;
    }

    tbody.innerHTML = rowsHTML;
}

// Communication Hub view
function renderCommunicationHub(isAdmin) {
    dynamicContentArea.innerHTML = `
        <div class="grid-3">
            <div class="glass-card">
                <h3 class="card-title mb-16">Write Notice / Announcement</h3>
                <form id="notice-publish-form">
                    <div class="form-group">
                        <label for="notice-title">Notice Title</label>
                        <input type="text" id="notice-title" class="form-control" style="padding-left: 16px;" placeholder="e.g. Practical Exam Schedule Shift" required>
                    </div>
                    <div class="form-group">
                        <label for="notice-cat">Category Type</label>
                        <select id="notice-cat" class="form-control" style="padding-left: 16px;">
                            <option value="exam">Academic Examination</option>
                            <option value="event">Campus Event</option>
                            <option value="urgent">Urgent Warning</option>
                            <option value="general">General Notice</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="notice-content">Circular Details</label>
                        <textarea id="notice-content" class="form-control" rows="4" style="padding-left: 16px; height: auto;" placeholder="Write notice details..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="fa-solid fa-bullhorn"></i> Broadcast Circular Notice
                    </button>
                </form>
            </div>
            
            <div class="glass-card" style="grid-column: span 2; display: flex; flex-direction: column; justify-content: space-between; height: 500px;">
                <div class="card-header-flex" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
                    <div>
                        <h3 class="card-title">Student Advisor Desk Chat</h3>
                        <p style="font-size: 11px; color: var(--text-muted);">Reply to queries directly</p>
                    </div>
                </div>
                
                <div style="flex-grow: 1; display: grid; grid-template-columns: 1fr 2fr; height: 380px; overflow: hidden;">
                    <!-- Students thread selector -->
                    <div id="advisor-threads-list" style="border-right: 1px solid var(--border-color); overflow-y: auto; padding: 10px 0;">
                        <!-- Thread headers populated dynamically -->
                    </div>
                    
                    <!-- Chat window -->
                    <div style="display: flex; flex-direction: column; justify-content: space-between; padding-left: 16px;">
                        <div id="advisor-chat-messages-box" style="flex-grow: 1; overflow-y: auto; padding: 12px 0; display: flex; flex-direction: column;">
                            <div style="text-align: center; color: var(--text-muted); font-size: 13px; padding-top: 100px;">Select a student thread to start messaging.</div>
                        </div>
                        
                        <form id="advisor-chat-send-form" style="display: flex; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 10px; visibility: hidden;">
                            <input type="hidden" id="advisor-chat-receiver-username">
                            <input type="text" id="advisor-chat-text-input" class="form-control" placeholder="Write reply to student..." style="padding-left: 16px;" required>
                            <button type="submit" class="btn btn-primary" style="width: auto; min-width: 80px;">
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Hook notice publish
    document.getElementById("notice-publish-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("notice-title").value;
        const cat = document.getElementById("notice-cat").value;
        const content = document.getElementById("notice-content").value;

        const newNotice = {
            id: `circ-${Date.now()}`,
            title: title.trim(),
            category: cat,
            content: content.trim(),
            date: new Date().toISOString().substring(0, 10),
            author: currentUser.name + ` (${currentUser.role === 'admin' ? 'Admin' : 'Faculty'})`
        };

        state.addCircular(newNotice);
        alert(`Notice bulletin '${title}' broadcasted successfully!`);
        document.getElementById("notice-publish-form").reset();
    });

    loadAdvisorDeskChatThreads();
}

function loadAdvisorDeskChatThreads() {
    const listContainer = document.getElementById("advisor-threads-list");
    listContainer.innerHTML = "";
    
    // Group messages by student sender
    const uniqueStudents = [];
    state.messages.forEach(m => {
        const stdUser = m.sender === "teacher" ? m.receiver : m.sender;
        if (!uniqueStudents.includes(stdUser)) {
            uniqueStudents.push(stdUser);
        }
    });

    uniqueStudents.forEach(username => {
        const student = state.users.find(u => u.username === username) || { name: `Student Roll ${username}` };
        
        const threadItem = document.createElement("div");
        threadItem.style.padding = "10px 12px";
        threadItem.style.cursor = "pointer";
        threadItem.style.borderRadius = "8px";
        threadItem.style.marginBottom = "6px";
        threadItem.style.border = "1px solid transparent";
        threadItem.innerHTML = `
            <div style="font-weight: 600; font-size: 13px;">${student.name}</div>
            <div style="font-size: 10px; color: var(--text-muted);">Roll No: ${username}</div>
        `;
        
        threadItem.addEventListener("click", () => {
            document.querySelectorAll("#advisor-threads-list > div").forEach(el => {
                el.style.background = "transparent";
                el.style.borderColor = "transparent";
            });
            threadItem.style.background = "rgba(255,255,255,0.03)";
            threadItem.style.borderColor = "var(--border-color)";
            openAdvisorChatThread(username);
        });

        listContainer.appendChild(threadItem);
    });
}

function openAdvisorChatThread(studentUsername) {
    const receiverField = document.getElementById("advisor-chat-receiver-username");
    const sendForm = document.getElementById("advisor-chat-send-form");
    const messagesBox = document.getElementById("advisor-chat-messages-box");
    
    receiverField.value = studentUsername;
    sendForm.style.visibility = "visible";
    
    const threadMessages = state.messages.filter(m => 
        (m.sender === studentUsername && m.receiver === "teacher") ||
        (m.sender === "teacher" && m.receiver === studentUsername)
    );

    let messagesHTML = "";
    threadMessages.forEach(m => {
        const isSelf = m.sender === "teacher";
        const msgAlign = isSelf ? "align-self: flex-end; background: var(--primary);" : "align-self: flex-start; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color);";
        const label = isSelf ? "You" : `Student Roll ${studentUsername}`;

        messagesHTML += `
            <div style="max-width: 70%; ${msgAlign} padding: 8px 12px; border-radius: 12px; margin-bottom: 8px; display: flex; flex-direction: column;">
                <span style="font-size: 9px; font-weight: 700; opacity: 0.6; margin-bottom: 2px;">${label}</span>
                <span style="font-size: 13px;">${m.text}</span>
            </div>
        `;
    });

    messagesBox.innerHTML = messagesHTML;
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Remove previous listeners
    const clonedForm = sendForm.cloneNode(true);
    sendForm.parentNode.replaceChild(clonedForm, sendForm);

    clonedForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = document.getElementById("advisor-chat-text-input").value;
        const newMsg = {
            id: `msg-${Date.now()}`,
            sender: "teacher",
            receiver: studentUsername,
            text: text.trim(),
            timestamp: new Date().toISOString()
        };
        state.addMessage(newMsg);
        document.getElementById("advisor-chat-text-input").value = "";
        openAdvisorChatThread(studentUsername);
    });
}

// Router assignments mapping for Teacher & Admin roles
window.renderTeacherDashboard = function() {
    renderFacultyDashboard(false);
};

window.renderTeacherStudents = function() {
    renderRegistryUsers(false);
};

window.renderTeacherAttendance = function() {
    renderAttendancePortal(false);
};

window.renderTeacherAssignments = function() {
    renderAssignmentsPortal(false);
};

window.renderTeacherMarks = function() {
    renderMarksPortal(false);
};

window.renderTeacherMaterials = function() {
    renderStudyMaterialsPortal(false);
};

window.renderTeacherCommunication = function() {
    renderCommunicationHub(false);
};

window.renderTeacherProfile = function() {
    renderProfileBase(currentUser);
};

window.renderAdminDashboard = function() {
    renderFacultyDashboard(true);
};

window.renderAdminStudents = function() {
    renderRegistryUsers(true);
};

window.renderAdminAttendance = function() {
    renderAttendancePortal(true);
};

window.renderAdminAssignments = function() {
    renderAssignmentsPortal(true);
};

window.renderAdminMarks = function() {
    renderMarksPortal(true);
};

window.renderAdminMaterials = function() {
    renderStudyMaterialsPortal(true);
};

window.renderAdminCommunication = function() {
    renderCommunicationHub(true);
};

window.renderAdminProfile = function() {
    renderProfileBase(currentUser);
};

window.renderAdminFees = function() {
    const eshikshaURL = "https://share.google/x83WwiwJV409pKHzP";
    const students = state.users.filter(u => u.role === 'student');
    const searchLower = (window.adminFeesSearch || "").toLowerCase().trim();
    const statusFilter = window.adminFeesStatusFilter || "";
    
    const filtered = students.filter(std => {
        const fee = std.feeStatus || { status: "" };
        const matchesSearch = !searchLower || 
            std.name.toLowerCase().includes(searchLower) ||
            std.rollNo.toLowerCase().includes(searchLower);
        const matchesStatus = !statusFilter || fee.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const itemsPerPage = 10;
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    
    if (!window.adminFeesPage) window.adminFeesPage = 1;
    if (window.adminFeesPage > totalPages) window.adminFeesPage = totalPages;
    if (window.adminFeesPage < 1) window.adminFeesPage = 1;
    
    const startIndex = (window.adminFeesPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

    let listHTML = "";
    paginated.forEach((std, i) => {
        const globalIndex = startIndex + i + 1;
        const fee = std.feeStatus || { total: 6200, paid: 0, status: "unpaid" };
        const badgeClass = fee.status === 'paid' ? 'badge-success' : (fee.status === 'partial' ? 'badge-warning' : 'badge-danger');
        
        listHTML += `
            <tr>
                <td>${globalIndex}</td>
                <td>
                    <div style="font-weight: 600;">${std.name}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">Roll: ${std.rollNo} | Class: ${std.class}</div>
                </td>
                <td>₹${fee.total}</td>
                <td>₹${fee.paid}</td>
                <td><span class="badge ${badgeClass}">${fee.status.toUpperCase()}</span></td>
            </tr>
        `;
    });

    if (listHTML === "") {
        listHTML = `<tr><td colspan="5" class="text-center" style="color: var(--text-muted); padding: 24px;">No records match your search.</td></tr>`;
    }

    dynamicContentArea.innerHTML = `
        <div class="glass-card mb-16" style="padding: 24px; text-align: center; background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%); border: 1.5px solid rgba(99, 102, 241, 0.25);">
            <div class="brand-icon" style="width: 50px; height: 50px; font-size: 24px; background: var(--primary); margin: 0 auto 12px;">
                <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 6px;">eShiksa Integration Portal</h3>
            <p style="font-size: 13px; color: var(--text-muted); max-width: 480px; margin: 0 auto 16px;">
                Access the official eShiksa platform for college accounts registration, fee tracking, and offline collection registry.
            </p>
            <a href="${eshikshaURL}" target="_blank" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 600; text-decoration: none; padding: 10px 20px;">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> eShiksa - Login
            </a>
        </div>

        <div class="glass-card mb-16">
            <h3 class="card-title mb-16">Filter Student Fees</h3>
            <div class="form-grid" style="grid-template-columns: 2fr 1fr; gap: 16px;">
                <div>
                    <label for="fees-search">Search Student Name or Roll Number</label>
                    <input type="text" id="fees-search" class="form-control" placeholder="Search..." value="${window.adminFeesSearch || ''}" style="padding-left: 16px;">
                </div>
                <div>
                    <label for="fees-status-filter">Payment Status</label>
                    <select id="fees-status-filter" class="form-control" style="padding-left: 16px;">
                        <option value="">All Statuses</option>
                        <option value="paid" ${statusFilter === 'paid' ? 'selected' : ''}>Fully Paid</option>
                        <option value="partial" ${statusFilter === 'partial' ? 'selected' : ''}>Partially Paid</option>
                        <option value="unpaid" ${statusFilter === 'unpaid' ? 'selected' : ''}>Unpaid</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="glass-card">
            <div class="card-header-flex">
                <div>
                    <h3 class="card-title">Fee Registrar Table</h3>
                    <p style="font-size: 12px; color: var(--text-muted);">Showing student divisions and their current eShiksa payment ledger statuses</p>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Student Details</th>
                            <th>Semester Fee</th>
                            <th>Total Paid</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${listHTML}
                    </tbody>
                </table>
            </div>

            <div class="flex-space" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                <button class="btn btn-secondary btn-sm" id="fees-prev-page" ${window.adminFeesPage === 1 ? 'disabled' : ''}>
                    <i class="fa-solid fa-chevron-left" style="margin-right: 6px;"></i> Prev
                </button>
                <span style="font-size: 13px; color: var(--text-muted);">Page <strong>${window.adminFeesPage}</strong> of <strong>${totalPages}</strong></span>
                <button class="btn btn-secondary btn-sm" id="fees-next-page" ${window.adminFeesPage === totalPages ? 'disabled' : ''}>
                    Next <i class="fa-solid fa-chevron-right" style="margin-left: 6px;"></i>
                </button>
            </div>
        </div>
    `;

    document.getElementById("fees-search").addEventListener("input", (e) => {
        window.adminFeesSearch = e.target.value;
        window.adminFeesPage = 1;
        renderAdminFees();
    });
    document.getElementById("fees-status-filter").addEventListener("change", (e) => {
        window.adminFeesStatusFilter = e.target.value;
        window.adminFeesPage = 1;
        renderAdminFees();
    });

    const prevBtn = document.getElementById("fees-prev-page");
    const nextBtn = document.getElementById("fees-next-page");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            window.adminFeesPage--;
            renderAdminFees();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            window.adminFeesPage++;
            renderAdminFees();
        });
    }
};

window.openDirectPaymentCollector = function(studentUsername) {
    const student = state.users.find(u => u.username === studentUsername);
    if (student) {
        feeModalDueAmt.textContent = `₹${student.feeStatus.due}`;
        feeModalDesc.textContent = "Direct Administrative Fee Collection";
        feePayStudentId.value = student.username;
        feeModal.classList.add("active");
    }
};

window.openAddUserForm = function(role) {
    let specificFieldsHTML = "";
    if (role === 'student') {
        specificFieldsHTML = `
            <div class="form-group">
                <label for="reg-rollno">Roll Number (Username)</label>
                <input type="text" id="reg-rollno" class="form-control" style="padding-left: 16px;" placeholder="e.g. 48" required>
            </div>
            <div class="form-group">
                <label for="reg-spdid">SPDID (Password)</label>
                <input type="text" id="reg-spdid" class="form-control" style="padding-left: 16px;" placeholder="e.g. 2024001550" required>
            </div>
            <div class="form-group">
                <label for="reg-program">Academic Program</label>
                <select id="reg-program" class="form-control" style="padding-left: 16px;" required>
                    <option value="B.Com (Regular)">B.Com (Regular)</option>
                    <option value="B.Com (Professional)">B.Com (Professional)</option>
                    <option value="M.Com">M.Com</option>
                </select>
            </div>
            <div class="form-group">
                <label for="reg-year">Year</label>
                <select id="reg-year" class="form-control" style="padding-left: 16px;" required>
                    <!-- Populated dynamically -->
                </select>
            </div>
            <div class="form-group">
                <label for="reg-semester">Semester</label>
                <select id="reg-semester" class="form-control" style="padding-left: 16px;" required>
                    <!-- Populated dynamically -->
                </select>
            </div>
            <div class="form-group">
                <label for="reg-class">Class Section (e.g. Division A, CS-A)</label>
                <input type="text" id="reg-class" class="form-control" style="padding-left: 16px;" value="Division A" required>
            </div>
            <div class="form-group">
                <label for="reg-fee-total">Total Term Fee (₹)</label>
                <input type="number" id="reg-fee-total" class="form-control" style="padding-left: 16px;" value="6200" required>
            </div>
        `;
    } else {
        specificFieldsHTML = `
            <div class="form-group">
                <label for="reg-dept">Academic Department</label>
                <input type="text" id="reg-dept" class="form-control" style="padding-left: 16px;" value="Commerce" required>
            </div>
            <div class="form-group">
                <label for="reg-classes">Assigned Classes (Comma separated)</label>
                <input type="text" id="reg-classes" class="form-control" style="padding-left: 16px;" value="CS-A, CS-B" required>
            </div>
        `;
    }

    const formHTML = `
        <form id="add-user-form">
            <input type="hidden" id="reg-role" value="${role}">
            
            <div class="form-grid">
                <div class="form-group form-grid-full">
                    <label for="reg-name">Full Name</label>
                    <input type="text" id="reg-name" class="form-control" style="padding-left: 16px;" placeholder="First Last" required>
                </div>
                
                ${role !== 'student' ? `
                <div class="form-group">
                    <label for="reg-username">Username (Login Key)</label>
                    <input type="text" id="reg-username" class="form-control" style="padding-left: 16px;" placeholder="Unique username" required>
                </div>
                
                <div class="form-group">
                    <label for="reg-password">Password</label>
                    <input type="password" id="reg-password" class="form-control" style="padding-left: 16px;" placeholder="Password" required>
                </div>
                ` : ''}
 
                <div class="form-group">
                    <label for="reg-email">Email Address</label>
                    <input type="email" id="reg-email" class="form-control" style="padding-left: 16px;" placeholder="name@college.edu" required>
                </div>
 
                <div class="form-group">
                    <label for="reg-phone">Phone Number</label>
                    <input type="text" id="reg-phone" class="form-control" style="padding-left: 16px;" placeholder="+91 99999 99999" required>
                </div>
            </div>
            
            ${specificFieldsHTML}
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" style="width: auto;">
                    <i class="fa-solid fa-circle-plus"></i>
                    <span>Register Account</span>
                </button>
            </div>
        </form>
    `;

    openModal(`Register New ${role.charAt(0).toUpperCase() + role.slice(1)}`, formHTML);

    if (role === 'student') {
        const progEl = document.getElementById("reg-program");
        const yearEl = document.getElementById("reg-year");
        const semEl = document.getElementById("reg-semester");

        const updateOpts = () => {
            const prog = progEl.value;
            const currentYear = yearEl.value;
            const currentSem = semEl.value;

            // Update Year Dropdown
            let years = ["1st Year", "2nd Year"];
            if (prog.includes("B.Com")) {
                years.push("3rd Year");
            }
            
            let yearHTML = years.map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`).join("");
            yearEl.innerHTML = yearHTML;

            // Re-render semester based on year
            const activeYear = yearEl.value;
            let semesters = [];
            if (activeYear === "1st Year") {
                semesters = ["Semester 1", "Semester 2"];
            } else if (activeYear === "2nd Year") {
                semesters = ["Semester 3", "Semester 4"];
            } else if (activeYear === "3rd Year") {
                semesters = ["Semester 5", "Semester 6"];
            }

            let semHTML = semesters.map(s => `<option value="${s}" ${s === currentSem ? 'selected' : ''}>${s}</option>`).join("");
            semEl.innerHTML = semHTML;
        };

        // Initialize
        updateOpts();

        progEl.addEventListener("change", updateOpts);
        yearEl.addEventListener("change", updateOpts);
    }

    // Form submission listener
    const regForm = document.getElementById("add-user-form");
    regForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const regRole = document.getElementById("reg-role").value;
        const nameVal = document.getElementById("reg-name").value;
        const emailVal = document.getElementById("reg-email").value;
        const phoneVal = document.getElementById("reg-phone").value;
        
        let userVal, passVal;
        if (regRole === 'student') {
            userVal = document.getElementById("reg-rollno").value.trim();
            passVal = document.getElementById("reg-spdid").value.trim();
        } else {
            userVal = document.getElementById("reg-username").value.trim();
            passVal = document.getElementById("reg-password").value.trim();
        }
        
        const newUser = {
            username: userVal,
            password: passVal,
            role: regRole,
            name: nameVal,
            email: emailVal,
            phone: phoneVal,
        };

        if (regRole === 'student') {
            newUser.program = document.getElementById("reg-program").value;
            newUser.year = document.getElementById("reg-year").value;
            newUser.semester = document.getElementById("reg-semester").value;
            newUser.class = document.getElementById("reg-class").value;
            newUser.rollNo = userVal;
            newUser.spdid = passVal;
            newUser.enrolmentNo = "ENR" + passVal;
            newUser.admAppNo = "APP" + passVal;
            newUser.department = "Commerce";
            newUser.admissionYear = "2026";
            
            const totalFee = parseFloat(document.getElementById("reg-fee-total").value);
            newUser.feeStatus = {
                total: totalFee,
                paid: 0,
                due: totalFee,
                status: "unpaid"
            };
            newUser.attendance = {};
            newUser.grades = [];
        } else {
            newUser.department = document.getElementById("reg-dept").value;
            newUser.office = "Staff Room";
            newUser.classes = document.getElementById("reg-classes").value.split(",").map(s => s.trim());
            newUser.subjects = ["Commerce"];
            newUser.schedule = [];
        }

        const success = state.addUser(newUser);
        if (success) {
            alert(`Registered ${nameVal} successfully.`);
            closeModal();
            renderRegistryUsers(true); // Rerender
        } else {
            alert(`A user with username '${userVal}' already exists. Please choose another username.`);
        }
    });
};

window.handleDeleteUser = function(username) {
    if (confirm(`Are you sure you want to delete user '${username}'? This deletes all files, schedules, and attendance histories permanently.`)) {
        state.deleteUser(username);
        renderRegistryUsers(true); // Rerender
    }
};

window.deleteAllStudents = function() {
    if (confirm("WARNING: Are you sure you want to delete ALL students registered in the database? This action is permanent and cannot be undone.")) {
        state.users = state.users.filter(u => u.role !== 'student');
        state.saveState();
        adminUsersPage = 1;
        renderRegistryUsers(true);
        alert("All student user data has been successfully deleted.");
    }
};

window.triggerBulkImport = function() {
    document.getElementById("bulk-import-file-input").click();
};

window.handleBulkImportFile = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        let importedCount = 0;
        let duplicateCount = 0;

        try {
            let studentsArray = [];
            if (file.name.endsWith(".json")) {
                studentsArray = JSON.parse(text);
                if (!Array.isArray(studentsArray)) {
                    studentsArray = [studentsArray];
                }
            } else if (file.name.endsWith(".csv")) {
                const lines = text.split(/\r?\n/);
                if (lines.length < 2) {
                    alert("CSV file must contain a header row and at least one student record.");
                    return;
                }
                const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
                    let row = {};
                    headers.forEach((h, idx) => {
                        row[h] = values[idx] || "";
                    });
                    studentsArray.push(row);
                }
            }

            studentsArray.forEach(row => {
                // Read case-insensitive or space-filled headers
                const getVal = (keys) => {
                    for (let k of keys) {
                        if (row[k] !== undefined) return row[k].toString().trim();
                        // Try uppercase / lowercase variations
                        for (let rk in row) {
                            if (rk.toUpperCase().replace(/\s+/g, '') === k.toUpperCase().replace(/\s+/g, '')) {
                                return row[rk].toString().trim();
                            }
                        }
                    }
                    return "";
                };

                const rollNo = getVal(["rollNo", "ROLL NO.", "ROLL NO", "ROLLNO"]);
                const spdid = getVal(["spdid", "SPDID"]);
                const name = getVal(["name", "FULL NAME", "FULLNAME"]);
                const email = getVal(["email", "EMAIL ID", "EMAILID", "EMAIL"]);
                const phone = getVal(["phone", "MO. NO.", "MONO", "PHONE NUMBER", "PHONE"]);
                const gender = getVal(["gender", "GENDER"]);
                const category = getVal(["category", "CATEGORY"]);

                if (!rollNo || !spdid) return; // skip header or empty rows

                const username = rollNo;
                const password = spdid;

                const exists = state.users.some(u => u.username === username);
                if (exists) {
                    duplicateCount++;
                    return;
                }

                // Course mapping
                let programVal = "B.Com (Professional)";
                const courseRaw = getVal(["course", "COURSE", "PROGRAM"]);
                if (courseRaw.includes("Reg") || courseRaw.toLowerCase().includes("regular")) {
                    programVal = "B.Com (Regular)";
                } else if (courseRaw.includes("MCom") || courseRaw.toLowerCase().includes("m.com")) {
                    programVal = "M.Com";
                }

                // Year mapping
                let yearVal = "1st Year";
                const yrRaw = getVal(["year", "YEAR"]);
                if (yrRaw === "1" || yrRaw.includes("1st")) yearVal = "1st Year";
                else if (yrRaw === "2" || yrRaw.includes("2nd")) yearVal = "2nd Year";
                else if (yrRaw === "3" || yrRaw.includes("3rd")) yearVal = "3rd Year";

                // Semester mapping
                let semVal = "Semester 1";
                const semRaw = getVal(["semester", "sem", "SEMESTER"]);
                if (semRaw) {
                    semVal = "Semester " + semRaw.replace("Semester", "").trim();
                }

                const newStudent = {
                    role: "student",
                    username: username,
                    password: password,
                    name: name || "Unknown Student",
                    email: email || "",
                    phone: phone || "",
                    rollNo: rollNo,
                    spdid: spdid,
                    gender: gender || "Male",
                    category: category || "General",
                    enrolmentNo: "ENR" + spdid,
                    admAppNo: "APP" + spdid,
                    class: "Division A",
                    division: "A",
                    program: programVal,
                    year: yearVal,
                    semester: semVal,
                    admissionYear: "2024",
                    attendance: {},
                    grades: [],
                    feeStatus: { total: 6200, paid: 0, due: 6200, status: "unpaid" }
                };

                state.users.push(newStudent);
                importedCount++;
            });

            if (importedCount > 0) {
                state.saveState();
                renderRegistryUsers(true);
            }

            alert(`Import completed successfully!\n- Imported: ${importedCount} students\n- Skipped (Duplicates): ${duplicateCount}`);
        } catch (err) {
            alert("Error parsing file. Please check format structure compatibility.\nDetails: " + err.message);
        }
        
        // Reset file input so same file can be selected again if needed
        event.target.value = "";
    };
    reader.readAsText(file);
};

window.handleDeleteCircular = function(id) {
    if (confirm("Are you sure you want to delete this notice? This action is immediate and permanent.")) {
        state.deleteCircular(id);
        renderCircularListBoard(currentUser.role !== 'student'); // refresh board
    }
};

// =========================================================================
// SHARED PROFILE COMPONENT
// =========================================================================

function renderProfileBase(user) {
    let detailsHTML = "";
    
    if (user.role === 'student') {
        detailsHTML = `
            <div class="profile-detail-item">
                <span class="detail-label">Roll Number:</span>
                <span class="detail-value">${user.rollNo}</span>
            </div>
            <div class="profile-detail-item">
                <span class="detail-label">SPDID:</span>
                <span class="detail-value"><code>${user.spdid}</code></span>
            </div>
            <div class="profile-detail-item">
                <span class="detail-label">Enrolment No:</span>
                <span class="detail-value"><code>${user.enrolmentNo}</code></span>
            </div>
            <div class="profile-detail-item">
                <span class="detail-label">Admission App No:</span>
                <span class="detail-value"><code>${user.admAppNo}</code></span>
            </div>
            <div class="profile-detail-item">
                <span class="detail-label">Class Group:</span>
                <span class="detail-value">${user.class}</span>
            </div>
            <div class="profile-detail-item">
                <span class="detail-label">Admission Year:</span>
                <span class="detail-value">${user.admissionYear}</span>
            </div>
            <div class="profile-detail-item">
                <span class="detail-label">Department:</span>
                <span class="detail-value">${user.department}</span>
            </div>
        `;
    } else if (user.role === 'teacher') {
        detailsHTML = `
            <div class="profile-detail-item">
                <span class="detail-label">Department:</span>
                <span class="detail-value">${user.department}</span>
            </div>
            <div class="profile-detail-item">
                <span class="detail-label">Office Cubicle:</span>
                <span class="detail-value">${user.office}</span>
            </div>
            <div class="profile-detail-item">
                <span class="detail-label">Assigned Classes:</span>
                <span class="detail-value">${user.classes.join(", ")}</span>
            </div>
        `;
    } else {
        detailsHTML = `
            <div class="profile-detail-item">
                <span class="detail-label">Division:</span>
                <span class="detail-value">${user.department}</span>
            </div>
            <div class="profile-detail-item">
                <span class="detail-label">Office Room:</span>
                <span class="detail-value">${user.office}</span>
            </div>
        `;
    }

    // Standard items (phone, email, password changes)
    dynamicContentArea.innerHTML = `
        <div class="glass-card">
            <div class="profile-view-wrapper">
                <div class="profile-card-left">
                    <div class="profile-large-avatar">${getInitials(user.name)}</div>
                    <h3 class="profile-full-name">${user.name}</h3>
                    <span class="profile-meta-role">${user.role}</span>
                    
                    <div class="profile-details-list">
                        ${detailsHTML}
                    </div>
                </div>

                <div style="border-left: 1px solid var(--border-color); padding-left: 32px;">
                    <h3 class="card-title mb-16">Contact and Credentials Setup</h3>
                    
                    <form id="profile-update-form">
                        <div class="form-group">
                            <label for="prof-email">Email Address</label>
                            <input type="email" id="prof-email" class="form-control" style="padding-left: 16px;" value="${user.email}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="prof-phone">Phone Number</label>
                            <input type="text" id="prof-phone" class="form-control" style="padding-left: 16px;" value="${user.phone}" required>
                        </div>

                        <div class="form-group">
                            <label for="prof-password">Change Password</label>
                            <input type="password" id="prof-password" class="form-control" style="padding-left: 16px;" value="${user.password}" required>
                        </div>

                        <button type="submit" class="btn btn-primary" style="width: auto; min-width: 180px;">
                            <i class="fa-solid fa-floppy-disk"></i>
                            <span>Save Profile Info</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Hook update submit
    const profForm = document.getElementById("profile-update-form");
    profForm.addEventListener("submit", (e) => {
        e.preventDefault();
        user.email = document.getElementById("prof-email").value;
        user.phone = document.getElementById("prof-phone").value;
        user.password = document.getElementById("prof-password").value;
        
        state.updateUser(user);
        alert("Profile details updated successfully.");
        loginUser(user); // refresh sidebar profile display and cache
    });
}


// --- App Initialization Entry Point ---
window.addEventListener("DOMContentLoaded", () => {
    setDateDisplay();
    // Check if session exists in local storage
    const savedUsername = localStorage.getItem("tcc_logged_in_username");
    if (savedUsername) {
        const savedUser = state.users.find(u => u.username === savedUsername);
        if (savedUser) {
            loginUser(savedUser);
            return;
        }
    }
    // Default initial view setup: show auth block
    authView.style.display = "flex";
    dashboardView.style.display = "none";
});

// =========================================================================
// INTERACTIVE LECTURE SCHEDULE PANEL IMPLEMENTATION
// =========================================================================
function renderInteractiveSchedulePanel() {
    if (!window.selectedScheduleDiv) window.selectedScheduleDiv = "Division A";
    if (!window.selectedScheduleProf) window.selectedScheduleProf = "All";

    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const slots = [
        { id: 1, time: "08:00 - 09:00 AM" },
        { id: 2, time: "09:00 - 10:00 AM" },
        { id: 3, time: "10:20 - 11:20 AM" },
        { id: 4, time: "11:20 AM - 12:20 PM" }
    ];

    const divisions = ["Division A", "Division B", "Division C", "Division D", "Division E", "Division F"];
    const professors = [
        { code: "All", name: "All Professors" },
        { code: "PMC", name: "Dr. P M Thapa (PMC)" },
        { code: "RK", name: "Dr. R. K. Thapa (RK)" },
        { code: "MG", name: "Prof. M. G. (MG)" },
        { code: "KT", name: "Prof. K. T. Mehta (KT)" },
        { code: "JR/RM", name: "Prof. J. R. / R. M. (JR/RM)" },
        { code: "JKR", name: "Prof. J. K. R. (JKR)" },
        { code: "PBC", name: "Prof. P. B. C. (PBC)" },
        { code: "JRR", name: "Prof. J. R. R. (JRR)" }
    ];

    let divOptions = divisions.map(d => `<option value="${d}" ${window.selectedScheduleDiv === d ? 'selected' : ''}>${d}</option>`).join("");
    let profOptions = professors.map(p => `<option value="${p.code}" ${window.selectedScheduleProf === p.code ? 'selected' : ''}>${p.name}</option>`).join("");

    let gridHTML = "";
    gridHTML += `<div class="timetable-header" style="grid-column: 1;">Slot / Time</div>`;
    weekdays.forEach(day => {
        gridHTML += `<div class="timetable-header">${day}</div>`;
    });

    const currentTimetable = state.timetables[window.selectedScheduleDiv] || {};

    slots.forEach(slot => {
        gridHTML += `
            <div class="timetable-row-label">
                <div class="text-center">
                    <div style="font-weight: 700; color: var(--text-main);">P${slot.id}</div>
                    <div style="font-size: 9px; white-space: nowrap;">${slot.time}</div>
                </div>
            </div>
        `;

        weekdays.forEach(day => {
            const classesOnDay = currentTimetable[day] || [];
            const details = classesOnDay.find(c => c.slot === slot.id);

            if (details && details.subject) {
                const profMatch = window.selectedScheduleProf === "All" || details.subject.includes(`(${window.selectedScheduleProf})`) || (details.teacher && details.teacher.includes(window.selectedScheduleProf));
                
                if (profMatch) {
                    const isCancelled = details.status === "Cancelled";
                    let slotStyle = "";
                    let slotContent = "";
                    
                    if (isCancelled) {
                        slotStyle = "background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.25);";
                        slotContent = `
                            <div class="timetable-subject" style="text-decoration: line-through; color: var(--danger); font-size: 11px;">${details.subject}</div>
                            <div class="timetable-teacher" style="color: var(--danger); font-weight: bold; font-size: 10px;">CANCELLED</div>
                            <div class="timetable-room" style="font-size: 9px; color: var(--text-muted);">No Class</div>
                        `;
                    } else {
                        slotStyle = "background: rgba(20, 83, 136, 0.08); border-color: rgba(20, 83, 136, 0.25);";
                        slotContent = `
                            <div class="timetable-subject" style="color: var(--primary); font-weight: 700; font-size: 11px;">${details.subject}</div>
                            <div class="timetable-teacher" style="font-size: 10px; color: var(--text-main);">${details.teacher || 'Faculty'}</div>
                            <div class="timetable-room" style="font-size: 9px;"><i class="fa-solid fa-location-dot" style="margin-right: 4px;"></i>${details.room || 'Room'}</div>
                        `;
                    }

                    const actionLabel = isCancelled ? "Activate" : "Cancel";
                    const btnClass = isCancelled ? "btn-secondary" : "btn-primary";
                    const actionBtn = `
                        <button class="btn ${btnClass} btn-sm" onclick="toggleLectureSlotStatus('${window.selectedScheduleDiv}', '${day}', ${slot.id})" style="padding: 2px 6px; font-size: 9px; margin-top: 6px; width: 100%;">
                            ${actionLabel}
                        </button>
                    `;
                    const swapBtn = `
                        <button class="btn btn-secondary btn-sm" onclick="swapLectureSlotDetails('${window.selectedScheduleDiv}', '${day}', ${slot.id})" style="padding: 2px 6px; font-size: 9px; margin-top: 4px; width: 100%; border-color: rgba(99, 102, 241, 0.15);">
                            <i class="fa-solid fa-arrows-rotate" style="margin-right: 2px;"></i> Swap / Edit
                        </button>
                    `;

                    gridHTML += `
                        <div class="timetable-slot" style="${slotStyle} display: flex; flex-direction: column; justify-content: space-between; min-height: 140px; padding: 8px;">
                            <div>${slotContent}</div>
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                ${actionBtn}
                                ${swapBtn}
                            </div>
                        </div>
                    `;
                } else {
                    gridHTML += `
                        <div class="timetable-slot timetable-empty" style="min-height: 115px; background: rgba(0,0,0,0.01);">
                            <span style="font-size: 10px; color: var(--text-muted); text-align: center;">Other Prof</span>
                        </div>
                    `;
                }
            } else {
                gridHTML += `
                    <div class="timetable-slot timetable-empty" style="min-height: 115px;">
                        <span>Free Slot</span>
                    </div>
                `;
            }
        });
    });

    dynamicContentArea.innerHTML = `
        <div class="glass-card mb-16">
            <h3 class="card-title mb-16">Filter Academic Time Table</h3>
            <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                    <label for="schedule-div-select">Select Division</label>
                    <select id="schedule-div-select" class="form-control" style="padding-left: 16px;">
                        ${divOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="schedule-prof-select">Select Professor Filter</label>
                    <select id="schedule-prof-select" class="form-control" style="padding-left: 16px;">
                        ${profOptions}
                    </select>
                </div>
            </div>
        </div>

        <div class="glass-card">
            <div class="card-header-flex">
                <div>
                    <h3 class="card-title">Weekly Lecture Schedule (${window.selectedScheduleDiv})</h3>
                    <p style="font-size: 12px; color: var(--text-muted);">View, schedule, or cancel lectures. Toggling requires security key [123456].</p>
                </div>
            </div>
            
            <div class="timetable-container" style="margin-top: 16px;">
                <div class="timetable-grid" style="grid-template-columns: 100px repeat(6, 1fr); gap: 6px;">
                    ${gridHTML}
                </div>
            </div>
        </div>
    `;

    document.getElementById("schedule-div-select").addEventListener("change", (e) => {
        window.selectedScheduleDiv = e.target.value;
        renderInteractiveSchedulePanel();
    });
    document.getElementById("schedule-prof-select").addEventListener("change", (e) => {
        window.selectedScheduleProf = e.target.value;
        renderInteractiveSchedulePanel();
    });
}

window.toggleLectureSlotStatus = function(division, day, slotId) {
    const password = prompt("Enter Schedule Editor Security Key:");
    if (password === null) return;
    
    if (password !== "123456") {
        alert("Incorrect security key. Access denied.");
        return;
    }

    const timetable = state.timetables[division];
    if (timetable && timetable[day]) {
        const slot = timetable[day].find(s => s.slot === slotId);
        if (slot) {
            slot.status = slot.status === "Cancelled" ? "Active" : "Cancelled";
            state.saveState();
            alert(`Lecture slot status updated successfully!`);
            renderInteractiveSchedulePanel();
        }
    }
};

window.swapLectureSlotDetails = function(division, day, slotId) {
    const password = prompt("Enter Schedule Editor Security Key:");
    if (password === null) return;
    
    if (password !== "123456") {
        alert("Incorrect security key. Access denied.");
        return;
    }

    const timetable = state.timetables[division];
    if (timetable && timetable[day]) {
        const slot = timetable[day].find(s => s.slot === slotId);
        if (slot) {
            const currentSub = slot.subject;
            const currentTeacher = slot.teacher || "";
            const currentRoom = slot.room || "";

            const newSub = prompt("Enter New Subject Title (and code if needed):", currentSub);
            if (newSub === null) return;
            
            const newTeacher = prompt("Enter New Professor Name:", currentTeacher);
            if (newTeacher === null) return;

            const newRoom = prompt("Enter New Classroom Room Number:", currentRoom);
            if (newRoom === null) return;

            // Save new details
            slot.subject = newSub;
            slot.teacher = newTeacher;
            slot.room = newRoom;
            slot.status = "Active"; // Reset status to active since we rescheduled it
            
            state.saveState();
            alert(`Lecture slot rescheduled successfully!`);
            renderInteractiveSchedulePanel();
        }
    }
};

function renderStaticTimetablePanel() {
    if (!window.selectedScheduleDiv) window.selectedScheduleDiv = "Division A";
    if (!window.selectedScheduleProf) window.selectedScheduleProf = "All";

    const slots = [
        { id: 1, time: "08:00 - 09:00 AM" },
        { id: 2, time: "09:00 - 10:00 AM" },
        { id: 3, time: "10:20 - 11:20 AM" },
        { id: 4, time: "11:20 AM - 12:20 PM" }
    ];
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    // Header controls: selector for class division and filter for teacher
    const divSelectorHTML = ["Division A", "Division B", "Division C", "Division D", "Division E", "Division F"].map(c => `
        <option value="${c}" ${c === window.selectedScheduleDiv ? 'selected' : ''}>${c}</option>
    `).join("");

    const teachersList = ["All", "Sarah", "Rajesh", "Evelyn", "Taylor", "Miller"];
    const teacherFilterHTML = teachersList.map(t => `
        <option value="${t}" ${t === window.selectedScheduleProf ? 'selected' : ''}>${t === 'All' ? 'All Professors' : 'Prof. ' + t}</option>
    `).join("");

    let gridHTML = "";
    gridHTML += `<div class="timetable-header" style="grid-column: 1;">Slot / Time</div>`;
    weekdays.forEach(day => {
        gridHTML += `<div class="timetable-header">${day}</div>`;
    });

    const currentTimetable = state.timetables[window.selectedScheduleDiv] || {};

    slots.forEach(slot => {
        gridHTML += `
            <div class="timetable-row-label">
                <div class="text-center">
                    <div style="font-weight: 700; color: var(--text-main);">P${slot.id}</div>
                    <div style="font-size: 9px; white-space: nowrap;">${slot.time}</div>
                </div>
            </div>
        `;

        weekdays.forEach(day => {
            const classesOnDay = currentTimetable[day] || [];
            const details = classesOnDay.find(c => c.slot === slot.id);

            if (details && details.subject) {
                const profMatch = window.selectedScheduleProf === "All" || details.subject.includes(`(${window.selectedScheduleProf})`) || (details.teacher && details.teacher.includes(window.selectedScheduleProf));
                
                if (profMatch) {
                    const isCancelled = details.status === "Cancelled";
                    let slotStyle = "";
                    let slotContent = "";
                    
                    if (isCancelled) {
                        slotStyle = "background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.25);";
                        slotContent = `
                            <div class="timetable-subject" style="text-decoration: line-through; color: var(--danger); font-size: 11px;">${details.subject}</div>
                            <div class="timetable-teacher" style="color: var(--danger); font-weight: bold; font-size: 10px;">CANCELLED</div>
                            <div class="timetable-room" style="font-size: 9px; color: var(--text-muted);">No Class</div>
                        `;
                    } else {
                        slotStyle = "background: rgba(20, 83, 136, 0.08); border-color: rgba(20, 83, 136, 0.25);";
                        slotContent = `
                            <div class="timetable-subject" style="color: var(--primary); font-weight: 700; font-size: 11px;">${details.subject}</div>
                            <div class="timetable-teacher" style="font-size: 10px; color: var(--text-main);">${details.teacher || 'Faculty'}</div>
                            <div class="timetable-room" style="font-size: 9px;"><i class="fa-solid fa-location-dot" style="margin-right: 4px;"></i>${details.room || 'Room'}</div>
                        `;
                    }

                    gridHTML += `
                        <div class="timetable-slot" style="${slotStyle} display: flex; flex-direction: column; justify-content: center; min-height: 115px; padding: 8px;">
                            <div>${slotContent}</div>
                        </div>
                    `;
                } else {
                    gridHTML += `
                        <div class="timetable-slot timetable-empty" style="min-height: 115px; background: rgba(0,0,0,0.01);">
                            <span style="font-size: 10px; color: var(--text-muted); text-align: center;">Other Prof</span>
                        </div>
                    `;
                }
            } else {
                gridHTML += `
                    <div class="timetable-slot timetable-empty" style="min-height: 115px;">
                        <span>Free Slot</span>
                    </div>
                `;
            }
        });
    });

    dynamicContentArea.innerHTML = `
        <div class="glass-card mb-16">
            <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                    <label for="static-schedule-class-select">Select Division</label>
                    <select id="static-schedule-class-select" class="form-control" style="padding-left: 16px;">
                        ${divSelectorHTML}
                    </select>
                </div>
                <div>
                    <label for="static-schedule-prof-select">Filter by Professor</label>
                    <select id="static-schedule-prof-select" class="form-control" style="padding-left: 16px;">
                        ${teacherFilterHTML}
                    </select>
                </div>
            </div>
        </div>

        <div class="glass-card">
            <h3 class="card-title mb-16">Master Class Timetable Grid (Read-Only)</h3>
            <div class="timetable-container">
                <div class="timetable-grid" style="grid-template-columns: 100px repeat(6, 1fr);">
                    ${gridHTML}
                </div>
            </div>
        </div>
    `;

    document.getElementById("static-schedule-class-select").addEventListener("change", (e) => {
        window.selectedScheduleDiv = e.target.value;
        renderStaticTimetablePanel();
    });
    document.getElementById("static-schedule-prof-select").addEventListener("change", (e) => {
        window.selectedScheduleProf = e.target.value;
        renderStaticTimetablePanel();
    });
}

window.renderTeacherTimetable = function() {
    renderStaticTimetablePanel();
};

window.renderAdminTimetable = function() {
    renderStaticTimetablePanel();
};

window.renderTeacherSchedule = function() {
    renderInteractiveSchedulePanel();
};

window.renderAdminSchedule = function() {
    renderInteractiveSchedulePanel();
};

window.printReceipt = function(txnId, desc, amount, date) {
    const printWindow = window.open("", "_blank", "width=600,height=600");
    printWindow.document.write(`
        <html>
        <head>
            <title>Receipt - ${txnId}</title>
            <style>
                body { font-family: sans-serif; padding: 40px; color: #1e293b; }
                .receipt-card { border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; max-width: 480px; margin: 0 auto; }
                .receipt-header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
                .receipt-title { font-size: 20px; font-weight: 700; color: #1e3a8a; }
                .receipt-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
                .receipt-total { border-top: 1px dashed #cbd5e1; padding-top: 12px; font-weight: 700; font-size: 16px; margin-top: 16px; }
            </style>
        </head>
        <body>
            <div class="receipt-card">
                <div class="receipt-header">
                    <div class="receipt-title">Tolani Commerce College, Adipur</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">NEP Semester Fee Receipt</div>
                </div>
                <div class="receipt-row"><strong>Transaction ID:</strong> <span>${txnId}</span></div>
                <div class="receipt-row"><strong>Description:</strong> <span>${desc}</span></div>
                <div class="receipt-row"><strong>Date:</strong> <span>${date}</span></div>
                <div class="receipt-row"><strong>Payment Method:</strong> <span>Card Payment (online)</span></div>
                <div class="receipt-row receipt-total"><strong>Amount Paid:</strong> <span>₹${amount.toLocaleString('en-IN')}.00</span></div>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

window.executeMockPostgresSQL = function(queryStr) {
    const q = queryStr.trim();
    if (!q) return "No query entered.";
    
    const parts = q.split(/\s+/);
    const command = parts[0].toUpperCase();
    
    if (command === "SELECT") {
        const fromIndex = parts.findIndex(p => p.toUpperCase() === "FROM");
        if (fromIndex === -1 || fromIndex === parts.length - 1) {
            return "ERROR: syntax error near 'FROM' or missing target table name.";
        }
        const tableName = parts[fromIndex + 1].toLowerCase().replace(/;/g, "");
        const validTables = ["users", "timetables", "assignments", "materials", "leaves"];
        if (!validTables.includes(tableName)) {
            return `ERROR: table "${tableName}" does not exist in B.Com schema.`;
        }
        
        let rows = [];
        if (tableName === "users") rows = state.users;
        else if (tableName === "timetables") {
            Object.keys(state.timetables).forEach(div => {
                Object.keys(state.timetables[div]).forEach(day => {
                    state.timetables[div][day].forEach(slot => {
                        rows.push({ division: div, day: day, slot: slot.slot, subject: slot.subject, teacher: slot.teacher, room: slot.room, status: slot.status });
                    });
                });
            });
        }
        else if (tableName === "assignments") rows = state.assignments;
        else if (tableName === "materials") rows = state.materials;
        else if (tableName === "leaves") rows = state.leaves;
        
        const whereIndex = parts.findIndex(p => p.toUpperCase() === "WHERE");
        if (whereIndex !== -1 && whereIndex < parts.length - 1) {
            const condPart = parts.slice(whereIndex + 1).join(" ").replace(/;/g, "");
            const match = condPart.match(/(\w+)\s*=\s*['"]?([^'"]+)['"]?/);
            if (match) {
                const colName = match[1];
                const colVal = match[2];
                rows = rows.filter(r => String(r[colName]) === colVal);
            }
        }
        
        if (rows.length === 0) {
            return "(0 rows)";
        }
        
        const cols = Object.keys(rows[0]).filter(k => typeof rows[0][k] !== 'object');
        let headerLine = cols.join(" | ");
        let separatorLine = cols.map(c => "-".repeat(Math.max(c.length, 6))).join("-+-");
        let lines = [headerLine, separatorLine];
        
        rows.forEach(r => {
            let rowLine = cols.map(c => String(r[c] !== undefined ? r[c] : "")).join(" | ");
            lines.push(rowLine);
        });
        
        return lines.join("\n") + `\n(${rows.length} rows)`;
    }
    
    if (command === "UPDATE") {
        const tableName = parts[1]?.toLowerCase();
        const validTables = ["users", "timetables", "assignments", "materials", "leaves"];
        if (!validTables.includes(tableName)) {
            return `ERROR: table "${tableName}" does not exist.`;
        }
        
        const setIndex = parts.findIndex(p => p.toUpperCase() === "SET");
        if (setIndex === -1) return "ERROR: missing 'SET' keyword in UPDATE statement.";
        
        const whereIndex = parts.findIndex(p => p.toUpperCase() === "WHERE");
        const setClauseEnd = whereIndex !== -1 ? whereIndex : parts.length;
        const setClause = parts.slice(setIndex + 1, setClauseEnd).join(" ").replace(/;/g, "");
        
        const setMatch = setClause.match(/(\w+)\s*=\s*['"]?([^'"]+)['"]?/);
        if (!setMatch) return "ERROR: invalid SET clause syntax. Must be col = value.";
        const updateCol = setMatch[1];
        const updateVal = setMatch[2];
        
        let matchCol = null;
        let matchVal = null;
        if (whereIndex !== -1) {
            const condClause = parts.slice(whereIndex + 1).join(" ").replace(/;/g, "");
            const condMatch = condClause.match(/(\w+)\s*=\s*['"]?([^'"]+)['"]?/);
            if (condMatch) {
                matchCol = condMatch[1];
                matchVal = condMatch[2];
            }
        }
        
        let updateCount = 0;
        if (tableName === "users") {
            state.users.forEach(u => {
                if (!matchCol || String(u[matchCol]) === matchVal) {
                    u[updateCol] = isNaN(Number(updateVal)) ? updateVal : Number(updateVal);
                    updateCount++;
                }
            });
            state.saveState();
        } else if (tableName === "assignments") {
            state.assignments.forEach(a => {
                if (!matchCol || String(a[matchCol]) === matchVal) {
                    a[updateCol] = updateVal;
                    updateCount++;
                }
            });
            state.saveState();
        } else if (tableName === "materials") {
            state.materials.forEach(m => {
                if (!matchCol || String(m[matchCol]) === matchVal) {
                    m[updateCol] = updateVal;
                    updateCount++;
                }
            });
            state.saveState();
        } else if (tableName === "leaves") {
            state.leaves.forEach(l => {
                if (!matchCol || String(l[matchCol]) === matchVal) {
                    l[updateCol] = updateVal;
                    updateCount++;
                }
            });
            state.saveState();
        }
        
        return `UPDATE ${updateCount}\nQuery completed successfully.`;
    }
    
    if (command === "DELETE") {
        const tableName = parts[2]?.toLowerCase().replace(/;/g, "");
        const validTables = ["users", "timetables", "assignments", "materials", "leaves"];
        if (!validTables.includes(tableName)) {
            return `ERROR: table "${tableName}" does not exist.`;
        }
        
        const whereIndex = parts.findIndex(p => p.toUpperCase() === "WHERE");
        if (whereIndex === -1) return "ERROR: DELETE statement requires a WHERE clause for safety.";
        
        const condClause = parts.slice(whereIndex + 1).join(" ").replace(/;/g, "");
        const condMatch = condClause.match(/(\w+)\s*=\s*['"]?([^'"]+)['"]?/);
        if (!condMatch) return "ERROR: invalid WHERE clause syntax.";
        const matchCol = condMatch[1];
        const matchVal = condMatch[2];
        
        let beforeCount = 0;
        let afterCount = 0;
        
        if (tableName === "users") {
            beforeCount = state.users.length;
            state.users = state.users.filter(u => String(u[matchCol]) !== matchVal);
            afterCount = state.users.length;
            state.saveState();
        } else if (tableName === "assignments") {
            beforeCount = state.assignments.length;
            state.assignments = state.assignments.filter(a => String(a[matchCol]) !== matchVal);
            afterCount = state.assignments.length;
            state.saveState();
        } else if (tableName === "materials") {
            beforeCount = state.materials.length;
            state.materials = state.materials.filter(m => String(m[matchCol]) !== matchVal);
            afterCount = state.materials.length;
            state.saveState();
        } else if (tableName === "leaves") {
            beforeCount = state.leaves.length;
            state.leaves = state.leaves.filter(l => String(l[matchCol]) !== matchVal);
            afterCount = state.leaves.length;
            state.saveState();
        }
        
        return `DELETE ${beforeCount - afterCount}\nQuery completed successfully.`;
    }

    if (command === "INSERT") {
        return "INSERT 0 1\nQuery completed successfully. (Direct record manipulation is supported via the visual table editor below).";
    }
    
    return `ERROR: unsupported Postgres command "${command}". Supported: SELECT, UPDATE, DELETE.`;
};

window.renderAdminDatabase = function() {
    if (!window.selectedPostgresTable) window.selectedPostgresTable = "users";

    const validTables = ["users", "timetables", "assignments", "materials", "leaves"];
    const tableOptionsHTML = validTables.map(t => `<option value="${t}" ${t === window.selectedPostgresTable ? 'selected' : ''}>schema: ${t}</option>`).join("");

    let tableRowsHTML = "";
    let tableHeadersHTML = "";

    let rawRows = [];
    if (window.selectedPostgresTable === "users") rawRows = state.users;
    else if (window.selectedPostgresTable === "assignments") rawRows = state.assignments;
    else if (window.selectedPostgresTable === "materials") rawRows = state.materials;
    else if (window.selectedPostgresTable === "leaves") rawRows = state.leaves;
    else if (window.selectedPostgresTable === "timetables") {
        Object.keys(state.timetables).forEach(div => {
            Object.keys(state.timetables[div]).forEach(day => {
                state.timetables[div][day].forEach(slot => {
                    rawRows.push({ division: div, day: day, slot: slot.slot, subject: slot.subject, teacher: slot.teacher, room: slot.room, status: slot.status });
                });
            });
        });
    }

    if (rawRows.length > 0) {
        const cols = Object.keys(rawRows[0]).filter(k => typeof rawRows[0][k] !== 'object');
        tableHeadersHTML = cols.map(c => `<th>${c}</th>`).join("") + "<th>Actions</th>";
        
        rawRows.slice(0, 50).forEach((r, idx) => {
            const cells = cols.map(c => `<td>${r[c] !== undefined ? r[c] : ''}</td>`).join("");
            const keyCol = cols.includes("username") ? "username" : (cols.includes("id") ? "id" : cols[0]);
            const keyVal = r[keyCol];
            tableRowsHTML += `
                <tr>
                    ${cells}
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="editPostgresRowPrompt('${window.selectedPostgresTable}', '${keyCol}', '${keyVal}')" style="padding: 2px 6px; font-size: 10px;">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deletePostgresRowPrompt('${window.selectedPostgresTable}', '${keyCol}', '${keyVal}')" style="padding: 2px 6px; font-size: 10px;">Delete</button>
                    </td>
                </tr>
            `;
        });
    }

    dynamicContentArea.innerHTML = `
        <div class="glass-card mb-16" style="background: rgba(15,23,42,0.9); border: 1.5px solid var(--accent); padding: 24px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <span style="font-size: 24px; color: var(--accent);"><i class="fa-solid fa-terminal"></i></span>
                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #10b981;">PostgreSQL Command Terminal</h3>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
                Direct client interface to B.Com PostgreSQL schema. Supports <code>SELECT</code>, <code>UPDATE</code>, and <code>DELETE</code>.
            </p>
            <div id="postgres-history" style="background: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 12px; height: 180px; overflow-y: auto; font-family: monospace; font-size: 12px; color: #10b981; margin-bottom: 12px; white-space: pre-wrap;">postgres=# -- Connected to PostgreSQL 16.2 database (tcc_nep_db)
postgres=# SELECT * FROM users WHERE role = 'admin';
username | password | role | name | email | phone | department | office
admin | okokokok | admin | Admin Principal | daveneel1405@gmail.com | +91 99999 88888 | Administration | Building A, Room 101
(1 row)</div>
            <form id="postgres-query-form" style="display: flex; gap: 8px;">
                <span style="font-family: monospace; font-size: 13px; color: #10b981; align-self: center;">postgres=#</span>
                <input type="text" id="postgres-query-input" class="form-control" placeholder="SELECT * FROM users WHERE division = 'A';" style="background: #020617; color: #10b981; font-family: monospace; border: 1px solid #334155; padding-left: 12px; flex-grow: 1;" autocomplete="off" required>
                <button type="submit" class="btn btn-primary" style="background: #10b981; border-color: #10b981; color: #020617; font-weight: bold; width: 100px;">Execute</button>
            </form>
        </div>

        <div class="glass-card">
            <div class="card-header-flex mb-16">
                <div>
                    <h3 class="card-title">PostgreSQL Tables Explorer (GUI Manager)</h3>
                    <p style="font-size: 12px; color: var(--text-muted);">Visual table browser with direct row replace/edit/delete authority.</p>
                </div>
                <select id="postgres-table-select" class="form-control" style="width: 220px; padding-left: 16px;">
                    ${tableOptionsHTML}
                </select>
            </div>
            
            <div class="table-responsive" style="max-height: 350px; overflow-y: auto;">
                <table class="custom-table" style="font-size: 11.5px;">
                    <thead>
                        <tr>
                            ${tableHeadersHTML}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById("postgres-table-select").addEventListener("change", (e) => {
        window.selectedPostgresTable = e.target.value;
        renderAdminDatabase();
    });

    document.getElementById("postgres-query-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("postgres-query-input");
        const query = input.value.trim();
        if (!query) return;

        const terminal = document.getElementById("postgres-history");
        const output = executeMockPostgresSQL(query);

        terminal.textContent += `\n\npostgres=# ${query}\n${output}`;
        terminal.scrollTop = terminal.scrollHeight;
        input.value = "";

        setTimeout(() => {
            renderAdminDatabase();
        }, 300);
    });
};

window.editPostgresRowPrompt = function(table, keyCol, keyVal) {
    let rows = [];
    if (table === "users") rows = state.users;
    else if (table === "assignments") rows = state.assignments;
    else if (table === "materials") rows = state.materials;
    else if (table === "leaves") rows = state.leaves;

    const row = rows.find(r => String(r[keyCol]) === keyVal);
    if (!row) {
        alert("Row not found.");
        return;
    }

    const field = prompt(`Enter Column Name to modify in ${table}:`, Object.keys(row)[1]);
    if (field === null) return;
    if (row[field] === undefined) {
        alert(`Column "${field}" does not exist in schema.`);
        return;
    }

    const val = prompt(`Enter New Value for Column "${field}":`, row[field]);
    if (val === null) return;

    row[field] = isNaN(Number(val)) ? val : Number(val);
    state.saveState();
    alert("Record updated successfully!");
    renderAdminDatabase();
};

window.deletePostgresRowPrompt = function(table, keyCol, keyVal) {
    if (!confirm(`Are you sure you want to delete row from table ${table} where ${keyCol} = '${keyVal}'?`)) {
        return;
    }

    if (table === "users") {
        state.users = state.users.filter(u => String(u[keyCol]) !== keyVal);
    } else if (table === "assignments") {
        state.assignments = state.assignments.filter(a => String(a[keyCol]) !== keyVal);
    } else if (table === "materials") {
        state.materials = state.materials.filter(m => String(m[keyCol]) !== keyVal);
    } else if (table === "leaves") {
        state.leaves = state.leaves.filter(l => String(l[keyCol]) !== keyVal);
    }

    state.saveState();
    alert("Record deleted successfully!");
    renderAdminDatabase();
};
