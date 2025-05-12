import functions_framework
from flask import request, jsonify, make_response
from google.cloud import firestore

@functions_framework.http
def entry_func(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  # do something here

  data = {}
  return create_response(request, data)


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

