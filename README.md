# Cuemath AI Flashcard Web App 🚀

![Banner](./frontend/public/readme-hero.png)

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

An intelligent, full-stack learning platform that transforms complex documents into interactive flashcards using AI. Built with a premium **Cuemath-inspired** design system and powered by advanced **Spaced Repetition (SRS)** logic.

---

## ✨ Features

### 🧠 AI-Powered Ingestion
- **PDF to Flashcards**: Upload complex PDFs and watch the AI extract key concepts into `Memorize` and `Q&A` cards.
- **Direct Text Input**: Paste your revision notes and generate specialized study decks in seconds.
- **Intelligent Chunking**: Large documents are smart-chunked to respect LLM context windows while maintaining semantic flow.

### 📈 Smart Learning & Analytics
- **SM-2 Algorithm**: Implements the SuperMemo-2 Spaced Repetition logic for scientifically optimized review intervals.
- **Progress Tracking**: Beautiful visualizations via **Recharts** showing your study sessions, mastery levels, and daily streaks.
- **Mastery Levels**: Cards progress from *Learning* to *Mastered* based on your performance.

### 🎨 Premium UI/UX
- **Cuemath Branded**: A high-fidelity interface with a professional color palette, vibrant icons, and glassmorphism.
- **Vite-Powered**: Blazing fast frontend performance with React 19 and Tailwind CSS 4.
- **Responsive Design**: Fully optimized for desktop and mobile learning.

---

## 🛠️ Tech Stack

**Frontend:**
- **Core**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0, Framer Motion
- **Graphs**: Recharts
- **Icons**: React Icons
- **State/Routing**: React Router 7, Context API

**Backend:**
- **Runtime**: Node.js, Express 5 (Alpha)
- **Database**: MongoDB (Mongoose 9)
- **AI**: Hugging Face Inference API
- **Parsers**: pdf-parse, Multer
- **Security**: JWT, BcryptJS, Helmet

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- MongoDB Atlas or local instance
- Hugging Face API Token

### 1. Clone the repository
```bash
git clone https://github.com/KashishKataria786/AI-flashcard-web-app.git
cd AI-flashcard-web-app
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
MONGO_DB_URL_CONNECTION_STRING=your_mongodb_uri
PORT=5000
NODE_ENV=dev
JWT_SECRET=your_super_secret_key
HF_TOKEN=your_huggingface_token
```
Start the backend:
```bash
nodemon
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```env
VITE_REACT_APP=http://localhost:5000
```
Start the frontend:
```bash
npm run dev
```

---

## 📖 Usage Guide

1.  **Sign Up/Login**: Create your personalized learning account.
2.  **Create a Deck**: Go to the *Flashcards* section and upload a PDF or paste text.
3.  **Review AI Cards**: Edit the generated cards if necessary.
4.  **Start Studying**: Click "Study Session" and rate your performance (0-5) for each card.
5.  **Track Progress**: Check the *Dashboard* to see your mastery growth and upcoming reviews.

---

## 📜 License
This project is licensed under the **ISC License**.

---

Developed with ❤️ for better learning.
