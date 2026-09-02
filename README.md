# Sistema-Hidroponico-Automatizado

Desenvolvimento de uma solução IoT para automação de estufas de morango em sistema hidropônico, em parceria com a EMATER e com apoio do Ministério de Ciência, Tecnologia e Inovação.

---

## 🛠 Arquitetura do Backend

O backend foi construído com **FastAPI** e **PostgreSQL** (asyncpg), contando com tarefas em segundo plano (background tasks) que coletam dados de um servidor de simulação IoT.

### Funcionalidades do Backend
- Consumo assíncrono dos dados da estufa simulada (temperatura, umidade, pH, condutividade, níveis e atuadores das três linhas).
- Simulação de valores de pH e Condutividade, integrando-os nas leituras.
- Controle Automatizado: O sistema avalia os parâmetros e, caso fora das metas, registra as ações corretivas.
- Controle Manual: API para acionar componentes manualmente.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Python 3.9+ instalado.
- Banco de Dados (PostgreSQL) rodando (ou configurado com banco em nuvem tipo Neon).
- Servidor de simulação rodando (ou usando o deploy no Vercel).

### Instalação
1. Acesse a pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
3. Garanta que o seu arquivo `.env` tenha a variável do banco de dados:
   ```env
   DATABASE_URL=postgresql+asyncpg://usuario:senha@host/banco
   ```

### Iniciando o Servidor
Com as dependências instaladas, rode o uvicorn:
```bash
python -m uvicorn app.main:app --reload
```
A API estará acessível em: `http://127.0.0.1:8000`.

Você pode testar todos os endpoints interativamente usando a documentação do Swagger:
👉 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

## 📡 Endpoints (Rotas da API)

### 🌿 Sensores
- `GET /api/sensors/current`
  Retorna o snapshot mais recente do clima, níveis, abastecimento central e das três linhas, incluindo pH, condutividade, umidade, bombas e fluxo.
  
- `GET /api/sensors/history?days=7&line_number=1`
  Retorna snapshots históricos, opcionalmente filtrados por período e linha.
  
- `GET /api/sensors/actuators/current`
  Retorna o estado atual de funcionamento das bombas e fluxo.

### ⚙️ Configurações e Metas
- `GET /api/config`
  Retorna as configurações atuais (Modo Automático/Manual, metas de pH, etc.).

- `PUT /api/config`
  Atualiza as metas. Exemplo de payload (JSON):
  ```json
  {
    "is_auto_mode": true,
    "target_ph_min": 6.0,
    "target_ph_max": 7.0,
    "target_conductivity_min": 1.0,
    "target_conductivity_max": 2.5,
    "min_water_level": 20.0
  }
  ```

### 🎮 Controle (Ações)
- `PUT /api/control/lines/{line_number}/pumps/{pump_number}`
  Encaminha um comando individual ao simulador quando o modo manual está ativo. O payload é `{ "enabled": true, "flow": 12 }`, com linhas de 1 a 3, bombas de 1 a 8 e fluxo de 0 a 20.
- `POST /api/control/manual`
  Grava uma ação manual no sistema. **Nota:** Só funciona se o modo automático (`is_auto_mode`) estiver desativado (`false`).
  Exemplo de payload (JSON):
  ```json
  {
    "action_type": "LIGAR_BOMBA_NUTRIENTES",
    "details": "Usuário ligou a bomba via dashboard."
  }
  ```

- `GET /api/control/logs`
  Retorna o histórico/auditoria de todas as ações que o sistema realizou (tanto automáticas quanto manuais).

### Variáveis de ambiente

Além de `DATABASE_URL`, configure `SIMULATION_URL`, `POLL_INTERVAL_SECONDS` e `CORS_ORIGINS` conforme o ambiente.
