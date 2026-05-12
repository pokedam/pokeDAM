package org.cifpaviles.pokedam.rest_server.models;

import java.util.List;

import org.cifpaviles.pokedam.rest_server.entity.Stats;

public class PokemonResponseFull {
    public Long id;    
    public Integer pokedexIdx;
    public Stats stats;
    public List<String> movs;
}
