create type roles as enum ('user', 'admin');

create table
    users(
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        googleId VARCHAR(255) NOT NULL,
        photo VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );


   
