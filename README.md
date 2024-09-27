# restaurant_nelo
Restaurant

## Pre-requisite
### Install Docker Desktop on you windows or mac laptop

### Run the Docker Desktop application

## Dev mode

### COPY env

`cp sample.env .env`

### Build the app
Now go to the root directory of the project `restaurant_nelo` and run following command

`docker-compose up --build`

## Prod mode

### COPY env

`cp sample.env .prod.env`

### Build the app
In prod mode we want to launch the app in different way. So we use the following command in our Jenkins CD to launch the application in the `prod` environment.

`docker-compose --env-file .prod.env up --build`
