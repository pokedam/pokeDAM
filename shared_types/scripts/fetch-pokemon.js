const fs = require('fs');
const path = require('path');

const generatedDir = path.join(__dirname, '..', 'src', 'generated');
const outputPath = path.join(generatedDir, 'pokemon.json');

async function fetchPokemonForce() {
    const pokemonList = [];

    try {
        console.log("Fetching total number of available Pokémon...");
        // Query species endpoint to get the exact total count (currently ~1025)
        const metaResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/?limit=1`);
        const metaData = await metaResponse.json();
        const limit = metaData.count;

        console.log(`Starting download of ${limit} Pokémon...`);

        for (let i = 1; i <= limit; i++) {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);

                // If the Pokémon does not exist or returns an error (API sometimes skips IDs)
                if (!response.ok) continue;

                const data = await response.json();

                pokemonList.push({
                    id: data.id,
                    name: data.name,
                    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`
                });

                if (i % 100 === 0) {
                    console.log(`Progress: ${i} of ${limit} downloaded...`);
                }
            } catch (error) {
                console.error(`Skipping ID ${i}: Pokémon may not exist.`);
            }
        }

        // Save JSON file to shared_types/src/generated
        if (!fs.existsSync(generatedDir)) {
            fs.mkdirSync(generatedDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(pokemonList, null, 2));

        console.log(`\nSuccess! Saved ${pokemonList.length} Pokémon to '${outputPath}'.`);

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