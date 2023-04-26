const pool = require('../db/index.db');
const uuid = require("uuid");
const axios = require("axios");


// get all available foodstuffs with pagination
exports.getAllFoodstuffs = async (req, res) => {
try {
  const page = parseInt(req.params.page) || 1;
  const limit = parseInt(req.params.limit) || 10;
  const offset = (page - 1) * limit;
  
  let sql = 'SELECT * FROM foodstuffs';
  
  if (req.params.page || req.params.limit) {
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
  }
  const data = await pool.query(sql);

  return res.status(200).json({ 
      message: 'All foodstuffs retrieved successfully',
      data: data.rows,
  });

} catch (err) {
  console.log(err);
}
}

// Add a foodstuff to the cart
exports.addFoodstuffToCart = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const { user_id } = req.user ? req.user : {};

  try {
    // Check if the foodstuff exists
    const foodstuff = await pool.query(
      'SELECT * FROM foodstuffs WHERE id = $1',
      [id]
    );

    if (foodstuff.rows.length === 0) {
      return res.status(404).json({
        message: 'Foodstuff not found',
      });
    }

    // Calculate the total price of the foodstuff based on the quantity
    const price = foodstuff.rows[0].price;
    const totalPrice = price * quantity;

    // Check if the cart item already exists for the user and foodstuff
    const existingCartItem = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND foodstuff_id = $2',
      [user_id, id]
    );

    if (existingCartItem.rows.length > 0) {
      // Update the quantity and total price of the existing cart item
      const { total_price } = existingCartItem.rows[0];
      const updatedCartItem = await pool.query(
        'UPDATE cart SET quantity = quantity + $1, total_price = $2 WHERE user_id = $3 AND foodstuff_id = $4 RETURNING *',
        [quantity, total_price + totalPrice, user_id, id]
      );

      return res.status(200).json(updatedCartItem.rows[0]);
    } else {
      // Add a new cart item with the quantity and total price
      const newCartItem = await pool.query(
        'INSERT INTO cart (user_id, foodstuff_id, quantity, total_price) VALUES ($1, $2, $3, $4) RETURNING *',
        [user_id, id, quantity, totalPrice]
      );

      return res.status(201).json(newCartItem.rows[0]);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      message: 'Server error',
    });
  }
};



exports.payment = async (req, res) => {
  try {
    const { id, email } = req.body;

    const result = await pool.query('SELECT * FROM cart WHERE id = $1', [id]);
    const result2 = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    console.log(result.rows[0]);
    console.log(result2.rows[0])

    const ref = uuid.v4();

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: ref, // Generate a UUID for the transaction reference
        amount: result.rows[0].total_price.toString(), // Convert the amount to a string
        currency: "NGN",
        redirect_url:
          "https://webhook.site/60d2d9fa-477d-44ba-8c12-9dcb73e130c7",
        meta: {
          consumer_id: uuid.v4(),
          consumer_mac: "92a3-912ba-1192a",
        },
        customer: {
          email: result2.rows[0].email,
          name: result2.rows[0].username,
        },
        customizations: {
          title: "Flutterwave",
          logo: "http://www.w3.org/2000/svg",
        },
      },
      {
        headers: {
          Authorization:`Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );
    console.log(response);

    res.send(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};