package org.cifpaviles.pokedam.rest_server.exception;

public record ApiError(
                String message,
                int status) {
}