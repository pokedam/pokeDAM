package org.cifpaviles.pokedam.rest_server.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_player_pokemon")
public class PlayerPokemon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

       
    // alias: string | null;
    // pokemon: number;
    // lvl: number;
    // exp: number;
    // iv: Stats;
    // movs: Movs[];
    // gender: Gender;
    // shiny: boolean;
    // owner: number; -> Por el que filtras
}
