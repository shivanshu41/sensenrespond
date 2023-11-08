# Instruction Manual
<code>@Author</code> - SHIVANSHU

This instruction manual is aimed to provide quick insigths and procedures into the whole architecture . Please go through these instructions to safely install and run the microservices on your local mahine

## Prerequisites
- Docker Compose and Docker desktop
- NodeJs(14.x.x) with Nvm
- npm , yarn or any other package manager of choice compatible with package.json

# Development
Step 1 - Install all the dependencies using <code>yarn install</code>
Step 2 - Build and run the api gateway along with all the microservices using <code>docker-compose up</code>

Note - Hot reloading is not implemented as only build directories are deployed

# Deployment (Please change the deployment config in package.json according to your docker infra)
Run <code>npm run deploy</code> to deploy all the services or go to the service directory and run the same command to deploy only that particular service
