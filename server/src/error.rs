use actix_web::{HttpResponse, HttpResponseBuilder, ResponseError, http::StatusCode};
use core::{error::Error as StdError, fmt};

#[derive(Debug)]
pub struct Error {
    error: Box<dyn StdError>,
    status: StatusCode,
}

impl Error {
    pub fn internal(error: impl Into<Box<dyn StdError>>) -> Self {
        Self {
            error: error.into(),
            status: StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    pub fn unauthorized(error: impl Into<Box<dyn StdError>>) -> Self {
        Self {
            error: error.into(),
            status: StatusCode::UNAUTHORIZED,
        }
    }

    pub fn bad_request(error: impl Into<Box<dyn StdError>>) -> Self {
        Self {
            error: error.into(),
            status: StatusCode::BAD_REQUEST,
        }
    }

    pub fn conflict(error: impl Into<Box<dyn StdError>>) -> Self {
        Self {
            error: error.into(),
            status: StatusCode::CONFLICT,
        }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} {}", self.status, self.error,)
    }
}

impl ResponseError for Error {
    fn error_response(&self) -> HttpResponse {
        HttpResponseBuilder::new(self.status)
            .json(serde_json::json!({ "error": self.error.to_string() }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn display_includes_status_and_message() {
        let e = Error::bad_request("bad input");
        let s = format!("{}", e);
        assert!(s.contains("400"));
        assert!(s.contains("bad input"));
    }
}
