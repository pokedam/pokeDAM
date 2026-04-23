package org.cifpaviles.pokedam.rest_server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(length = 100)
    public String nickname;

    @Column
    public int avatarIndex;

    @Column(length = 100)
    public String email;

    @Column(length = 500)
    public String password;
    
    @Column(length = 500, nullable = false)
    public String refreshToken;


}
