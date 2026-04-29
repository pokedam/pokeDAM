package org.cifpaviles.pokedam.rest_server.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class Stats {
    public Integer hp;
    public Integer attack;
    public Integer defense;
    public Integer spAttack;
    public Integer spDefense;
    public Integer speed;
}
