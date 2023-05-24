from flask import Flask, request, jsonify
from flask_cors import CORS
from cassandra.cluster import Cluster
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Connect to the Cassandra cluster
cluster = Cluster(contact_points=['cassandra-seed'], port=9042)
session = cluster.connect()
session.execute("""
    CREATE KEYSPACE IF NOT EXISTS weather
    WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 2};
""")
session.execute("""USE weather""")
session.execute("""
    CREATE TABLE IF NOT EXISTS weather.stations (
      id text,
      name text static,
      date text,
      temperature float,
      PRIMARY KEY (id, date)
    )
""")


@app.route('/')
def hello():
    return 'Hello, Flask!'


@app.route('/calculate')
def calculate():
    # Get the numbers from the request parameters
    num1 = int(request.args.get('num1'))
    num2 = int(request.args.get('num2'))

    print(num1, num2)

    # Perform the calculation
    result = num1 + num2

    # Return the result as a JSON response
    return jsonify({'result': result})


@app.route('/insert-data', methods=['POST'])
def insert_data():
    try:
        id = request.json.get('id')
        name = request.json.get('name')
        temperature = float(request.json.get('temperature'))

        # Insert data into Cassandra table
        date = request.json.get("date")
        session.execute(
            """
            INSERT INTO weather.stations (id, name, date, temperature)
            VALUES (%s, %s, %s, %s)
            """,
            (id, name, date, temperature)
        )

        return 'Data inserted successfully!'
    except Exception as e:
        return str(e)


@app.route('/showtable')
def show_table():
    rows = session.execute("SELECT * FROM weather.stations")
    data = [{'id': row.id, 'name': row.name, 'date': row.date, 'temperature': row.temperature}
            for row in rows]
    return jsonify(data)


if __name__ == '__main__':
    app.run(port=4001)
