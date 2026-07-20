pipeline {
    agent any

    stages {
        stage('Build and Test') {
            steps {
                echo "Building and testing Momentum branch: ${env.BRANCH_NAME}"

                // Build images for every branch to verify Docker build health.
                sh 'docker compose build --pull'

                // Run backend tests in a Maven container so feature branches validate code.
                sh 'docker run --rm -v "$PWD/backend:/app" -w /app maven:3.9-eclipse-temurin-21 mvn -q test'
            }
        }

        stage('Deploy Production') {
            when {
                branch 'master'
            }

            steps {
                echo "Deploying Momentum to production..."

                withCredentials([
                    string(credentialsId: 'MOMENTUM_DB_NAME', variable: 'MOMENTUM_DB_NAME'),
                    string(credentialsId: 'MOMENTUM_DB_USER', variable: 'MOMENTUM_DB_USER'),
                    string(credentialsId: 'MOMENTUM_DB_PASSWORD', variable: 'MOMENTUM_DB_PASSWORD'),
                    string(credentialsId: 'MOMENTUM_JWT_SECRET', variable: 'MOMENTUM_JWT_SECRET')
                ]) {
                    sh 'docker compose -p momentum-production down --remove-orphans || true'
                    sh 'docker compose -p momentum-production build --pull'
                    sh 'docker compose -p momentum-production up -d'
                }
            }
        }

        stage('Cleanup Branch Docker Artifacts') {
            when {
                not {
                    branch 'master'
                }
            }

            steps {
                echo "Cleaning up Docker artifacts from non-master branch build..."

                // Safe cleanup: only dangling images and stale build cache.
                sh 'docker image prune -f'
                sh 'docker builder prune -f --filter "until=24h"'
            }
        }
    }

    post {
        success {
            echo "Pipeline successful for branch: ${env.BRANCH_NAME}"
        }
        failure {
            echo "Pipeline failed for branch: ${env.BRANCH_NAME}"
        }
    }
}
