from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class SensorDataResponse(BaseModel):
    id: int
    timestamp: datetime
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    soil_humidity: Optional[float] = None
    water_level: Optional[float] = None
    product_level: Optional[float] = None
    ph: Optional[float] = None
    conductivity: Optional[float] = None

    class Config:
        from_attributes = True

class ActuatorStateResponse(BaseModel):
    id: int
    timestamp: datetime
    pump_state: Any
    flow_state: Any

    class Config:
        from_attributes = True

class ControlConfigBase(BaseModel):
    is_auto_mode: bool
    target_ph_min: float
    target_ph_max: float
    target_conductivity_min: float
    target_conductivity_max: float
    min_water_level: float

class ControlConfigResponse(ControlConfigBase):
    id: int

    class Config:
        from_attributes = True

class ControlConfigUpdate(ControlConfigBase):
    pass

class ActionLogResponse(BaseModel):
    id: int
    timestamp: datetime
    action_type: str
    details: Optional[str] = None

    class Config:
        from_attributes = True

class ManualActionRequest(BaseModel):
    action_type: str # e.g. "TURN_ON_PUMP_1", "ADD_NUTRIENT"
    details: Optional[str] = None
