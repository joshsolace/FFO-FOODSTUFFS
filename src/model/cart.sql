create table
    cart(
        id SERIAL PRIMARY KEY,
        user_id INT,
        foodstuff_id INT NOT NULL,
        quantity INT NOT NULL,
        total_price INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        Foreign Key (user_id) references users(id)
    );

    SELECT SUM(quantity) AS total_products, SUM(total_price) AS total_price FROM cart WHERE user_id = userId;
