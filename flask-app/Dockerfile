# start by pulling the python image
FROM python:3.8-alpine

# Install netcat for the wait-for-it script
RUN apk update && apk add netcat-openbsd

WORKDIR /app

COPY ./requirements.txt .

# upgrade pip
RUN pip install --upgrade pip

# install the dependencies and packages in the requirements file
RUN pip install -r requirements.txt

# copy every content from the local file to the image
COPY . .

# Make the wait-for-it script executable
RUN chmod +x /app/wait-for-it.sh

# start the flask server
CMD [ "/app/wait-for-it.sh", "cassandra-seed", "9042", "--", "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=4001"]


