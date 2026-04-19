# Depression Severity Analyzer

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](.)

**An AI-powered web application for analyzing depression severity and providing personalized mental health support resources.**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Architecture](#-architecture)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Configuration](#-configuration)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## Overview

**Depression Severity Analyzer** is a comprehensive mental health assessment platform that uses advanced machine learning to analyze user-provided text and predict depression severity levels. The application provides:

- **Real-time Analysis:** Process text input and receive immediate severity predictions
- **Personalized Recommendations:** AI-generated coping strategies tailored to severity level
- **Resource Discovery:** YouTube video recommendations organized by severity category
- **History Tracking:** Maintain analysis history for progress monitoring
- **Crisis Support:** Quick access to mental health resources and helplines

> ⚠️ **Disclaimer:** This application is designed as a supportive tool only and should not replace professional mental health evaluation. Always consult qualified mental health professionals for diagnosis and treatment.

---

## ✨ Features

### 🔍 Core Analysis
- **Intelligent Text Analysis:** RoBERTa-based transformer model for accurate depression severity classification
- **4-Level Severity Classification:** Minimal, Mild, Moderate, Severe
- **Confidence Metrics:** Risk score and confidence percentage for each analysis
- **Timestamp Tracking:** Automatic recording of analysis date and time

### 💡 Personalized Support
- **Coping Suggestions:** AI-generated personalized strategies based on severity level
- **Crisis Resources:** Emergency hotlines and support contact information
  - National Suicide Prevention Lifeline (US)
  - Crisis Text Line (SMS support)
  - International resources (multiple countries)

### 🎬 Video Recommendations
- **Severity-Based Categorization:** 6 intelligent categories
  - All Videos
  - Therapy & Counseling
  - Meditation & Mindfulness
  - Coping Strategies
  - Motivation & Positivity
  - Daily Habits

- **YouTube Integration:** Real-time video fetching with search and filtering
- **Bookmark System:** Save favorite videos with persistent storage
- **Professional UI:** Clean, responsive design with Feather icons

### 👤 User Management
- **Secure Authentication:** JWT-based signup and login
- **History Tracking:** SQLite database for local analysis history
- **MongoDB Integration:** User data and authentication management

### 🎨 User Experience
- **Responsive Design:** Mobile-friendly interface with Tailwind CSS
- **Dark Theme:** Easy on the eyes with professional color scheme
- **Icon-Based UI:** Professional Feather icons throughout (no emojis)
- **Accessible Navigation:** React Router for smooth page transitions

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.2.0 | UI Framework |
| **React Router** | 6.20.0 | Client-side routing |
| **Vite** | 5.4.21 | Build tool & dev server |
| **Tailwind CSS** | 3.3.0 | Utility-first styling |
| **react-icons** | 4.12.0 | Icon library (Feather) |
| **Axios** | 1.6.0 | HTTP client |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.11 | Server language |
| **FastAPI** | Latest | Web framework |
| **Uvicorn** | Latest | ASGI server |
| **SQLAlchemy** | Latest | ORM |
| **Motor** | 3.3.2 | Async MongoDB driver |
| **PyMongo** | 4.6.0 | MongoDB client |

### Machine Learning
| Technology | Version | Purpose |
|-----------|---------|---------|
| **PyTorch** | 2.7.1 | Deep learning framework |
| **Transformers** | 4.36.2 | Hugging Face models |
| **RoBERTa** | - | Depression severity classifier |

### Databases
| Database | Purpose |
|----------|---------|
| **SQLite** | Analysis history storage |
| **MongoDB** | User authentication & profiles |

### External APIs
| Service | Purpose |
|---------|---------|
| **YouTube Data API v3** | Video recommendations |

---

## 📦 Installation

### Prerequisites
- Python 3.11 or higher
- Node.js 16+ and npm 8+
- Git
- MongoDB (optional, for user authentication)
- YouTube API Key (for video recommendations)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sanikaa205/depression-prediction.git
   cd depression-prediction
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv backend/venv
   
   # On Windows
   backend\venv\Scripts\activate
   
   # On macOS/Linux
   source backend/venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Configure environment**
   - Create `.env` file in backend directory (optional)
   - Set MongoDB connection string if using remote MongoDB
   - Configure any other environment-specific settings

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install npm dependencies**
   ```bash
   npm install
   ```

3. **Configure YouTube API**
   - Create `.env` file in frontend directory
   - Add your YouTube API key:
     ```
     VITE_YOUTUBE_API_KEY=your_api_key_here
     ```
   - Get your API key: https://developers.google.com/youtube/registering_an_application

---

## 🚀 Quick Start

### Development Mode

1. **Start Backend (Terminal 1)**
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python app.py
   ```
   Backend will start on `http://localhost:8000`

2. **Start Frontend (Terminal 2)**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will start on `http://localhost:5175` (or next available port)

3. **Access Application**
   - Open browser to `http://localhost:5175`
   - Sign up for an account
   - Start analyzing depression severity

### API Documentation
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 📁 Project Structure

```
depression-prediction/
├── frontend/                      # React application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RiskMeter.jsx
│   │   │   ├── SeverityBadge.jsx
│   │   │   └── SuicidalAlert.jsx
│   │   ├── pages/                # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Analyze.jsx
│   │   │   ├── History.jsx
│   │   │   └── Support.jsx
│   │   ├── context/              # Context API state
│   │   │   └── AuthContext.jsx
│   │   ├── api/                  # API client
│   │   │   └── axiosClient.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env                      # Environment variables
│
├── backend/                       # FastAPI application
│   ├── app.py                    # Main application entry
│   ├── auth.py                   # Authentication logic
│   ├── database.py               # Database configuration
│   ├── schema.py                 # Pydantic models
│   ├── predict.py                # Prediction logic
│   ├── predictor.py              # ML model wrapper
│   ├── model_loader.py           # Model loading utilities
│   ├── requirements.txt          # Python dependencies
│   ├── model/                    # ML model files
│   │   ├── config.json
│   │   ├── model.safetensors
│   │   ├── tokenizer_config.json
│   │   ├── vocab.json
│   │   ├── merges.txt
│   │   └── label_mapping.json
│   ├── venv/                     # Virtual environment
│   └── depression.db             # SQLite database
│
├── SETUP_GUIDE.md                # Detailed setup documentation
├── FRONTEND_SETUP_GUIDE.md       # Frontend-specific setup
├── TEST_REPORT.md                # Test results and validation
└── README.md                     # This file
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

### Analysis Endpoints

#### Analyze Text
```http
POST /analyze
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "I've been feeling really down lately..."
}

Response:
{
  "severity": "Moderate",
  "risk_score": 65.4,
  "confidence_score": 82.1,
  "suggestions": ["...", "..."]
}
```

#### Get Analysis History
```http
GET /history
Authorization: Bearer {token}
```

#### Get Latest Result
```http
GET /latest-result
Authorization: Bearer {token}

Response:
{
  "id": "analysis_id",
  "severity": "Moderate",
  "risk_score": 65.4,
  "confidence_score": 82.1,
  "created_at": "2026-04-19T15:19:49.183000",
  "coping_suggestions": ["...", "..."]
}
```

### Health Check
```http
GET /health
```

---

## ⚙️ Configuration

### Backend Configuration
Create `backend/.env` file:
```env
# Database
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/depression-prediction

# API Settings
DEBUG=False
SECRET_KEY=your-secret-key-here

# Model Configuration
MODEL_PATH=./model
DEVICE=cuda  # or cpu
```

### Frontend Configuration
Create `frontend/.env` file:
```env
# YouTube API
VITE_YOUTUBE_API_KEY=AIzaSy...

# API Base URL (if using custom backend)
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🛠 Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
# Output: dist/ directory
```

**Backend:**
```bash
# Backend is ready to run with: python app.py
# For production, use gunicorn:
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app
```

### Code Style & Linting

**Python:**
```bash
pip install flake8 black
flake8 backend/
black backend/
```

**JavaScript:**
```bash
npm run lint
npm run format
```

---

## 📤 Deployment

### Frontend Deployment
- **Vercel:** `npm run build` → Deploy `dist/` folder
- **Netlify:** Connect GitHub repository for auto-deployment
- **GitHub Pages:** Configure in `vite.config.js`

### Backend Deployment
- **Heroku:** Include Procfile with Gunicorn
- **AWS EC2:** Install dependencies and run with systemd service
- **Docker:** Create Dockerfile and docker-compose.yml

### Docker Deployment (Optional)
```bash
# Build and run with Docker
docker-compose up --build
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add your feature description"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request**

### Contribution Guidelines
- Follow PEP 8 for Python code
- Use ESLint/Prettier for JavaScript
- Add tests for new features
- Update documentation as needed
- Be respectful and constructive

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### Getting Help
- **Documentation:** See [SETUP_GUIDE.md](SETUP_GUIDE.md) and [FRONTEND_SETUP_GUIDE.md](FRONTEND_SETUP_GUIDE.md)
- **Test Report:** Check [TEST_REPORT.md](TEST_REPORT.md) for validation details
- **API Docs:** Access Swagger UI at `/docs` endpoint when backend is running
- **Issues:** Report bugs via GitHub Issues

### Mental Health Resources
If you're struggling with depression, please reach out to:
- **National Suicide Prevention Lifeline:** 1-800-273-8255 (US)
- **Crisis Text Line:** Text HOME to 741741 (US)
- **International Association for Suicide Prevention:** https://www.iasp.info/resources/Crisis_Centres/

---

## 👨‍💻 Author

**Sanika** - Full-stack Developer & AI Enthusiast

- GitHub: [@Sanikaa205](https://github.com/Sanikaa205)
- Project Repository: [depression-prediction](https://github.com/Sanikaa205/depression-prediction)

---

## 🙏 Acknowledgments

- Hugging Face for the RoBERTa model
- React and FastAPI communities
- YouTube for the video API
- All contributors and testers

---

## 📊 Project Status

- ✅ **Core Features:** Complete
- ✅ **YouTube Integration:** Implemented
- ✅ **User Authentication:** Functional
- ✅ **Analysis History:** Operational
- ✅ **Crisis Resources:** Integrated
- ✅ **Production Ready:** Yes

**Last Updated:** April 19, 2026  
**Latest Release:** v1.0.0

---

<div align="center">

**Made with ❤️ for mental health awareness**

⭐ If you find this project helpful, please consider giving it a star!

</div>
