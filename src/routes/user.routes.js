const express = require('express');
const passport = require('passport');
const { getAllFoodstuffs, addFoodstuffToCart, payment } = require('../controller/foodstuff.controller');
const router = express.Router();
require('../middleware/auth');


router.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});


router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
  }
);



//  get all available foodstuffs with pagination
router.get('/availabefoostuffs/:page/:limit', getAllFoodstuffs);



// add foodstuff to cart
router.post('/addtocart/:id', addFoodstuffToCart);

// pay for foodstuff in cart with flutterwave
router.post('/pay', payment);

module.exports = router;
