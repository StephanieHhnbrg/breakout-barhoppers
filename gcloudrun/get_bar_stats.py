import functions_framework
from flask import request, jsonify, make_response
from google.cloud import firestore


@functions_framework.http
def get_bar_stats(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  bar_id = request.args.get("id")
  data = retrieve_bar_stats(bar_id)
  return create_response(request, data)


def retrieve_bar_stats(bar_id):
  db = firestore.Client(database='barhoppers')
  docs_ref = db.collection('events')
  query = (docs_ref.where('bar', '==', bar_id))
  results = query.stream()

  event_count = 0
  unique_guests = set()
  fulfilled_quest_count = 0

  for doc in results:
    data = doc.to_dict()
    unique_guests.add(data.get('guest'))
    if data.get('quest'):
      fulfilled_quest_count += 1
    event_count += 1

  return {
    "checkins": event_count,
    "guests": len(unique_guests),
    "questFulfilled": fulfilled_quest_count
  }


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

