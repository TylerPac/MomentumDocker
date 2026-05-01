pipeline {
    agent any

    tools {
        maven 'Maven 3.9'
    }

    stages {
        stage('Build Spring Boot Backend') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                echo "🚀 Building and deploying Momentum (backend + frontend) via Docker Compose..."
                withCredentials([
                        string(credentialsId: 'MOMENTUM_DB_NAME', variable: 'MOMENTUM_DB_NAME'),
                        string(credentialsId: 'MOMENTUM_DB_USER', variable: 'MOMENTUM_DB_USER'),
                        string(credentialsId: 'MOMENTUM_DB_PASSWORD', variable: 'MOMENTUM_DB_PASSWORD'),
                        string(credentialsId: 'MOMENTUM_JWT_SECRET', variable: 'MOMENTUM_JWT_SECRET')
                ]) {
                    sh 'docker compose down --remove-orphans || true'
                    sh 'docker compose build --pull'
                    sh 'docker compose up -d'
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful."
        }
        failure {
            echo "❌ Deployment failed."
        }
    }
}
