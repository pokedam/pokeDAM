package org.cifpaviles.pokedam.rest_server.models;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class Result<T> {
    public final T content;
    public final String error;

    private Result(T content, String error) {
        this.content = content;
        this.error = error;
    }

    public static <T> ResponseEntity<Result<T>> ok(T content) {
        return ResponseEntity.ok(new Result<>(content, null));
    }

    public static ResponseEntity<Result<Void>> ok() {
        return ResponseEntity.ok(new Result<>(null, null));
    }

    public static <T> ResponseEntity<Result<T>> err(HttpStatus status, String error) {
        return ResponseEntity.status(status).body(new Result<>(null, error));
    }

    public static <T> ResponseEntity<Result<T>> err(HttpStatus status) {
        return ResponseEntity.status(status).body(new Result<>(null, null));
    }
}
