from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    soil_humidity = Column(Float, nullable=True)
    water_level = Column(Float, nullable=True)
    product_level = Column(Float, nullable=True)
    central_water_level = Column(Float, nullable=True)
    central_product_level = Column(Float, nullable=True)
    ph = Column(Float, nullable=True)
    conductivity = Column(Float, nullable=True)


class LineTelemetry(Base):
    __tablename__ = "line_telemetry"

    id = Column(Integer, primary_key=True, index=True)
    snapshot_id = Column(Integer, ForeignKey("sensor_data.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    line_number = Column(Integer, nullable=False, index=True)
    soil_humidity = Column(Float, nullable=True)
    ph = Column(Float, nullable=True)
    conductivity = Column(Float, nullable=True)
    pump_state = Column(JSON, nullable=False, default=list)
    flow_state = Column(JSON, nullable=False, default=list)

class ActuatorState(Base):
    __tablename__ = "actuator_state"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    pump_state = Column(JSON, nullable=True)
    flow_state = Column(JSON, nullable=True)

class ControlConfig(Base):
    __tablename__ = "control_config"

    id = Column(Integer, primary_key=True, index=True)
    is_auto_mode = Column(Boolean, default=True)
    target_ph_min = Column(Float, default=5.5)
    target_ph_max = Column(Float, default=6.5)
    target_conductivity_min = Column(Float, default=1.0)
    target_conductivity_max = Column(Float, default=2.5)
    min_water_level = Column(Float, default=20.0)

class ActionLog(Base):
    __tablename__ = "action_log"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    action_type = Column(String, index=True) # e.g. "AUTO_PH_UP", "AUTO_WATER_FILL"
    details = Column(String, nullable=True)
