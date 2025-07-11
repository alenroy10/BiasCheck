import os
import sys
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore, auth

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.bias_features import BiasWordFeatures
from textblob import TextBlob

# Initialize Firebase Admin SDK
try:
    # Try to load the service account key with absolute path
    firebase_key_path = os.path.join(os.path.dirname(__file__), 'firebase-key.json')
    cred = credentials.Certificate(firebase_key_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Firebase Admin SDK initialized successfully")
except Exception as e:
    print(f"⚠️ Firebase Admin SDK not initialized: {e}")
    print("Please add your firebase-key.json file to the server directory")
    print("⚠️ Running in demo mode - authentication disabled")
    db = None

# Paths
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../model/bias_model.pkl')
GENDER_WORDS_PATH = os.path.join(os.path.dirname(__file__), '../data/corrected_gender_dataset.csv')

# Load model
try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    model = None
    print(f"Error loading model: {e}")

# Load gender-coded words
try:
    gender_words_df = pd.read_csv(GENDER_WORDS_PATH)
    gender_words = set(gender_words_df['word'].str.lower())
except Exception as e:
    gender_words = set()
    print(f"Error loading gender-coded words: {e}")

# FastAPI app
app = FastAPI()

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to verify Firebase token
async def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        # For demo mode, allow requests without token
        if db is None:
            return "demo_user"
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        # Remove "Bearer " prefix
        token = authorization.replace("Bearer ", "")
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception as e:
        # For demo mode, allow requests with any token
        if db is None:
            return "demo_user"
        raise HTTPException(status_code=401, detail="Invalid token")

class AnalyzeRequest(BaseModel):
    text: str

class BiasWord(BaseModel):
    word: str
    label: str
    bias_type: str
    context_notes: str

class AnalyzeResponse(BaseModel):
    label: str
    probabilities: Dict[str, float]
    bias_words: List[BiasWord]
    sentiment: Dict[str, float]
    summary: str

class HistoryResponse(BaseModel):
    id: str
    text: str
    label: str
    timestamp: str
    bias_count: int

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest, user_id: str = Depends(verify_token)):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded.")
    
    text = request.text
    
    # Predict
    pred = model.predict([text])[0]
    proba = model.predict_proba([text])[0]
    classes = model.classes_
    probabilities = {cls: float(p) for cls, p in zip(classes, proba)}
    
    # Bias-coded words detection (all types)
    found_words = []
    text_lower = text.lower()
    for _, row in gender_words_df.iterrows():
        word = str(row['word']).lower()
        if word in text_lower:
            found_words.append(BiasWord(
                word=row['word'],
                label=row['label'],
                bias_type=row['bias_type'],
                context_notes=row['context_notes']
            ))
    
    # Sentiment
    blob = TextBlob(text)
    sentiment = {
        'polarity': blob.sentiment.polarity,
        'subjectivity': blob.sentiment.subjectivity
    }
    
    # Summary
    summary = f"Label: {pred}. Polarity: {sentiment['polarity']:.2f}, Subjectivity: {sentiment['subjectivity']:.2f}. Found {len(found_words)} bias-coded words."
    
    # Save to Firestore if available and user is authenticated
    if db and user_id != "demo_user":
        try:
            analysis_data = {
                'user_id': user_id,
                'text': text,
                'label': pred,
                'probabilities': probabilities,
                'bias_words': [word.dict() for word in found_words],
                'sentiment': sentiment,
                'summary': summary,
                'timestamp': datetime.now().isoformat()
            }
            db.collection('users').document(user_id).collection('analyses').add(analysis_data)
            print(f"✅ Analysis saved for user {user_id}")
        except Exception as e:
            print(f"⚠️ Failed to save analysis: {e}")
    elif user_id == "demo_user":
        print("ℹ️ Demo mode - analysis not saved to history")
    
    return AnalyzeResponse(
        label=pred,
        probabilities=probabilities,
        bias_words=found_words,
        sentiment=sentiment,
        summary=summary
    )

@app.get("/history", response_model=List[HistoryResponse])
async def get_history(user_id: str = Depends(verify_token)):
    if not db:
        # Demo mode - return sample data
        demo_history = [
            HistoryResponse(
                id="demo-1",
                text="We are seeking a strong craftsman to join our team. The ideal candidate should be a recent graduate with 5+ years of experience...",
                label="biased",
                timestamp="2024-01-15T10:30:00Z",
                bias_count=3
            ),
            HistoryResponse(
                id="demo-2", 
                text="Looking for a dynamic team player who can work long hours and handle pressure. Must be young and energetic...",
                label="toxic",
                timestamp="2024-01-14T14:20:00Z",
                bias_count=2
            ),
            HistoryResponse(
                id="demo-3",
                text="Seeking qualified candidates with excellent communication skills and strong analytical abilities...",
                label="neutral", 
                timestamp="2024-01-12T09:15:00Z",
                bias_count=0
            )
        ]
        return demo_history
    
    try:
        # Get user's analysis history
        analyses = db.collection('users').document(user_id).collection('analyses').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(50).stream()
        
        history = []
        for doc in analyses:
            data = doc.to_dict()
            history.append(HistoryResponse(
                id=doc.id,
                text=data['text'][:100] + "..." if len(data['text']) > 100 else data['text'],
                label=data['label'],
                timestamp=data['timestamp'],
                bias_count=len(data['bias_words'])
            ))
        
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {e}")

@app.get("/dashboard")
async def get_dashboard_data(user_id: str = Depends(verify_token)):
    if not db:
        # Demo mode - return sample data
        return {
            "totalAnalyses": 0,
            "biasDetected": 0,
            "accuracy": 0,
            "biasBreakdown": {
                "gender": 0,
                "age": 0,
                "cultural": 0,
                "toxic": 0
            },
            "recentAnalyses": []
        }
    
    try:
        # Get user's analyses from Firestore
        analyses_ref = db.collection('users').document(user_id).collection('analyses')
        analyses = analyses_ref.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(10).stream()
        
        analyses_list = []
        total_bias_words = 0
        bias_breakdown = {
            "gender": 0,
            "age": 0,
            "cultural": 0,
            "toxic": 0
        }
        
        for analysis in analyses:
            analysis_data = analysis.to_dict()
            analyses_list.append({
                "id": analysis.id,
                "title": analysis_data.get('text', '')[:50] + '...' if len(analysis_data.get('text', '')) > 50 else analysis_data.get('text', ''),
                "date": analysis_data.get('timestamp', '').split('T')[0] if analysis_data.get('timestamp') else '',
                "biasCount": len(analysis_data.get('bias_words', [])),
                "status": "completed",
                "score": int(analysis_data.get('probabilities', {}).get('neutral', 0) * 100) if analysis_data.get('probabilities') else 0
            })
            
            # Count bias words by type
            for bias_word in analysis_data.get('bias_words', []):
                total_bias_words += 1
                bias_type = bias_word.get('bias_type', '').lower()
                if 'gender' in bias_type:
                    bias_breakdown["gender"] += 1
                elif 'age' in bias_type:
                    bias_breakdown["age"] += 1
                elif 'cultural' in bias_type:
                    bias_breakdown["cultural"] += 1
                elif 'toxic' in bias_type or 'competition' in bias_type:
                    bias_breakdown["toxic"] += 1
        
        # Calculate percentages for bias breakdown
        total_analyses = len(analyses_list)
        if total_analyses > 0:
            for key in bias_breakdown:
                bias_breakdown[key] = int((bias_breakdown[key] / total_analyses) * 100)
        
        return {
            "totalAnalyses": total_analyses,
            "biasDetected": total_bias_words,
            "accuracy": 94.2,  # Placeholder accuracy
            "biasBreakdown": bias_breakdown,
            "recentAnalyses": analyses_list
        }
        
    except Exception as e:
        print(f"Failed to fetch dashboard data: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard data")

@app.get("/")
def root():
    return {"message": "BiasCheck API is running."} 