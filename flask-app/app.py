from flask import Flask, request, jsonify
from flask_cors import CORS
from cassandra.cluster import Cluster
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Connect to the Cassandra cluster
print("starting flask app")
cluster = Cluster(contact_points=['cassandra-seed'], port=9042)
session = cluster.connect()



@app.route('/')
def hello():
    return 'Hello, Flask v1!'


@app.route('/calculate')
def calculate():
    num1 = int(request.args.get('num1'))
    num2 = int(request.args.get('num2'))

    result = num1 + num2

    return jsonify({'result': result})


@app.route('/logs_insertion', methods=['POST'])
def logs_insertion():
    print("start insertt data")
    
    session.execute("""
    CREATE KEYSPACE IF NOT EXISTS health_hive
    WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 2};
""")
    session.execute("""USE health_hive""")
    session.execute("""
        CREATE TABLE IF NOT EXISTS health_hive.logs (
            email text,
            username text static,
            date text,
            heart_rate text,
            weight text,
            blood_pressure text,
            body_temperature text,
            hours_of_sleep text,
            stress_level text,
            water_intake text,
            diet text,
            exercise_minutes text,
            mood text,
            weather_condition text,
            PRIMARY KEY (email, date)
        );
    """)

    try:
        email = request.json.get('email')
        username = request.json.get('username')
        date = request.json.get('date')
        heart_rate = request.json.get('heart_rate')
        weight = request.json.get('weight')
        blood_pressure = request.json.get('blood_pressure')
        body_temperature = request.json.get('body_temperature')
        hours_of_sleep = request.json.get('hours_of_sleep')
        stress_level = request.json.get('stress_level')
        water_intake = request.json.get('water_intake')
        diet = request.json.get('diet')
        exercise_minutes = request.json.get('exercise_minutes')
        mood = request.json.get('mood')
        weather_condition = request.json.get('weather_condition')

        print(email, username, date, heart_rate, weight, blood_pressure, body_temperature)

        session.execute(
            """
            INSERT INTO health_hive.logs (email, username, date, heart_rate, weight, blood_pressure, body_temperature, hours_of_sleep, stress_level, water_intake, diet, exercise_minutes, mood, weather_condition)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (email, username, date, heart_rate, weight, blood_pressure, body_temperature, hours_of_sleep, stress_level, water_intake, diet, exercise_minutes, mood, weather_condition)
        )

        return 'Data inserted successfully from backend!'
    except Exception as e:
        print(e)
        return str(e)

@app.route('/insert-data', methods=['POST'])
def insert_data():
    print("start insert data")
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


@app.route('/show_logs')
def show_logs():
    rows = session.execute("SELECT * FROM health_hive.logs")
    print(rows)
    data = [{'email': row.email, 'username': row.username, 'date': row.date, 'heart_rate': row.heart_rate, 'weight': row.weight, 'blood_pressure': row.blood_pressure, 'body_temperature': row.body_temperature, 'hours_of_sleep': row.hours_of_sleep, 'stress_level': row.stress_level, 'water_intake': row.water_intake, 'diet': row.diet, 'exercise_minutes': row.exercise_minutes, 'mood': row.mood, 'weather_condition': row.weather_condition}
            for row in rows]
    return jsonify(data)

@app.route('/show_table')
def show_table():
    rows = session.execute("SELECT * FROM weather.stations")
    data = [{'id': row.id, 'name': row.name, 'date': row.date, 'temperature': row.temperature}
            for row in rows]
    return jsonify(data)


if __name__ == '__main__':
    app.run(port=4001)

