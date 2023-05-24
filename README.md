# HealthHive

HealthHive is a health information application designed to empower individuals to create personalized and easily accessible health insights. It provides customers with access to a comprehensive suite of health management resources to assist them in understanding and promoting their wellness. The application includes features such as health logs, health visualization, wellness forecasts, and health chat assistants.

## Features

- **Health Logs**: Easily track and record your health data, including vital signs, symptoms, medication, and lifestyle factors.
- **Health Visualization**: Visualize your health data through interactive charts and graphs, allowing you to gain insights and identify trends.
- **Wellness Forecast**: Get personalized wellness forecasts based on your health data, helping you plan and make informed decisions.
- **Health Chat Assistants**: Interact with chat assistants powered by artificial intelligence to receive personalized health recommendations and guidance.

## Get Start

At Directory **HealthHive**, build up docker containers use following command

```
docker-compose build 
```

Then run build up containers communication in background using following command

```
docker-compose up
```

**Notice** This step will take 1-2 min to come up because the Cassandra cluster has to initialize.

Feel free to check flask server's status using

```
docker logs healthhive-flask-backend-1
```
**Or**

```
docker logs <-container id of flask backend container->
```

## Access 
Access React app at **localhost:3000**


## Testing (temporary)

Check Flask app's stauts at **localhost:4001** 
You need to see Hello Flask to have flask app running

Feel free to check http://localhost:4001/showtable to check cassandra table's result
