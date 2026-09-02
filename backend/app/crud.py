from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app import models, schemas
from datetime import datetime, timedelta, timezone
from typing import Optional

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


async def create_snapshot(session: AsyncSession, sensors: dict, lines: list[dict]):
    sensor = models.SensorData(**sensors)
    session.add(sensor)
    await session.flush()

    for line in lines:
        session.add(models.LineTelemetry(snapshot_id=sensor.id, **line))

    await session.commit()
    await session.refresh(sensor)
    return sensor


async def get_latest_line_telemetries(session: AsyncSession):
    result = await session.execute(select(models.LineTelemetry).order_by(desc(models.LineTelemetry.timestamp)))
    latest = {}
    for item in result.scalars().all():
        latest.setdefault(item.line_number, item)
    return [latest[number] for number in sorted(latest)]


async def get_snapshot_history(session: AsyncSession, limit: int = 100, line_number: Optional[int] = None, days: Optional[int] = None):
    query = select(models.SensorData)
    if days:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        query = query.where(models.SensorData.timestamp >= cutoff)
    query = query.order_by(desc(models.SensorData.timestamp)).limit(limit)

    sensor_result = await session.execute(query)
    snapshots = list(sensor_result.scalars().all())
    if not snapshots:
        return []

    snapshot_ids = [snapshot.id for snapshot in snapshots]
    line_query = select(models.LineTelemetry).where(models.LineTelemetry.snapshot_id.in_(snapshot_ids))
    if line_number is not None:
        line_query = line_query.where(models.LineTelemetry.line_number == line_number)
    line_result = await session.execute(line_query.order_by(models.LineTelemetry.timestamp))
    by_snapshot = {}
    for line in line_result.scalars().all():
        by_snapshot.setdefault(line.snapshot_id, []).append(line)

    return [
        {
            "id": snapshot.id,
            "timestamp": snapshot.timestamp,
            "temperature": snapshot.temperature,
            "humidity": snapshot.humidity,
            "water_level": snapshot.water_level,
            "product_level": snapshot.product_level,
            "central_water_level": snapshot.central_water_level,
            "central_product_level": snapshot.central_product_level,
            "lines": by_snapshot.get(snapshot.id, []),
        }
        for snapshot in snapshots
    ]

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
