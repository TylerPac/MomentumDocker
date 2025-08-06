# Momentum

A comprehensive fitness tracking and analytics web application built with Java Servlets, JSP, Hibernate ORM, and MySQL. This project demonstrates full-stack development, containerization, and CI/CD automation using Docker and Jenkins.

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
- **Backend:** Java Servlets, JSP, Hibernate ORM
- **Frontend:** HTML, CSS, JavaScript (JSP templates)
- **Database:** MySQL (dedicated container)
- **Build Tool:** Maven
- **Containerization:** Docker, Docker Compose
- **CI/CD:** Jenkins
- **Server:** Apache Tomcat

## Architecture
- Multi-container setup: application and database run in isolated Docker containers
- Database connection managed via Hibernate configuration
- Application server runs on Tomcat, exposed on port 8082
- Jenkins pipeline automates build, test, and deployment steps

## Getting Started
1. **Clone the repository:**
   ```bash
   git clone https://github.com/TylerPac/MomentumDocker.git
   ```
2. **Build and run with Docker Compose:**
   ```bash
   docker compose up -d --build
   ```
3. **Access the app:**
   - Open [http://localhost:8082](http://localhost:8082) in your browser

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

Test Login and Password
Login
```bash
   admin
```
Password
```bash
   admin
```
---

*Created by Tyler Pac. For more projects, visit my portfolio!*
## Portfolio
- [https://www.tylerpac.dev/](https://www.tylerpac.dev/)