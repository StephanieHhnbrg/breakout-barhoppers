import functions_framework
from flask import Flask, request, jsonify, make_response
from google.cloud import firestore


@functions_framework.http
def get_friends_of_user(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  mail = request.args.get("user")
  user = find_user_by_mail(mail)

  accepted_friends = get_accepted_friends_of_user(user)
  pending_friends = get_friends_requests_of_user(user)
  data = accepted_friends + pending_friends

  return create_response(request, data)


def find_user_by_mail(mail):
  db = firestore.Client(database='barhoppers')
  doc_ref = db.collection('users').document(mail)
  doc = doc_ref.get()

  if doc.exists:
    return doc.to_dict()
  else:
    return None


def get_accepted_friends_of_user(user):
  friends = user.get("friends", [])
  result = []

  for friend_mail in friends:
    friend = find_user_by_mail(friend_mail)
    data = {
      "mail": friend_mail,
      "name": friend.get("name"),
      "picture": friend.get("picture"),
      "status": ""
    }
    result.append(data)
  return result

def get_friends_requests_of_user(user):
  mail = user.get("email")
  db = firestore.Client(database='barhoppers')
  sent_requests = db.collection('friend_requests') \
    .where('sender_mail', '==', mail) \
    .stream()
  received_requests = db.collection('friend_requests') \
    .where('recipient_mail', '==', mail) \
    .stream()

  result = []
  for doc in sent_requests:
    data = doc.to_dict()
    r = {
      "status": "pending",
      "mail": data.get("recipient_mail"),
      "name": data.get("recipient_name")
    }
    result.append(r)

  for doc in received_requests:
    data = doc.to_dict()
    r = {
      "status": "requested",
      "mail": data.get("sender_mail"),
      "name": data.get("sender_name")
    }
    result.append(r)

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

