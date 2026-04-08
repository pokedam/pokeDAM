UPDATE users SET google_sub = $1, google_email = $2
    WHERE id = $3
    RETURNING *;