const session = require('express-session');
const { configservices } = require('../config/config');
 
 const sessionMiddleware = (app)=>{
  (session({
     name: 'sessionId',
     secret: configservices.SESSION_SECRET,
     resave: configservices.SESSION_RESAVE,
     saveUninitialized: configservices.SESSION_SAVE_UNINITIALIZED,
     cookie: { 
       secure: false,
       maxAge: 24 * 60 * 60 * 1000 // Expires in 24 hours
     }
   }));
 };
 
 module.exports = sessionMiddleware;
