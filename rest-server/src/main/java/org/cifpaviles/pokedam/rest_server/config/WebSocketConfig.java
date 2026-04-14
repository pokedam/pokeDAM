package org.cifpaviles.pokedam.rest_server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // "topic" para respuestas a grupos (ej. /topic/lobbies , /topic/room/{id})
        config.enableSimpleBroker("/topic");
        // Prefijo para enviar mensajes desde cliente al servidor
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint al que se conecta el cliente inicialmente para habilitar WS.
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }
}
