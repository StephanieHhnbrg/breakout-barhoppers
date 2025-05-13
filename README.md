# Barhoppers

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?color=blue)](./LICENSE.md)
[![Angular](https://img.shields.io/badge/Angular-%23DD0031.svg?logo=angular&logoColor=white)](https://angular.dev/)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=fff)](https://www.python.org/)

### 📌 Introduction
This project is the main contribution to the [Breakout Challenge of Jägermeister](https://earn.superteam.fun/listing/jagermeister-side-track/) 

Recent [statistics](https://www.edwardconard.com/macro-roundup/jburnmurdoch-notes-in-the-us-and-uk-young-people-are-spending-about-2-hours-more-time-alone-per-day-in-2023-than-in-2010-time-spent-alone-is-strongly-associated-with-lower-life-satisfactio/?view=detail) show that younger generations are socializing less with their peers.
As the first to grow up fully immersed in the digital world, many of their interactions now happen online rather than in person.

*Barhoppers* aims to bridge that gap by turning real-life socializing into a game. 
Built on Solana, the app creates a fun, gamified barhopping experience where users earn tokens and NFTs by visiting bars, scanning QR codes, and completing unique quests with friends.

When users earn more than 50 tokens, they can redeem them for vouchers to unlock exclusive happy hour deals at participating bars.
Additionally, users can collect unique achievement NFTs by reaching key milestones:
* Pub Pioneer - by visiting 15 bars 
* Quest Explorer - by completing 3 quests 
* Social Butterfly - by adding 5 friends to their barhopping crew

### 🧩 Main components in the Frontend
* Login: User authentication via Google Account
* Welcome Screen: Initial Greeting and displaying user's tokens, nfts and vouchers
* Map: Interactive map to explore nearby bars, available quests and friends locations.
* QR Scanner: Scans QR codes for check-ins at bar, quests, and friend requests.
* Friend Management: View and add friends using usernames or QR codes, and share invite links.
* Bar Administration: Manage bar details, update offers and quests, and view statistics.


### 🏃‍Google CloudRun Endpoint
| Method | Endpoint                       | Params/Body                                                                                 | Description                                                                                               |
|--------|--------------------------------|---------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| GET    | get_bar_by_id                  | id                                                                                          | retrieving bar details for its administration by barkeepers                                               |
| POST   | post_update_bar                | `Bar`                                                                                       | updating opening hours and happy hours of a bar                                                           |
| POST   | post_creat_quest               | `Quest`                                                                                     | creating unique quests linked to a bar                                                                    |
| GET    | get_bar_stats                  | id                                                                                          | retrieving bar statistics about guests, check-ins and quests                                              |
| GET    | get_bars_by_loc                | lat, lng                                                                                    | retrieving all bars of a city to display on the map component                                             |
|        |                                |                                                                                             |                                                                                                           |
| POST   | post_sign_up                   | token/code                                                                                  | signing in users via Google account authentication, solana wallet creation for new users                  |
|        |                                |                                                                                             |
| GET    | get_friends_of_user            | mail                                                                                        | retrieving friends of users (accepted and pending requests)                                               |
| GET    | get_friends_locations          | mail                                                                                        | retrieving friends locations, based of recent fulfilled bar quests to display on the map component        |
| POST   | post_create_friend_req         | `{ senderName: string, senderMail: string, recipientName: string, recipientMail?: string }` | create friend request                                                                                     |
| POST   | post_update_friend_req         | `{ sender: {mail: string}, recipient: {mail: string}, accepted: boolean}`                   | accept or delete friend request                                                                           |
|        |                                |                                                                                             |
| POST   | post_create_bar_check_in_event | `{ bar: string, quest: string, user: string}` - corresponding ids/mail                      | check in into a bar or quest                                                                              |
| GET    | get_user_stats                 | mail                                                                                        | retrieving user statistics (#barsVisited, #questFulfilled, #friendsMade) to validate eligibility for nfts | 



### 🔥 Firestore Collections
| Collection      | Fields                                                                                 | 
|-----------------|----------------------------------------------------------------------------------------|
| users           | id, email, name, picture, friends, barId, createdAt                                    |
| wallets         | userId, publicKey, encryptedPrivateKey, createdAt                                      |
| bars            | name, address, lat, lng, openingHours, happyHours, quests, status (crawled/registered) |
| quests          | barId, name, description, dates, regularDays, startHour, endHour, createAt             |
| friend_requests | sender_name, sender_mail, recipient_name, recipient_mail                               |
| events          | bar, quest, quest, createdAt                                                           |


### 🛠️ Local Setup
This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.7. \
The live version is deployed as a <a href='https://stephaniehhnbrg.github.io/breakout-barhoppers/' target='_blank'>Github Page</a>.

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

#### Local Frontend Setup
- Install dependencies: `npm install`
- Copy `environment.ts` as `environment.local.ts`and replace the placeholders
  - `MINT_ADDRESS` - used in the [wallet service](./src/app/services/wallet.service.ts) for the token generation
  - `WALLET_CRYPTO_PASSPHRASE` - also used in the [backend](./gcloudrun/post_sign_up.py) for the encryption of users wallet key pairs
  - `PAYER_SECRET_KEY` - base64 formatted secret key from a generated solana KeyPair 
  - `GOOGLE_LOGIN_ID` - used for the login with google accounts
- Start project: `npm run start`

### 🔗 Related Links
* [live version of Barhoppers](https://stephaniehhnbrg.github.io/breakout-barhoppers/)
* [pitch slides](https://docs.google.com/presentation/d/e/2PACX-1vSHz2XZIdQOxO39GWxpvX7bx-l9ryhU_8-2xUzroo3N1vIxa13zAL_C-TwWOvP2CPBkYotghNw_GR8d/pub?start=true&loop=true&delayms=10000)
* [hackathon description](https://earn.superteam.fun/listing/jagermeister-side-track/)
* [set-up guide](https://medium.com/@stephaniematata65/build-deploy-generate-an-end-to-end-gcp-ai-setup-897e1c55ad6b)
