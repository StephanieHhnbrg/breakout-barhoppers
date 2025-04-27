import functions_framework
from flask import Flask, request, jsonify, make_response
from google.cloud import firestore


app = Flask(__name__)
@functions_framework.http
def post_update_bar(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  update_bar(request)

  return create_response(request, {})


def update_bar(request):
  bar_id = request.json.get('id')

  db = firestore.Client(database='barhoppers')
  doc_ref = db.collection('bars').document(bar_id)
  doc_ref.update({
    'name': request.json.get('name'),
    'address': request.json.get('address'),
    'lat': request.json.get('lat'),
    'lng': request.json.get('lng'),
    'openingHours': request.json.get('openingHours'),
    'happyHours': request.json.get('happyHours')
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

