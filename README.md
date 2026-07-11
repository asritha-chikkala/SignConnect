# 🚀 SignConnect - AI-Powered Indian Sign Language Translator

> Breaking communication barriers with real-time ISL translation, 3D
> avatar signing, and AI-powered learning.

------------------------------------------------------------------------

## 📌 Problem & Domain

**The Problem:** India has over **5 million deaf individuals** but only
**250 certified sign language interpreters** - that's **1 interpreter
for every 20,000 deaf people**. This massive gap leaves the Deaf
community isolated from education, healthcare, and daily communication.

**Our Solution:** SignConnect is an AI-powered platform that provides
**real-time two-way communication** between hearing and deaf individuals
through Indian Sign Language (ISL).

**Themes Selected:** - ✅ **Human Experience & Productivity** -
Accessibility technology improving quality of life - ✅ **Learning &
Knowledge Systems** - AI-powered ISL education platform - ✅
**HealthTech & Bio Platforms** - Enabling better healthcare
communication

------------------------------------------------------------------------

## 🎯 Objective

**Target Users:** - Deaf and hard-of-hearing individuals in India - Sign
language learners and interpreters - Healthcare providers, educators,
and public service workers - Families of deaf individuals

**The Pain Point:** - Only 250 certified interpreters for 5M+ deaf
individuals - No accessible real-time translation tools for ISL -
Limited resources for learning ISL - Communication barriers in
emergencies, healthcare, and education

**Our Solution:** - **Speech-to-Sign:** Real-time translation from
English to ISL with 3D avatar - **Sign-to-Text:** 99% accurate ML model
for ISL alphabet recognition - **AI Tutor:** Learn ISL with personalized
AI assistance - **Video Captioning:** Convert video content to ISL
signing

------------------------------------------------------------------------

## 🧠 Team & Approach

### Team Name:

Vector Vortex

### Team Members:

- Chikkala Asritha
- Merikela Geeta Sanjana

### Our Approach:

**Why we chose this problem:** Sign language is the primary
communication method for millions but remains inaccessible to most. With
India's interpreter shortage, technology is the only scalable solution.

**Key Challenges Addressed:** 1. **Real-time performance** - Optimized
3D avatar animations for smooth signing 2. **Accurate sign
recognition** - Built ML model with 99.17% accuracy 3. **Limited ISL
data** - Used transfer learning with MobileNetV2 on ISLRTC dataset 4.
**Cross-platform access** - Web app deployed on Render for universal
access

**Breakthroughs:** - Achieved 99.17% accuracy on ISL alphabet
recognition - Integrated Groq AI for natural language to ISL gloss
translation - Built immersive 3D avatar using Three.js and VRM

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Core Technologies Used:

**Frontend:** - Next.js 16 (App Router) - React 19 with TypeScript -
Tailwind CSS 4 - Framer Motion (Animations) - Three.js /
@react-three/fiber (3D Avatar)

**Backend:** - Next.js API Routes - Groq AI (Llama 3.3 70B + Whisper) -
Supabase (Auth + Database) - Neo4j AuraDB (Graph Database)

**AI/ML:** - TensorFlow + Keras (ML Model) - MobileNetV2 (Transfer
Learning) - Mediapipe (Pose Estimation - Reference)

**Hosting:** - Render (Web App) - Supabase (Backend)

### Additional Technologies Used:

-   ✅ **AI / ML** - Custom trained model with 99.17% accuracy
-   ✅ **Cloud** - Deployed on Render with auto-deploy from GitHub
-   ✅ **Neo4j** - Semantic graph database for sign relationships

------------------------------------------------------------------------

## 🏆 Sponsored Track


-   ✅ **Neo4j Track** -- Uses AuraDB for semantic sign relationships
-   ✅ **Base44 Track** -- Prototype built with rapid iteration
-   ✅ **Sarvaam AI Track** -- AI-powered translation
-   ✅ **Render Workflows** -- Deployed on Render with CI/CD

### Neo4j Implementation:

Our Neo4j AuraDB stores ISL signs as graph nodes with semantic
relationships. This enables: - **Semantic sign lookup** - Finding
related signs - **Learning paths** - Connecting signs by category and
difficulty - **Faster fallback** - When AI translation fails, Neo4j
provides semantic matches

------------------------------------------------------------------------

## ✨ Key Features

### 🎯 Real-Time Speech-to-ISL

-   Convert English speech/text to ISL gloss
-   3D VRM avatar signs in real-time
-   Sentiment detection (happy, urgent, question, neutral)
-   Emergency mode for urgent situations

### ✋ Sign-to-Text with 99% Accuracy

-   Custom CNN model trained on 5,400+ ISL images
-   Recognizes A-Z and 0-9 signs
-   Real-time camera detection
-   Confidence scoring and history tracking

### 📚 AI-Powered Learning

-   AI Tutor using Groq Llama 3.3 70B
-   Flashcards with ISL signs
-   Interactive quizzes
-   Chat history with search

### 🎥 Video Captioning

-   Upload videos for ISL captioning
-   YouTube URL support
-   Avatar signs the captions
-   Manual transcript input

### 👤 User Dashboard

-   Supabase authentication
-   Profile management
-   Learning progress tracking

------------------------------------------------------------------------

## 📽️ Demo & Deliverables

-   **Demo Video Link:** 
-   **Deployment Link:** https://signconnect-qvx7.onrender.com
-   **GitHub Repository:**
    https://github.com/asritha-chikkala/SignConnect
-   **Pitch Deck:** 

------------------------------------------------------------------------





## 🧪 How to Run the Project
``` bash
#How to Install
pip install -r requirements.txt


### Local Setup:

``` bash
# 1. Clone the repository
git clone https://github.com/asritha-chikkala/SignConnect.git
cd SignConnect

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Install Python dependencies (for ML model)
pip install tensorflow opencv-python numpy scikit-learn joblib

# 5. Run the development server
npm run dev

# 6. Open local host 
```

### Environment Variables Needed:

``` env
# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key

# ============================================
# GROQ API
# ============================================
GROQ_API_KEY=your_groq_api_key

# ============================================
# DEEPGRAM API
# ============================================
DEEPGRAM_API_KEY=your_deepgram_api_key

# ============================================
# YOUTUBE API
# ============================================
YOUTUBE_API_KEY=your_youtube_api_key

# ============================================
# NEO4J (Graph Database)
# ============================================
NEO4J_URI=your_neo4j_uri
NEO4J_USERNAME=your_neo4j_username
NEO4J_PASSWORD=your_neo4j_password
NEO4J_DATABASE=your_neo4j_database

# ============================================
# APP URL (Your Render Deployment)
# ============================================
NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com


```

------------------------------------------------------------------------

## 🧬 Future Scope

-   📱 Full Expo Mobile App
-   🧠 Word-Level Sign Recognition
-   🌍 Multi-language Support
-   🎮 AR Integration
-   🤖 Custom Avatar Creation
-   📊 Analytics Dashboard

------------------------------------------------------------------------

## 📎 Resources / Credits

**Datasets:** - ISLRTC Indian Sign Language Dataset - INCLUDE 50 Dataset

**Open Source Libraries:** - @pixiv/three-vrm - TensorFlow - Mediapipe

**APIs:** - Groq AI - Supabase - Neo4j AuraDB

**Acknowledgements:** - HackHazards '26 - ISLRTC - Open-source community

------------------------------------------------------------------------

## 🏁 Final Words

Building SignConnect has been an incredible journey. We started with a
simple idea: "What if we could break the communication barrier for the
Deaf community?" Through this hackathon, we've built a working prototype
that demonstrates the potential of AI to create **real social impact**.

**Key Learnings:** - Transfer learning with MobileNetV2 can achieve
remarkable accuracy with limited data - Real-time 3D avatar signing
requires careful optimization - The gap between hearing and deaf
individuals can be bridged with technology

**Shout-out to:** - Our teammates for their dedication and late-night
debugging sessions - The HackHazards team - Everyone supporting
accessibility

**SignConnect is more than a hackathon project - it's the beginning of a
journey to make ISL accessible to everyone.**

------------------------------------------------------------------------

*Made with ❤️ for HackHazards '26*
