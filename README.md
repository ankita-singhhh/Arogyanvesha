# 🌿 Arogyanvesha — AI-Powered Clinical & Ayurvedic Healthcare Platform

Arogyanvesha is an evidence-grounded, AI-powered health and Ayurvedic wellness platform combining:

- **Trained Machine Learning Model:** A serialized Random Forest classifier (377 symptom features, 512 candidate condition classes) predicting condition probabilities from patient-reported symptoms.
- **Multilingual AI Understanding:** Gemini AI supporting English, Hindi, and Hinglish symptom descriptions, normalizations, and empathetic clinical explanations.
- **Retrieval-Augmented Generation (RAG):** Evidence-grounded retrieval from authenticated Ministry of AYUSH CCRAS clinical referral protocols, WHO benchmarks, and NCCIH (NIH) literature.
- **Ayurvedic Prakriti Personalization:** Body constitution (Vata, Pitta, Kapha) assessment, seasonal Ritu alignments, Ahara (diet), and Vihara (lifestyle) guidance.
- **Full-Stack Application:** Next.js 16 + React 19 + TypeScript frontend with Supabase authentication, activity tracking, and AI Vaidya chat.

> **Medical Transparency Disclaimer:** Arogyanvesha is an educational and research-support platform, not a certified clinical diagnostic device. Candidate conditions are statistical probabilities and must never be interpreted as confirmed diagnoses. Emergency safety checks run independently to intercept life-threatening situations immediately.

---

## 🏗 System Architecture

```text
User (Browser)
   │
   ▼
Next.js Frontend (App Router, TypeScript, Zustand)
   │
   ├── Authenticated Request with JWT & Rate Limiting
   ▼
Next.js API Gateway (/api/symptoms/analyze)
   │
   ├── Forward Payload
   ▼
FastAPI Python Backend (/api/v1/analyze)
   │
   ├── 1. Rule-Based Emergency Safety Interceptor (Chest pain, stroke, asphyxia)
   ├── 2. Multilingual Symptom Extraction & Normalization (Gemini AI + Alias Matcher)
   ├── 3. 377-dimensional Binary Vector Construction
   ├── 4. Random Forest Inference (512 Classes, predict_proba)
   ├── 5. RAG Retrieval from AYUSH / WHO / NCCIH Knowledge Base (112 Docs)
   └── 6. Evidence-Grounded Ayurvedic Synthesis (Gemini AI with Fallback)
   │
   ▼
Next.js API Handler
   │
   ├── Persists Analysis & Activity in Supabase Database
   ▼
Next.js Results Page (/symptoms/result)
   │
   └── Optional Continuity to AI Vaidya Chat (/chat)
```

---

## 📂 Repository Structure

```text
d:/arogyan/Arogyanvesha/
├── README.md                                  # Complete Project Documentation
├── config/
│   ├── arogyanvesha_symptom_features.json     # Exact 377 training features in order
│   ├── arogyanvesha_symptom_aliases.json      # 496 multilingual (En/Hi/Hinglish) aliases
│   └── user_profile.json                      # Reference Prakriti user profile
├── model/
│   └── arogyanvesha_random_forest_final.joblib# Trained Random Forest classifier (299 MB)
├── ayurvedic_knowledge/
│   ├── rag_documents_provenance_aware_v4.json # 112 curated & provenance-tracked passages
│   ├── rag_embeddings_v4.npy                  # Precomputed 384-d document embeddings
│   ├── source_registry.json                   # AYUSH, WHO, and NCCIH official sources
│   └── source_files/                          # Original government and WHO source documents
├── backend/
│   ├── main.py                                # FastAPI entrypoint, lifespan, CORS, /health, /ready
│   ├── requirements.txt                       # Python dependencies
│   ├── .env.example                           # Backend environment template
│   ├── app/
│   │   ├── core/                              # App config & redacting logger
│   │   ├── schemas/                           # Pydantic schemas (symptom, prediction, rag, analysis, chat)
│   │   ├── services/                          # Safety, Random Forest ML, Symptom Extractor, RAG, Gemini
│   │   └── api/v1/                            # Versioned endpoints (/symptoms, /predict, /rag, /analyze, /chat)
│   └── tests/                                 # Pytest test suite (27 automated tests)
└── Arogyanvesha_platform-main/                # Next.js 16 + React 19 Frontend
    ├── src/
    │   ├── app/(auth)/symptoms/page.tsx       # Symptom checker input & live progress
    │   ├── src/app/(auth)/symptoms/result/    # Full candidate conditions & evidence results
    │   ├── src/app/api/symptoms/analyze/      # API Gateway to FastAPI backend & Supabase
    │   ├── src/app/api/chat/                  # Chat messages route with RAG grounding
    │   └── src/stores/symptomStore.ts         # Zustand state management
    └── package.json                           # Frontend dependencies
```

---

## 🚀 Getting Started (Windows PowerShell)

### Prerequisites

- **Python 3.10+** (Tested on Python 3.13)
- **Node.js 20+** & npm
- Local clone located at `d:\arogyan\Arogyanvesha`

---

### 1. Backend Setup & Startup

1. Open PowerShell and navigate to the backend directory:
   ```powershell
   cd d:\arogyan\Arogyanvesha\backend
   ```

2. Configure environment variables:
   ```powershell
   Copy-Item .env.example .env
   ```
   *(Optional)* Add your Gemini API key inside `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
   *Note: If `GEMINI_API_KEY` is omitted, the backend will automatically operate in deterministic fallback mode with full keyword extraction and rule-grounded synthesis.*

3. Start the FastAPI server:
   ```powershell
   python -m uvicorn main:app --reload --port 8000
   ```
   - Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Liveness Check: [http://localhost:8000/health](http://localhost:8000/health)
   - Readiness Check: [http://localhost:8000/ready](http://localhost:8000/ready)

---

### 2. Frontend Setup & Startup

1. Open a second PowerShell terminal and navigate to the frontend directory:
   ```powershell
   cd d:\arogyan\Arogyanvesha\Arogyanvesha_platform-main
   ```

2. Verify or update `.env.local`:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   PYTHON_API_URL=http://127.0.0.1:8000
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=43a87b7b389d005a07973b9bcdfedfea6b97f58fabdc57dc8bf225b7bea26f2d
   NEXT_PUBLIC_SUPABASE_URL=https://prwplawfejbimyvqnovb.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sb_publishable__TBzskHpQc3ibLpJ4LSVRg_z9lZKUyV
   ```

3. Start Next.js development server:
   ```powershell
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints Reference

### 1. Readiness Probe
`GET /ready`

Checks that the Random Forest model (377 features, 512 classes) and RAG documents are active.

**Sample Response:**
```json
{
  "status": "ready",
  "model_loaded": true,
  "feature_count": 377,
  "condition_classes_count": 512,
  "rag_documents_count": 112,
  "ai_provider": "gemini"
}
```

### 2. Condition Prediction
`POST /api/v1/predict`

**Request:**
```json
{
  "symptoms": ["headache", "fever", "fatigue"],
  "top_k": 3
}
```

**Response:**
```json
{
  "status": "success",
  "recognized_symptoms": ["headache", "fever", "fatigue"],
  "candidate_conditions": [
    {
      "condition": "malaria",
      "probability": 0.38,
      "score_type": "uncalibrated_rf_probability",
      "rank": 1
    },
    {
      "condition": "typhoid",
      "probability": 0.24,
      "score_type": "uncalibrated_rf_probability",
      "rank": 2
    }
  ],
  "disclaimer": "These are model-generated candidate conditions based on a statistical Random Forest classifier, not a clinical medical diagnosis."
}
```

### 3. Multilingual Symptom Extraction
`POST /api/v1/symptoms/extract`

**Request:**
```json
{
  "text": "mujhe do din se sir dard aur bukhar hai"
}
```

**Response:**
```json
{
  "status": "success",
  "recognized_symptoms": [
    {
      "raw_term": "sir dard",
      "canonical_feature": "headache",
      "confidence": 0.95,
      "is_explicit": true
    },
    {
      "raw_term": "bukhar",
      "canonical_feature": "fever",
      "confidence": 0.95,
      "is_explicit": true
    }
  ],
  "canonical_symptoms": ["headache", "fever"],
  "requires_clarification": false
}
```

### 4. End-to-End Analysis Pipeline
`POST /api/v1/analyze`

**Request:**
```json
{
  "symptom_text": "I have had a dull headache, tiredness, and bloating since yesterday",
  "duration": "1-3 days",
  "severity": 4
}
```

**Response includes:**
- Emergency check result (`is_emergency: false`, `urgency: "low"`)
- Normalized symptoms (`["headache", "fatigue", "flatulence"]`)
- Candidate conditions from the Random Forest model
- Retrieved official passages and citations from Ministry of AYUSH & WHO
- Ayurvedic Dosha imbalance (e.g. `Vata Aggravation`)
- Traditional Ahara (diet) and Vihara (lifestyle) recommendations
- Warning signs and when to seek medical evaluation
- Clear medical disclaimer

---

## 🧪 Verification & Test Results

### Automated Test Suite (Pytest)
Run tests in `backend/`:
```powershell
python -m pytest tests -v
```
**Results:** `27 passed, 0 failed` in 45.7s.
- `test_random_forest.py` (5 tests): Model loading, 377 feature vector dimension, known inputs, empty inputs, unknown inputs.
- `test_safety.py` (6 tests): Cardiac emergency, respiratory emergency, stroke, non-emergency, pregnancy alert.
- `test_symptom_extractor.py` (4 tests): English, Hindi, Hinglish, vague clarification.
- `test_rag.py` (4 tests): Knowledge base loading, condition retrieval, query scoring, source provenance.
- `test_api_integration.py` (8 tests): `/health`, `/ready`, `/predict`, `/extract`, `/rag`, `/analyze`, emergency interception, and `/chat`.

### TypeScript Verification
```powershell
cd Arogyanvesha_platform-main
npx tsc --noEmit
```
**Results:** `0 errors` (TypeScript 5.x clean).

### Next.js Production Build
```powershell
npm run build
```
**Results:** Production build compiled successfully across all 73 routes via Turbopack.

---

## 🌐 Deployment Guidelines

- **Frontend:** Deploy `Arogyanvesha_platform-main` to **Vercel** or any Node.js hosting platform. Configure environment variables in the project settings (`NEXT_PUBLIC_SUPABASE_URL`, `PYTHON_API_URL`, etc.).
- **Backend:** Deploy `backend/` as a containerized service (Docker) or web service on **Railway**, **Render**, or **Fly.io** with at least 1 GB RAM to accommodate the 299 MB Random Forest model in memory.
- **Model Artifacts & RAG Files:** Ensure `model/` and `ayurvedic_knowledge/` directories are accessible to the container at runtime.
