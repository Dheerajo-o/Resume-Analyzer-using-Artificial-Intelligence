import os
import json
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import google.generativeai as genai
import PyPDF2
import docx

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max upload

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configure Gemini API
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    text = ""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def extract_text_from_docx(file_path):
    text = ""
    try:
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"Error reading DOCX: {e}")
    return text

def analyze_resume_with_gemini(resume_text, job_description):
    model = genai.GenerativeModel("gemini-flash-latest")
    
    prompt = f"""
    You are an expert Applicant Tracking System (ATS) and a Senior Technical Recruiter.
    Review the following Resume text and compare it against the provided Job Description.

    Resume Text:
    {resume_text}

    Job Description:
    {job_description}

    Provide a detailed analysis in strictly valid JSON format. Do not include markdown formatting like ```json ... ```, just output the raw JSON string.
    The JSON must contain exactly these keys:
    - "ats_score": An integer between 0 and 100 representing the match percentage.
    - "missing_keywords": A list of important strings/keywords from the JD that are missing in the resume.
    - "matched_keywords": A list of important strings/keywords found in both the JD and the resume.
    - "category": A string describing the professional category or role of the resume (e.g., "Software Engineer", "Data Scientist").
    - "suggestions": A list of strings containing actionable advice on how to improve the resume for this specific role.

    Ensure the response can be directly parsed by Python's json.loads().
    """

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Strip potential markdown formatting if Gemini includes it despite instructions
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        return json.loads(response_text)
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    if not gemini_api_key or gemini_api_key == "your_api_key_here":
         return jsonify({"error": "Gemini API Key is not configured on the server."}), 500

    if 'resume' not in request.files:
        return jsonify({"error": "No resume file uploaded"}), 400
        
    file = request.files['resume']
    job_description = request.form.get('job_description', '')

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if not job_description:
        return jsonify({"error": "Job description is required"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Extract text based on file type
        resume_text = ""
        file_ext = filename.rsplit('.', 1)[1].lower()
        if file_ext == 'pdf':
            resume_text = extract_text_from_pdf(file_path)
        elif file_ext == 'docx':
            resume_text = extract_text_from_docx(file_path)

        # Cleanup uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)

        if not resume_text.strip():
            return jsonify({"error": "Could not extract text from the uploaded file."}), 400

        # Analyze with Gemini
        analysis_result = analyze_resume_with_gemini(resume_text, job_description)

        if analysis_result:
            return jsonify(analysis_result)
        else:
            return jsonify({"error": "Failed to analyze resume with AI engine."}), 500
            
    return jsonify({"error": "Invalid file type. Only PDF and DOCX are allowed."}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
