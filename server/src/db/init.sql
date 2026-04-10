DROP TABLE IF EXISTS user_profiles, tokens, users, profiles, company CASCADE;
DROP EXTENSION IF EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE users (
	id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	google_email TEXT,
	google_sub TEXT,
	created_at TIMESTAMP DEFAULT now()
);

-- User-owned pokemons (stored per user; base species stay in memory)
CREATE TABLE pokemon (
	id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pokedex_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL REFERENCES users(id),
	nickname TEXT,
	level SMALLINT NOT NULL DEFAULT 1,
	ivs JSONB NOT NULL,
	evs JSONB NOT NULL,
	recovery_at TIMESTAMP,
	PRIMARY KEY (id)
);

CREATE INDEX idx_pokemon_user_id ON pokemon(user_id);
