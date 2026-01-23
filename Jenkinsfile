pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = 'vanujak'
        FRONTEND_IMAGE = "${DOCKER_HUB_USER}/easycase-frontend"
        BACKEND_IMAGE = "${DOCKER_HUB_USER}/easycase-backend"
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
                        // FIX: Run as root ('u root') inside container to avoid EACCES issues during installing packages
                        // in a temporary pipeline container. 
                        docker.image('node:18').inside('-u root') {
                            sh 'npm install'
                            // sh 'npm test' 
                            echo "Dependencies installed successfully."
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
                        // FIX: Pass the build argument VITE_API_URL so the frontend knows where to send API requests
                        def buildCommand = "--build-arg VITE_API_URL=http://3.229.137.7:4000 ./frontend"
                        
                        def app = docker.build("${FRONTEND_IMAGE}:${BUILD_NUMBER}", buildCommand)
                        app.push()
                        app.push("latest")
                    }
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                sshagent(['prod-ssh-key']) {
                    sh "scp -o StrictHostKeyChecking=no docker-compose.yml ubuntu@3.229.137.7:/home/ubuntu/docker-compose.yml"
                    
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@3.229.137.7 '
                            export APP_IMAGE=${BACKEND_IMAGE}:latest
                            
                            # Pull latest images
                            docker pull ${BACKEND_IMAGE}:latest
                            docker pull ${FRONTEND_IMAGE}:latest
                            
                            # Stop current containers to force recreation with new images
                            docker-compose down
                            docker-compose up -d
                        '
                    """
                }
            }
        }
    }
}