from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    crop = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    area_ha = Column(Float, nullable=False)
    predicted_yield = Column(Float, nullable=False)
    total_production = Column(Float, nullable=False)
    baseline_yield = Column(Float, nullable=False)
    model_version = Column(String(50), nullable=False)
    
    # Serialized JSON blobs for rich parameters
    inputs_json = Column(Text, nullable=False)
    factors_json = Column(Text, nullable=True)
    suggestions_json = Column(Text, nullable=True)
    uncertainty_json = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="predictions")

class DatasetAudit(Base):
    __tablename__ = "dataset_audits"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    total_rows = Column(Integer, nullable=False)
    valid_rows = Column(Integer, nullable=False)
    error_rows = Column(Integer, nullable=False)
    error_summary_json = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
