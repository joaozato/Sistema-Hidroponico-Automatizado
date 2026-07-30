from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app import models, schemas
import json

async def get_latest_sensor_data(session: AsyncSession):
    result = await session.execute(select(models.SensorData).order_by(desc(models.SensorData.timestamp)).limit(1))
    return result.scalars().first()

async def get_sensor_data_history(session: AsyncSession, limit: int = 100):
    result = await session.execute(select(models.SensorData).order_by(desc(models.SensorData.timestamp)).limit(limit))
    return result.scalars().all()

async def create_sensor_data(session: AsyncSession, data: dict):
    db_data = models.SensorData(**data)
    session.add(db_data)
    await session.commit()
    await session.refresh(db_data)
    return db_data

async def get_latest_actuator_state(session: AsyncSession):
    result = await session.execute(select(models.ActuatorState).order_by(desc(models.ActuatorState.timestamp)).limit(1))
    return result.scalars().first()

async def create_actuator_state(session: AsyncSession, pump_state: list, flow_state: list):
    db_state = models.ActuatorState(
        pump_state=pump_state,
        flow_state=flow_state
    )
    session.add(db_state)
    await session.commit()
    await session.refresh(db_state)
    return db_state

async def get_control_config(session: AsyncSession):
    result = await session.execute(select(models.ControlConfig).limit(1))
    config = result.scalars().first()
    if not config:
        config = models.ControlConfig()
        session.add(config)
        await session.commit()
        await session.refresh(config)
    return config

async def update_control_config(session: AsyncSession, config_update: schemas.ControlConfigUpdate):
    config = await get_control_config(session)
    for key, value in config_update.dict().items():
        setattr(config, key, value)
    await session.commit()
    await session.refresh(config)
    return config

async def create_action_log(session: AsyncSession, action_type: str, details: str = None):
    log = models.ActionLog(action_type=action_type, details=details)
    session.add(log)
    await session.commit()
    await session.refresh(log)
    return log

async def get_action_logs(session: AsyncSession, limit: int = 50):
    result = await session.execute(select(models.ActionLog).order_by(desc(models.ActionLog.timestamp)).limit(limit))
    return result.scalars().all()
