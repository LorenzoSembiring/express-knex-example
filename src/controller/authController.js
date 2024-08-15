const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const knexConfig = require('../../knexfile');
const environment = process.env.NODE_ENV || 'development'; 
const knex = require('knex')(knexConfig[environment]);

class AuthController {
  register = async (req, res, next) => {
    const saltRounds = 10;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const id = await knex('users').insert({
        username: username,
        email: email,
        password: hashedPassword
      });

      const data = await knex('users').where('id', id[0]);
      res.status(200).json({
        code: 200,
        status: "success",
        data: data[0],
      });

    } catch (err) {
      res.status(500).json({
        code: 500,
        status: "error",
        message: err,
      });
      next(err);
    }
  };
  verify = async (req, res, next) => {
    const password = req.body.password;
    const hashed = req.body.hashed;
    try {
      const isSame = await bcrypt.compare(password, hashed)
      res.status(200).json({
        code: 200,
        status: "success",
        data: isSame
      });
    } catch (err) {
      res.status(500).json({
        code: 500,
        status: "error",
        message: err,
      });
    }
  }
}
module.exports = AuthController;
