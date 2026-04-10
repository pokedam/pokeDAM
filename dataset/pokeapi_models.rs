use serde::Deserialize;

#[derive(Deserialize)]
pub struct Pokemon {
    pub name: String,
    pub forms: Vec<Resource>,
    pub moves: Vec<MovInfo>,
    pub types: Vec<PokemonType>,
    pub stats: Vec<Stat>,
}

#[derive(Deserialize)]
pub struct MovInfo {
    #[serde(rename = "move")]
    pub mov: Resource,
    pub version_group_details: Vec<VersionGroupDetail>,
}

#[derive(Deserialize)]
pub struct VersionGroupDetail {
    pub level_learned_at: u8,
    pub move_learn_method: MoveLearnMethod,
    pub version_group: VersionGroup,
}

#[derive(Deserialize)]
pub struct MoveLearnMethod {
    pub name: String,
}

#[derive(Deserialize)]
pub struct VersionGroup {
    pub name: String,
}

#[derive(Deserialize)]
pub struct PokemonType {
    pub slot: u8,
    #[serde(rename = "type")]
    pub inner: TypeInner,
}

#[derive(Deserialize)]
pub struct TypeInner {
    pub name: String,
}

#[derive(Deserialize)]
pub struct PokemonForm {
    pub name: String,
    pub form_name: String,
    pub sprites: PokemonSprites,
}

#[derive(Deserialize)]
pub struct PokemonSprites {
    pub back_default: Option<String>,
    pub back_shiny: Option<String>,
    pub front_default: Option<String>,
    pub front_shiny: Option<String>,
    pub back_female: Option<String>,
    pub back_shiny_female: Option<String>,
    pub front_female: Option<String>,
    pub front_shiny_female: Option<String>,
}

#[derive(Deserialize)]
pub struct ResourceList {
    pub results: Vec<Resource>,
}

#[derive(Deserialize)]
pub struct Resource {
    pub name: String,
    pub url: String,
}

#[derive(Deserialize)]
pub struct Stat {
    pub base_stat: u16,
    pub stat: Resource,
}
