package org.cifpaviles.pokedam.rest_server.entity;

import org.cifpaviles.pokedam.rest_server.models.GameSummary;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "games")
public class GameDocument {
    @Id
    public String id;
    
    public GameSummary gameSummary;
    
    public GameDocument() {}
    
    public GameDocument(GameSummary gameSummary) {
        this.gameSummary = gameSummary;
    }
}
