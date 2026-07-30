from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app import crud, schemas
from app.database import get_async_session

router = APIRouter(prefix="/api/config", tags=["config"])

@router.get("", response_model=schemas.ControlConfigResponse)
async def get_config(session: AsyncSession = Depends(get_async_session)):
    config = await crud.get_control_config(session)
    return config

@router.put("", response_model=schemas.ControlConfigResponse)
async def update_config(config_update: schemas.ControlConfigUpdate, session: AsyncSession = Depends(get_async_session)):
    config = await crud.update_control_config(session, config_update)
    return config
