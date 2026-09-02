import asyncio
import httpx
import logging
import os
from datetime import datetime, timezone
from app.database import AsyncSessionLocal
from app import crud

logger = logging.getLogger(__name__)

SIMULATION_URL = os.getenv("SIMULATION_URL", "https://simul-hidroponico.vercel.app").rstrip("/")
POLL_INTERVAL_SECONDS = float(os.getenv("POLL_INTERVAL_SECONDS", "10"))


def _number(payload: dict, key: str):
    value = payload.get(key)
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _line_payload(number: int, payload: dict):
    return {
        "line_number": number,
        "soil_humidity": _number(payload, "soil_humidity"),
        "ph": _number(payload, "ph"),
        "conductivity": _number(payload, "conductivity"),
        "pump_state": payload.get("pump_state") or [],
        "flow_state": payload.get("flow_state") or [],
    }

async def fetch_data_from_simulation():
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            paths = ["/weather", "/estufa1", "/central_node", "/estufa1/linha1", "/estufa1/linha2", "/estufa1/linha3"]
            responses = await asyncio.gather(*(client.get(f"{SIMULATION_URL}{path}") for path in paths))
            for response in responses:
                response.raise_for_status()

            weather_data, greenhouse_data, central_data, *line_data = [response.json() for response in responses]
            return {
                "sensors": {
                    "temperature": _number(weather_data, "temperature"),
                    "humidity": _number(weather_data, "humidity"),
                    "water_level": _number(greenhouse_data, "water_level"),
                    "product_level": _number(greenhouse_data, "product_level"),
                    "central_water_level": _number(central_data, "water_level"),
                    "central_product_level": _number(central_data, "product_level"),
                },
                "lines": [_line_payload(index, payload) for index, payload in enumerate(line_data, start=1)],
            }
        except Exception as e:
            logger.error(f"Error fetching simulation data: {e}")
            return None


async def command_simulation_pump(line_number: int, pump_number: int, enabled: bool, flow: float):
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.patch(
            f"{SIMULATION_URL}/estufa1/linha{line_number}",
            json={"pump_number": pump_number, "enabled": enabled, "flow": flow},
        )
        response.raise_for_status()
        line = _line_payload(line_number, response.json())
        line.update({"id": 0, "snapshot_id": 0, "timestamp": datetime.now(timezone.utc)})
        return line

async def run_automatic_control(session, sensors, lines, config):
    if not config.is_auto_mode:
        return
        
    for line in lines:
        ph = line.get("ph")
        if ph is not None:
            if ph < config.target_ph_min:
                await crud.create_action_log(session, "AUTO_PH_UP", f"Linha {line['line_number']}: pH {ph} abaixo do mínimo ({config.target_ph_min}).")
            elif ph > config.target_ph_max:
                await crud.create_action_log(session, "AUTO_PH_DOWN", f"Linha {line['line_number']}: pH {ph} acima do máximo ({config.target_ph_max}).")

        conductivity = line.get("conductivity")
        if conductivity is not None:
            if conductivity < config.target_conductivity_min:
                await crud.create_action_log(session, "AUTO_COND_UP", f"Linha {line['line_number']}: condutividade baixa ({conductivity}).")
            elif conductivity > config.target_conductivity_max:
                await crud.create_action_log(session, "AUTO_COND_DOWN", f"Linha {line['line_number']}: condutividade alta ({conductivity}).")

    water_level = sensors.get("water_level")
    if water_level is not None and water_level < config.min_water_level:
        await crud.create_action_log(session, "AUTO_WATER_FILL", f"Nível de água {water_level}% está abaixo do mínimo ({config.min_water_level}%). Ligando bomba de água.")

async def simulation_polling_task():
    while True:
        try:
            data = await fetch_data_from_simulation()
            if data:
                async with AsyncSessionLocal() as session:
                    timestamp = datetime.now(timezone.utc)
                    sensors = {**data["sensors"], "timestamp": timestamp}
                    lines = [{**line, "timestamp": timestamp} for line in data["lines"]]
                    await crud.create_snapshot(session, sensors, lines)
                    
                    # Run control logic
                    config = await crud.get_control_config(session)
                    await run_automatic_control(session, data["sensors"], data["lines"], config)
        except asyncio.CancelledError:
            logger.info("Simulation polling task cancelled")
            break
        except Exception as e:
            logger.error(f"Unexpected error in simulation task: {e}")
            
        await asyncio.sleep(POLL_INTERVAL_SECONDS)
