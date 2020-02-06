import logging
import random
import string
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, send

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app, cors_allowed_origins="*")

globalDataBase = {}


@socketio.on('message')
def handleMessage(msg):
    logging.info(msg)
    send(msg, broadcast=True)


@app.route("/host")
def host_a_game():
    key = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    globalDataBase.update({key: {"white": True, "black": False}})
    print(globalDataBase)
    return key


@app.route("/")
def hello():
    return "Hello World! by SAURABH LONDHE"


if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0')
