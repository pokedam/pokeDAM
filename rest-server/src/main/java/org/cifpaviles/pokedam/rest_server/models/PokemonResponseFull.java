package org.cifpaviles.pokedam.rest_server.models;

import java.util.ArrayList;
import java.util.List;

import org.cifpaviles.pokedam.rest_server.entity.Stats;

public class PokemonResponseFull {
    public Long id;
    public int pokedexIdx;
    public Stats stats;
    public List<String> movs = new ArrayList<>();
}
