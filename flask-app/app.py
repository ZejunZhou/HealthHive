from flask import Flask, request, jsonify
from flask_cors import CORS
from cassandra.cluster import Cluster
from datetime import datetime, timedelta
import random

app = Flask(__name__)
CORS(app)

# Connect to the Cassandra cluster
print("starting flask app")
cluster = Cluster(contact_points=['cassandra-seed'], port=9042)
session = cluster.connect()


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

start_date = datetime(2023, 8, 1)
dates = [(start_date + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(100)]

# 为每个日期生成随机健康数据
for date in dates:
    email = "zzhou443@wisc.edu"
    username = "user123456"  # 随机用户名
    heart_rate = str(random.randint(60, 100))
    weight = str(round(random.uniform(40, 110), 2))  # 体重范围从50kg到100kg
    blood_pressure = f"{random.randint(90, 120)}/{random.randint(60, 80)}"
    body_temperature = str(round(random.uniform(36.5, 40), 1))
    hours_of_sleep = str(round(random.uniform(4, 10), 1))
    stress_level = str(random.randint(1, 10))
    water_intake = str(random.randint(1, 8))  # 1到8杯水
    diet = "Healthy" if random.random() > 0.5 else "Unhealthy"
    exercise_minutes = str(random.randint(0, 120))
    mood = random.choice(["Happy", "Sad", "Neutral", "Excited", "Tired"])
    weather_condition = random.choice(["Sunny", "Rainy", "Cloudy", "Windy", "Snowy"])

    
    # 这里是你的插入数据库的代码
    session.execute(
        """
        INSERT INTO health_hive.logs (email, username, date, heart_rate, weight, blood_pressure, body_temperature, hours_of_sleep, stress_level, water_intake, diet, exercise_minutes, mood, weather_condition)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (email, username, date, heart_rate, weight, blood_pressure, body_temperature, hours_of_sleep, stress_level, water_intake, diet, exercise_minutes, mood, weather_condition)
    )

@app.route('/')
def hello():
    return 'Hello, Flask v1!'


@app.route('/calculate')
def calculate():
    num1 = int(request.args.get('num1'))
    num2 = int(request.args.get('num2'))

    result = num1 + num2

    return jsonify({'result': result})

## Method insert user sign up information into cassandra db
@app.route("/user_insertion", methods = ['POST'])
def user_insertion():
    print("start inserting userinfo")
    session.execute("""
    CREATE KEYSPACE IF NOT EXISTS health_hive
    WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 2};
""")
    session.execute("""USE health_hive""")
    session.execute("""
    CREATE TABLE IF NOT EXISTS health_hive.user(
        email text,
        username text,
        password text,
        PRIMARY KEY (email)
    )
    """)
    try:
        email = request.json.get("email")
        username = request.json.get("username")
        password = request.json.get("password")
        session.execute("""INSERT INTO health_hive.user (email, username, password)
                            VALUES (%s, %s, %s)""", (email, username, password))
        
        return "USER data has been successfully inserted into db"

    except Exception as e:
        return str(e)

@app.route('/insert_prediction', methods = ['POST'])
def insert_prediction():
    session.execute("""USE health_hive""")
    session.execute("""
    CREATE TABLE IF NOT EXISTS health_hive.prediction(
        email text,
        date text,
        diabetes_risk text,
        hypertension_risk text,
        fever_risk text,
        depression_risk text,
        health_index text,
        PRIMARY KEY (email, date)
    )
    """)
    try:
        email = request.json.get("email")
        date = request.json.get('date')
        diabetes_risk = request.json.get('diabetes_risk')
        hypertension_risk = request.json.get("hypertension_risk")
        fever_risk = request.json.get('fever_risk')
        depression_risk = request.json.get('depression_risk')
        health_index = request.json.get("health_index")
    except Exception as e:
        return str(e)
    
    session.execute(
            """
            INSERT INTO health_hive.prediction (email, date, diabetes_risk, hypertension_risk, fever_risk, depression_risk, health_index)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (email, date, diabetes_risk, hypertension_risk, fever_risk, depression_risk, health_index)
        )

    return "prediction insert successfully"

## function get prediction metrics by date
@app.route('/get_prediction_metrics_by_date')
def get_prediction_metrics_by_date():
    session.execute("""
    CREATE TABLE IF NOT EXISTS health_hive.prediction(
        email text,
        date text,
        diabetes_risk text,
        hypertension_risk text,
        fever_risk text,
        depression_risk text,
        health_index text,
        PRIMARY KEY (email, date)
    )
    """)
    email = request.args.get('email')
    date = request.args.get('date')
    query = f"SELECT * FROM health_hive.prediction WHERE email=%s AND date=%s"
    rows = session.execute(query, [email, date])
    if rows:
        for row in rows:
            return jsonify({"email": row.email, 'date':row.date, 'diabetes_risk':row.diabetes_risk, "hypertension_risk":row.hypertension_risk, "fever_risk":row.fever_risk, "depression_risk":row.depression_risk, "health_index":row.health_index})
    else:
        return jsonify({'message':"No Report has generated"}), 400

## function get health_index by date range
@app.route('/get_health_index_by_range')
def get_health_index_by_range():
    email = request.args.get('email')
    date = request.args.get('date')
    ## fetch all health_index include today's date
    query = f"SELECT health_index FROM health_hive.prediction WHERE email=%s AND date <= %s"
    rows = session.execute(query, [email, date])
    if rows:
        for row in rows:
            return jsonify({"email": row.email, 'date':row.date, "health_index":row.health_index})
    else:
        return jsonify({'message':"No index has generated"})


## Method get user info by EMAIL for sign in verification
@app.route('/get_user', methods = ['GET'])
def get_user():
    session.execute("""
    CREATE KEYSPACE IF NOT EXISTS health_hive
    WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 2};
""")
    session.execute("""USE health_hive""")
    session.execute("""
    CREATE TABLE IF NOT EXISTS health_hive.user(
        email text,
        username text,
        password text,
        PRIMARY KEY (email)
    )
    """)
    email = request.args.get('email')
    user_info = get_user_by_email(email)
    if user_info != None:
        return jsonify(user_info)
    else:
        return jsonify({"message": "Account not registered"}), 400

## Help Method help to get userinfo by Email
def get_user_by_email(email):
    keyspace = "health_hive"
    table = "user"
    query = f"SELECT * FROM {keyspace}.{table} WHERE email=%s"
    rows = session.execute(query, [email])
    ## case email has not found from db
    if not rows:
        return None

    for row in rows:
        return {"email": row.email, "password": row.password, "username":row.username}


## Method insert log data into cassandra db
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

        ##print(email, username, date, heart_rate, weight, blood_pressure, body_temperature)

        session.execute(
            """
            INSERT INTO health_hive.logs (email, username, date, heart_rate, weight, blood_pressure, body_temperature, hours_of_sleep, stress_level, water_intake, diet, exercise_minutes, mood, weather_condition)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (email, username, date, heart_rate, weight, blood_pressure, body_temperature, hours_of_sleep, stress_level, water_intake, diet, exercise_minutes, mood, weather_condition)
        )

        return 'LOG Data inserted successfully from backend!'
    except Exception as e:
        print(e)
        return str(e)

## Method delete data from database
@app.route("/delete_logs", methods=["DELETE"])
def delete_logs():
    print("calling delete logs")
    email = request.args.get('email')
    date = request.args.get('date')
    delete_logs_by_date(email, date)
    return jsonify({"message":"successfully delete from database"})

## Helper method to delete data from database
def delete_logs_by_date(email, date):
    keyspace = "health_hive"
    table = "logs"
    query = f"DELETE FROM {keyspace}.{table} WHERE email=%s AND date=%s"
    session.execute(query, [email, date])
   

## Method fetch data from database
@app.route("/get_logs", methods=['GET'])
def get_logs():
    print("calling get logs")
    email = request.args.get('email')
    logs = get_logs_by_email(email)
    return jsonify(logs)

## Helper method help to get data from database by email
def get_logs_by_email(email):
    keyspace = "health_hive"
    table = "logs"
    query = f"SELECT * FROM {keyspace}.{table} WHERE email=%s"
    rows = session.execute(query, [email])
    data = {}
    for row in rows:
        date_str = row.date 
        data[date_str] = {'email': row.email, 'username': row.username, 'heart_rate': row.heart_rate, 'weight': row.weight, 'blood_pressure': row.blood_pressure, 'body_temperature': row.body_temperature, 'hours_of_sleep': row.hours_of_sleep, 'stress_level': row.stress_level, 'water_intake': row.water_intake, 'diet': row.diet, 'exercise_minutes': row.exercise_minutes, 'mood': row.mood, 'weather_condition': row.weather_condition}
    return data

## Function get health info by specific date
@app.route("/get_logs_by_date", methods=['GET'])
def get_logs_by_date():
    keyspace = "health_hive"
    table = "logs"
    email = request.args.get("email")
    date = request.args.get("date")
    query = f"SELECT * FROM {keyspace}.{table} WHERE email=%s AND date=%s"
    rows = session.execute(query, [email, date])
    data = {}
    for row in rows:
        date_str = row.date 
        data[date_str] = {'heart_rate': row.heart_rate, 'weight': row.weight, 'blood_pressure': row.blood_pressure, 'body_temperature': row.body_temperature, 'hours_of_sleep': row.hours_of_sleep, 'stress_level': row.stress_level, 'water_intake': row.water_intake, 'diet': row.diet, 'exercise_minutes': row.exercise_minutes, 'mood': row.mood, 'weather_condition': row.weather_condition}
    if not data:
        return jsonify({"message": "No records found for the given email and date."}), 401
    return jsonify(data)



## Method fetch data from database
@app.route("/get_single_logs", methods=['GET'])
def get_single_logs():
    print("calling get single logs")
    email = request.args.get('email')
    metric = request.args.get("metric")
    logs = get_single_logs_by_email(email, metric)
    return jsonify(logs)

## Helper method help to get data from database by email
def get_single_logs_by_email(email, metric):
    if metric not in ["heart_rate", "weight", "blood_pressure", "body_temperature", "hours_of_sleep", "stress_level", "water_intake", "diet", "exercise_minutes", "mood", "weather_condition"]:
        return jsonify({"error": "Invalid metric"}), 400
    keyspace = "health_hive"
    table = "logs"
    query = f"SELECT email, username, date, {metric} FROM {keyspace}.{table} WHERE email=%s"
    rows = session.execute(query, [email])
    data = {}
    for row in rows:
        date_str = row.date 
        data[date_str] = {'email': row.email, 'username': row.username, metric:getattr(row, metric)}
    return data

@app.route("/get_single_logs_by_date", methods=["GET"])
def get_single_log_by_date():
    email = request.args.get('email')
    metric = request.args.get("metric")
    startDate = request.args.get("startDate")
    endDate = request.args.get("endDate")
    logs = get_single_logs_by_email_date(email, metric, startDate, endDate)
    return jsonify(logs)

def get_single_logs_by_email_date(email, metric, startDate, endDate):
    if metric not in ["heart_rate", "weight", "blood_pressure", "body_temperature", "hours_of_sleep", "stress_level", "water_intake", "diet", "exercise_minutes", "mood", "weather_condition"]:
        return jsonify({"error": "Invalid metric"}), 400
    keyspace = "health_hive"
    table = "logs"
    query = f"SELECT email, username, date, {metric} FROM {keyspace}.{table} WHERE email=%s AND date >= %s AND date <= %s"
    try:
        rows = session.execute(query, [email, startDate, endDate])
        data = {}
        for row in rows:
            date_str = row.date 
            data[date_str] = {'email': row.email, 'username': row.username, metric:getattr(row, metric)}
        return data
    except Exception as e:
        print("Error executing query:", e)  # Log the error for debugging
        return jsonify({"error": "Internal server error"}), 500


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
    ##print(rows)
    data = [{'email': row.email, 'username': row.username, 'date': row.date, 'heart_rate': row.heart_rate, 'weight': row.weight, 'blood_pressure': row.blood_pressure, 'body_temperature': row.body_temperature, 'hours_of_sleep': row.hours_of_sleep, 'stress_level': row.stress_level, 'water_intake': row.water_intake, 'diet': row.diet, 'exercise_minutes': row.exercise_minutes, 'mood': row.mood, 'weather_condition': row.weather_condition}
            for row in rows]
    return jsonify(data)

# @app.route('/show_user')
# def show_user():
#     rows = session.execute("""SELECT * FROM health_hive.user""")
#     data = [{'email': row.email, "username":row.username, "password":row.password}
#             for row in rows]
#     return jsonify(data)

# @app.route('/show_table')
# def show_table():
#     rows = session.execute("SELECT * FROM weather.stations")
#     data = [{'id': row.id, 'name': row.name, 'date': row.date, 'temperature': row.temperature}
#             for row in rows]
#     return jsonify(data)

if __name__ == '__main__':
    app.run(port=4001)

