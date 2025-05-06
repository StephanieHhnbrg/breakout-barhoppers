import functions_framework
from flask import request, jsonify, make_response
from google.cloud import firestore

db = firestore.Client(database='barhoppers')
@functions_framework.http
def get_friends_locations(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  mail = request.args.get("user")
  user = find_user_by_mail(mail)
  friends = user.get("friends", [])

  data = []
  for friend_mail in friends:
    entry = find_user_check_in(friend_mail)
    if entry:
      data.append(entry)

  return create_response(request, data)


def find_user_by_mail(mail):
  doc_ref = db.collection('users').document(mail)
  doc = doc_ref.get()

  if doc.exists:
    return doc.to_dict()
  else:
    return None


def find_user_check_in(mail):
  docs_ref = db.collection('events')
  query = docs_ref.where('guest', '==', mail)
  results = query.stream()

  # TODO should only append, if not older than x hours - not implemented for demo purposes

  for doc in results:
    user = find_user_by_mail(mail)
    print(user)
    event_data = doc.to_dict()
    print(event_data)
    bar_id = event_data.get("bar")
    print(bar_id)
    if not bar_id:
      return None
    bar = find_bar_by_id(bar_id)
    if not bar:
      return None
    return {"name": user.get("name"), "picture": user.get("picture"), "lat": bar.get("lat"), "lng": bar.get("lng")}

  return None


def find_bar_by_id(id):
  doc_ref = db.collection('bars').document(id)
  doc = doc_ref.get()

  if doc.exists:
    return doc.to_dict()
  else:
    return None


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

