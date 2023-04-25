require ('dotenv').config();
const pool = require('../db/index.db');
const cloudinary = require('cloudinary');

// create foodstuff
exports.createFoodstuff = async (req, res) => {
    const {name, price, description } = req.body;
    const image = req.file.path;
  try {
        // uploading images to cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    const result = await cloudinary.uploader.upload(image);
    const images = result.secure_url;

    const newFoodstuff = await pool.query(
      'INSERT INTO foodstuffs (name, price, description, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, price, description, images]
    );
    res.json(newFoodstuff.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
}
