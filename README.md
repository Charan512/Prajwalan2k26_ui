# Prajwalan 2K26 - Frontend

React + Vite frontend application for the Prajwalan 2K26 event management system.

## Features

- **Admin Dashboard**: Manage teams, tasks, and leaderboard
- **Evaluator Portal**: Evaluate teams with domain-based filtering
- **Team Lead Dashboard**: View assigned tasks and team information
- **Professional VR Theme**: Modern UI with HoloBackground and cyber-glass aesthetics
- **Role-Based Access Control**: Secure authentication with JWT
- **Responsive Design**: Optimized for both desktop and mobile devices

## Tech Stack

- React 18
- Vite
- React Router v6
- Axios
- Context API for state management

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5001/api
```

For production, update the API URL to your backend server.

## Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable components (Navbar, HoloBackground, etc.)
├── context/         # React Context (Auth, Theme)
├── pages/           # Page components
│   ├── admin/       # Admin dashboard pages
│   ├── evaluator/   # Evaluator portal pages
│   └── teamlead/    # Team lead dashboard pages
├── services/        # API service layer
├── App.jsx          # Main app component with routing
└── main.jsx         # Application entry point
```

## User Roles

1. **Admin**: Full access to manage teams, tasks, and view leaderboard
2. **Evaluator**: Evaluate teams within assigned domain
3. **Team Lead**: View team information and assigned tasks

## Login Credentials (Development)

```
Admin:          srkraceofficial@gmail.com / prajwalan@2k26
Student Eval:   student.eval.1@prajwalan.com / eval123
Regular Eval:   evaluator.1@prajwalan.com / eval123
Team Lead:      team1@prajwalan.com / team123
```

## Key Features

### Admin Dashboard
- View all teams and their scores
- Manage tasks for each round
- Publish tasks to team leads
- Select teams for Flash Round
- View leaderboard

### Evaluator Portal
- Search teams by number
- View assigned domain teams
- Submit scores with feedback
- Weighted scoring (Student: 30%, Staff: 70%)

### Team Lead Dashboard
- View team information
- Access visible tasks for all rounds
- Track team members

## Theme

The application features a professional VR theme with:
- Custom HoloBackground component
- Cyber-glass aesthetic
- Orbitron and JetBrains Mono typography
- Dark/Light mode support

## License

Proprietary - SRKR ACE Prajwalan 2K26
