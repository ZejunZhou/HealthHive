# Use a more standard base image
FROM python:3.8-slim-buster

# Install Java and other necessary tools
RUN apt-get update && apt-get install -y openjdk-11-jdk netcat && rm -rf /var/lib/apt/lists/*

# Set the environment variable for Java
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-arm64
ENV PATH="$JAVA_HOME/bin:${PATH}"

# Set PYSPARK_PYTHON environment variable
ENV PYSPARK_PYTHON=python3

WORKDIR /app

COPY ./requirements.txt .

# Upgrade pip
RUN pip install --upgrade pip

# Install the dependencies and packages in the requirements file
RUN pip install -r requirements.txt

COPY . .

RUN chmod +x start.sh

# Start flask server
CMD ["sh", "start.sh"]
