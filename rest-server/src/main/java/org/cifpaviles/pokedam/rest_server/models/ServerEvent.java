package org.cifpaviles.pokedam.rest_server.models;

public class ServerEvent {
    private String event;
    private Object payload;

    public ServerEvent(String event, Object payload) {
        this.event = event;
        this.payload = payload;
    }

    public String getEvent() {
        return event;
    }

    public Object getPayload() {
        return payload;
    }

    public void setEvent(String event) {
        this.event = event;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }
}
