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
    bar = doc.to_dict()
    bar["quests"] = get_quests(bar)
    result.append(bar)
  return result


def find_quest_by_id(id):
  db = firestore.Client(database='barhoppers')
  doc_ref = db.collection('quests').document(id)
  doc = doc_ref.get()

  if doc.exists:
    quest = doc.to_dict()
    quest["id"] = id
    return quest
  else:
    return None


def get_quests(bar):
  quests = bar.get("quests", [])
  result = []

  for quest_id in quests:
    quest = find_quest_by_id(quest_id)
    if quest:
      result.append(quest)
  return result


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
