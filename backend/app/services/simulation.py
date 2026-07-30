import asyncio
import httpx
import random
import logging
from app.database import AsyncSessionLocal
from app import crud

logger = logging.getLogger(__name__)

SIMULATION_URL = "https://simul-hidroponico.vercel.app"

async def fetch_data_from_simulation():
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            weather_res = await client.get(f"{SIMULATION_URL}/weather")
            node1_res = await client.get(f"{SIMULATION_URL}/node1")
            central_res = await client.get(f"{SIMULATION_URL}/central_node")
            
            weather_data = weather_res.json() if weather_res.status_code == 200 else {}
            node1_data = node1_res.json() if node1_res.status_code == 200 else {}
            central_data = central_res.json() if central_res.status_code == 200 else {}
            
            # Extract values, handle possible errors or missing keys
            temperature = float(weather_data.get("temperature")) if weather_data.get("temperature") else None
            humidity = float(weather_data.get("humidity")) if weather_data.get("humidity") else None
            soil_humidity = float(node1_data.get("soil_humidity")) if "soil_humidity" in node1_data else None
            water_level = float(central_data.get("water_level")) if "water_level" in central_data else None
            product_level = float(central_data.get("product_level")) if "product_level" in central_data else None
            
            pump_state = node1_data.get("pump_state", [])
            flow_state = node1_data.get("flow_state", [])
            
            # Mock pH and conductivity (not provided by the simulation)
            ph = round(random.uniform(5.0, 7.5), 2)
            conductivity = round(random.uniform(0.8, 3.0), 2)
            
            return {
                "sensors": {
                    "temperature": temperature,
                    "humidity": humidity,
                    "soil_humidity": soil_humidity,
                    "water_level": water_level,
                    "product_level": product_level,
                    "ph": ph,
                    "conductivity": conductivity
                },
                "actuators": {
                    "pump_state": pump_state,
                    "flow_state": flow_state
                }
            }
        except Exception as e:
            logger.error(f"Error fetching simulation data: {e}")
            return None

async def run_automatic_control(session, sensors, config):
    if not config.is_auto_mode:
        return
        
    ph = sensors.get("ph")
    if ph is not None:
        if ph < config.target_ph_min:
            await crud.create_action_log(session, "AUTO_PH_UP", f"pH {ph} está abaixo do mínimo ({config.target_ph_min}). Adicionando base.")
        elif ph > config.target_ph_max:
            await crud.create_action_log(session, "AUTO_PH_DOWN", f"pH {ph} está acima do máximo ({config.target_ph_max}). Adicionando ácido.")
            
    conductivity = sensors.get("conductivity")
    if conductivity is not None:
        if conductivity < config.target_conductivity_min:
            await crud.create_action_log(session, "AUTO_COND_UP", f"Condutividade {conductivity} está baixa. Adicionando nutrientes.")
        elif conductivity > config.target_conductivity_max:
            await crud.create_action_log(session, "AUTO_COND_DOWN", f"Condutividade {conductivity} está alta. Adicionando água pura.")

    water_level = sensors.get("water_level")
    if water_level is not None and water_level < config.min_water_level:
        await crud.create_action_log(session, "AUTO_WATER_FILL", f"Nível de água {water_level}% está abaixo do mínimo ({config.min_water_level}%). Ligando bomba de água.")

async def simulation_polling_task():
    while True:
        try:
            data = await fetch_data_from_simulation()
            if data:
                async with AsyncSessionLocal() as session:
                    # Save sensors
                    await crud.create_sensor_data(session, data["sensors"])
                    # Save actuators
                    await crud.create_actuator_state(session, data["actuators"]["pump_state"], data["actuators"]["flow_state"])
                    
                    # Run control logic
                    config = await crud.get_control_config(session)
                    await run_automatic_control(session, data["sensors"], config)
        except asyncio.CancelledError:
            logger.info("Simulation polling task cancelled")
            break
        except Exception as e:
            logger.error(f"Unexpected error in simulation task: {e}")
            
        await asyncio.sleep(10) # Poll every 10 seconds
