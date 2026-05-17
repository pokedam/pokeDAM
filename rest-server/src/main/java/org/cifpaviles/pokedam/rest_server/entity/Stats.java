package org.cifpaviles.pokedam.rest_server.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class Stats {
    public int level;
    public int exp;
    public int hp;
    public int attack;
    public int defense;
    public int specialAttack;
    public int specialDefense;
    public int speed;
}
