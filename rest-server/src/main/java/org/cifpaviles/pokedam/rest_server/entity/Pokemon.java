package org.cifpaviles.pokedam.rest_server.entity;

import java.util.ArrayList;
import java.util.List;

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
    @Column(name = "mov")
    public List<String> movs = new ArrayList<>();

    @Embedded
    public Stats iv;

    @Column(nullable = false)
    public boolean isActive;

    // @Enumerated(jakarta.persistence.EnumType.STRING)
    // @Column(nullable = false)
    // public Gender gender;

    // @Column(nullable = false)
    // public Boolean shiny;

}
