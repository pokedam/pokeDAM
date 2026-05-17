package org.cifpaviles.pokedam.rest_server.dataset;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class PokemonDataset {
    public record PokemonTypes(String main, String secondary) {}
    public record PokemonData(int id, String name, PokemonTypes types) {}

    private static final Map<Integer, PokemonData> POKEMON_MAP = new HashMap<>();
    private static final Map<String, List<String>> MOVES_BY_TYPE = new HashMap<>();

    static {
        MOVES_BY_TYPE.put("normal", List.of("destructor", "hyperBeam", "megaPunch", "recover", "cheerUp", "helpingHand"));
        MOVES_BY_TYPE.put("fire", List.of("ember", "overheat", "fireBlast", "sunnyDay", "warmHeal", "flameChargeBuff"));
        MOVES_BY_TYPE.put("water", List.of("waterGun", "hydroCannon", "hydroPump", "lifeDew", "rainDance", "aquaRing"));
        MOVES_BY_TYPE.put("grass", List.of("vineWhip", "frenzyPlant", "leafStorm", "synthesis", "aromatherapy", "cottonGuard"));
        MOVES_BY_TYPE.put("electric", List.of("thunderShock", "zapCannon", "thunder", "charge", "magneticFlux", "sparkHeal"));
        MOVES_BY_TYPE.put("ice", List.of("iceShard", "freezeDry", "blizzard", "snowscape", "iceShield", "chillPill"));
        MOVES_BY_TYPE.put("fighting", List.of("karateChop", "closeCombat", "dynamicPunch", "bulkUp", "coaching", "meditate"));
        MOVES_BY_TYPE.put("poison", List.of("poisonSting", "sludgeWave", "gunkShot", "acidArmor", "toxicBarrier", "purify"));
        MOVES_BY_TYPE.put("ground", List.of("mudSlap", "earthquake", "mudBomb", "spikesShield", "shoreUp", "earthBlessing"));
        MOVES_BY_TYPE.put("flying", List.of("peck", "braveBird", "hurricane", "roost", "tailwind", "featherDanceBuff"));
        MOVES_BY_TYPE.put("psychic", List.of("confusion", "psychoBoost", "zenHeadbutt", "calmMind", "healPulse", "reflect"));
        MOVES_BY_TYPE.put("bug", List.of("furyCutter", "bugBuzz", "megahorn", "quiverDance", "pollenPuffHeal", "swarmBoost"));
        MOVES_BY_TYPE.put("rock", List.of("rockThrow", "headSmash", "stoneEdge", "rockPolish", "wideGuard", "stoneRest"));
        MOVES_BY_TYPE.put("ghost", List.of("astonish", "shadowForce", "shadowClaw", "shadowShield", "spiritShackleBuff", "spectralRest"));
        MOVES_BY_TYPE.put("dragon", List.of("dragonBreath", "dracoMeteor", "dragonRush", "dragonDance", "dragonCheer", "draconicAura"));
        MOVES_BY_TYPE.put("steel", List.of("metalClaw", "flashCannon", "ironTail", "ironDefense", "gearUp", "metallicShine"));
        MOVES_BY_TYPE.put("fairy", List.of("fairyWind", "fleurCannon", "playRough", "moonlight", "floralHealing", "mistyTerrain"));
        MOVES_BY_TYPE.put("dark", List.of("bite", "darkPulse", "darkBarrage", "nastyPlot", "darkCloak", "midnightCheer"));

        try {
            ObjectMapper mapper = new ObjectMapper()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            try (InputStream is = new ClassPathResource("pokemon.json").getInputStream()) {
                List<PokemonData> list = mapper.readValue(is, new TypeReference<List<PokemonData>>() {});
                for (PokemonData data : list) {
                    POKEMON_MAP.put(data.id(), data);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static PokemonData getPokemonData(int pokedexIdx) {
        return POKEMON_MAP.get(pokedexIdx);
    }

    public static List<String> getRandomMovesForPokemon(int pokedexIdx, int count) {
        PokemonData data = getPokemonData(pokedexIdx);
        if (data == null || data.types() == null) {
            List<String> normalMoves = new ArrayList<>(MOVES_BY_TYPE.getOrDefault("normal", List.of("destructor")));
            Collections.shuffle(normalMoves, ThreadLocalRandom.current());
            return normalMoves.subList(0, Math.min(count, normalMoves.size()));
        }

        Set<String> possibleMoves = new HashSet<>(MOVES_BY_TYPE.getOrDefault(data.types().main(), Collections.emptyList()));
        if (data.types().secondary() != null) {
            possibleMoves.addAll(MOVES_BY_TYPE.getOrDefault(data.types().secondary(), Collections.emptyList()));
        }

        List<String> list = new ArrayList<>(possibleMoves);
        if (list.isEmpty()) {
            list.add("destructor");
        }
        Collections.shuffle(list, ThreadLocalRandom.current());
        return list.subList(0, Math.min(count, list.size()));
    }
}
