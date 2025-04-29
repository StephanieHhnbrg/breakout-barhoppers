import functions_framework
from flask import Flask, request, jsonify, make_response
from google.cloud import firestore


app = Flask(__name__)
@functions_framework.http
def post_create_bar(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  bar_id = create_bar(request)
  add_bar_to_user(request.json.get('barkeeper_mail'), bar_id)

  return create_response(request, { barId: bar_id })


def create_bar(request):
  bar_id = "bar_" + str(hash(request.json.get('name')))

  db = firestore.Client(database='barhoppers')
  db.collection('bars').document(bar_id).set({
    'name': request.json.get('name'),
    'address': request.json.get('address'),
    'lat': request.json.get('lat'),
    'lng': request.json.get('lng'),
    'openingHours': request.json.get('openingHours'),
    'happyHours': request.json.get('happyHours'),
    'status': 'registered'
  })

  return bar_id


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

