package org.cifpaviles.pokedam.rest_server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.cifpaviles.pokedam.rest_server.models.UserChangeRequest;

import java.util.Arrays;
import jakarta.persistence.PrePersist;

@Entity
@Table(name = "app_user")
public class User {
    private static final List<String> TRAINER_BASE_NAMES = Arrays.asList(
            "Ash",
            "Red",
            "Blue",
            "Green",
            "Leaf",
            "Gold",
            "Silver",
            "Crystal",
            "Ethan",
            "Kris",
            "Lyra",
            "Brendan",
            "May",
            "Wally",
            "Barry",
            "Dawn",
            "Lucas",
            "Hilbert",
            "Cheren",
            "Bianca",
            "Hilda",
            "Rosa",
            "Nate",
            "Hugh",
            "N",
            "Ghetsis",
            "Cyrus",
            "Guzma",
            "Plumeria",
            "Gladion",
            "Lillie",
            "Kukui",
            "Hau",
            "Marnie",
            "Hop",
            "Leon",
            "Bea",
            "Peony",
            "Klara",
            "Avery",
            "Raihan",
            "Roxanne",
            "Brawly",
            "Wattson",
            "Flannery",
            "Norman",
            "Winona",
            "Tate",
            "Liza",
            "Wallace",
            "Sidney",
            "Phoebe",
            "Glacia",
            "Drake",
            "Steven",
            "Bruno",
            "Agatha",
            "Karen",
            "Falkner",
            "Bugsy",
            "Whitney",
            "Morty",
            "Clair",
            "Pryce",
            "Jasmine",
            "Koga",
            "Erika",
            "Sabrina",
            "Blaine",
            "Brock",
            "LtSurge",
            "Elesa",
            "Cilan",
            "Chili",
            "Cress",
            "Colress");

    public User() {

    }

    public User(UserChangeRequest data) {
        this.nickname = data.nickname;
        this.avatarId = data.avatarId;
        this.email = data.email;
        this.password = data.password;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(length = 100)
    public String nickname;

    @Column
    public Long avatarId;

    @Column(length = 100, unique = true)
    public String email;

    @Column(length = 500)
    public String password;

    @Column(length = 500, nullable = false)
    public String refreshToken;

    public static String generateRandomTrainerName() {
        int num = ThreadLocalRandom.current().nextInt(1, 1000); // 1..999
        String suffix = String.format("%03d", num);
        String base = TRAINER_BASE_NAMES.get(ThreadLocalRandom.current().nextInt(TRAINER_BASE_NAMES.size()));
        return base + suffix;
    }

    public void assignRandomTrainerName() {
        this.nickname = generateRandomTrainerName();
    }

    public static User createWithRandomName() {
        User u = new User();
        u.assignRandomTrainerName();
        return u;
    }

    @PrePersist
    public void ensureNicknameOnCreate() {
        if (this.nickname == null || this.nickname.isBlank()) {
            this.nickname = generateRandomTrainerName();
        }
    }

    public void setRefreshToken(String token) {
        this.refreshToken = token;
    }

    public String getRefreshToken() {
        return this.refreshToken;
    }
}
