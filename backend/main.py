from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime
import os

# Import your database and crud modules
from crud import (
    get_dashboard_stats, mark_attendance, get_attendance,
    add_marks, get_marks, get_at_risk_students,
    create_user, get_user_by_email, create_student, get_students,
    process_bulk_attendance,
    process_bulk_marks,
    process_bulk_marks_excel  # NEW: Added Excel processor
)
from schemas import (
    AttendanceCreate, MarksCreate, RiskPrediction,
    UserCreate, LoginSchema, StudentCreate
)
from database import SessionLocal, engine, Base
from auth import verify_password, create_access_token

# Import your auth router file
import auth 

# 1. Initialize the app EXACTLY ONCE
app = FastAPI(title="EduTrack AI")

# 2. Add your CORS Middleware immediately after initializing
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Include your auth router so the OAuth routes are registered
app.include_router(auth.router)

# 4. Create database tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def home():
    return {
        "message": "EduTrack AI Running"
    }

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    return create_user(db, user)

@app.post("/login")
def login(user: LoginSchema, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, user.email)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.email})
    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.post("/students")
def add_student(student: StudentCreate, db: Session = Depends(get_db)):
    return create_student(db, student)

@app.get("/students")
def students(db: Session = Depends(get_db)):
    return get_students(db)

@app.post("/attendance")
def add_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    return mark_attendance(db, attendance)

@app.get("/attendance")
def attendance_list(db: Session = Depends(get_db)):
    return get_attendance(db)

@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    return get_dashboard_stats(db)

@app.post("/marks")
def create_marks(mark: MarksCreate, db: Session = Depends(get_db)):
    return add_marks(db, mark)

@app.get("/marks")
def marks_list(db: Session = Depends(get_db)):
    return get_marks(db)


# ==========================================
# BULK UPLOAD ENDPOINTS
# ==========================================

@app.post("/attendance/bulk-upload")
async def bulk_upload_attendance(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    contents = await file.read()
    decoded_contents = contents.decode('utf-8')
    return process_bulk_attendance(db, decoded_contents)

@app.post("/marks/bulk-upload")
async def bulk_upload_marks(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not (file.filename.endswith('.csv') or file.filename.endswith('.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV and XLSX files are supported.")
    
    contents = await file.read()
    
    # 1. Extract Subject (e.g., "COA")
    fallback_subject = file.filename.split('.')[0].split('_')[-1] if '_' in file.filename else "General"
    
    # 2. Extract Exam Type (T1, T2, T3, T4)
    exam_type = "T1" # Default fallback
    for part in file.filename.upper().replace('.XLSX','').replace('.CSV','').split('_'):
        if part in ["T1", "T2", "T3", "T4"]:
            exam_type = part
            break
            
    if file.filename.endswith('.xlsx'):
        from crud import process_bulk_marks_excel
        return process_bulk_marks_excel(db, contents, fallback_subject, exam_type)
    else:
        from crud import process_bulk_marks
        return process_bulk_marks(db, contents.decode('utf-8'), fallback_subject, exam_type)


# ==========================================
# REPORTS & ANALYTICS
# ==========================================

@app.get("/reports/compiled-marksheet")
def generate_compiled_marksheet(db: Session = Depends(get_db)):
    from models import Student, Marks
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill
    
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Compiled Marksheet"

    students = db.query(Student).all()
    all_marks = db.query(Marks).all()
    
    # Get unique list of subjects
    subjects = sorted(list(set([m.subject for m in all_marks if m.subject])))

    # 1. Dynamic Headers based on available subjects
    headers = ["Roll No / ID", "Student Name", "Email", "Attendance %"] + subjects + ["Total Score", "Percentage", "Status"]
    for col_num, header in enumerate(headers, start=1):
        cell = sheet.cell(row=1, column=col_num)
        cell.value = header
        cell.font = Font(bold=True)
        cell.fill = PatternFill(fill_type="solid", fgColor="D3D3D3")

    # 2. Populate rows for each student
    row_num = 2
    for student in students:
        student_marks = [m for m in all_marks if m.student_id == student.id]
        if not student_marks:
            continue # Skip students with zero marks entered

        sheet.cell(row=row_num, column=1).value = student.id
        sheet.cell(row=row_num, column=2).value = student.name
        sheet.cell(row=row_num, column=3).value = student.email
        sheet.cell(row=row_num, column=4).value = student.attendance

        total_obtained = 0
        max_possible = len(subjects) * 100 
        marks_dict = {m.subject: m.marks for m in student_marks}
        
        col_idx = 5
        # Place marks in the correct subject column
        for sub in subjects:
            val = marks_dict.get(sub, "-")
            sheet.cell(row=row_num, column=col_idx).value = val
            if val != "-":
                total_obtained += val
            col_idx += 1
        
        # Calculate final stats
        percentage = (total_obtained / max_possible * 100) if max_possible > 0 else 0
        sheet.cell(row=row_num, column=col_idx).value = total_obtained
        sheet.cell(row=row_num, column=col_idx+1).value = round(percentage, 2)
        sheet.cell(row=row_num, column=col_idx+2).value = "Pass" if percentage >= 40 else "Fail"
        
        # Color coding Pass/Fail
        status_cell = sheet.cell(row=row_num, column=col_idx+2)
        if percentage >= 40:
            status_cell.fill = PatternFill(fill_type="solid", fgColor="90EE90") # Green
        else:
            status_cell.fill = PatternFill(fill_type="solid", fgColor="FF9999") # Red

        row_num += 1

    # Adjust column widths
    for col in ["B", "C"]:
        sheet.column_dimensions[col].width = 25

    filename = f"Compiled_Marksheet_{datetime.now().strftime('%d-%m-%Y')}.xlsx"
    workbook.save(filename)
    
    return FileResponse(
        path=filename, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
        filename=filename
    )


@app.get("/analytics/at-risk")
def at_risk_students(db: Session = Depends(get_db)):
    return get_at_risk_students(db)

@app.post("/predict-risk")
def predict_risk(data: RiskPrediction):
    if data.attendance < 60 or data.average_marks < 40:
        risk = "High"
        recommendation = "Immediate academic intervention required"
    elif data.attendance < 75 or data.average_marks < 60:
        risk = "Medium"
        recommendation = "Monitor student performance closely"
    else:
        risk = "Low"
        recommendation = "Student performing well"

    return {
        "risk_level": risk,
        "recommendation": recommendation
    }
@app.get("/analytics/ml-predict/{student_id}")
def get_ml_prediction(student_id: int, db: Session = Depends(get_db)):
    from crud import predict_student_performance_ml
    return predict_student_performance_ml(db, student_id)
@app.post("/attendance/bulk-pdf-upload")
async def bulk_upload_attendance_pdf(file: UploadFile = File(...), subject: str = "General", db: Session = Depends(get_db)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for this endpoint.")
    
    contents = await file.read()
    from crud import process_bulk_attendance_pdf
    return process_bulk_attendance_pdf(db, contents, subject)