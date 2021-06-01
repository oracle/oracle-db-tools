pipeline {

    environment {
        admin_email = "databasecicd@gmail.com"
    }

  agent any
  stages {
    stage('Start') {
      steps {
        echo 'APEX and Databse CICD Start for ${env.BRANCH_NAME}'
      }
    }

    stage('Terraform GO!') {
      steps {
        sh '''cd ./build
              terraform init
              terraform plan
              terraform apply -auto-approve'''
      }
    }

    stage('Check Logs for ORA Errors') {
      steps {
        script {
          if (manager.logContains('.*ORA-[0-9]{4,5}$.*')) {
            error("Build failed because of an ORA Error")
          }
        }

      }
    }

    stage('Backup if Successful') {
      steps {

        echo 'Backing up DB' 
  
//        sh '''cd ./post_build
//             terraform init
//             terraform plan
//             terraform apply'''
      }
    }

  }

    post {
    unsuccessful {

          emailext(attachLog: true, attachmentsPattern: '**/build/autonomous_database_wallet.zip', body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}\n More info at: ${env.BUILD_URL}", from: '${env.admin_email}', replyTo: '${env.admin_email}', to: '${env.admin_email}', subject: "Jenkins Build ${currentBuild.currentResult}: Job ${env.JOB_NAME}")
            }
        
    success {


          emailext(attachLog: true, body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}\n More info at: ${env.BUILD_URL}", from: "${env.admin_email}", replyTo: "${env.admin_email}", to: "${env.admin_email}", subject: "Jenkins Build ${currentBuild.currentResult}: Job ${env.JOB_NAME}")

//          sh '''cd ./post_setup
//                terraform destroy
//                cd ./build
//                terraform destroy'''

          sh '''cd ./build
                terraform destroy -auto-approve'''
              


            }
         }

}
