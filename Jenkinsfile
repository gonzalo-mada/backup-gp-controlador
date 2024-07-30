pipeline {
    agent none
    stages {
        stage('Deliver for development') {
            when {
                branch 'develop'
            }
            agent {
                label 'desarrollo-controladores'
            }
            steps {
                echo 'Instalando dependencias'
                sh 'npm install'
                echo 'Eliminando app de pm2'
                sh 'pm2 delete ${PWD##*/} || true'
                echo 'Levantando aplicación'
                sh 'pm2 start index.js --name ${PWD##*/}'
                echo 'Save pm2'
                sh 'pm2 save'
            }
        }
    }
}
