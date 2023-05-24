# start by pulling the python image
FROM python:3.8-alpine

COPY ./requirements.txt .

# upgrade pip
RUN pip install --upgrade pip

# install the dependencies and packages in the requirements file
RUN pip install -r requirements.txt

# copy every content from the local file to the image
COPY . .

## start the flask server
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=4001"]

