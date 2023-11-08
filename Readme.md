# Instruction Manual
<code>@Author</code> - SHIVANSHU

This instruction manual is aimed to provide quick insights and procedures into the whole architecture . Please go through these instructions to safely install and run the microservices on your local mahine

#### Postman Collection
https://api.postman.com/collections/5376901-10d0bdbf-94a1-4752-a2f4-7a9e448b13ba?access_key=PMAT-01HERD7FKTW1H684NB3PCYY8F2

# Operational Notes
- While registering the user you will receive the an OTP in your email id.
- Email setup is done through SendGrid. If you don't receive any email containg OTP. Please use the OTP printed in the console. (This is just for testing purposes)
- Sample email templates from my other project is used. Please ignore the content of the emails
- Application is containerized using docker-compose

# Architectural Notes
- This architecture follows Microservice approach. It contains two microservices namely Page and Auth
- It is designed in Dependency Injection pattern to enable high scalabality. In this we are injecting operations to the controller as dependency. The operations are defined set of services with a unique name denoting the endpoint of the service. In this way only the services are modifiable and rest of the architecture works as a unique instance.
- This dependency injection approach prevents the data leak in a request by maintaining the context of the request inside the closure of the created instance
- Security is handled by authetication middleware which checks the token provided in Authorisation Bearer
- Page Microservice is used for page management , post management , comment management , replies management , likes management 
- Auth Service handles the authentication and authorisation of the user using JsonWebTokens

# Recommendations
- Use an RSA or ECDSA key created by a valid Certificate Authority as the seed for JSONWebTokens
- This architecture can be further improved after analysing the economics and anticipated peak load
- This architecture can be further improved by introducing an API Gateway which can designed in a Singleton pattern or Dependency Injection pattern

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

