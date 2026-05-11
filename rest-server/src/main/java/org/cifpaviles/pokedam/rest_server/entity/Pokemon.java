package org.cifpaviles.pokedam.rest_server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
    public Integer pokemon;

    // @Column(nullable = false)
    // public Integer lvl;

    // @Column(nullable = false)
    // public Integer exp;

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
