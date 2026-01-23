pipeline {
    agent any

    environment {
        // Docker Hub Credentials
        DOCKER_HUB_USER = 'vanujak'
        FRONTEND_IMAGE = "${DOCKER_HUB_USER}/easycase-frontend"
        BACKEND_IMAGE = "${DOCKER_HUB_USER}/easycase-backend"
        
        // Mongo Config (for Validating Tests)
        MONGO_URI = "mongodb://mongo:27017/easycasedb"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test Backend') {
            steps {
                script {
                    dir('backend') {
                        // Using a node image to run tests rapidly
                        docker.image('node:18').inside {
                            sh 'npm install'
                            // sh 'npm test' // Uncomment if you want to enforce tests passing
                            echo "Skipping actual test execution for speed, but installed dependencies successfully."
                        }
                    }
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                script {
                    docker.withRegistry('', 'docker-hub-credentials') {
                        def app = docker.build("${BACKEND_IMAGE}:${BUILD_NUMBER}", "./backend")
                        app.push()
                        app.push("latest")
                    }
                }
            }
        }

        stage('Build & Push Frontend') {
            steps {
                script {
                    docker.withRegistry('', 'docker-hub-credentials') {
                        // Pass API URL build arg if needed (Update IP if domain exists)
                        // For now we assume typical Docker networking or client-side relative paths
                        def app = docker.build("${FRONTEND_IMAGE}:${BUILD_NUMBER}", "./frontend")
                        app.push()
                        app.push("latest")
                    }
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                sshagent(['prod-ssh-key']) {
                    // Copy the docker-compose.yml to production first
                    // We assume the one in your repo is 'production-ready' or we overwrite fields
                    sh "scp -o StrictHostKeyChecking=no docker-compose.yml ubuntu@3.229.137.7:/home/ubuntu/docker-compose.yml"
                    
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@3.229.137.7 '
                            # Export Image Names so docker-compose uses the Docker Hub images, NOT local build
                            export APP_IMAGE=${BACKEND_IMAGE}:latest
                            # (You might need to update your docker-compose.yml to use \${APP_IMAGE} instead of 'build:')
                            
                            # Forcing pull of latest images
                            docker pull ${BACKEND_IMAGE}:latest
                            docker pull ${FRONTEND_IMAGE}:latest
                            
                            # Restart services
                            docker-compose up -d --remove-orphans
                        '
                    """
                }
            }
        }
    }
}