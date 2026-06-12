
# Claude Chatbot (Groq Edition)

A fast, free chatbot powered by Groq's API using LLaMA 3.3 70B.

## Setup

1. Open `js/app.js`
2. Replace `YOUR_GROQ_API_KEY_HERE` on line 2 with your Groq API key:
   ```js
   const API_KEY = "gsk_";
   ```
3. Open `index.html` in a browser or serve with a local server.


## Getting a FREE Groq API Key

1. Go to https://console.groq.com
2. Sign up (free, no credit card needed)
3. Go to **API Keys** → **Create API Key**
4. Copy and paste it into `js/app.js`

## Running Locally

```bash
cd chatbot
npx serve .
# then open http://localhost:3000
```

Or just double-click `index.html`.

## Model

Uses `llama-3.3-70b-versatile` by default — fast and highly capable.
You can change it in `js/app.js` line 3. Other free Groq models:
- `llama-3.1-8b-instant` (fastest)
- `mixtral-8x7b-32768` (long context)
- `gemma2-9b-it` (Google Gemma)
=======
# Zeno-Chatbot
An AI-powered chatbot developed to enhance my skills in Python, API integration, and conversational AI. Built with the Groq API, this project focuses on delivering natural and interactive user conversations while exploring real-world chatbot development concepts.

