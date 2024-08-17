const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const knexConfig = require("../../knexfile");
const environment = process.env.NODE_ENV;
const knex = require("knex")(knexConfig[environment]);

class AuthController {
  register = async (req, res, next) => {
    const saltRounds = 10;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const existedUser = await knex("users").where("email", email);

      if (existedUser[0]) {
        res.status(400).json({
          code: 400,
          status: "bad request",
          message: "email already existed.",
        });
        return;
      }

      const id = await knex("users").insert({
        username: username,
        email: email,
        password: hashedPassword,
      });

      const data = await knex("users").where("id", id[0]);
      res.status(201).json({
        code: 201,
        status: "created",
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

  login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
      const user = await knex("users").where("email", email);
      console.log(user[0])
      if (!user) {
        res.status(401).json({
          code: 401,
          status: "unauthorized",
          message: "incorrect email or password",
        });
        return;
      }
      const isSame = await bcrypt.compare(password, user[0].password);
      if (!isSame) {
        res.status(401).json({
          code: 401,
          status: "unauthorized",
          message: "incorrect email or password",
        });
        return;
      }
      const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, {
        expiresIn: '10s'
      });
      console.log(token)
      res.status(200).json({
        code: 200,
        status: "success",
        data: {
          user: user[0],
          token
        },
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
    const bearer = req.headers.authorization;
    const token = bearer.match(/^Bearer\s+(\S+)$/)[1];
    try {
      if (typeof bearer !== 'undefined') {
        try {
          var data = jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
          if(err.name == "TokenExpiredError") {
            return res.status(401).json({
              code: 401,
              status: "unauthorized"
            })
          }
          return res.status(500).json({
            code: 500,
            status: "fail",
            error: err
          })
        }
      }

      res.status(200).json({
        code: 200,
        status: "success",
        data: data
      });
    
    } catch (err) {
      res.status(500).json({
        code: 500,
        status: "error",
        message: err,
      });
    }
  };
}
module.exports = AuthController;
