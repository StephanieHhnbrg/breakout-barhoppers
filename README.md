# Barhoppers

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?color=blue)](./LICENSE.md)
[![Angular](https://img.shields.io/badge/Angular-%23DD0031.svg?logo=angular&logoColor=white)](https://angular.dev/)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=fff)](#)

### 📌 Introduction
This project is the main contribution to the [Breakout Challenge of Jägermeister](https://earn.superteam.fun/listing/jagermeister-side-track/)  \

// TODO


### 🧩 Main components in the Frontend
* Login & Welcome Screen: User authentication and initial greeting.
* Map: Interactive map to explore nearby bars and available quests.
* QR Scanner: Scans QR codes for check-ins at bar, quests, and friend requests.
* Friend Management: View and add friends using usernames or QR codes, and share invite links.
* Bar Administration: Manage bar details, update offers and quests, and view statistics.


### 🏃‍Google CloudRun Endpoint
| Method | Endpoint                       | Params/Body                                                                        | PDescription |
|--------|--------------------------------|------------------------------------------------------------------------------------|--------------|
| GET    | get_bar_by_id                  | id                                                                                 | -            |
| POST   | post_create_bar                | `Bar`                                                                              | -            |
| POST   | post_update_bar                | `Bar`                                                                              | -            |
| GET    | get_bar_stats                  | id                                                                                 | -            |
| GET    | get_bars_by_loc                | lat, lng                                                                           | -            |
|        |                                |                                                                                    |              |
| POST   | post_sign_up                   | token/code                                                                         | -            |
|        |                                |                                                                                    |
| GET    | get_friends_of_user            | mail                                                                               | -            |
| POST   | post_create_friend_req         | `{ sender: {name: string, mail: string}, recipient: {name: string, mail: string}}` | -            |
| POST   | post_update_friend_req         | `{ sender: {mail: string}, recipient: {mail: string}, accepted: boolean}`          | -            |
|        |                                |                                                                                    |
| POST   | post_create_bar_check_in_event | `{ bar: string, quest: string, user: string}` - corresponding ids/mail             | -            |


### 🔥 Firestore Collections
| Collection      | Fields                                                   | Description |
|-----------------|----------------------------------------------------------|-------------|
| users           | id, email, name, friends, barId, createdAt               | -           |
| wallets         | userId, publicKey, encryptedPrivateKey, createdAt        | -           |
| bars            | name, adress, lat, lng, openingHours, happyHours, quests | -           |
| friend_requests | sender_name, sender_mail, recipient_name, recipient_mail | -           |
| events          | bar, quest, quest                                        | -           |


### 🛠️ Local Setup
This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.7. \
The live version is deployed as a <a href='https://stephaniehhnbrg.github.io/breakout-barhoppers/' target='_blank'>Github Page</a>.

#### Run locally
- Install dependencies: `npm install`
- Start project: `npm run start`


#### Gcloud Run Setup
For each python script in the [gcloudrun direction](./gcloudrun), do as follow:
1. Go to [GCloud Run console](https://console.cloud.google.com/run)
2. Click on the `(...) Write a function button`
3. Configure:
- service name
- region
- runtime: Python 3.12
- authentication: Allow unauthenticated invocations
- minimum number of instances: 1
4. Add the [python scripts](./gcloudrun) and the requirements.txt into the code editor of the Source tab
5. Deploy, then copy the endpoint from the Networking tab and update it in the [enviroment variables](./src/environments)


#### Firestore Setup
* Create a Firestore DB called `barhoppers` via [Firestore Studio](https://console.cloud.google.com/firestore/databases)
* Enable the [Firestore API](https://console.cloud.google.com/apis/dashboard)


### 🔗 Related Links
* [live version of Barhoppers](https://stephaniehhnbrg.github.io/breakout-barhoppers/)
* [hackathon description](https://earn.superteam.fun/listing/jagermeister-side-track/)
* [set-up guide](https://medium.com/@stephaniematata65/build-deploy-generate-an-end-to-end-gcp-ai-setup-897e1c55ad6b)
