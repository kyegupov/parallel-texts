#!/usr/bin/env python3

from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/")
def index():
    return app.send_static_file('index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return app.send_from_directory('static', path)
