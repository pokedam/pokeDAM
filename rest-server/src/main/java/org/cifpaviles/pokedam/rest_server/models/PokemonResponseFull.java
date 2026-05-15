package org.cifpaviles.pokedam.rest_server.models;

import org.cifpaviles.pokedam.rest_server.entity.Pokemon;
import java.util.ArrayList;
import java.util.List;

import org.cifpaviles.pokedam.rest_server.entity.Stats;

public class PokemonResponseFull {
    public PokemonResponseFull(Pokemon pokemon) {
        id = pokemon.id;
        name = null;
        pokedexIdx = pokemon.pokedexIdx;
        iv = pokemon.iv;
        movs = pokemon.movs;
    }

    public Long id;
    public String name;
    public int pokedexIdx;
    public Stats iv;
    public List<String> movs = new ArrayList<>();
}
