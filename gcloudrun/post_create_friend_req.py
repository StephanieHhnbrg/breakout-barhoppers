import functions_framework
from flask import Flask, request, jsonify, make_response
from google.cloud import firestore


@functions_framework.http
def post_create_friend_req(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  create_friend_request(request)
  return create_response(request, {})


def create_friend_request(request):
  sender_name = request.json.get('senderName')
  sender_mail = request.json.get('senderMail')

  recipient_name = request.json.get('recipientName')
  recipient_mail = request.json.get('recipientMail')

  if not recipient_mail:
    user = find_user_by_name(recipient_name)
    if user:
      recipient_mail = user["email"]
    else:
      raise ValueError("Recipient mail not provided and user not found by name")

  db = firestore.Client(database='barhoppers')
  db.collection('friend_requests').add({
    "sender_name": sender_name,
    "sender_mail": sender_mail,
    "recipient_name": recipient_name,
    "recipient_mail": recipient_mail,
  })


def find_user_by_name(name):
  db = firestore.Client(database='barhoppers')
  docs_ref = db.collection('users')
  query = docs_ref.where('name', '==', name).limit(1)
  results = query.stream()

  user_doc = next(results, None)
  if user_doc:
    user_data = user_doc.to_dict()
    return user_data
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

