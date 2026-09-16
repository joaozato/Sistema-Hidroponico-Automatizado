-- ====================================================================================================
-- GATILHO 1: Atualiza status do ESP32 ao receber leitura de sensor
-- ====================================================================================================
CREATE OR REPLACE FUNCTION atualizar_ultima_comunicacao_sensor()
RETURNS TRIGGER AS $$
DECLARE
    v_micro_id INTEGER;
BEGIN
    SELECT fk_microcontroladores_micro_id INTO v_micro_id
    FROM sensores
    WHERE sensor_id = NEW.sensor_id;
    
    IF v_micro_id IS NOT NULL THEN
        UPDATE microcontroladores
        SET ultima_comunicacao = NEW.data_hora
        WHERE micro_id = v_micro_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_atualizar_comunicacao_sensor
AFTER INSERT ON log_leituras
FOR EACH ROW
EXECUTE FUNCTION atualizar_ultima_comunicacao_sensor();

COMMENT ON FUNCTION atualizar_ultima_comunicacao_sensor() IS 'Atualiza a data/hora da última comunicação do microcontrolador sempre que uma nova leitura de sensor chega.';

-- ====================================================================================================
-- GATILHO 2: Atualiza status do ESP32 ao acionar comando de atuador
-- ====================================================================================================
CREATE OR REPLACE FUNCTION atualizar_ultima_comunicacao_atuador()
RETURNS TRIGGER AS $$
DECLARE
    v_micro_id INTEGER;
BEGIN
    SELECT fk_microcontroladores_micro_id INTO v_micro_id
    FROM atuadores
    WHERE atuador_id = NEW.atuador_id;
    
    IF v_micro_id IS NOT NULL THEN
        UPDATE microcontroladores
        SET ultima_comunicacao = NEW.data_hora
        WHERE micro_id = v_micro_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_atualizar_comunicacao_atuador
AFTER INSERT ON log_comandos
FOR EACH ROW
EXECUTE FUNCTION atualizar_ultima_comunicacao_atuador();

COMMENT ON FUNCTION atualizar_ultima_comunicacao_atuador() IS 'Atualiza a data/hora da última comunicação do microcontrolador sempre que um comando de atuador é registrado.';

-- ====================================================================================================
-- GATILHO 3: Validação Customizada - Evita conflito de Ciclos Ativos
-- ====================================================================================================
CREATE OR REPLACE FUNCTION validar_ciclo_ativo_setor()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_fim IS NULL THEN
        IF EXISTS (
            SELECT 1 
            FROM ciclos_ativos 
            WHERE fk_setores_setor_id = NEW.fk_setores_setor_id 
              AND data_fim IS NULL 
              AND ciclo_id <> COALESCE(NEW.ciclo_id, -1)
        ) THEN
            RAISE EXCEPTION 'ERRO: O setor % já possui um ciclo ativo. Finalize-o antes de iniciar um novo cultivo.', NEW.fk_setores_setor_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_validar_ciclo_ativo
BEFORE INSERT OR UPDATE ON ciclos_ativos
FOR EACH ROW
EXECUTE FUNCTION validar_ciclo_ativo_setor();

COMMENT ON FUNCTION validar_ciclo_ativo_setor() IS 'Gera uma mensagem de erro amigável se a API tentar abrir um ciclo de cultivo num setor que já está ocupado.';

-- ====================================================================================================
-- GATILHO 4: Sistema de Segurança e Alertas (Unificado)
-- ====================================================================================================
CREATE OR REPLACE FUNCTION trg_func_verificar_leituras()
RETURNS TRIGGER AS $$
DECLARE
    v_tipo VARCHAR(50);
    v_ph_min FLOAT;
    v_ph_max FLOAT;
    v_ce_min FLOAT;
    v_ce_max FLOAT;
    v_cultivo_nome VARCHAR(100);
    v_mensagem VARCHAR(255);
BEGIN
    -- 1. Identifica o tipo do sensor de forma robusta
    SELECT tipo INTO v_tipo FROM sensores WHERE sensor_id = NEW.sensor_id;
    
    -- 2. Busca limites do cultivo ativo para o setor deste sensor
    SELECT c.nome, c.ph_min, c.ph_max, c.ce_min, c.ce_max 
    INTO v_cultivo_nome, v_ph_min, v_ph_max, v_ce_min, v_ce_max
    FROM sensores s
    JOIN ciclos_ativos ca ON s.fk_setores_setor_id = ca.fk_setores_setor_id
    JOIN catalogo_cultivos c ON ca.fk_catalogo_cultivos_cultivo_id = c.cultivo_id
    WHERE s.sensor_id = NEW.sensor_id AND ca.data_fim IS NULL;
    
    -- 3. Checagem de limites com Case Insensitive (UPPER) e formatação de texto limpa
    IF v_cultivo_nome IS NOT NULL THEN
        IF UPPER(v_tipo) = 'PH' AND (NEW.valor < v_ph_min OR NEW.valor > v_ph_max) THEN
            v_mensagem := format('ALERTA: pH fora da faixa para %s (limites: %s a %s | valor lido: %s)', v_cultivo_nome, v_ph_min, v_ph_max, NEW.valor);
            
            INSERT INTO alertas_seguranca (sensor_id, data_hora, valor, mensagem)
            VALUES (NEW.sensor_id, NEW.data_hora, NEW.valor, v_mensagem);
            
        ELSIF UPPER(v_tipo) = 'CE' AND (NEW.valor < v_ce_min OR NEW.valor > v_ce_max) THEN
            v_mensagem := format('ALERTA: CE fora da faixa para %s (limites: %s a %s | valor lido: %s)', v_cultivo_nome, v_ce_min, v_ce_max, NEW.valor);
            
            INSERT INTO alertas_seguranca (sensor_id, data_hora, valor, mensagem)
            VALUES (NEW.sensor_id, NEW.data_hora, NEW.valor, v_mensagem);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_verificar_leituras
AFTER INSERT ON log_leituras
FOR EACH ROW
EXECUTE FUNCTION trg_func_verificar_leituras();

COMMENT ON FUNCTION trg_func_verificar_leituras() IS 'Avalia instantaneamente se a leitura inserida viola os limites de pH e Condutividade do plantio ativo e dispara um alerta de segurança se necessário.';