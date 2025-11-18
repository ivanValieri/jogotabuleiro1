-- Função para atribuir missões aleatórias para jogadores sem missão
CREATE OR REPLACE FUNCTION assign_missing_missions(room_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    player_record RECORD;
    available_missions integer[] := ARRAY[1,2,3,4,5,6,7,8];
    used_missions integer[];
    random_mission integer;
BEGIN
    -- Buscar missões já utilizadas na sala
    SELECT ARRAY_AGG(mission_id) INTO used_missions
    FROM game_players 
    WHERE room_id = room_uuid AND mission_id IS NOT NULL;
    
    -- Se não há missões utilizadas, inicializar array vazio
    IF used_missions IS NULL THEN
        used_missions := ARRAY[]::integer[];
    END IF;
    
    -- Para cada jogador sem missão na sala
    FOR player_record IN 
        SELECT id, player_id 
        FROM game_players 
        WHERE room_id = room_uuid AND mission_id IS NULL
    LOOP
        -- Remover missões já utilizadas da lista disponível
        available_missions := ARRAY(
            SELECT unnest(ARRAY[1,2,3,4,5,6,7,8]) 
            EXCEPT 
            SELECT unnest(used_missions)
        );
        
        -- Se não há missões disponíveis, reiniciar a lista
        IF array_length(available_missions, 1) = 0 THEN
            available_missions := ARRAY[1,2,3,4,5,6,7,8];
        END IF;
        
        -- Selecionar uma missão aleatória
        random_mission := available_missions[1 + floor(random() * array_length(available_missions, 1))];
        
        -- Atribuir a missão ao jogador
        UPDATE game_players 
        SET mission_id = random_mission 
        WHERE id = player_record.id;
        
        -- Adicionar a missão à lista de utilizadas
        used_missions := array_append(used_missions, random_mission);
    END LOOP;
END;
$$;