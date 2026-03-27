# BreakPoint Project Initialization Commands

## Project Overview
BreakPoint is a web-based security-testing lab platform with a Next.js frontend, Express/Nest.js backend, and MongoDB database.

---

## Backend Initialization (Nest.js)

```powershell
# Navigate to parent directory
cd C:\Users\LENOVO\Desktop\BreakPoint

# Create Nest.js project
npm install -g @nestjs/cli
nest new backend

# Navigate to backend
cd backend

# Install dependencies
npm install @nestjs/mongoose mongoose bcrypt jsonwebtoken @nestjs/jwt passport passport-jwt
npm install --save-dev @types/bcrypt @types/passport-jwt

# Create .env file
echo "PORT=3001" > .env
echo "MONGODB_URI=mongodb://localhost:27017/breakpoint" >> .env
echo "JWT_SECRET=your_jwt_secret_key_here" >> .env
echo "NODE_ENV=development" >> .env

# Generate modules/controllers/services
nest generate module modules/users
nest generate controller modules/users
nest generate service modules/users

nest generate module modules/labs
nest generate controller modules/labs
nest generate service modules/labs

nest generate module modules/auth
nest generate controller modules/auth
nest generate service modules/auth
```

### Backend package.json scripts (auto-generated):
```json
"scripts": {
  "start": "nest start",
  "dev": "nest start --watch",
  "debug": "nest start --debug --watch",
  "prod": "node dist/main",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage"
}
```

---

## Frontend Initialization (Next.js with Tailwind CSS)

```powershell
# Navigate to parent directory
cd ..

# Create Next.js project
npx create-next-app@latest 

# Navigate to frontend
cd frontend

# Install additional dependencies
npm install axios zustand

# Create project structure
mkdir app\(auth)
mkdir app\(dashboard)
mkdir app\(simulation)
mkdir components
mkdir lib
mkdir public\images
mkdir styles

# Return to root
cd ..
```

---

## Database Setup

```powershell
# Install MongoDB Community Edition or use Docker
# Option 1: Using Docker (recommended)
docker run -d -p 27017:27017 --name breakpoint-db mongo:latest

# Option 2: Using local MongoDB installation
# Download from: https://www.mongodb.com/try/download/community
# Follow installation instructions
```

---

## Root Project Initialization

```powershell
# Initialize root directory as a git repository
git init

# Create root .gitignore (use the provided .gitignore file)
# See .gitignore file in the root directory

# Create root package.json for monorepo management (optional)
npm init -y

# Install root dev dependencies
npm install --save-dev concurrently

# Add scripts to root package.json:
# "scripts": {
#   "dev": "concurrently \"cd frontend && npm run dev\" \"cd backend && npm run dev\"",
#   "install-all": "npm install && cd frontend && npm install && cd ../backend && npm install"
# }
```

---

## Complete Setup Sequence

```powershell
# 1. Start from project root
cd C:\Users\LENOVO\Desktop\BreakPoint

# 2. Initialize git
git init

# 3. Create .gitignore
# (See generated .gitignore file)

# 4. Create backend with Nest.js
npm install -g @nestjs/cli
nest new backend
cd backend
npm install @nestjs/mongoose mongoose bcrypt jsonwebtoken @nestjs/jwt passport passport-jwt
npm install --save-dev @types/bcrypt @types/passport-jwt
nest generate module modules/users
nest generate controller modules/users
nest generate service modules/users
nest generate module modules/labs
nest generate controller modules/labs
nest generate service modules/labs
nest generate module modules/auth
nest generate controller modules/auth
nest generate service modules/auth
cd ..

# 5. Create frontend with Next.js
npx create-next-app@latest frontend --typescript --tailwind --eslint
cd frontend
npm install axios zustand
cd ..

# 6. Setup root package.json for concurrent development
npm init -y
npm install --save-dev concurrently

# 7. Start MongoDB
docker run -d -p 27017:27017 --name breakpoint-db mongo:latest

# 8. Run development servers
npm run dev
```

---

## Environment Variables

### Backend (.env)
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/breakpoint
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
ADMIN_PASSWORD=admin_password_here
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Verification Checklist

- [ ] Backend running on http://localhost:3001
- [ ] Frontend running on http://localhost:3000
- [ ] MongoDB running on localhost:27017
- [ ] Backend can connect to MongoDB
- [ ] Frontend can make API calls to backend
- [ ] .gitignore properly configured
- [ ] Git repository initialized
- [ ] All environment variables configured

