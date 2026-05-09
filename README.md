# AI Resume Analyzer

A production-ready web application that analyzes resumes against job descriptions using Google Gemini AI. It calculates an ATS match score, identifies missing and matched keywords, and provides actionable improvement suggestions.

## Features

- **Document Parsing:** Supports `.pdf` and `.docx` resume uploads.
- **AI-Powered Analysis:** Leverages the powerful Google Gemini Pro model for intelligent text understanding and comparison.
- **Detailed Feedback:** Provides an ATS score (0-100), matched/missing keywords, and specific improvement suggestions.
- **Beautiful UI:** Responsive, modern design with a circular gauge animation and clean dashboard layout.
- **Secure:** Uses `.env` for API key management. No local ML models required.

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript, FontAwesome
- **Backend:** Flask (Python)
- **AI Engine:** Google Generative AI (Gemini Pro)
- **Utilities:** PyPDF2 (PDF parsing), python-docx (DOCX parsing)

## Setup Instructions

### 1. Clone or Download the repository
Navigate to the project directory in your terminal.

### 2. Create a Virtual Environment (Recommended)
```bash
py -3.11 -m venv venv
```

Activate the virtual environment:
- **Windows:** `venv\Scripts\activate`
- **macOS/Linux:** `source venv/bin/activate`

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure API Key
1. Rename `.env.example` to `.env`.
2. Get an API key from [Google AI Studio](https://aistudio.google.com/).
3. Open `.env` and paste your key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 5. Run the Application
```bash
python app.py
```

### 6. Access the App
Open your web browser and navigate to: `http://127.0.0.1:5000`

## Project Structure
```
project/
│
├── app.py                  # Main Flask application and backend logic
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (API Key)
├── README.md               # Project documentation
│
├── templates/
│   └── index.html          # Frontend HTML structure
│
└── static/
    ├── css/
    │   └── style.css       # Styling and layout
    └── js/
        └── script.js       # Frontend interactivity and API calls
```
