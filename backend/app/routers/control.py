from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app import crud, schemas
from app.database import get_async_session

router = APIRouter(prefix="/api/control", tags=["control"])

@router.post("/manual", response_model=schemas.ActionLogResponse)
async def manual_control(action: schemas.ManualActionRequest, session: AsyncSession = Depends(get_async_session)):
    config = await crud.get_control_config(session)
    if config.is_auto_mode:
        raise HTTPException(status_code=400, detail="Cannot execute manual actions while in auto mode.")
        
    log = await crud.create_action_log(session, action.action_type, action.details)
    return log

@router.get("/logs", response_model=List[schemas.ActionLogResponse])
async def get_control_logs(limit: int = 50, session: AsyncSession = Depends(get_async_session)):
    logs = await crud.get_action_logs(session, limit)
    return logs
