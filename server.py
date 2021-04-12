from flask import Flask, url_for, jsonify, request, render_template, send_from_directory
from flask_cors import CORS, cross_origin
app = Flask(__name__, static_folder="build/static", template_folder="build")
CORS(app)

@app.route('/')
def hello_world():
    return "Hello, World! For Camel Flask Server"

@app.route("/index.html")
def home():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=12345)