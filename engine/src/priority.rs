/// Prioridad de una acción en un turno de Pokémon.
///
/// El ordenamiento sigue las reglas oficiales:
/// 1. Mayor `level` va primero (rango -7..=7, igual que el juego oficial).
/// 2. A igual `level`, mayor `speed` va primero (desempate por velocidad del Pokémon actuante).
///
/// Implementa `Ord` de forma que el orden *ascendente* de Rust
/// corresponde al orden real de ejecución, por lo que basta con ordenar
/// el slice de mayor a menor (`sort_unstable_by(|a, b| b.cmp(a))`).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct Priority {
    /// Nivel de prioridad del movimiento/acción (-7 a +7).
    pub level: i8,
    /// Velocidad del Pokémon actuante, usada como desempate.
    pub speed: u16,
}

impl Priority {
    pub const fn new(level: i8, speed: u16) -> Self {
        Self { level, speed }
    }
}

impl PartialOrd for Priority {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Priority {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        // Primero comparar por nivel; si es igual, comparar por velocidad.
        self.level
            .cmp(&other.level)
            .then(self.speed.cmp(&other.speed))
    }
}
