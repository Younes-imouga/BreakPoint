# BreakPoint Technical Documentation

## Stack
- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript, Mongoose
- Database: MongoDB
- Containers: Docker Compose

## Repository Structure
- `frontend/`: Website UI for participants and admins
- `backend/`: API, auth, business logic, and persistence
- `design/`: Static design references
- `docs/`: Project documentation

## Core Modules
- Auth: login, register, JWT-based access
- Users: profile, leaderboard, user management
- Simulations: lab CRUD, filtering, metadata/components
- Attempts: start attempt, submit token, hint usage, give up
- Guards: JWT and role-based route protection

## Data Model Summary
- User: role, exp, total_score, badge, completed_simulations
- Simulation: name, slug, description, difficulty, score, minimum_exp, status, components, hints
- Attempt: user_id, simulation_id, attempts[], hints_used, success, final_score

## Frontend Pages
- Participant: dashboard, simulations, simulation detail, attempts, profile, leaderboard, documentation
- Admin: labs, users, submissions, progress, activity

## Key Behaviors
- Completed labs are unique and cannot be replayed for score.
- XP gating locks labs by `minimum_exp`.
- Leaderboard is participant-only.
- Admin edit form preloads full simulation details before saving updates.

## API Overview
- `POST /auth/login`, `POST /auth/register`
- `GET /users/me`, `GET /users/me/stats`, `GET /users/leaderboard/top`
- `GET /simulations`, `GET /simulations/:id`, `POST /simulations`, `PATCH /simulations/:id`, `DELETE /simulations/:id`
- `POST /simulations/:id/start`
- `POST /attempts/:id/submit`, `GET /attempts/:id/hints`, `POST /attempts/:id/give-up`

## Security Notes
- Route guards enforce auth and role checks.
- Token verification is server-side.
- Simulations run as controlled/sandboxed content in the UI.

## Local Run
- Backend: `cd backend && npm install && npm run start:dev`
- Frontend: `cd frontend && npm install && npm run dev`

## Docker Run
- Start: `docker compose up --build`
- Frontend: `http://localhost:3001`
- Backend: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`
