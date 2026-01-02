# Momentum

Fitness tracking and analytics app.

This repo is in the middle of a migration from the original JSP/Servlet app to:
- `backend/` (Spring Boot REST API)
- `frontend/` (React + Vite)

## Features
- User authentication and account management
- Workout logging and history tracking
- Data analytics and progress visualization
- Responsive JSP-based UI
- RESTful endpoints for data operations
- Hibernate ORM for database management
- Separate MySQL database instance for isolation
- Containerized deployment with Docker
- Automated build and deployment pipeline with Jenkins

## Technology Stack
- **Backend:** Spring Boot (REST) + JPA
- **Frontend:** React + Vite
- **Database:** MySQL
- **Build Tool:** Maven
- **Containerization:** Docker, Docker Compose
- **CI/CD:** Jenkins

## Local development

### Option B: no Docker (recommended for local UI dev)

#### Prereqs
- Node.js + npm installed
- Java JDK installed

#### Backend (Spring Boot)
Run with the `dev` profile to use the homelab database on your LAN.

From the repo root:
```powershell
mvn -f .\backend\pom.xml spring-boot:run -Dspring-boot.run.profiles=dev
```

Required env vars (do not commit secrets):
```powershell
$env:MYSQL_USER = "..."
$env:MYSQL_PASSWORD = "..."
```

Defaults used by the `dev` profile:
- Host: `192.168.1.26`
- DB name: `homelabdatabase`

Optional overrides:
```powershell
$env:MOMENTUM_DEV_DB_HOST = "192.168.1.26"
$env:MOMENTUM_DEV_DB_NAME = "homelabdatabase"
```

Run tests:
```powershell
mvn -f .\backend\pom.xml test
```

Stop the backend: press `Ctrl+C` in the terminal running it.

#### Frontend (React + Vite)
From the repo root:
```powershell
cd .\frontend
npm install
npm run dev
```

Stop the frontend: press `Ctrl+C` in the terminal running it.

#### Frontend ↔ Backend connectivity
- Dev mode: Vite proxies `/api/*` to the backend.
- Default proxy target is `http://localhost:8085`.

Override if needed:
```powershell
$env:VITE_API_TARGET = "http://localhost:8085"
npm run dev
```

### Option A: Docker Compose (matches Jenkins/prod deployment)
From the repo root:
```powershell
docker compose up -d --build
```

Ports (current defaults):
- Frontend: `http://localhost:8082`
- Backend: `http://localhost:8085`
- MySQL: `localhost:3307`

## Getting Started
1. **Clone the repository:**
   ```bash
   git clone https://github.com/TylerPac/MomentumDocker.git
   ```
2. **Run locally:**
   - See “Local development” above

## Portfolio Value
This project showcases:
- End-to-end web application development
- Database design and ORM integration
- Container orchestration and automation
- Real-world CI/CD pipeline implementation
- Clean separation of environments and data

## Repository
- [GitHub: TylerPac/MomentumDocker](https://github.com/TylerPac/MomentumDocker)

## Live Demo
- [https://momentum.tylerpac.dev/](https://momentum.tylerpac.dev/)

---

*Created by Tyler Pac. For more projects, visit my portfolio!*
## Portfolio
- [https://www.tylerpac.dev/](https://www.tylerpac.dev/)