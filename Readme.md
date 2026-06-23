# ⚡ QuizAI

QuizAI is an AI-powered quiz generation and live quiz platform that transforms topics, study notes, and PDFs into interactive quizzes within seconds. The platform combines Google's Gemini AI with real-time multiplayer functionality, allowing users to create, host, and participate in engaging quizzes while tracking performance through leaderboards and detailed analysis.

Whether you're preparing for exams, revising lecture notes, conducting classroom activities, or testing your understanding of a subject, QuizAI provides an efficient and intelligent learning experience.

---

## 🌐 Live Demo

Visit the application:

**Frontend:** https://quiz-ai-multiplayer.vercel.app

**Backend API:** https://quizai-54x5.onrender.com

---

## ✨ Key Features

### AI Quiz Generation

Generate high-quality multiple-choice quizzes using Google's Gemini AI.

* Topic-based quiz creation
* Difficulty selection (Easy, Medium, Hard)
* Custom question count
* Additional instructions for tailored quizzes
* AI-generated realistic answer choices

---

###  PDF-Based Quiz Creation

Turn study material into quizzes instantly.

* Upload one or multiple PDF documents
* Extract content automatically
* Generate questions directly from uploaded notes
* Combine uploaded material with custom instructions
* Useful for lectures, assignments, and exam preparation

---

###  Live Quiz Rooms

Create and host real-time quiz sessions.

* Generate room codes
* Invite participants to join
* Real-time room updates using Socket.IO
* Waiting room system
* Host-controlled quiz start
* Automatic submission when time expires

---

### 🏆 Leaderboards & Analysis

Track performance and compare results.

* Live leaderboard rankings
* Quiz analysis after completion
* Correct answer review
* Reattempt quizzes anytime
* Score tracking and comparison

---

### Secure Authentication

User accounts are secured using industry-standard practices.

* JWT Authentication
* Password hashing with bcrypt
* Protected API routes
* User-specific quiz history

---

## Technology Stack

### Frontend

* React
* Vite
* Axios
* Socket.IO Client

### Backend

* Node.js
* Express.js
* MongoDB
* Socket.IO

### Artificial Intelligence

* Google Gemini API
* PDF Parsing

### Deployment

* Vercel (Frontend)
* Render (Backend)
* MongoDB Atlas (Database)

---

##  Project Structure

```text
QuizAI/
│
├── client/        # React Frontend
├── server/        # Express Backend
└── README.md
```

---


## 📸 Screenshots


* Home Page
* Create Quiz Page
* PDF Upload Workflow
* Live Room Interface
* Leaderboard
* Quiz Analysis

---

## 🔮 Future Enhancements

* AI-generated answer explanations
* Topic detection and syllabus analysis
* Advanced performance analytics
* LangChain integration
* Question bank management

---

## 👨‍💻 Author

**Keshav Raj**
