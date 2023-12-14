import express from 'express';
import admin from '../models/admin-data.js';
import bcrypt from "bcrypt";

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/admin-login');
}

function createRoutes(passport) {
  const router = express.Router();

  router.get('/admin-login', (req, res) => {
    res.render('admin-login', { user: req.user, message: req.flash('error')});
  });

  router.get('/admin-login', (req, res) => {
    res.render('admin-login', { message: req.flash('error') });
  });


  router.post('/admin-login', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/admin-login',
    failureFlash: true
  }));

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

  return router;
}

export default createRoutes;