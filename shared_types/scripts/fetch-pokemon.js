const fs = require('fs');
const path = require('path');

const generatedDir = path.join(__dirname, '..', 'src', 'generated');
const outputPath = path.join(generatedDir, 'pokemon.json');
const CONCURRENCY = 20;

async function fetchPokemonForce() {

    try {
        console.log("Fetching total number of available Pokémon...");
        // Query species endpoint to get the exact total count (currently ~1025)
        const metaResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/?limit=1`);
        const metaData = await metaResponse.json();
        const limit = metaData.count;

        console.log(`Starting download of ${limit} Pokémon...`);

        const ids = Array.from({ length: limit }, (_, i) => i + 1);
        const pokemons = [];

        for (let i = 0; i < ids.length; i += CONCURRENCY) {
            const batch = ids.slice(i, i + CONCURRENCY);
            const batchResults = await Promise.all(batch.map(async (id) => {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                const data = await response.json();
                const types = data.types;
                const stats = Array.isArray(data.stats) ? data.stats : [];
                const statLookup = stats.reduce((acc, statEntry) => {
                    if (statEntry?.stat?.name && typeof statEntry.base_stat === 'number') {
                        acc[statEntry.stat.name] = statEntry.base_stat;
                    }
                    return acc;
                }, {});
                return {
                    types: {
                        main: types[0].type.name,
                        secondary: types[1]?.type.name
                    },
                    id: data.id,
                    name: data.name,
                    statsBase: {
                        hp: statLookup['hp'] ?? 0,
                        attack: statLookup['attack'] ?? 0,
                        defense: statLookup['defense'] ?? 0,
                        specialAttack: statLookup['special-attack'] ?? 0,
                        specialDefense: statLookup['special-defense'] ?? 0,
                        speed: statLookup['speed'] ?? 0,
                    }
                };
            }));

            pokemons.push(...batchResults);
        }

        // Save JSON file to shared_types/src/generated
        if (!fs.existsSync(generatedDir)) {
            fs.mkdirSync(generatedDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(pokemons, null, 2));

        console.log(`\nSuccess! Saved ${pokemons.length} Pokémon to '${outputPath}'.`);

    } catch (error) {
        console.error("Critical error while connecting to the API:", error);
    }
}

async function fetchPokemon() {
    if (fs.existsSync(outputPath)) {
        return;
    }

    await fetchPokemonForce();
}

const args = process.argv.slice(2);
const force = args.includes('--force') || args.includes('-f');

if (force) {
    console.log('Force flag detected, rebuilding datasets...');
    fetchPokemonForce();
} else {
    fetchPokemon();
}