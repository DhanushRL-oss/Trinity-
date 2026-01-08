const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Data storage files
const usersFile = path.join(__dirname, 'users.json');
const roadsFile = path.join(__dirname, 'roadmaps.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data files
function initializeDataFiles() {
    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, JSON.stringify({}, null, 2));
    }
    if (!fs.existsSync(roadsFile)) {
        fs.writeFileSync(roadsFile, JSON.stringify({}, null, 2));
    }
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

// Middleware to verify JWT
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
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running' });
});

// Authentication Endpoints
app.post('/api/auth/signup', (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        // Validation
        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'Email, password, and confirmation are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const users = readUsers();

        if (users[email]) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const userId = Date.now().toString();
        users[email] = {
            userId,
            email,
            password, // TODO: Hash this with bcrypt in production
            createdAt: new Date().toISOString()
        };

        writeUsers(users);

        const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ 
            token, 
            user: { userId, email },
            message: 'Account created successfully'
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
});

app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const users = readUsers();
        const user = users[email];

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.userId, email }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ 
            token, 
            user: { userId: user.userId, email },
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Roadmap endpoints
app.post('/api/roadmaps', verifyToken, (req, res) => {
    try {
        const { career, skills, recommendations } = req.body;

        if (!career || !skills) {
            return res.status(400).json({ error: 'Career and skills are required' });
        }

        const roadmaps = readRoadmaps();
        const userId = req.userId;

        if (!roadmaps[userId]) {
            roadmaps[userId] = [];
        }

        const roadmap = {
            id: Date.now().toString(),
            career,
            skills,
            recommendations,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        roadmaps[userId].push(roadmap);
        writeRoadmaps(roadmaps);

        res.json({ 
            message: 'Roadmap saved successfully',
            roadmap 
        });
    } catch (error) {
        console.error('Save roadmap error:', error);
        res.status(500).json({ error: 'Failed to save roadmap' });
    }
});

app.get('/api/roadmaps', verifyToken, (req, res) => {
    try {
        const roadmaps = readRoadmaps();
        const userId = req.userId;
        const userRoadmaps = roadmaps[userId] || [];

        res.json({ 
            roadmaps: userRoadmaps,
            total: userRoadmaps.length
        });
    } catch (error) {
        console.error('Fetch roadmaps error:', error);
        res.status(500).json({ error: 'Failed to fetch roadmaps' });
    }
});

app.get('/api/roadmaps/:id', verifyToken, (req, res) => {
    try {
        const roadmaps = readRoadmaps();
        const userId = req.userId;
        const userRoadmaps = roadmaps[userId] || [];
        const roadmap = userRoadmaps.find(r => r.id === req.params.id);

        if (!roadmap) {
            return res.status(404).json({ error: 'Roadmap not found' });
        }

        res.json(roadmap);
    } catch (error) {
        console.error('Fetch roadmap error:', error);
        res.status(500).json({ error: 'Failed to fetch roadmap' });
    }
});

app.delete('/api/roadmaps/:id', verifyToken, (req, res) => {
    try {
        const roadmaps = readRoadmaps();
        const userId = req.userId;

        if (!roadmaps[userId]) {
            return res.status(404).json({ error: 'No roadmaps found' });
        }

        roadmaps[userId] = roadmaps[userId].filter(r => r.id !== req.params.id);
        writeRoadmaps(roadmaps);

        res.json({ message: 'Roadmap deleted successfully' });
    } catch (error) {
        console.error('Delete roadmap error:', error);
        res.status(500).json({ error: 'Failed to delete roadmap' });
    }
});

// Generate recommendations endpoint
app.post('/api/generate-recommendations', async (req, res) => {
    try {
        const { career, skills } = req.body;

        if (!career || !skills || skills.length === 0) {
            return res.status(400).json({ error: 'Career and skills are required' });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ 
                error: 'OpenAI API key not configured',
                useStatic: true
            });
        }

        const prompt = `You are a career counselor. A person is targeting the career of "${career}" and has these skills: ${skills.join(', ')}. 
                
Provide ONLY a valid JSON response with this exact structure (no markdown, no extra text, ONLY JSON):
{
  "missingSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "nextSteps": ["step1", "step2", "step3"],
  "resources": [
    {"skill": "skillname", "resource": "resource type", "link": "https://example.com"},
    {"skill": "skillname", "resource": "resource type", "link": "https://example.com"}
  ]
}

Make recommendations specific, practical, and varied. Focus on the missing skills and ${career} career path.`;

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
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            console.error('OpenAI API Error:', response.status, response.statusText);
            return res.status(500).json({ 
                error: 'Failed to generate recommendations',
                useStatic: true
            });
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const recommendations = JSON.parse(jsonMatch[0]);
            return res.json(recommendations);
        }

        return res.status(500).json({ 
            error: 'Invalid response format from AI',
            useStatic: true
        });

    } catch (error) {
        console.error('AI generation error:', error.message);
        return res.status(500).json({ 
            error: 'Server error while generating recommendations',
            useStatic: true
        });
    }
});

// Start server
initializeDataFiles();

const server = app.listen(PORT, () => {
    console.log(`\n✅ Backend server is running on http://localhost:${PORT}`);
    console.log(`\n📝 Available API Endpoints:`);
    console.log(`   POST   /api/auth/signup`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/roadmaps (requires auth)`);
    console.log(`   POST   /api/roadmaps (requires auth)`);
    console.log(`   GET    /api/roadmaps/:id (requires auth)`);
    console.log(`   DELETE /api/roadmaps/:id (requires auth)`);
    console.log(`   POST   /api/generate-recommendations`);
    console.log(`   GET    /api/health`);
    console.log(`\n⚠️  Make sure to configure .env file with OPENAI_API_KEY and JWT_SECRET\n`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Try changing PORT in .env`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});
