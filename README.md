
# 🧠 BiasCheck – AI-Powered Job Description Bias Detector

BiasCheck is a full-stack web application that detects **bias in job descriptions** using a trained machine learning model. Built with **FastAPI** and **React + Vite**, it integrates **Firebase Auth** and **Firestore** to deliver a secure, feature-rich user experience.

---

## 🚀 Features

- 🔐 **User Authentication** (Firebase Email/Password)
- 📑 **Bias Detection Engine** using trained ML model
- 🔄 **Job Description Submission** and analysis
- 💾 **Firestore Integration** to save and view past analyses
- 🧠 Supports detection of:
  - Gender Bias
  - Racial Bias
  - Age Bias
  - Ableist Language
  - Cultural/Socioeconomic Bias
- 🛡️ Protected routes for authenticated users
- 🌐 Deployed-ready for Vercel/Netlify (frontend) and Render/Heroku (backend)

---

## 🧰 Tech Stack

| Layer        | Tech Used                       |
|--------------|---------------------------------|
| Frontend     | React.js + Vite + Tailwind CSS  |
| Backend      | FastAPI (Python)                |
| ML Model     | scikit-learn + joblib           |
| Auth & DB    | Firebase Auth + Firestore       |
| Deployment   | Vercel, Render, Heroku, Firebase |

---

## 📁 Folder Structure

```
BiasCheck/
│
├── client/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI
│   │   ├── pages/           # Auth & Analysis Pages
│   │   ├── services/        # Firebase & API integration
│   │   ├── config/          # firebase.js config
│   │   └── App.jsx
│   └── index.html
│
├── server/                  # Backend (FastAPI)
│   ├── main.py              # FastAPI entry point
│   ├── model_loader.py      # Load & use ML model
│   ├── schema.py            # Pydantic models
│   └── requirements.txt
│
├── model/
│   └── bias_model.pkl       # Trained ML model (joblib)
│
├── data/
│   ├── biascheck_dataset.csv      # Raw data
│   ├── gender_label_words.csv     # Word lexicon
│   └── stopwords.txt              # (Optional)
│
└── README.md
```

---

## 🔧 Setup & Run Locally

### 📦 1. Clone the Repository

```bash
git clone https://github.com/alenroy10/BiasCheck.git
cd BiasCheck
```

---

### 🖥️ 2. Backend – FastAPI

```bash
cd server
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

- Runs on: [http://localhost:8000](http://localhost:8000)

---

### 🌐 3. Frontend – React + Vite

```bash
cd client
npm install
npm run dev
```

- Runs on: [http://localhost:5173](http://localhost:5173)

---

### 🔥 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project (e.g., `BiasCheck`)
3. Go to **Project Settings > General > Web App** → Get Firebase config
4. Replace `client/src/config/firebase.js` with:

```js
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "XXXXXXX",
  appId: "APP_ID"
};
```

5. Enable Firebase **Authentication** → Sign-in Method → Enable **Email/Password**
6. Enable **Cloud Firestore** → Start in test mode

---

## 🧠 Machine Learning Model Details

- Model: `LogisticRegression` (scikit-learn)
- Training data: `biascheck_dataset.csv`
- Labels: Biased (1), Unbiased (0)
- Preprocessing:
  - Stopword removal
  - Lemmatization
  - TF-IDF vectorization
- Lexical analysis: Uses `gender_label_words.csv` for word-level insights

---

## 🔌 API Endpoints (FastAPI)

| Method | Endpoint        | Description                |
|--------|------------------|----------------------------|
| POST   | `/analyze`       | Analyze job description    |
| GET    | `/health`        | Health check (returns 200) |

### Example `POST /analyze`:

#### Request:
```json
{
  "text": "We’re looking for a young, energetic male developer..."
}
```

#### Response:
```json
{
  "prediction": "biased",
  "score": 0.92,
  "bias_types": ["gender", "age", "culture"],
  "highlighted": ["young", "male", "energetic"]
}
```

---

## 🧪 Sample Data

### ✅ Sample Unbiased JD
> We are seeking a software engineer with 2+ years of experience, strong communication skills, and a team-oriented mindset.

### ❌ Sample Biased JD
> We're looking for a young, aggressive male coder who can work 12-hour days. No family distractions.

---

## 🔐 Firestore Structure

```plaintext
users (collection)
 └── userId (document)
     └── analyses (subcollection)
         └── autoId (document)
             ├── text: "Job desc..."
             ├── result: "biased"
             ├── types: [gender, age]
             └── timestamp: 2025-07-11
```

---

## 📸 Screenshots

> Add these manually:
- 📥 Login/Register Page
- 🧠 Bias Analysis Result
- 📂 History Section
- 🧾 Firestore Dashboard

---

## 🚀 Deployment

### Frontend (Vercel/Netlify):
- Connect repo → Auto deploy `client/` folder

### Backend (Render):
- Use `server/` as root
- Set build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port 10000`

---

## 🛠️ Future Improvements

- 🔍 Word-level bias heatmaps
- 🗣️ Voice input for job descriptions
- 🌍 Multilingual bias detection
- 🧾 PDF/Docx upload and scan
- 🎯 Admin panel for moderation

---

## 🤝 Contributing

1. Fork the repo
2. Create a new branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License © 2025 BiasCheck Team

---

## 🙋‍♂️ Maintainer

Built by **Alen Roy**  
📧 alen@example.com (Replace with your contact)  
🔗 [LinkedIn](https://www.linkedin.com/in/alen-roy10/)
