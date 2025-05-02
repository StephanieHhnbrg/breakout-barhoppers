import functions_framework
from flask import request, jsonify, make_response
from google.cloud import firestore

@functions_framework.http
def get_user_stats(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  mail = request.args.get("mail")
  user = find_user_by_mail(mail)
  stats = retrieve_event_stats(mail)

  data = {
    "friendsAdded": len(user.get('friends')),
    "barsVisited": stats.get('barsVisited'),
    "questFulfilled": stats.get('questFulfilled')
  }
  return create_response(request, data)


def find_user_by_mail(mail):
  db = firestore.Client(database='barhoppers')
  doc_ref = db.collection('users').document(mail)
  doc = doc_ref.get()

  if doc.exists:
    return doc.to_dict()
  else:
    return None


def retrieve_event_stats(user_mail):
  db = firestore.Client(database='barhoppers')
  docs_ref = db.collection('events')
  query = (docs_ref.where('guest', '==', user_mail))
  results = query.stream()

  event_count = 0
  fulfilled_quest_count = 0

  for doc in results:
    data = doc.to_dict()
    if data.get('quest'):
      fulfilled_quest_count += 1
    event_count += 1

  return {
    "barsVisited": event_count,
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
