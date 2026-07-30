import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import sensors, config, control
from app.services.simulation import simulation_polling_task
# importamos os models para garantir que o Base conheça as tabelas
from app import models

app = FastAPI(title="Sistema Hidropônico API")

# Configuração de CORS para permitir acesso do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui os roteadores
app.include_router(sensors.router)
app.include_router(config.router)
app.include_router(control.router)

# Armazena a task em background para poder cancelar caso necessário (embora no startup/shutdown simples não seja estritamente necessário)
background_tasks = set()

@app.on_event("startup")
async def startup():
    # Cria as tabelas no banco de dados
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Inicia a tarefa de polling da simulação em background
    task = asyncio.create_task(simulation_polling_task())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)

@app.on_event("shutdown")
async def shutdown():
    # Cancela as tarefas em background
    for task in background_tasks:
        task.cancel()
