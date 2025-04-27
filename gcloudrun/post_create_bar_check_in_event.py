import functions_framework
from flask import Flask, request, jsonify, make_response
from google.cloud import firestore


app = Flask(__name__)
@functions_framework.http
def post_create_bar_check_in_event(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  create_event(request)

  return create_response(request, { barId: bar_id })


def create_event(request):
  db = firestore.Client(database='barhoppers')
  db.collection('events').add({
    'bar': request.json.get('bar'),
    'quest': request.json.get('quest'),
    'guest': request.json.get('user')
  })

def add_bar_to_user(barkeeper_mail, bar_id):
  db = firestore.Client(database='barhoppers')
  doc_ref = db.collection('users').document(barkeeper_mail)
  doc_ref.update({
    'barId': bar_id,
  })

ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'https://stephaniehhnbrg.github.io'
]


def handle_cors(request):
  response = make_response()
  response.status_code = 204
  origin = request.headers.get('Origin')
  if origin in ALLOWED_ORIGINS:
    response.headers['Access-Control-Allow-Origin'] = origin
  response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
  return response


def create_response(request, data):
  response = make_response(jsonify(data))
  response.status_code = 200
  origin = request.headers.get('Origin')
  if origin in ALLOWED_ORIGINS:
    response.headers['Access-Control-Allow-Origin'] = origin
  return response

