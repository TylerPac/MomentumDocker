pipeline {
    agent any
    
    tools {
        maven 'Maven 3.9'
    }
    
    parameters {
            booleanParam(name: 'RESET_DB', defaultValue: false, description: 'Wipe and reinitialize the MySQL database')
    }
    environment {
        DOCKER_COMPOSE_PATH = "${WORKSPACE}/docker-compose.yml"
        IMAGE_NAME = "momentum-app"

        // Used for docker compose env substitution + Spring datasource resolution
        MYSQL_HOST = "momentum-db"

        // Jenkins Credentials IDs
        MYSQL_ROOT_PASSWORD = credentials('MYSQL_ROOT_PASSWORD')
        MYSQL_DATABASE = credentials('MYSQL_DATABASE')
        MYSQL_USER = credentials('MYSQL_USER')
        MYSQL_PASSWORD = credentials('MYSQL_PASSWORD')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: env.BRANCH_NAME, url: 'https://github.com/TylerPac/MomentumDocker.git'
            }
        }

        stage('Build WAR') {
            steps {
                sh 'mvn clean package'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'mvn test'
            }
            post {
                unsuccessful {
                    error('Tests failed. Aborting pipeline.')
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker compose build'
            }
        }
        stage('Reset Database') {
        when{
            expression { params.RESET_DB }
        }
            steps {
                        echo '⚠️ Resetting MySQL volume...'
                sh 'docker compose down -v --remove-orphans'
            }
        }

        stage('Deploy to Development Branch') {
            when {
                branch 'Development'
            }
            steps {
                echo 'Deploying to staging...'
                // Stop any existing momentum container first
                sh 'docker stop momentum || true'
                sh 'docker rm momentum || true'
                sh 'docker compose down --remove-orphans || true'
                sh 'docker compose build --no-cache'
                sh 'docker compose up -d'
            }
        }

        stage('Deploy to Master Branch') {
            when {
                branch 'master'
            }
            steps {
                echo 'Deploying to production...'
                sh 'docker tag momentum-app:latest momentum-app:rollback || echo "No image to rollback from"'
                // Stop any existing momentum container first
                sh 'docker stop momentum || true'
                sh 'docker rm momentum || true'
                sh 'docker compose down --remove-orphans || true'
                sh 'docker compose up -d --build'
            }
        }
    }

    post {
        success {
            echo '✅ Build & Deployment successful!'
        }
        failure {
            echo 'Build or Deployment failed.'
            script {
                if (env.BRANCH_NAME == 'master') {
                    echo 'Rolling back production to last known good image...'
                    sh '''
                        docker compose down
                        docker tag momentum-app:rollback momentum-app:latest
                        docker compose up -d
                    '''
                }
            }
        }
    }
}
