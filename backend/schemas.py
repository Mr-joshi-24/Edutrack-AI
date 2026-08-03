from pydantic import BaseModel
from pydantic import EmailStr
from typing import Optional
from pydantic import BaseModel, EmailStr
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
    attendance: float
    marks: float


class StudentResponse(StudentCreate):

    id: int

    class Config:
        from_attributes = True

from datetime import date

from pydantic import BaseModel, EmailStr
from datetime import date

# ... (Keep your User, Student, Marks schemas exactly the same) ...

class AttendanceCreate(BaseModel):
    student_id: int
    date: date
    subject: str  # NEW FIELD
    status: str

class AttendanceResponse(AttendanceCreate):
    id: int
    class Config:
        from_attributes = True




class MarksCreate(BaseModel):

    student_id: int
    subject: str
    marks: float


class MarksResponse(MarksCreate):

    id: int

    class Config:
        from_attributes = True
        

class MarksCreate(BaseModel):
    student_id: int
    subject: str
    marks: float
    
    # NEW OPTIONAL FIELDS (Default to 0.0 or None if not provided)
    internal_marks: Optional[float] = 0.0
    external_marks: Optional[float] = 0.0
    practical_marks: Optional[float] = 0.0
    exam_type: Optional[str] = None
    semester: Optional[str] = None
    academic_year: Optional[str] = None
    remarks: Optional[str] = None

class MarksResponse(MarksCreate):
    id: int
    class Config:
        from_attributes = True

class RiskPrediction(BaseModel):
    attendance: float
    average_marks: float