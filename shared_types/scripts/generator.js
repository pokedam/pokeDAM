const fs = require('fs');

async function obtenerPokemon() {
    const listaPokemon = [];
    
    try {
        console.log("Consultando el total de Pokémon disponibles...");
        // Consultamos la especie para saber el total exacto (actualmente 1025)
        const metaRespuesta = await fetch(`https://pokeapi.co/api/v2/pokemon-species/?limit=1`);
        const metaData = await metaRespuesta.json();
        const limite = metaData.count; 

        console.log(`Iniciando descarga de ${limite} Pokémon...`);

        for (let i = 1; i <= limite; i++) {
            try {
                const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
                
                // Si el Pokémon no existe o da error (a veces hay saltos en los IDs de la API)
                if (!respuesta.ok) continue;

                const data = await respuesta.json();

                listaPokemon.push({
                    id: data.id,
                    nombre: data.name,
                    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`
                });

                if (i % 100 === 0) {
                    console.log(`Progreso: ${i} de ${limite} descargados...`);
                }
            } catch (error) {
                console.error(`Error saltando ID ${i}: el Pokémon podría no existir.`);
            }
        }

        // Guardar el archivo JSON en shared_types/src/generated
        const path = require('path');
        const generatedDir = path.join(__dirname, '..', 'src', 'generated');
        if (!fs.existsSync(generatedDir)) {
            fs.mkdirSync(generatedDir, { recursive: true });
        }
        const outputPath = path.join(generatedDir, 'pokemon.json');
        fs.writeFileSync(outputPath, JSON.stringify(listaPokemon, null, 2));
        console.log(`\n¡Éxito! Se han guardado ${listaPokemon.length} Pokémon en '${outputPath}'.`);
        
    } catch (error) {
        console.error("Error crítico al conectar con la API:", error);
    }
}

obtenerPokemon();