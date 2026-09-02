from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app import crud, schemas
from app.database import get_async_session

router = APIRouter(prefix="/api/control", tags=["control"])


@router.get("/logs", response_model=List[schemas.ActionLogResponse])
async def get_control_logs(limit: int = 50, session: AsyncSession = Depends(get_async_session)):
    logs = await crud.get_action_logs(session, limit)
    return logs
