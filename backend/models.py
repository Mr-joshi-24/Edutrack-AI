from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    roll_no = Column(String, nullable=True)
    branch = Column(String, nullable=True, default="CSE")
    attendance = Column(Float, default=0.0)
    marks = Column(Float, default=0.0)
    intervention_status = Column(String, nullable=True, default="Pending")
    last_alert_sent = Column(String, nullable=True)

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(Date)
    subject = Column(String)
    status = Column(String)
    student = relationship("Student")

class Marks(Base):
    __tablename__ = "marks"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject = Column(String)
    marks = Column(Float)
    
    internal_marks = Column(Float, default=0.0)
    external_marks = Column(Float, default=0.0)
    practical_marks = Column(Float, default=0.0)
    exam_type = Column(String, nullable=True)
    semester = Column(String, nullable=True)
    academic_year = Column(String, nullable=True)
    remarks = Column(String, nullable=True)
    
    student = relationship("Student")
