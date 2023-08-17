from flask import Flask, request, jsonify
from flask_cors import CORS
from pyspark.sql import SparkSession
import time


app = Flask(__name__)
CORS(app)

def get_spark_session():
    return SparkSession.builder \
        .appName("FlaskSparkApp") \
        .master("local[1]") \
        .getOrCreate()

spark = get_spark_session() ## initialize spark session
# # execute a simple job to warm up SparkSession
# rdd = spark.sparkContext.parallelize([1, 2, 3, 4, 5])
# rdd.count()

@app.route('/')
def test_flask():
    return "Welcome to Spark Flask server!"

@app.route('/test-spark')
def test_spark():
    ##spark = get_spark_session()
    start_time = time.time()
    data = [i for i in range(100)]
    df = spark.createDataFrame([(t,) for t in data], ["value"])
    result = df.rdd.map(lambda row: row.value * 2).reduce(lambda a, b: a + b)
    end_time = time.time()
    
    # 如果你不打算再次使用 SparkSession，可以停止它，但在此示例中可能不是必要的。
    # spark.stop()
    
    return f"Result of Spark test job: {result}, total time is {end_time-start_time}"

@app.route('/test-speed')
def test_speed():
    start_time = time.time()
    data = [i for i in range(100)]
    result = sum([i * 2 for i in data])
    end_time = time.time()
    
    return f"Result of Speed test job: {result}, total time is {end_time-start_time}"

if __name__ == '__main__':
    app.run(port=4002)
