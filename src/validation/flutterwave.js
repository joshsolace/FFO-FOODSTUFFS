const { Rave } = require('flutterwave-node-v3');
require('dotenv').config();

const rave = new Rave({
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
  production: false,
});

module.exports = {
  pay: async (amount, email, reference) => {
    const payload = {
      amount,
      email,
      tx_ref: reference,
      redirect_url: 'https://your-app.com/success',
      payment_options: 'card',
    };
    const response = await rave.initiatePayment(payload);
    return response;
  },
};
