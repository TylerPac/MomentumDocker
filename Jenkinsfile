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
                // sh 'docker compose down -v --remove-orphans'  removes volume
                sh 'docker compose down --remove-orphans'
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
                // sh 'docker compose down -v --remove-orphans'  removes volume
                sh 'docker compose down --remove-orphans'
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
