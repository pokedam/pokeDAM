package org.cifpaviles.pokedam.rest_server.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "app_player_pokemon")
public class PlayerPokemon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = true)
    public String alias;

    @Column(nullable = false)
    public Integer pokemon;

    @Column(nullable = false)
    public Integer lvl;

    @Column(nullable = false)
    public Integer exp;

    @Embedded
    public Stats iv;

    @ElementCollection
    @CollectionTable(name = "app_player_pokemon_movs", joinColumns = @JoinColumn(name = "player_pokemon_id"))
    @Column(name = "mov_id")
    public java.util.List<Integer> movs;

    @Enumerated(jakarta.persistence.EnumType.STRING)
    @Column(nullable = false)
    public Gender gender;

    @Column(nullable = false)
    public Boolean shiny;

    @jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @jakarta.persistence.JoinColumn(name = "owner_id", nullable = false)
    public User owner;
}
