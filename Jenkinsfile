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
                    error('❌ Tests failed. Aborting pipeline.')
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker-compose build'
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'Development'
            }
            steps {
                echo 'Deploying to staging...'
                bat 'docker-compose down -v --remove-orphans'
                bat 'docker-compose build --no-cache'
                bat 'docker-compose up -d'
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'master'
            }
            steps {
                echo 'Deploying to production...'
                bat 'docker tag momentum-app:latest momentum-app:rollback || echo "No image to rollback from"'
                bat 'docker-compose down -v --remove-orphans'
                bat 'docker-compose up -d --build'
            }
        }
    }

    post {
        success {
            echo '✅ Build & Deployment successful!'
        }
        failure {
            echo '❌ Build or Deployment failed.'
            script {
                if (env.BRANCH_NAME == 'master') {
                    echo '🔁 Rolling back production to last known good image...'
                    bat '''
                        docker-compose down
                        docker tag momentum-app:rollback momentum-app:latest
                        docker-compose up -d
                    '''
                }
            }
        }
    }
}
