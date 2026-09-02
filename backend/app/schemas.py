from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class LineTelemetryResponse(BaseModel):
    id: int = 0
    snapshot_id: int = 0
    timestamp: datetime
    line_number: int
    soil_humidity: Optional[float] = None
    ph: Optional[float] = None
    conductivity: Optional[float] = None
    pump_state: List[int] = Field(default_factory=list)
    flow_state: List[float] = Field(default_factory=list)


class SensorDataResponse(BaseModel):
    id: int
    timestamp: datetime
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    soil_humidity: Optional[float] = None
    water_level: Optional[float] = None
    product_level: Optional[float] = None
    central_water_level: Optional[float] = None
    central_product_level: Optional[float] = None
    ph: Optional[float] = None
    conductivity: Optional[float] = None
    lines: List[LineTelemetryResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
class ActuatorStateResponse(BaseModel):
    id: int
    timestamp: datetime
    pump_state: Any
    flow_state: Any
    lines: List[LineTelemetryResponse] = Field(default_factory=list)

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
