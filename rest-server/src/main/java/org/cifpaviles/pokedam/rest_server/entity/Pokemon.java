package org.cifpaviles.pokedam.rest_server.entity;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_player_pokemon")
public class Pokemon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    public User owner;

    // @Column(nullable = true)
    // public String alias;

    @Column(nullable = false)
    public int pokedexIdx;

    // @Column(nullable = false)
    // public Integer lvl;

    // @Column(nullable = false)
    // public Integer exp;

    @ElementCollection
    @CollectionTable(name = "pokemon_movs", joinColumns = @JoinColumn(name = "pokemon_id"))
    public List<String> movs = new ArrayList<>();

    @Embedded
    public Stats iv;

    @Column(nullable = false)
    public boolean isActive;

    public static Pokemon random() {
        Pokemon pokemon = new Pokemon();
        pokemon.pokedexIdx = ThreadLocalRandom.current().nextInt(1, 1026);
        pokemon.iv = new Stats();
        pokemon.iv.level = 0;
        pokemon.iv.exp = 0;
        pokemon.iv.hp = 0;
        pokemon.iv.attack = 0;
        pokemon.iv.defense = 0;
        pokemon.iv.spAttack = 0;
        pokemon.iv.spDefense = 0;
        pokemon.iv.speed = 0;
        pokemon.movs.add("destructor");
        return pokemon;
    }

    // @Enumerated(jakarta.persistence.EnumType.STRING)
    // @Column(nullable = false)
    // public Gender gender;

    // @Column(nullable = false)
    // public Boolean shiny;

}
