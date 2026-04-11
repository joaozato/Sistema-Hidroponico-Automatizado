from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker  #permite criar a função assyncrona
from sqlalchemy.orm import declarative_base   #base declarativa
from typing import AsyncGenerator #gerador assyncrono
from dotenv import load_dotenv  #importa da biblioteca dotenv, busca os dados do DB dentro do .env mantendo seguro a aplicação.
import os 

load_dotenv()
#Database vai receber a info do .env 
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo = True)
#cria a engine de Async e echo faz com que possamos ver as att do banco


#Cria a inicializadora de sessão async
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

#define uma dependencia para colher sessões no FAST API

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

Base = declarative_base()