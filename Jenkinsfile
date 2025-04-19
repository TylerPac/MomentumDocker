pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_PATH = "${WORKSPACE}/docker-compose.yml"
        IMAGE_NAME = "momentum-app"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: env.BRANCH_NAME, url: 'https://github.com/TylerPac/MomentumDocker.git'
            }
        }
        stage('Ensure Logs Folder') {
            steps {
                echo 'Ensuring logs directory exists...'
                bat 'if not exist logs mkdir logs'
            }
        }
        stage('Clean Logs') {
            steps {
                echo 'Cleaning old logs...'
                bat '''
                    if exist logs (
                        del /q logs\\*.log*
                        del /q logs\\*.txt
                    )
                '''
            }
        }
        stage('Build WAR') {
            steps {
                bat 'mvn clean package'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'mvn test'
            }
            post {
                unsuccessful {
                    error('❌ Unit tests failed. Skipping Docker build and deployment.')
                }
            }
        }
        stage('Prepopulate Log Files') {
            steps {
                echo '📄 Creating placeholder log files to ensure container mount does not wipe logs...'
                bat '''
                    echo. > logs\\momentum-app.log
                    echo. > logs\\catalina.2025-04-19.log
                    echo. > logs\\host-manager.2025-04-19.log
                    echo. > logs\\localhost.2025-04-19.log
                    echo. > logs\\localhost_access_log.2025-04-19.txt
                    echo. > logs\\manager.2025-04-19.log
                '''
            }
        }
        stage('Build Docker Image') {
            steps {
                bat 'docker-compose build --no-cache'
            }
        }

        stage('Deploy to Development Branch') {
            when {
                branch 'Development'
            }
            steps {
                echo '🚀 Deploying to Development (staging)...'
                bat 'docker-compose down -v --remove-orphans'
                bat 'docker-compose up -d'
            }
        }

        stage('Deploy to Master Branch') {
            when {
                branch 'master'
            }
            steps {
                echo '🚀 Deploying to Production...'
                bat 'docker-compose down -v --remove-orphans'
                bat 'docker-compose up -d'
            }
        }

        stage('Debug: List Logs') {
            steps {
                echo '🔍 Showing final log folder contents (for verification)...'
                bat 'dir logs'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '🛑 Pipeline failed — no deployment performed.'
        }
    }
}
