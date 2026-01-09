const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET is configured
if (!JWT_SECRET || JWT_SECRET.length < 32) {
    console.error('❌ CRITICAL: JWT_SECRET must be set in .env file and be at least 32 characters long');
    process.exit(1);
}

// Data storage files
const usersFile = path.join(__dirname, 'users.json');
const roadsFile = path.join(__dirname, 'roadmaps.json');

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Initialize data files
function initializeDataFiles() {
    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, JSON.stringify({}, null, 2));
    }
    if (!fs.existsSync(roadsFile)) {
        fs.writeFileSync(roadsFile, JSON.stringify({}, null, 2));
    }
}

// Extract skills from text
function extractSkillsFromText(text) {
    const SKILL_LIST = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'React', 'Vue.js', 'Angular',
        'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel', 'PHP',
        'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
        'AWS', 'Google Cloud', 'Azure', 'Git', 'GitHub', 'GitLab', 'REST API', 'GraphQL',
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP',
        'Data Science', 'Data Analysis', 'Tableau', 'Power BI', 'Excel', 'R', 'MATLAB',
        'DevOps', 'CI/CD', 'Jenkins', 'Linux', 'Windows', 'Android', 'iOS',
        'React Native', 'Flutter', 'Swift', 'Kotlin', 'Golang', 'Rust', 'Ruby', 'Perl',
        'Cybersecurity', 'Network Security', 'Penetration Testing', 'Ethical Hacking',
        'VLSI', 'Embedded Systems', 'Arduino', 'Raspberry Pi', 'IoT', 'FPGA', 'Verilog',
        'CAD', 'SolidWorks', 'AutoCAD', 'ANSYS', 'Power Systems',
        'Agile', 'Scrum', 'Kanban', 'Jira', 'Project Management', 'Leadership'
    ];
    
    const foundSkills = new Set();
    const lowerText = text.toLowerCase();
    
    SKILL_LIST.forEach(skill => {
        if (lowerText.includes(skill.toLowerCase())) {
            foundSkills.add(skill);
        }
    });
    
    return Array.from(foundSkills);
}

// Extract career from text
function extractCareerField(text) {
    const CAREER_KEYWORDS = {
        'Full Stack Developer': ['full stack', 'fullstack'],
        'Frontend Developer': ['frontend', 'front-end'],
        'Backend Developer': ['backend', 'back-end'],
        'Data Scientist': ['data science', 'data scientist'],
        'DevOps Engineer': ['devops', 'dev ops'],
        'Mobile Developer': ['mobile developer'],
        'Cybersecurity Engineer': ['cybersecurity', 'security'],
        'AI Engineer': ['ai engineer', 'ai/ml'],
        'QA Engineer': ['qa engineer', 'quality assurance']
    };
    
    const lowerText = text.toLowerCase();
    for (const [career, keywords] of Object.entries(CAREER_KEYWORDS)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
            return career;
        }
    }
    return null;
}

// Career skill requirements mapping
const CAREER_SKILLS = {
    'Full Stack Developer': {
        essential: ['JavaScript', 'React', 'Node.js', 'SQL', 'REST API', 'HTML', 'CSS'],
        important: ['MongoDB', 'Express', 'Django', 'PostgreSQL', 'Docker', 'Git'],
        nice: ['TypeScript', 'GraphQL', 'Redis', 'AWS']
    },
    'Frontend Developer': {
        essential: ['JavaScript', 'React', 'HTML', 'CSS', 'REST API'],
        important: ['Vue.js', 'TypeScript', 'Git', 'Responsive Design'],
        nice: ['Angular', 'GraphQL', 'Testing', 'DevTools']
    },
    'Backend Developer': {
        essential: ['Node.js', 'Python', 'SQL', 'REST API', 'Database Design'],
        important: ['Express', 'Django', 'PostgreSQL', 'MongoDB', 'Git'],
        nice: ['GraphQL', 'Docker', 'Microservices', 'AWS']
    },
    'Data Scientist': {
        essential: ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'Statistics'],
        important: ['TensorFlow', 'Scikit-learn', 'Pandas', 'Tableau', 'R'],
        nice: ['Deep Learning', 'NLP', 'Big Data', 'Spark']
    },
    'DevOps Engineer': {
        essential: ['Docker', 'Kubernetes', 'Linux', 'CI/CD', 'AWS'],
        important: ['Jenkins', 'Git', 'Python', 'Terraform', 'Monitoring'],
        nice: ['Google Cloud', 'Azure', 'Ansible', 'Security']
    },
    'Mobile Developer': {
        essential: ['React Native', 'Swift', 'Kotlin', 'Android', 'iOS'],
        important: ['Flutter', 'JavaScript', 'REST API', 'Git', 'SQLite'],
        nice: ['Firebase', 'GraphQL', 'Performance', 'Security']
    },
    'AI Engineer': {
        essential: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'Data Science'],
        important: ['PyTorch', 'NLP', 'Computer Vision', 'Statistics', 'Mathematics'],
        nice: ['LLMs', 'Reinforcement Learning', 'Model Optimization', 'Research']
    },
    'Cybersecurity Engineer': {
        essential: ['Network Security', 'Linux', 'Cryptography', 'Ethical Hacking', 'Risk Analysis'],
        important: ['Penetration Testing', 'Firewalls', 'Intrusion Detection', 'Python'],
        nice: ['SIEM', 'Cloud Security', 'Malware Analysis', 'Compliance']
    },
    'QA Engineer': {
        essential: ['Testing', 'Test Automation', 'SQL', 'REST API', 'Bug Tracking'],
        important: ['Selenium', 'Python', 'JavaScript', 'Git', 'Performance Testing'],
        nice: ['CI/CD', 'Security Testing', 'Load Testing', 'Analytics']
    }
};

// Calculate skill grading for a career
function calculateSkillGradings(userSkills, targetCareer) {
    const careerRequirements = CAREER_SKILLS[targetCareer] || {
        essential: [],
        important: [],
        nice: []
    };
    
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    
    const getSkillStatus = (skillList) => {
        const status = {};
        skillList.forEach(skill => {
            const hasSkill = userSkillsLower.some(us => 
                us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us)
            );
            status[skill] = hasSkill;
        });
        return status;
    };
    
    const essentialStatus = getSkillStatus(careerRequirements.essential);
    const importantStatus = getSkillStatus(careerRequirements.important);
    const niceStatus = getSkillStatus(careerRequirements.nice);
    
    const essentialCount = Object.values(essentialStatus).filter(v => v).length;
    const importantCount = Object.values(importantStatus).filter(v => v).length;
    const niceCount = Object.values(niceStatus).filter(v => v).length;
    
    const essentialScore = careerRequirements.essential.length > 0 
        ? Math.round((essentialCount / careerRequirements.essential.length) * 100)
        : 0;
    const importantScore = careerRequirements.important.length > 0
        ? Math.round((importantCount / careerRequirements.important.length) * 100)
        : 0;
    const niceScore = careerRequirements.nice.length > 0
        ? Math.round((niceCount / careerRequirements.nice.length) * 100)
        : 0;
    
    // Calculate overall grade (A-F)
    const overallPercent = (essentialScore * 0.5 + importantScore * 0.3 + niceScore * 0.2);
    let grade = 'F';
    if (overallPercent >= 90) grade = 'A';
    else if (overallPercent >= 80) grade = 'B';
    else if (overallPercent >= 70) grade = 'C';
    else if (overallPercent >= 60) grade = 'D';
    
    return {
        essentialSkills: {
            skills: careerRequirements.essential,
            status: essentialStatus,
            percentage: essentialScore,
            count: essentialCount
        },
        importantSkills: {
            skills: careerRequirements.important,
            status: importantStatus,
            percentage: importantScore,
            count: importantCount
        },
        niceToHaveSkills: {
            skills: careerRequirements.nice,
            status: niceStatus,
            percentage: niceScore,
            count: niceCount
        },
        overallGrade: grade,
        overallPercent: Math.round(overallPercent)
    };
}

// Helper functions
function readUsers() {
    try {
        return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    } catch {
        return {};
    }
}

function writeUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function readRoadmaps() {
    try {
        return JSON.parse(fs.readFileSync(roadsFile, 'utf8'));
    } catch {
        return {};
    }
}

function writeRoadmaps(roadmaps) {
    fs.writeFileSync(roadsFile, JSON.stringify(roadmaps, null, 2));
}

// Verify JWT
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.email = decoded.email;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running' });
});

// Auth endpoints
app.post('/api/auth/signup', (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const users = readUsers();
        if (users[email]) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const userId = Date.now().toString();
        users[email] = { userId, email, password, createdAt: new Date().toISOString() };
        writeUsers(users);

        const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: { userId, email } });
    } catch (error) {
        res.status(500).json({ error: 'Signup failed' });
    }
});

app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;

        const users = readUsers();
        const user = users[email];

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.userId, email }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: { userId: user.userId, email } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});


// Generate recommendations
app.post('/api/generate-recommendations', async (req, res) => {
    try {
        const { career, skills } = req.body;

        if (!career || !skills || skills.length === 0) {
            return res.status(400).json({ error: 'Career and skills required' });
        }

        // Get skill gradings
        const gradings = calculateSkillGradings(skills, career);

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        const prompt = `Career Counselor: A person targeting "${career}" with skills: ${skills.join(', ')}. 
Provide JSON: {
  "missingSkills": ["skill1", "skill2", "skill3"],
  "recommendations": ["rec1", "rec2"],
  "nextSteps": ["step1", "step2"]
}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 800
            })
        });

        if (!response.ok) {
            return res.status(500).json({ error: 'AI generation failed' });
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const recommendations = JSON.parse(jsonMatch[0]);
            return res.json({
                ...recommendations,
                gradings: gradings
            });
        }

        res.status(500).json({ error: 'Invalid response' });

    } catch (error) {
        res.status(500).json({ error: 'Generation error' });
    }
});

// Roadmap endpoints
app.post('/api/roadmaps', (req, res) => {
    try {
        const { career, skills, recommendations } = req.body;
        const roadmaps = readRoadmaps();
        const userId = 'default'; // Default user since auth is removed

        if (!roadmaps[userId]) roadmaps[userId] = [];

        const roadmap = {
            id: Date.now().toString(),
            career, skills, recommendations,
            createdAt: new Date().toISOString()
        };

        roadmaps[userId].push(roadmap);
        writeRoadmaps(roadmaps);

        res.json({ message: 'Saved', roadmap });
    } catch (error) {
        res.status(500).json({ error: 'Save failed' });
    }
});

app.get('/api/roadmaps', (req, res) => {
    try {
        const roadmaps = readRoadmaps();
        const userRoadmaps = roadmaps['default'] || [];
        res.json({ roadmaps: userRoadmaps, total: userRoadmaps.length });
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
});

app.get('/api/roadmaps/:id', (req, res) => {
    try {
        const roadmaps = readRoadmaps();
        const roadmap = (roadmaps['default'] || []).find(r => r.id === req.params.id);
        if (!roadmap) return res.status(404).json({ error: 'Not found' });
        res.json(roadmap);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
});

app.delete('/api/roadmaps/:id', (req, res) => {
    try {
        const roadmaps = readRoadmaps();
        if (roadmaps['default']) {
            roadmaps['default'] = roadmaps['default'].filter(r => r.id !== req.params.id);
            writeRoadmaps(roadmaps);
        }
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Start server
initializeDataFiles();
app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
    console.log(`📄 Resume analysis and AI recommendations enabled!`);
});
