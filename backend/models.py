from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    attendance = Column(Float, default=0.0)
    marks = Column(Float, default=0.0)

# UPDATED: Added 'subject' to track lecture-wise attendance
class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(Date)
    subject = Column(String) # NEW FIELD
    status = Column(String)
    student = relationship("Student")

# ... (keep User, Student, Attendance classes exactly the same)

class Marks(Base):
    __tablename__ = "marks"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject = Column(String)
    marks = Column(Float) # This will act as the 'Total Score'
    
    # NEW FIELDS FOR MARKS & REPORTS UI
    internal_marks = Column(Float, default=0.0)
    external_marks = Column(Float, default=0.0)
    practical_marks = Column(Float, default=0.0)
    exam_type = Column(String, nullable=True)
    semester = Column(String, nullable=True)
    academic_year = Column(String, nullable=True)
    remarks = Column(String, nullable=True)
    
    student = relationship("Student")



