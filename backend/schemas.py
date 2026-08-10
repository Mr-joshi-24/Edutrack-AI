from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import date

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    roll_no: Optional[str] = None
    branch: Optional[str] = "CSE"
    attendance: Optional[float] = 0.0
    marks: Optional[float] = 0.0

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    roll_no: Optional[str] = None
    branch: Optional[str] = None
    attendance: Optional[float] = None
    marks: Optional[float] = None

class StudentResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    roll_no: Optional[str] = None
    branch: Optional[str] = "CSE"
    attendance: Optional[float] = 0.0
    marks: Optional[float] = 0.0
    intervention_status: Optional[str] = "Pending"
    last_alert_sent: Optional[str] = None

    class Config:
        from_attributes = True

class AttendanceCreate(BaseModel):
    student_id: int
    date: date
    subject: str = "COA"
    status: str

class AttendanceResponse(AttendanceCreate):
    id: int
    class Config:
        from_attributes = True

class MarksCreate(BaseModel):
    student_id: int
    subject: str
    marks: float
    internal_marks: Optional[float] = 0.0
    external_marks: Optional[float] = 0.0
    practical_marks: Optional[float] = 0.0
    exam_type: Optional[str] = "T1"
    semester: Optional[str] = "Sem 4"
    academic_year: Optional[str] = "2025-2026"
    remarks: Optional[str] = None

class MarksResponse(MarksCreate):
    id: int
    class Config:
        from_attributes = True

class RiskPrediction(BaseModel):
    attendance: float
    average_marks: float