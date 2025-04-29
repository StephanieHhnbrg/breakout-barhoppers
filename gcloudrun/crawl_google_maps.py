import functions_framework
from apify_client import ApifyClient
from google.cloud import firestore
from flask import request, jsonify, make_response
import re

client = os.environ["APIFY_CLIENT_ID"]

@functions_framework.http
def crawl_google_maps(request):
  if request.method == 'OPTIONS':
    return handle_cors(request)

  run_input = {
    "searchStringsArray": ["bar"],
    "locationQuery": "Dortmund, Germany",
    "maxCrawledPlacesPerSearch": 1,
    "language": "en",
  }

  run = client.actor("compass/google-maps-extractor").call(run_input=run_input)

  for item in client.dataset(run["defaultDatasetId"]).iterate_items():
    print(item)
    create_bar(item)

  return create_response(request, {})


def create_bar(item):
  bar_id = "bar_" + str(hash(item.get('title')))
  location = item.get('location', {})
  db = firestore.Client(database='barhoppers')
  db.collection('bars').document(bar_id).set({
    'name': item.get('title'),
    'address': item.get('street') + ', ' + item.get('postalCode') + ' ' + item.get('city'),
    'lat': location.get('lat'),
    'lng': location.get('lng'),
    'openingHours': transform_opening_hours(item.get('openingHours')),
    'happyHours': []
  })

  return bar_id


def transform_opening_hours(hours):
  result = []
  for h in hours:
    if h.get('hours') != 'Closed':
      day = get_weekday_number(h.get('day'))
      if h.get('hours') == 'Open 24 hours':
        start, end = 0, 0
      else:
        start, end = get_hours(h.get('hours'))
      result.append({
        "day": day,
        "start": start,
        "end": end
      })
  return result

def get_weekday_number(weekday):
  match weekday:
    case "Monday":
      return 1
    case "Tuesday":
      return 2
    case "Wednesday":
      return 3
    case "Thursday":
      return 4
    case "Friday":
      return 5
    case "Saturday":
      return 6
    case "Sunday":
      return 7


def get_hours(time_str):
  matches = re.findall(r'(\d+)(?::(\d+))?\s*(AM|PM)?', time_str, flags=re.IGNORECASE)
  if len(matches) != 2:
    raise ValueError("Expected exactly two times in the input string.")

  start_hour, start_minute, start_meridiem = matches[0]
  end_hour, end_minute, end_meridiem = matches[1]

  if not start_meridiem:
    start_meridiem = end_meridiem

  start = convert_to_24h_range(int(start_hour), int(start_minute or 0), start_meridiem)
  end = convert_to_24h_range(int(end_hour), int(end_minute or 0), end_meridiem)
  return start, end


def convert_to_24h_range(hour, minute, meridiem = 'PM'):
  if meridiem.upper() == 'AM':
    if hour == 12:
      hour = 0
  else:
    if hour != 12:
      hour += 12
  return hour + (minute / 60)



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

