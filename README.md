# Korean-Pronunciation-Challenge# Korean Pronunciation Challenge

This project is a web application that presents a sentence to the user, records the user reading it, and evaluates pronunciation accuracy via the ETRI Pronunciation API, displaying a score from 1 to 5 (rounded to one decimal place).

---

<img width="464" alt="image" src="https://github.com/user-attachments/assets/68427e8a-b243-4b38-8954-56d084fd7fbe" />


## Key Features

- **Random Sentence Presentation**  
  The backend returns one random sentence from a predefined list.
- **Recording & Submission**  
  The React frontend records the user’s voice at 16 kHz, converts WAV → PCM, encodes as Base64, and sends to the server.
- **ETRI API Integration**  
  The backend calls ETRI’s `PronunciationKor` API to obtain recognized text and a pronunciation score.
- **Score Processing**  
  The returned score is rounded to one decimal place before display.
- **Responsive UI with Tailwind CSS**  
  Styled using the `@tailwindcss/vite` plugin for a modern, responsive design.

---

## Installation & Running

```bash
# Frontend
git clone <repo-url>
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
# Create .env file with your ETRI API key:
# ETRI_API_KEY=<your_key>
npm start
```

Visit:
- Frontend: http://localhost:5173
- Backend:  http://localhost:3000

---

## Architecture

```
[React Frontend] <--(API)--> [Express Backend] <--(HTTP REST)--> [ETRI Pronunciation API]
```

### Frontend Workflow

1. **Fetch Sentence**  
   On component mount, call `GET /api/randomSentence` to retrieve a random prompt.
2. **Record Audio**  
   Use the `MediaRecorder` API to record user speech.
3. **Convert to PCM**  
   - Blob → ArrayBuffer → AudioBuffer → WAV  
   - Strip the first 44 bytes (WAV header) to obtain raw 16 kHz PCM data
4. **Base64 Encoding**  
   Convert the PCM buffer to a Base64 string.
5. **Send to Backend**  
   `POST /api/evaluate` with JSON payload: `{ script, audio }`.
6. **Display Score**  
   Round the backend’s `score` to one decimal and render on screen.

### Backend Workflow

1. **Routes**  
   - `GET /api/randomSentence`: Returns one sentence from a list.  
   - `POST /api/evaluate`: Receives `{ script, audio }`.
2. **Build ETRI Request**  
   ```json
   {
     "access_key": process.env.ETRI_API_KEY,
     "argument": {
       "language_code": "korean",
       "script": "<user_script>",
       "audio": "<Base64_audio>"
     }
   }
   ```
3. **API Call**  
   `POST http://aiopen.etri.re.kr:8000/WiseASR/PronunciationKor`
4. **Parse & Round**  
   Extract `return_object.score`, convert to Number, round to one decimal.
5. **Respond to Client**  
   Return JSON: `{ score: 3.5 }`.

---

## Environment Variables (backend/.env)

```env
ETRI_API_KEY=your_etri_access_key
PORT=3000
```

---

## Tailwind CSS Setup

1. **Install Plugin**  
   ```bash
   npm install tailwindcss @tailwindcss/vite --save-dev
   ```
2. **Vite Configuration**  
   ```js
   // vite.config.mjs
   import { defineConfig } from 'vite';
   import react       from '@vitejs/plugin-react';
   import tailwindcss from '@tailwindcss/vite';

   export default defineConfig({
     plugins: [react(), tailwindcss()],
   });
   ```
3. **Import Styles**  
   ```css
   /* src/styles.css */
   @import "tailwindcss";
   ```
4. **Include in App**  
   ```js
   // src/main.jsx
   import './styles.css';
   ```

---

## Folder Structure

```
backend/
├─ index.js
├─ package.json
├─ .env
└─ routes/
    ├─ randomSentence.js
    └─ evaluate.js

frontend/
├─ src/
│  ├─ components/
│  │  └─ Recorder.jsx
│  ├─ styles.css
│  ├─ main.jsx
│  └─ App.jsx
├─ tailwind.config.js
├─ vite.config.mjs
├─ package.json
└─ postcss.config.cjs
```

---

## Future Improvements

- **API Limit Handling**: Consider caching or self-hosted models to bypass the 1,000 calls/day limit.
- **Enhanced Error Handling**: More robust backend and frontend error messaging.
- **UI/UX Enhancements**: Recording indicators, score history, and accessibility features.
- **AR Camera Integration**: Integrate an AR camera overlay on the frontend to visually guide users during pronunciation challenges.
- **Animations & Branding**: Add interactive animations resembling English brand pronunciation challenges to enhance user engagement and feedback.

---

