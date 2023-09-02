from flask import Flask, request, jsonify
from flask_cors import CORS
from cassandra.cluster import Cluster
from datetime import datetime, timedelta
import random
import re
import bcrypt

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

## database Initialization
def initialize_db():
    try:
        # switch to the health_hive keyspace
        session.execute("""
        CREATE KEYSPACE IF NOT EXISTS health_hive
        WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 2};
        """)
        session.execute("""USE health_hive""")
        
        # Create the user table for userinfo storage
        session.execute("""
        CREATE TABLE IF NOT EXISTS health_hive.user(
            email text,
            username text,
            password text,
            salt text,
            PRIMARY KEY (email)
        )
        """)
        
        # Create the prediction table for storing wellness prediction
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
        
        # Create the logs table for storing health logs
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
        )
        """)
    except Exception as e:
        print("initialize database error")

## start database
try:
    initialize_db()
except Exception as e:
    print(str(e))


@app.route('/')
def hello():
    return 'Hello, Flask v1!'

@app.route('/insert_prediction', methods = ['POST'])
def insert_prediction():
    try:
        email = request.json.get("email")
        date = request.json.get('date')
        diabetes_risk = request.json.get('diabetes_risk')
        hypertension_risk = request.json.get("hypertension_risk")
        fever_risk = request.json.get('fever_risk')
        depression_risk = request.json.get('depression_risk')
        health_index = request.json.get("health_index")

        ## test email validation
        email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        email_result = bool(re.match(email_regex, email))

        if not email_result:
            return "Input invalid email into backend", 400

        ## test date validation
        date_regex = r'^\d{4}-\d{2}-\d{2}$'
        date_result = bool(re.match(date_regex, date))

        if not date_result:
            return "Input invalid date into backend", 400
        
        ## test diabetes risk
        diabetes_result = 0 <= float(diabetes_risk) and float(diabetes_risk) <= 100
        hypertension_result = 0 <= float(hypertension_risk) and float(hypertension_risk) <= 100
        fever_result = 0 <= float(fever_risk) and float(fever_risk) <= 100
        depression_result = 0 <= float(depression_risk) and float(depression_risk) <= 100
        health_index_result = 0 <= float(health_index) and float(health_index) <= 100

        if not (diabetes_result and hypertension_result and fever_result and depression_result and health_index_result):
            return "Input invalid risk and index into backend", 400
    
        session.execute(
            """
            INSERT INTO health_hive.prediction (email, date, diabetes_risk, hypertension_risk, fever_risk, depression_risk, health_index)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (email, date, diabetes_risk, hypertension_risk, fever_risk, depression_risk, health_index)
        )

        return "health prediction insert successfully"
    except Exception as e:
        return str(e)

## function get prediction metrics by date
@app.route('/get_prediction_metrics_by_date')
def get_prediction_metrics_by_date():
    try:
        email = request.args.get('email')
        date = request.args.get('date')

         ## test email validation
        email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        email_result = bool(re.match(email_regex, email))

        if not email_result:
            return "Input invalid email into backend for query", 400

        ## test date validation
        date_regex = r'^\d{4}-\d{2}-\d{2}$'
        date_result = bool(re.match(date_regex, date))

        if not date_result:
            return "Input invalid date into backend for query", 400

        query = f"SELECT * FROM health_hive.prediction WHERE email=%s AND date=%s"
        rows = session.execute(query, [email, date])

        if rows:
            for row in rows:
                return jsonify({"email": row.email, 'date':row.date, 'diabetes_risk':row.diabetes_risk, "hypertension_risk":row.hypertension_risk, "fever_risk":row.fever_risk, "depression_risk":row.depression_risk, "health_index":row.health_index})
        else:
            return jsonify({'message':"No Report has generated"}), 400
    except Exception as e:
        print(str(e))

## function get health_index by date range
@app.route('/get_health_index_by_range')
def get_health_index_by_range():
    try:
        email = request.args.get('email')
        date = request.args.get('date')

        ## test email validation
        email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        email_result = bool(re.match(email_regex, email))

        if not email_result:
            return "Input invalid email into backend for query", 400

        ## test date validation
        date_regex = r'^\d{4}-\d{2}-\d{2}$'
        date_result = bool(re.match(date_regex, date))

        if not date_result:
            return "Input invalid date into backend for query", 400

        ## fetch all health_index include today's date
        query = f"SELECT date, health_index FROM health_hive.prediction WHERE email=%s AND date <= %s"
        rows = session.execute(query, [email, date])
        if rows:
            data = []
            for row in rows:
                data.append({'date':row.date, "health_index":row.health_index})
            return jsonify(data)
        else:
            return jsonify({'message':"No index has generated"}), 400
    except Exception as e:
        print(str(e))

## Method insert user sign up information into cassandra db, with data validation
@app.route("/user_insertion", methods = ['POST'])
def user_insertion():
    try:
        email = request.json.get("email")
        username = request.json.get("username")
        password = request.json.get("password")

        ## backend validation for email username password
        if not email or not username or not password:
            return "Missing required fields for userinfo", 400
        
        ## test email
        email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        email_result = bool(re.match(email_regex, email))

        if not email_result:
            return "Input invalid email into backend", 400
        
        ## test username
        username_regex = r"^[a-zA-Z0-9 ]+$"
        username_format_result = bool(re.match(username_regex, username))

        if not username_format_result:
            return "Input invalid username format into backend", 400
        
        username_length_result = len(username) >= 3  and len(username) <= 20

        if not username_length_result:
            return "Input invalid username length into backend", 400
        
        ## test password
        password_length_result = len(password) >= 8 and len(password) <= 16

        if not password_length_result:
            return "Input invalid password length into backend", 400
        
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

        session.execute("""INSERT INTO health_hive.user (email, username, password, salt)
                            VALUES (%s, %s, %s, %s)""", (email, username, password_hash, salt.decode('utf-8')))
        
        return "USER data has been successfully inserted into db"

    except Exception as e:
        return str(e)

## function verify login at backend
@app.route('/login_verify', methods = ['POST'])
def login_verify():
    try:
        email = request.json.get('email')
        password = request.json.get('password')
        keyspace = "health_hive"
        table = "user"
        ## select encoded password
        query = f"SELECT * FROM {keyspace}.{table} WHERE email=%s"
        row = session.execute(query, [email]).one()
         
        if not row:
            return jsonify({"message": "User not found"}),400

        stored_salt = row.salt.encode('utf-8')
        password_hash = bcrypt.hashpw(password.encode('utf-8'), stored_salt).decode('utf-8')

        ## compare user's encode password with db record
        if password_hash == row.password:
            return jsonify({'email':row.email, "username":row.username}) 
        else:
            return jsonify({"message": "Incorrect password"}),400

    except Exception as e:
        print(str(e))


## Method get user info by EMAIL for sign up verification
@app.route('/get_user', methods = ['GET'])
def get_user():
    try:
        email = request.args.get('email')
        ## test email
        email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        email_result = bool(re.match(email_regex, email))
        if not email_result:
            return "Input invalid email into backend for query", 400

        user_info = get_user_by_email(email)
        if user_info != None:
            return jsonify(user_info)
        else:
            return jsonify({"message": "Account not registered"}), 400
    except Exception as e:
        print(str(e))

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
        return {"email": row.email, "username":row.username}

## function validate numeric health metrics values 
def validate_input(value, min, max):
    ## allow user to leave empty field
    if value == "":
        return True
    try:
        value = float(value)
        return min <= value <= max
    except ValueError:
        return False


## Method insert log data into cassandra db
@app.route('/logs_insertion', methods=['POST'])
def logs_insertion():
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

        ## test email
        email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        email_result = bool(re.match(email_regex, email))

        if not email_result:
            return "Input invalid email into backend", 400
        
        ## test username
        username_regex = r"^[a-zA-Z0-9 ]+$"
        username_format_result = bool(re.match(username_regex, username))

        if not username_format_result:
            return "Input invalid username format into backend", 400
        
        # test date validation
        date_regex = r'^\d{4}-\d{2}-\d{2}$'
        date_result = bool(re.match(date_regex, date))

        if not date_result:
            return "Input invalid date into backend", 400
        
        ## test heart_rate
        heart_rate_result = validate_input(heart_rate, 40, 200)

        if not heart_rate_result:
            return "Input invalid heart rate into backend", 400

        ## test weight
        weight_result = validate_input(weight, 20, 200)

        if not weight_result:
            return "Input invalid weight into backend", 400

        ## test blood pressure
        try:
            systolic, diastolic = blood_pressure.split('/')
        except ValueError:
            return False
        
        blood_pressure_reult = validate_input(systolic, 40, 200) and validate_input(diastolic, 40, 200)

        if not blood_pressure_reult:
            return "Input input invalid blood pressure into backend", 400

        ## test body temperature
        body_temperature_result = validate_input(body_temperature, 34, 42)

        if not body_temperature_result:
            return "Input invalid body temperature into backend", 400

        ## test hours of sleep
        hours_of_sleep_result = validate_input(hours_of_sleep, 0, 24)

        if not hours_of_sleep_result:
            return "Input invalid hour of slepp into backend", 400

        ## test stress level
        stress_range = [str(i + 1) for i in range(10)]
        stress_level_result = stress_level in stress_range

        if not stress_level_result:
            return "Input invalid stress level into backend", 400

        ## test water intake
        water_intake_result = validate_input(water_intake, 0, 8)

        if not water_intake_result:
            return "Input invalid water intake into backend", 400
        
        ## test diet
        diet_range = ["Healthy", "Unhealthy"]
        diet_result = diet in diet_range

        if not diet_result:
            return "Input invalid diet into backend", 400

        ## test exercise minutes
        exercise_result = validate_input(exercise_minutes, 0, 1440)

        if not exercise_result:
            return "Input invalid exercise miniutes into backend", 400

        ## test mood
        mood_range = ["Happy", "Sad", "Neutral", "Excited", "Tired"]
        mood_result = mood in mood_range

        if not mood_result:
            return "Input invalid mood into backend", 400

        ## test weather condition
        weather_range = ["Sunny", "Rainy", "Cloudy", "Windy", "Snowy"]
        weather_result = weather_condition in weather_range

        if not weather_result:
            return "Input invalid weather into backend", 400

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
    try:
        # print("calling delete logs")
        email = request.args.get('email')
        date = request.args.get('date')
        ## test email
        email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        email_result = bool(re.match(email_regex, email))

        if not email_result:
            return "Input invalid email into backend for deleting", 400
        
        # test date validation
        date_regex = r'^\d{4}-\d{2}-\d{2}$'
        date_result = bool(re.match(date_regex, date))

        if not date_result:
            return "Input invalid date into backend", 400
        
        delete_logs_by_date(email, date)
        return jsonify({"message":"successfully delete from database"})
    except Exception as e:
        print(str(e))

## Helper method to delete data from database
def delete_logs_by_date(email, date):
    keyspace = "health_hive"
    table = "logs"
    query = f"DELETE FROM {keyspace}.{table} WHERE email=%s AND date=%s"
    session.execute(query, [email, date])
   

## Method fetch data from database
@app.route("/get_logs", methods=['GET'])
def get_logs():
    try:
        print("calling get logs")
        email = request.args.get('email')
        ## test email
        email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        email_result = bool(re.match(email_regex, email))
        if not email_result:
            return "Input invalid email into backend", 400

        logs = get_logs_by_email(email)
        return jsonify(logs)
    except Exception as e:
        print(str(e))

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
    try:
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
    except Exception as e:
        print(e)


## Method fetch data from database
@app.route("/get_single_logs", methods=['GET'])
def get_single_logs():
    try:
        print("calling get single logs")
        email = request.args.get('email')
        metric = request.args.get("metric")
        logs = get_single_logs_by_email(email, metric)
        return jsonify(logs)
    except Exception as e:
        print(e)

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
    try:
        email = request.args.get('email')
        metric = request.args.get("metric")
        startDate = request.args.get("startDate")
        endDate = request.args.get("endDate")
        logs = get_single_logs_by_email_date(email, metric, startDate, endDate)
        return jsonify(logs)
    except Exception as e:
        print(str(e))

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

@app.route('/show_logs')
def show_logs():
    rows = session.execute("SELECT * FROM health_hive.logs")
    ##print(rows)
    data = [{'email': row.email, 'username': row.username, 'date': row.date, 'heart_rate': row.heart_rate, 'weight': row.weight, 'blood_pressure': row.blood_pressure, 'body_temperature': row.body_temperature, 'hours_of_sleep': row.hours_of_sleep, 'stress_level': row.stress_level, 'water_intake': row.water_intake, 'diet': row.diet, 'exercise_minutes': row.exercise_minutes, 'mood': row.mood, 'weather_condition': row.weather_condition}
            for row in rows]
    return jsonify(data)

@app.route('/show_user')
def show_user():
    rows = session.execute("SELECT * FROM health_hive.user")
    ##print(rows)
    data = [{'email': row.email, 'username': row.username, 'password':row.password, 'salt':row.salt}
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

