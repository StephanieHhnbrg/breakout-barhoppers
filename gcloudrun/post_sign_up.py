import functions_framework
from flask import Flask, request, jsonify, make_response
from google.oauth2 import id_token
import requests as http_requests
from google.auth.transport import requests as google_requests
import os
from cryptography.fernet import Fernet
from solana.keypair import Keypair
import base64
import binascii
from google.cloud import firestore


app = Flask(__name__)

CLIENT_ID = os.environ["GOOGLE_CLIENT_ID"]
CLIENT_SECRET = os.environ["GOOGLE_CLIENT_SECRET"]
ENCRYPTION_KEY = os.environ.get('ENCRYPTION_KEY', Fernet.generate_key()).decode() if isinstance(
  os.environ.get('ENCRYPTION_KEY', Fernet.generate_key()), bytes) else os.environ.get('ENCRYPTION_KEY', Fernet.generate_key())
cipher_suite = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)



@functions_framework.http
def authenticate_google(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  token = extract_token(request)

  try:
    idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)
    email = idinfo.get('email')

    if not email:
      return jsonify({"error": "Email not found in token"}), 400

    user = find_user_by_email(email)

    if not user:
      user = create_user({
        "email": email,
        "name": idinfo.get('name'),
      })

      print(user)
      wallet = create_wallet_for_user(user["id"])
    else:
      wallet = get_user_wallet(user["id"])

    print(wallet)
    data = {
      "mail": user["email"],
      "name": user["name"],
      "barId": user["barId"],
      "walletAddress": wallet["publicKey"],
      "accessToken": generate_token(user)
    }

    print("data")
    return create_response(request, data)

  except ValueError:
    return jsonify({"error": "Invalid token"}), 401
  except Exception as e:
    return jsonify({"error": str(e)}), 500


def extract_token(request):
  if request.json and 'token' in request.json:
    print("TOKEN BY PAYLOAD")
    return request.json.get('token')
  elif request.json and 'code' in request.json:
    code = request.json.get('code')
    return exchange_code_for_token(code).get("id_token")
  return None


def exchange_code_for_token(code):
  token_url = "https://oauth2.googleapis.com/token"

  data = {
    "code": code,
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "redirect_uri": "postmessage",
    "grant_type": "authorization_code"
  }

  response = http_requests.post(token_url, data=data)
  response.raise_for_status()
  print("TOKEN EXTRACTED BY CODE")
  return response.json()


def find_user_by_email(email):
  db = firestore.Client(database='barhoppers')
  doc_ref = db.collection('users').document(email)
  doc = doc_ref.get()

  if doc.exists:
    print("USER FOUND IN DB")
    return doc.to_dict()
  else:
    return None


def create_user(user_data):
  user_id = "user_" + str(hash(user_data["email"]))
  email = user_data["email"]

  db = firestore.Client(database='barhoppers')
  db.collection('users').document(email).set({
    "id": user_id,
    "name": user_data["name"],
    "barId": "",
    "friends": [],
    "email": email,
    "createdAt": firestore.SERVER_TIMESTAMP
  })

  print("USER CREATED")
  return {"id": user_id, "name": user_data["name"], "email": user_data["email"], "barId": ""}


def create_wallet_for_user(user_id):
  keypair = Keypair()
  public_key = str(keypair.public_key)

  private_key_bytes = keypair.secret_key
  private_key_hex = binascii.hexlify(private_key_bytes).decode('utf-8')
  encrypted_private_key = cipher_suite.encrypt(private_key_hex.encode())

  db = firestore.Client(database='barhoppers')
  db.collection('wallets').document(user_id).set({
    "userId": user_id,
    "publicKey": public_key,
    "encryptedPrivateKey": encrypted_private_key.decode(),
    "createdAt": firestore.SERVER_TIMESTAMP
  })

  print("WALLET CREATED")
  return {"publicKey": public_key, "userId": user_id}

def get_user_wallet(user_id):
  db = firestore.Client(database='barhoppers')
  doc_ref = db.collection('wallets').document(user_id)
  doc = doc_ref.get()

  if doc.exists:
    return doc.to_dict()
  else:
    return None


def generate_token(user):
  # TODO
  print("NEW TOKEN GENERATED")
  return "sample_token_for_" + user["id"]


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

