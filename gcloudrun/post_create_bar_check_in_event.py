import functions_framework
from flask import request, jsonify, make_response
from google.cloud import firestore


@functions_framework.http
def post_create_bar_check_in_event(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  create_event(request)

  return create_response(request, {})


def create_event(request):
  db = firestore.Client(database='barhoppers')
  db.collection('events').add({
    'bar': request.json.get('bar'),
    'quest': request.json.get('quest'),
    'guest': request.json.get('user'),
    'createdAt': firestore.SERVER_TIMESTAMP
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

