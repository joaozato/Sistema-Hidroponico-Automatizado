-- ====================================================================================================
-- INFRAESTRUTURA
-- ====================================================================================================
-- Unidade física: estufa
CREATE TABLE estufas (
    estufa_id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_criacao DATE DEFAULT CURRENT_DATE,
    localizacao VARCHAR(255)
);
COMMENT ON TABLE estufas IS 'Registra as estufas físicas gerenciadas pelo sistema.';

-- Hardware centralizador: microcontrolador (ESP32)
CREATE TABLE microcontroladores (
    micro_id SERIAL PRIMARY KEY,
    mac_address MACADDR UNIQUE NOT NULL,
    descricao VARCHAR(255),
    ultima_comunicacao TIMESTAMP,
    fk_estufas_estufa_id INTEGER NOT NULL,
    CONSTRAINT FK_microcontroladores_estufas FOREIGN KEY (fk_estufas_estufa_id)
        REFERENCES estufas (estufa_id) ON DELETE CASCADE
);
COMMENT ON TABLE microcontroladores IS 'Cadastro dos nós IoT (ESP32) vinculados às estufas.';

-- Setores físicos: carreiras, reservatórios, ambiente geral
CREATE TABLE setores (
    setor_id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    fk_estufas_estufa_id INTEGER NOT NULL,
    CONSTRAINT FK_setores_estufas FOREIGN KEY (fk_estufas_estufa_id)
        REFERENCES estufas (estufa_id) ON DELETE CASCADE
);
COMMENT ON TABLE setores IS 'Subdivisões lógicas e físicas de uma estufa (ex: Carreira 1, Reservatório, etc.).';


-- ====================================================================================================
-- HARDWARE: SENSORES E ATUADORES
-- ====================================================================================================
-- Cadastro dos sensores: pH, condutividade, etc.
CREATE TABLE sensores (
    sensor_id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    pino_digital INTEGER,
    unidade_medida VARCHAR(20),
    fk_microcontroladores_micro_id INTEGER NOT NULL,
    fk_setores_setor_id INTEGER NOT NULL,
    CONSTRAINT FK_sensores_microcontroladores FOREIGN KEY (fk_microcontroladores_micro_id)
        REFERENCES microcontroladores (micro_id) ON DELETE RESTRICT,
    CONSTRAINT FK_sensores_setores FOREIGN KEY (fk_setores_setor_id)
        REFERENCES setores (setor_id) ON DELETE CASCADE
);
COMMENT ON TABLE sensores IS 'Catálogo de sensores (pH, CE, Temperatura) associados a um setor e microcontrolador.';

-- Cadastro dos atuadores: válvulas das carreiras e bomba.
CREATE TABLE atuadores (
    atuador_id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    pino_digital INTEGER,
    fk_microcontroladores_micro_id INTEGER NOT NULL,
    fk_setores_setor_id INTEGER, -- NULL se for Bomba
    fk_estufas_estufa_id INTEGER, -- NULL se for Válvula
    
    -- Restrição de Chave Estrangeira
    CONSTRAINT FK_atuadores_microcontroladores FOREIGN KEY (fk_microcontroladores_micro_id)
        REFERENCES microcontroladores (micro_id) ON DELETE RESTRICT,
    CONSTRAINT FK_atuadores_setores FOREIGN KEY (fk_setores_setor_id)
        REFERENCES setores (setor_id) ON DELETE CASCADE,
    CONSTRAINT FK_atuadores_estufas FOREIGN KEY (fk_estufas_estufa_id)
        REFERENCES estufas (estufa_id) ON DELETE CASCADE,
        
    -- Trava no Banco para Tipos Permissíveis.
    CONSTRAINT CK_atuador_tipo CHECK (tipo IN ('Bomba', 'Valvula')),
    
    -- Restrição Logica: Bomba pertence a Estufa, Valvula pertence a Setor
    CONSTRAINT CK_atuador_localizacao CHECK (
        (tipo = 'Bomba' AND fk_estufas_estufa_id IS NOT NULL AND fk_setores_setor_id IS NULL) OR
        (tipo = 'Valvula' AND fk_setores_setor_id IS NOT NULL AND fk_estufas_estufa_id IS NULL)
    )
);
COMMENT ON TABLE atuadores IS 'Dispositivos de ação. Bombas aplicam-se à estufa; válvulas a setores específicos.';


-- ====================================================================================================
-- CULTIVOS E CICLOS DE CULTIVO
-- ====================================================================================================
-- Catálogo de cultivos registrados: morango, etc.
CREATE TABLE catalogo_cultivos (
    cultivo_id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ph_min FLOAT,
    ph_max FLOAT,
    ce_min FLOAT,
    ce_max FLOAT,
    temp_ideal FLOAT
);
COMMENT ON TABLE catalogo_cultivos IS 'Dicionário de tipos de plantação e seus parâmetros ideais (pH, CE, Temp).';

-- Ciclos de cultivo ativos: qual cultivo está em qual setor e quando começou.
CREATE TABLE ciclos_ativos (
    ciclo_id SERIAL PRIMARY KEY,
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE, -- Melhoria 2: Default para simplificar inserts
    data_fim DATE,
    fk_catalogo_cultivos_cultivo_id INTEGER NOT NULL,
    fk_setores_setor_id INTEGER NOT NULL,
    CONSTRAINT FK_ciclos_ativos_cultivos FOREIGN KEY (fk_catalogo_cultivos_cultivo_id)
        REFERENCES catalogo_cultivos (cultivo_id) ON DELETE RESTRICT,
    CONSTRAINT FK_ciclos_ativos_setores FOREIGN KEY (fk_setores_setor_id)
        REFERENCES setores (setor_id) ON DELETE RESTRICT
);
COMMENT ON TABLE ciclos_ativos IS 'Controle temporal e de localização dos plantios ativos.';

-- Garante que não haja mais de um ciclo ativo por setor ao mesmo tempo.
CREATE UNIQUE INDEX idx_setor_ciclo_ativo 
ON ciclos_ativos (fk_setores_setor_id) 
WHERE (data_fim IS NULL);


-- ====================================================================================================
-- LOGS E MONITORAMENTO
-- ====================================================================================================
-- Log de leituras dos sensores
CREATE TABLE log_leituras (
    sensor_id INTEGER NOT NULL,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor FLOAT NOT NULL,
    PRIMARY KEY (sensor_id, data_hora),
    CONSTRAINT FK_log_leituras_sensores FOREIGN KEY (sensor_id)
        REFERENCES sensores (sensor_id) ON DELETE CASCADE
);
COMMENT ON TABLE log_leituras IS 'Série temporal (Time-Series) das medições captadas pelos sensores.';

-- Log de comandos enviados aos atuadores
CREATE TABLE log_comandos (
    atuador_id INTEGER NOT NULL,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(10) NOT NULL,
    origem VARCHAR(100), -- ex: 'API', 'Gatilho de Seguranca', 'Manual'
    PRIMARY KEY (atuador_id, data_hora),
    CONSTRAINT FK_log_comandos_atuadores FOREIGN KEY (atuador_id)
        REFERENCES atuadores (atuador_id) ON DELETE CASCADE
);
COMMENT ON TABLE log_comandos IS 'Auditoria de ativação/desativação dos equipamentos (Bombas/Válvulas).';

-- Log de erros reportados pelo(s) microcontrolador(es)
CREATE TABLE log_erros (
    id_dispositivo INTEGER NOT NULL,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cod_erro INTEGER,
    mensagem VARCHAR(255),
    PRIMARY KEY (id_dispositivo, data_hora),
    CONSTRAINT FK_log_erros_microcontroladores FOREIGN KEY (id_dispositivo)
        REFERENCES microcontroladores (micro_id) ON DELETE CASCADE
);
COMMENT ON TABLE log_erros IS 'Registro de falhas emitidas pelo hardware (ESP32).';

-- Alerta de segurança: quando um sensor ultrapassa limites críticos, registra o evento.
CREATE TABLE alertas_seguranca (
    alerta_id SERIAL PRIMARY KEY,
    sensor_id INTEGER NOT NULL,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor FLOAT NOT NULL,
    mensagem VARCHAR(255) NOT NULL,
    CONSTRAINT FK_alertas_seguranca_sensores FOREIGN KEY (sensor_id)
        REFERENCES sensores (sensor_id) ON DELETE CASCADE
);
COMMENT ON TABLE alertas_seguranca IS 'Registro automático acionado via Trigger quando os valores lidos ultrapassam o tolerado pelo Cultivo Ativo.';
