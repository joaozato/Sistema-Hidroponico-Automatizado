from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app import crud, schemas
from app.database import get_async_session

router = APIRouter(prefix="/api/sensors", tags=["sensors"])

@router.get("/current", response_model=schemas.SensorDataResponse)
async def get_current_sensors(session: AsyncSession = Depends(get_async_session)):
    data = await crud.get_latest_sensor_data(session)
    if not data:
        return schemas.SensorDataResponse(id=0, timestamp="2000-01-01T00:00:00Z", lines=[])
    return {
        "id": data.id,
        "timestamp": data.timestamp,
        "temperature": data.temperature,
        "humidity": data.humidity,
        "water_level": data.water_level,
        "product_level": data.product_level,
        "central_water_level": data.central_water_level,
        "central_product_level": data.central_product_level,
        "lines": await crud.get_latest_line_telemetries(session),
    }

@router.get("/history", response_model=List[schemas.SensorDataResponse])
async def get_sensors_history(limit: int = 100, line_number: Optional[int] = None, days: Optional[int] = None, session: AsyncSession = Depends(get_async_session)):
    return await crud.get_snapshot_history(session, min(limit, 1000), line_number, days)

@router.get("/actuators/current", response_model=schemas.ActuatorStateResponse)
async def get_current_actuators(session: AsyncSession = Depends(get_async_session)):
    data = await crud.get_latest_sensor_data(session)
    if not data:
        return schemas.ActuatorStateResponse(id=0, timestamp="2000-01-01T00:00:00Z", pump_state=[], flow_state=[], lines=[])
    lines = await crud.get_latest_line_telemetries(session)
    return schemas.ActuatorStateResponse(
        id=data.id,
        timestamp=data.timestamp,
        pump_state=[line.pump_state for line in lines],
        flow_state=[line.flow_state for line in lines],
        lines=lines,
    )
