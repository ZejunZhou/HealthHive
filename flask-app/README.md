# Build images

docker build -t flask-backend . 

# Build network

docker network create mynetwork

# Manually start containers

docker run -d --network=mynetwork --name=react-frontend -p 3000:3000 react-frontend
docker run -d --network=mynetwork --name=flask-backend -p 4001:4001 flask-backend