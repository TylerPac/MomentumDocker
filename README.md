
<p align="center">
    <img src="frontend/public/MomentumLogo.png" alt="Momentum logo" width="500" />
</p>
<p align="center"><strong>Fitness tracking and analytics app.</strong></p>

## About Momentum
I built Momentum to solve a personal problem: I wanted a clean, easy way to log workouts and visualize trends over time without paying another subscription provider.


## Website
- [momentum.tylerpac.dev](https://momentum.tylerpac.dev/) 



## Features
- User authentication and account management
- Workout logging and history tracking
- Data analytics and progress visualization
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

## Architecture

Momentum is a containerized full-stack app with a React frontend, Spring Boot backend, and MySQL persistence layer.

### System Architecture

```mermaid
flowchart LR
    U[User Browser]

    subgraph RT[Production on VPS]
        FE[Frontend Container\nNginx + React Static Build]
        BE[Backend Container\nSpring Boot API + JWT Security]
        DB[(MySQL Container\nSame VPS Docker Network)]
    end

    U -->|HTTPS via Traefik| FE
    FE -->|/api proxy| BE
    BE -->|JPA/Hibernate| DB

    subgraph DEV[Local Development]
        VITE[Vite Dev Server]
        API[Backend Dev Profile :8085]
        DEVDB[(Local MySQL in Docker :3307)]
    end

    U -. hot reload .-> VITE
    VITE -. /api proxy .-> API
    API -. JDBC .-> DEVDB
```

### Database Relationship Diagram

```mermaid
erDiagram
    direction LR

    USERS {
        int user_id PK
        string username UK
        string password
        string unit_system
    }

    WORKOUT {
        int workout_id PK
        int user_id FK
        string workout_type
        string workout_name
        date workout_date
        float distance
        float time
        float weight
        int sets
        int reps
        string notes
    }

    USERS ||--o{ WORKOUT : owns
```

## Contact

**Let's Connect**

For collaboration, engineering opportunities, or project discussions, use the contact page:

- [Contact TylerPac Development](https://www.tylerpac.dev/contact)