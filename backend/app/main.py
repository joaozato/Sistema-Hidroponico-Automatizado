from fastapi import FastAPI  #importamos o fast API 
from app.database import Base, engine, get_async_session   #importamos o que será necessário para inicializar o back end

app = FastAPI() #criamos uma instancia para inicializar

#inicializamos no fast api o evento assim.
@app.on_event("startup")
async def startup(): #função de inicializar
    async with engine.begin() as conn: #conn é connection , aguarda que a engine inicialize a conexão com o banco
        await conn.run_sync(Base.metadata.create_all) #ele aguarda a conexão para a base criar as tabelas no banco.

