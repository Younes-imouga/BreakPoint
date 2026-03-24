BreakPoint
Program Description:
BreakPoint is a web-based security-testing lab platform that allows users to interact with intentionally vulnerable simulations (XSS, CSRF, logic flaws, etc.) 
to discover Tokens and submit them via a secure dashboard. The platform aims to provide a safe, educational, 
and challenging environment for participants to practice web security skills, while admins manage labs and user activity.

Objectives
Provide a safe and controlled environment for practicing web security.
Encourage problem-solving and analysis by hiding vulnerability types.
Enable progress tracking, scoring, and achievement recognition.
Allow admins to manage labs, users, and platform security efficiently.

Features
1. Simulated Labs
Labs are intentionally vulnerable and coded by admins.
Each lab is sandboxed to prevent interference with the main platform.
Labs have embedded Tokens for participants to discover.
Difficulty level and metadata (name, description, points) are stored in the backend.
2. Flag Discovery & Submission
Participants submit Tokens through a secure dashboard.
Tokens are verified server-side to prevent tampering.
Points are awarded based on lab completion.


3. User Roles and Responsibilities
Participants / Learners
Register, login, and manage their account.
Access labs via /simulation/{id}.
Interact with labs to discover Tokens.
Track progress, points, completed labs, and optionally badges/leaderboard.
Admins / Developers
Secure login with access to admin dashboard.
Upload and register new labs (lab code + metadata: name, description, points, route/filename) and edit or delete existing labs.
Monitor participants, track flag submissions, and manage scores.
Maintain platform security and ensure lab sandboxing.
4. Progress Tracking & Gamification
Dashboard shows completed labs, points, and achievements.
Leaderboards and badges motivate participants.
Bonus: history of labs completed, attempts, and hints used.

Deliverables
Application
Fully functional web application with user-friendly interface.
User and Technical Documentation
User guide explaining platform usage.
Technical documentation for development, maintenance, and future updates.
Source Code
Complete, well-structured, and commented source code.
Final Report on Functionalities
Detailed report summarizing implemented functionalities, their purpose, and how they meet project requirements.
 Target Audience
Students and beginners interested in web security.
Security enthusiasts wanting practical experience.
Admins or instructors managing labs and participant progress.

Technical Details
Frontend: Responsive and intuitive interface (Next Js with a css framework like Tailwind).
Backend: Secure and scalable architecture for managing users, labs, Tokens, and scores (Express JS or Nest JS).
Database: Structured storage for users, labs, Tokens, and scores (mongoDB).
Security: Strict separation between sandboxed labs and the secure dashboard.

Docker Quick Start
1. From the project root, run: `docker compose up --build`
2. Services:
- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

Notes
- `frontend` depends on `backend`.
- `backend` depends on `mongo` (health-checked).
- To stop all services: `docker compose down`
- To stop and remove DB volume too: `docker compose down -v`