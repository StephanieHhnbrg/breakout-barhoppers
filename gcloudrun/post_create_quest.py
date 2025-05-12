import functions_framework
from flask import request, jsonify, make_response
from google.cloud import firestore

@functions_framework.http
def post_create_quest(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  bar_id = request.json.get('barId')
  quest_id = request.json.get('id')
  if quest_exist(quest_id):
    update_quest(request)
  else:
    create_quest(request)
    add_quest_to_bar(bar_id, quest_id)

  return create_response(request, {})


def quest_exist(quest_id):
  db = firestore.Client(database='barhoppers')
  doc_ref = db.collection('quests').document(quest_id)
  doc = doc_ref.get()
  return doc.exists


def create_quest(request):
  db = firestore.Client(database='barhoppers')
  db.collection('quests').document(request.json.get('id')).set({
    "barId": request.json.get('barId'),
    "name": request.json.get('name'),
    "description": request.json.get('description'),
    "regularDays": request.json.get('regularDays'),
    "dates": request.json.get('dates'),
    "startHour": request.json.get('startHour'),
    "endHour": request.json.get('endHour'),
    "createdAt": firestore.SERVER_TIMESTAMP
  })

def update_quest(request):
  db = firestore.Client(database='barhoppers')
  doc_ref = db.collection('quests').document(request.json.get('id'))
  doc_ref.update({
    "name": request.json.get('name'),
    "description": request.json.get('description'),
    "regularDays": request.json.get('regularDays'),
    "dates": request.json.get('dates'),
    "startHour": request.json.get('startHour'),
    "endHour": request.json.get('endHour'),
    "createdAt": firestore.SERVER_TIMESTAMP
  })

def add_quest_to_bar(bar_id, quest_id):
  db = firestore.Client(database='barhoppers')
  doc_ref = db.collection('bars').document(bar_id)
  doc_ref.update({
    'quests': firestore.ArrayUnion([quest_id])
  })

ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'https://stephaniehhnbrg.github.io'
]


def get_allowed_origin(request):
  origin = request.headers.get('Origin', '')
  if origin in ALLOWED_ORIGINS:
    return origin
  return ALLOWED_ORIGINS[0]


def handle_cors(request):
  response = make_response()
  response.status_code = 204
  response.headers['Access-Control-Allow-Origin'] = get_allowed_origin(request)
  response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
  return response


def create_response(request, data):
  response = make_response(jsonify(data))
  response.status_code = 200
  response.headers['Access-Control-Allow-Origin'] = get_allowed_origin(request)
  return response

