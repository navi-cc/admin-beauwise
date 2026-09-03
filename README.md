# 🚀 BeauWise: Web Admin Client

> **BeauWise** is an AI-powered cosmetic ingredient analysis and suitability assessment system. It uses OCR and Large Language Models (LLMs) to scan product labels, evaluate ingredient safety,
> and recommend alternatives tailored to a user's specific facial skin and hair profile.
>
> Beauwise is implemented for everyday consumers to make safe, informed decisions by decoding complex ingredient lists.
> Grounded in verified dermatological science rather than brand marketing,
> it minimizes the trial and error of finding suitable cosmetics, acts as an educational tool for skincare professionals,
> and promotes industry transparency by highlighting FDA-compliant products.
>
> **Core Features**
>
> - **Ingredient Scanning (OCR):** Extracts text directly from physical product labels.
> - **AI-Assisted Analysis:** Leverages LLMs to evaluate the safety, suitability, and purpose of extracted ingredients.
> - **Personalized Recommendations:** Uses content-based filtering to suggest alternative active ingredients aligned with the user's personal skin and hair profile.
> - **FDA Product Verification:** Checks a cosmetic product's regulatory legitimacy and notification status.
> - **Batch Code Lookup:** Determines a product's freshness and safe usage period.
> - **Educational Module:** Debunks cosmetic myths and educates users on ingredient science.
>
> Learn More: **[BeauWise](https://beauwise.tech)**

<br/>

## 🌐 Project Ecosystem

This repository is the mobile frontend of the Beauwise mobile platform. You can find the other components here:

- [Backend Server Repo](https://github.com/navi-cc/beauwise-server) - The core API and database.
- **[Web Admin Client Repo](https://github.com/navi-cc/admin-beauwise) (You are here)** - The admin web app.
- [Mobile Client Repo](https://github.com/Shelsss/Group3-BeauWise) - The android app.

<br/>

## 🛠 Tech Stack

- **Framework & Bundler:** React + Vite
- **State Management:** Zustand
- **Routing:** React Router
- **UI Components:** shadcn/ui (Tailwind CSS)
- **Backend Services:** Firebase Client SDK
- **Runtime:** Node.js (v22.19.0)

<br/>

## 📋 Prerequisites

Before running the web client locally, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v22.19.0)
- _Note: To test live data interactions, ensure your local Backend Server and Firebase Emulators are already running._

<br/>

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following keys. Reach out to the team lead for the secret values.

```ini
VITE_FIREBASE_PROJECT_ID= #...
VITE_FIREBASE_API_KEY= #...
VITE_FIREBASE_APP_ID= #...
VITE_FIREBASE_STORAGE_BUCKET_ID= #...
VITE_CDN_BEAUWISE= #...
```

<br/>

## 🔌 Connecting to the Local Firebase Emulators / Server

Locate the firebase initialization file ([`app/lib/firebase.ts`](app/lib/firebase.ts)) and update the `localIP` array with your machine's current IPv4 address:

```javascript
// Replace with your machine's actual local IP address
const localIP = ['127.0.0.1', '192.168.x.xxx', '10.xx.xx.xxx'];
connectFirestoreEmulator(db, localIP[1], 8080);
connectAuthEmulator(auth, `http://${localIP[1]}:9099`);
connectStorageEmulator(storage, localIP[1], 9199);

// Ensure the index matches your updated IP (e.g., localIP[1] for 192.168.x.xxx)
connectAuthEmulator(auth, `http://${localIP[1]}:9099`);
connectFirestoreEmulator #...
connectStorageEmulator #...
```

<br/>

## 🚀 Local Development Setup

1. Install Dependencies

```bash
npm install
```

2. Build and Start the App

```bash
npm run dev
```
