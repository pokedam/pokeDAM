# Changelog

## Desarrollo Inicial del Cliente

### Core
- Implementación del concepto de cliente utilizando **Angular**.

### Sistema de Usuarios y Autenticación
- **Acceso Flexible**: El proceso de login es opcional. Se permite el acceso al gestor de salas y búsqueda de partidas directamente como **invitado**.
- **Propósito del Login**: El inicio de sesión se reserva para la persistencia de progreso entre dispositivos, evitando ser un paso intrusivo para el usuario casual.

### Gestión de Partidas (Matchmaking)
La interfaz de búsqueda de partidas se estructura en tres bloques principales:

#### 1. Buscador de Partidas
- Visualización de la lista de partidas disponibles y su estado actual.
- **Futuro**: Se prevé la implementación de un filtro de búsqueda por nombre en la parte superior.
- Botón de acceso rápido para la creación de nuevas salas.

#### 2. Creador de Partidas
- Formulario para asignar nombre a la sala.
- Soporte para **partidas privadas** mediante contraseña opcional (activable vía checkbox).
- **Experiencia de Usuario (UX)**: 
    - Se guardan el nombre de la partida y el estado de privacidad al cancelar, facilitando una re-creación rápida.
    - La contraseña **no se guarda** tras cancelar para reforzar la confianza del usuario y garantizar la seguridad de sus datos.

#### 3. Sala de Espera (Lobby)
- Muestra la lista de jugadores presentes y las características de la partida.
- Funcionalidad para abandonar la sala y regresar al buscador.
- Botón de inicio de partida exclusivo para el **Host** (Anfitrión).