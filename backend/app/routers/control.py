from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app import crud, schemas
from app.database import get_async_session
from app.services.simulation import command_simulation_pump

router = APIRouter(prefix="/api/control", tags=["control"])


@router.put("/lines/{line_number}/pumps/{pump_number}", response_model=schemas.PumpCommandResponse)
async def update_pump(line_number: int, pump_number: int, command: schemas.PumpCommandRequest, session: AsyncSession = Depends(get_async_session)):
    config = await crud.get_control_config(session)
    if config.is_auto_mode:
        raise HTTPException(status_code=400, detail="Desative o modo automático para controlar as bombas manualmente.")
    if not 1 <= line_number <= 3 or not 1 <= pump_number <= 8:
        raise HTTPException(status_code=422, detail="Linha deve estar entre 1 e 3 e bomba entre 1 e 8.")
    if not 0 <= command.flow <= 20:
        raise HTTPException(status_code=422, detail="O fluxo deve estar entre 0 e 20.")

    try:
        line = await command_simulation_pump(line_number, pump_number, command.enabled, command.flow)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Não foi possível encaminhar o comando ao simulador.") from exc

    log = await crud.create_action_log(
        session,
        "MANUAL_PUMP_UPDATE",
        f"Linha {line_number}, bomba {pump_number}: {'ligada' if command.enabled else 'desligada'}, fluxo {command.flow}.",
    )
    return {
        "line_number": line_number,
        "pump_number": pump_number,
        "enabled": command.enabled,
        "flow": command.flow,
        "line": line,
        "log": log,
    }

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
