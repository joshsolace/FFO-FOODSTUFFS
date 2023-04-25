create table
    foodstuffs(
        id SERIAL PRIMARY KEY,
        foodstuff_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        price VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        user_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
