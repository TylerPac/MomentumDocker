pipeline {
    agent any

    tools {
        maven 'Maven 3.9'
    }

    parameters {
        booleanParam(name: 'RESET_DB', defaultValue: false, description: 'Wipe and reinitialize the MySQL database')
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
                echo "🚀 Building and starting all services via Docker Compose..."
                withCredentials([
                        string(credentialsId: 'MYSQL_ROOT_PASSWORD', variable: 'MYSQL_ROOT_PASSWORD'),
                        string(credentialsId: 'MYSQL_DATABASE', variable: 'MYSQL_DATABASE'),
                        string(credentialsId: 'MYSQL_USER', variable: 'MYSQL_USER'),
                        string(credentialsId: 'MYSQL_PASSWORD', variable: 'MYSQL_PASSWORD')
                ]) {
                    script {
                        if (params.RESET_DB) {
                            echo '⚠️ Resetting MySQL volume...'
                            sh 'docker compose down -v --remove-orphans || true'
                        } else {
                            sh 'docker compose down --remove-orphans || true'
                        }
                    }

                    sh 'docker compose pull || true'
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
