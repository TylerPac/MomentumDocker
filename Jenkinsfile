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
                sh 'mkdir -p logs'
            }
        }
        stage('Clean Logs') {
            steps {
                echo 'Cleaning old logs...'
                sh '''
                    if [ -d "logs" ]; then
                        rm -f logs/*.log*
                        rm -f logs/*.txt
                    fi
                '''
            }
        }
        stage('Build WAR') {
            steps {
                sh 'mvn clean package'
            }
        }

        /*
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
        */
        stage('Prepopulate Log Files') {
            steps {
                echo '📄 Creating placeholder log files to ensure container mount does not wipe logs...'
                script {
                            def now = new Date().format("yyyy-MM-dd")
                            def files = [
                                "catalina.${now}.log",
                                "host-manager.${now}.log",
                                "localhost.${now}.log",
                                "localhost_access_log.${now}.txt",
                                "manager.${now}.log",
                                "momentum-app.log"
                            ]
                            files.each { fname ->
                                sh "touch logs/${fname}"
                            }
                        }
            }
        }
        stage('Build Docker Image') {
            steps {
                sh 'docker-compose build --no-cache'
            }
        }

        stage('Deploy to Development Branch') {
            when {
                branch 'Development'
            }
            steps {
                echo '🚀 Deploying to Development (staging)...'
                sh 'docker-compose down -v --remove-orphans'
                sh 'docker-compose up -d'
            }
        }

        stage('Deploy to Master Branch') {
            when {
                branch 'master'
            }
            steps {
                echo '🚀 Deploying to Production...'
                sh 'docker-compose down -v --remove-orphans'
                sh 'docker-compose up -d'
            }
        }

        stage('Debug: List Logs') {
            steps {
                echo '🔍 Showing final log folder contents (for verification)...'
                sh 'ls -la logs/'
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
