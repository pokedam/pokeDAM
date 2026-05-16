package org.cifpaviles.pokedam.rest_server.models;

import java.util.List;
import java.util.Map;

public class GameSummary {
    public Long date;
    public List<Map<String, Object>> initialGame;
    public List<Object> history;
    public Map<String, Object> end;
}
