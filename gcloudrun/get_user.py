import functions_framework
from flask import Flask, request, jsonify, make_response
from google.cloud import firestore


app = Flask(__name__)
@functions_framework.http
def get_user(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  mail = request.args.get("mail")
  data = find_user_by_mail(mail)
  return create_response(request, data)


def find_user_by_mail(mail):
  db = firestore.Client(database='barhoppers')
  doc_ref = db.collection('users').document(mail)
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

