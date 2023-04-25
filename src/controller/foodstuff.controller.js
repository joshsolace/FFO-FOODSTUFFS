const pool = require('../db/index.db');


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


// exports.addFoodstuffToCart = async (req, res) => {
//   const { id } = req.params;
//   const { quantity } = req.body;

//   try {
//     // Check if the foodstuff exists
//     const foodstuff = await pool.query(
//       'SELECT * FROM foodstuffs WHERE id = $1',
//       [id]
//     );

//     if (foodstuff.rows.length === 0) {
//       return res.status(404).json({
//         message: 'Foodstuff not found',
//       });
//     }
//     // Calculate the total price of the foodstuff based on the quantity
//     const price = foodstuff.rows[0].price;
//     const totalPrice = price * quantity;

//     // Check if the cart item already exists for the user and foodstuff
//     const existingCartItem = await pool.query(
//       'SELECT * FROM cart WHERE foodstuff_id = $1',
//       [id]
//     );

//     if (existingCartItem.rows.length > 0) {
//       // Update the quantity and total price of the existing cart item
//       const { total_price } = existingCartItem.rows[0];
//       const totalPrice = parseFloat(foodstuff.rows[0].price) * parseInt(quantity);
//       const updatedCartItem = await pool.query(
//         'UPDATE cart SET quantity = quantity + $1, total_price = $2 WHERE foodstuff_id = $3 RETURNING *',
//         [quantity, total_price + totalPrice, id]
//       );

//       return res.status(200).json(updatedCartItem.rows[0]);
//     } else {
//       // Add a new cart item with the quantity and total price
//       const newCartItem = await pool.query(
//         'INSERT INTO cart (foodstuff_id, quantity, total_price) VALUES ($1, $2, $3) RETURNING *',
//         [id, quantity, totalPrice]
//       );

//      return res.status(201).json(newCartItem.rows[0]);
//     }
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       message: 'Server error',
//     });
//   }
// };

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

// Checkout the cart
exports.checkoutCart = async (req, res) => {
  const { user_id } = req.user; // assuming user is authenticated and user ID is available in req.user

  try {
    // Save the cart items to the database
    const cartItems = await pool.query(
      'SELECT foodstuff_id, quantity, total_price FROM cart WHERE user_id = $1',
      [user_id]
    );
    await Promise.all(
      cartItems.rows.map(async item => {
        await pool.query(
          'INSERT INTO cart_history (user_id, foodstuff_id, quantity, total_price) VALUES ($1, $2, $3, $4)',
          [user_id, item.foodstuff_id, item.quantity, item.total_price]
        );
      })
    );

    // Clear the cart after successful checkout
    await pool.query('DELETE FROM cart WHERE user_id = $1', [user_id]);

    res.status(200).json({ message: 'Cart checked out successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Something went wrong!' });
  }
};


// Calculate the total price of the cart
exports.calculateTotalPrice = async (req, res) => {
  const { user_id } = req.user; // assuming user is authenticated and user ID is available in req.user

  try {
    const totalPrice = await pool.query(
      'SELECT SUM(total_price) FROM cart WHERE user_id = $1',
      [user_id]
    );
    res.status(200).json({
      totalPrice: totalPrice.rows[0].sum,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      message: 'Server error',
    });
  }
};

// Checkout the cart
// exports.checkoutCart = async (req, res) => {
//   const { user_id } = req.user; // assuming user is authenticated and user ID is available in req.user

//   try {
//     // Save the cart items to the database
//     const cartItems = await pool.query(
//       'SELECT foodstuff_id, quantity, total_price FROM cart WHERE user_id = $1',
//       [user_id]
//     );
//     await Promise.all(
//       cartItems.rows.map(async item => {
//         await pool.query(
//           'INSERT INTO cart_history (user_id, foodstuff_id, quantity, total_price)


// pay for foodstuff in cart with flutterwave
exports.payWithFlutterwave = async (req, res) => {
  const { cart_id } = req.params;
  const { email, amount } = req.body;

  try {
    const cart = await pool.query(
      'SELECT * FROM cart WHERE id = $1',
      [cart_id]
    );

    if (cart.rows.length === 0) {
      return res.status(404).json({
        message: 'Cart not found',
      });
    }

    const { total_price } = cart.rows[0];

    if (total_price !== amount) {
      return res.status(400).json({
        message: 'Invalid amount',
      });
    }

    const payment = await pool.query(
      'INSERT INTO payments (cart_id, email, amount) VALUES ($1, $2, $3) RETURNING *',
      [cart_id, email, amount]
    );

    return res.status(201).json(payment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      message: 'Server error',
    });
  }
}