import functions_framework
from flask import Flask, request, jsonify, make_response
from google.cloud import firestore


app = Flask(__name__)
@functions_framework.http
def post_accept_friend_req(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  if request.json.get('accepted'):
    accept_friend_request(request)
  delete_friend_request(request)

  return create_response(request, {})


def accept_friend_request(request):
  recipient = request.json.get('recipient', {})
  recipient_mail = recipient.get('mail')
  sender = request.json.get('sender', {})
  sender_mail = sender.get('mail')
  addFriendToUser(sender_mail, recipient_mail)
  addFriendToUser(recipient_mail, sender_mail)

def addFriendToUser(user_mail, friend_mail):
  db = firestore.Client(database='barhoppers')
  doc_ref = db.collection('users').document(user_mail)
  doc_ref.update({
    'friends': firestore.ArrayUnion([friend_mail])
  })


def delete_friend_request(request):
  db = firestore.Client(database="barhoppers")

  docs = db.collection('friend_requests') \
    .where('sender_mail', '==', request.json.get('sender.mail')) \
    .where('recipient_mail', '==', request.json.get('recipient.mail')) \
    .stream()

  for doc in docs:
    doc.reference.delete()


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

