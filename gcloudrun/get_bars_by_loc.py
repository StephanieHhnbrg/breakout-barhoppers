import functions_framework
from flask import Flask, request, jsonify, make_response
from google.cloud import firestore


app = Flask(__name__)
@functions_framework.http
def get_bars_by_loc(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  lat = request.args.get("lat")
  lng = request.args.get("lng")

  # for now all bars are fetch, bc we are only demoing one city, and only have data of one city in the db
  data = fetch_data()
  return create_response(request, data)

def fetch_data():
  db = firestore.Client(database='barhoppers')
  docs = db.collection('bars').stream()

  result = []
  for doc in docs:
    data = doc.to_dict()
    result.append(data)
  return result


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
  response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
  return response


def create_response(request, data):
  response = make_response(jsonify(data))
  response.status_code = 200
  origin = request.headers.get('Origin')
  if origin in ALLOWED_ORIGINS:
    response.headers['Access-Control-Allow-Origin'] = origin
  return response

