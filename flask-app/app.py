from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(port=4001)
