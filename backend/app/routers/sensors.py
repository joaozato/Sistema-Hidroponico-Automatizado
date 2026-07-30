from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app import crud, schemas
from app.database import get_async_session

router = APIRouter(prefix="/api/sensors", tags=["sensors"])

@router.get("/current", response_model=schemas.SensorDataResponse)
async def get_current_sensors(session: AsyncSession = Depends(get_async_session)):
    data = await crud.get_latest_sensor_data(session)
    if not data:
        # Return empty/default if no data yet
        return schemas.SensorDataResponse(id=0, timestamp="2000-01-01T00:00:00Z")
    return data

@router.get("/history", response_model=List[schemas.SensorDataResponse])
async def get_sensors_history(limit: int = 100, session: AsyncSession = Depends(get_async_session)):
    data = await crud.get_sensor_data_history(session, limit)
    return data

@router.get("/actuators/current", response_model=schemas.ActuatorStateResponse)
async def get_current_actuators(session: AsyncSession = Depends(get_async_session)):
    data = await crud.get_latest_actuator_state(session)
    if not data:
        return schemas.ActuatorStateResponse(id=0, timestamp="2000-01-01T00:00:00Z", pump_state=[], flow_state=[])
    return data
