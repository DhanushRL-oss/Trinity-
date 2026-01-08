# Skill Gap Analyzer - Frontend

A modern React frontend for the Skill Gap Analyzer backend. This application helps users identify critical skills they need to learn based on their target career and current skill set.

## Features

✨ **Interactive Skill Roadmap Generator**
- Input target career and current skills
- Get AI-powered personalized learning roadmap
- View detailed information for each skill
- Responsive, modern UI with dark theme

## Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the FrontEnd directory:
```bash
cd c:\Trinity\FrontEnd
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Running

**Development Mode:**
```bash
npm run dev
```

**Build for Production:**
```bash
npm run build
```

**Preview Production Build:**
```bash
npm run preview
```

## Configuration

The frontend expects the backend server to be running on `http://localhost:5000`. 

If your backend runs on a different port, update the `vite.config.js` proxy configuration.

## Project Structure

```
src/
├── components/
│   ├── SkillForm.jsx         # Form for career and skills input
│   ├── RoadmapDisplay.jsx    # Displays the learning roadmap
│   └── SkillCard.jsx         # Individual skill card component
├── styles/
│   ├── SkillForm.css
│   ├── RoadmapDisplay.css
│   └── SkillCard.css
├── App.jsx                   # Main app component
├── App.css
├── main.jsx                  # Entry point
├── index.css                 # Global styles
└── vite.config.js           # Vite configuration

index.html                    # HTML template
package.json                  # Dependencies
```

## How It Works

1. User enters their target career and current skills
2. Frontend sends request to backend API
3. Backend uses OpenAI to generate a personalized learning roadmap
4. Roadmap is displayed with expandable skill cards showing:
   - Skill difficulty
   - Estimated learning time
   - Learning type (Course, Project-based, etc.)
   - Resources and where to learn
   - Expected outcomes

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **CSS3** - Styling with modern features

## License

MIT
