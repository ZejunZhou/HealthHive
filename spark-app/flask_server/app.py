from flask import Flask, request, jsonify
from flask_cors import CORS
from pyspark.sql import SparkSession
from pyspark.ml.feature import VectorAssembler, StringIndexer
from pyspark.ml.regression import LinearRegression, DecisionTreeRegressor, RandomForestRegressor, GBTRegressor
from pyspark.ml import Pipeline
from pyspark.sql import Row
import time


app = Flask(__name__)
CORS(app)

def get_spark_session():
    return SparkSession.builder \
        .appName("FlaskSparkApp") \
        .getOrCreate()

spark = get_spark_session() ## initialize spark session
# execute a simple job to warm up SparkSession
rdd = spark.sparkContext.parallelize([1, 2, 3, 4, 5])
rdd.count()

data = spark.read.csv("health_data.csv", header=True, inferSchema=True) ## read data for training model
train_data, test_data = data.randomSplit([0.8, 0.2])
## encoder the string columns
diet_indexer = StringIndexer(inputCol="diet", outputCol="dietIndex")
mood_indexer = StringIndexer(inputCol="mood", outputCol="moodIndex")
weather_indexer = StringIndexer(inputCol="weather_condition", outputCol="weatherIndex")
## convert features to vector
assembler = VectorAssembler(
    inputCols=["heart_rate", "weight", "body_temperature", "hours_of_sleep", "stress_level", "water_intake", "dietIndex", "exercise_minutes", "moodIndex", "weatherIndex", 'systolic', 'diastolic'],
    outputCol="features"
)
## build up diabetes regression model
diabetes_risk_lr = GBTRegressor(featuresCol="features", labelCol="diabetes_risk")
diabetes_pipeline = Pipeline(stages=[diet_indexer, mood_indexer, weather_indexer, assembler, diabetes_risk_lr])
# train the model
diabetes_model = diabetes_pipeline.fit(train_data)
## build up hypertension regression model
hypertension_risk_lr = DecisionTreeRegressor(featuresCol="features", labelCol="hypertension_risk")
hypertension_pipeline = Pipeline(stages=[diet_indexer, mood_indexer, weather_indexer, assembler, hypertension_risk_lr])
# train the model
hypertension_model = hypertension_pipeline.fit(train_data)
## build up fever regression model
fever_risk_lr = DecisionTreeRegressor(featuresCol="features", labelCol="fever_risk")
fever_pipeline = Pipeline(stages=[diet_indexer, mood_indexer, weather_indexer, assembler, fever_risk_lr])
# train the model
fever_model = fever_pipeline.fit(train_data)
## build up depression regression model
depression_risk_lr =GBTRegressor(featuresCol="features", labelCol="depression_risk")
depression_pipeline = Pipeline(stages=[diet_indexer, mood_indexer, weather_indexer, assembler, depression_risk_lr])
## train the model
depression_model = depression_pipeline.fit(train_data)
## build up health index regression model
health_index_lr = GBTRegressor(featuresCol="features", labelCol="health_index")
health_index_pipeline = Pipeline(stages=[diet_indexer, mood_indexer, weather_indexer, assembler, health_index_lr])
## train the model
health_index_model = health_index_pipeline.fit(train_data)

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
    
    return f"Result of Spark test job: {result}, total time is {end_time-start_time}"

@app.route('/test-speed')
def test_speed():
    start_time = time.time()
    data = [i for i in range(100)]
    result = sum([i * 2 for i in data])
    end_time = time.time()
    
    return f"Result of Speed test job: {result}, total time is {end_time-start_time}"

@app.route('/risk_prediction', methods=['POST'])
def prediction():
    try:
        user_input = request.json
        ## convert to float before passing to model
        def convert_to_float(value):
            try:
                return float(value)
            except ValueError:
                return value

        user_input['heart_rate'] = convert_to_float(user_input['heart_rate'])
        user_input['weight'] = convert_to_float(user_input['weight'])
        user_input['body_temperature'] = convert_to_float(user_input['body_temperature'])
        user_input['hours_of_sleep'] = convert_to_float(user_input['hours_of_sleep'])
        user_input['stress_level'] = convert_to_float(user_input['stress_level'])
        user_input['water_intake'] = convert_to_float(user_input['water_intake'])
        user_input['exercise_minutes'] = convert_to_float(user_input['exercise_minutes'])
        user_input['systolic'] = convert_to_float(user_input['blood_pressure'].split('/')[0])
        user_input['diastolic'] = convert_to_float(user_input['blood_pressure'].split('/')[1])

        # convert user_input object into Row
        row = Row(**user_input)
        print(row)
        df = spark.createDataFrame([row])

        diabetes_result = get_prediction(diabetes_model, df)
        hypertension_result = get_prediction(hypertension_model, df)
        fever_result = get_prediction(fever_model, df)
        depression_result = get_prediction(depression_model, df)
        health_index_result = get_prediction(health_index_model, df)

        return jsonify({
            "diabetes_risk": "{:.1f}".format(diabetes_result),
            "hypertension_risk": "{:.1f}".format(hypertension_result),
            "fever_risk": "{:.1f}".format(fever_result),
            "depression_risk": "{:.1f}".format(depression_result),
            "health_index": "{:.1f}".format(health_index_result)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

  # Help function to get prediction for a specific model
def get_prediction(model, df):
    prediction = model.transform(df)
    return prediction.collect()[0]['prediction']




if __name__ == '__main__':
    app.run(port=4002)
