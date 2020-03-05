const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const VerifyToken = require("../middleware/auth");
const mysqlDB = require("../config/db");

const router = express.Router();
/**
 * @method - POST
 * @description - User Signup
 * @param - /user/signup
 */

router.post(
  "/signup",
  [
    check("username", "Please enter a valid Username")
      .not()
      .isEmpty(),
    check("email", "Please enter a valid email")
      .not()
      .isEmpty(),
    check("password", "Please enter a valid password").isLength({ min: 6 })
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {

      let userFind = "SELECT * FROM `users` WHERE email = '" + email + "' ";

      mysqlDB.query(userFind, (err, results) => {
        if (err) {
          res.status(501).send("Error in finding result");
        }

        if (results.length > 0) {
          console.log(results);
          return res.status(500).send("Alerdy user present in database..");
        } else {
          let hashedPassword = bcrypt.hashSync(password, 8);

          let insert =
            "INSERT INTO `users` (username, email, password) VALUES (?, ?, ?)";

          mysqlDB.query(
            insert,
            [username, email, hashedPassword],
            (err, resultsInsert) => {
              console.log(resultsInsert.insertId)
              if (err) {
                return res
                  .status(500)
                  .send("There was a problem in registering in database..");
              }

              const payload = {
                user: { id: resultsInsert.insertId }
              };

              var token = jwt.sign(
                {
                  payload
                },
                process.env.TOKEN,
                {
                  expiresIn: 10000
                }
              );

              res.status(200).send({ auth: true, token: token });
            }
          );
        }
      });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Error in saving...");
    }
  }
);


/**
 * @method - POST
 * @description - Get LoggedIn User
 * @param - /user/me
 */
router.post(
  "/login",
  [
    check("email", "Please enter email")
      .not()
      .isEmpty(),
    check("password", "Please enter a valid password").isLength({ min: 6 })
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let findUser = "SELECT * FROM `users` WHERE email = ? ";

      mysqlDB.query(findUser, [email, password], (err, results) => {
        if (results.length > 0) {
          let comparePassword = bcrypt.compareSync(
            password,
            results[0].password
          );

          if (!comparePassword) {
            return res.status(400).send({ auth: false, token: null });
          }

          console.log(results[0].id)

          var token = jwt.sign(
            {
              id: results[0].id
            },
            process.env.TOKEN,
            {
              expiresIn: 10000
            }
          );

          res.status(200).json({
            auth: true,
            token: token
          });
        } else {
          return res.status(400).json({
            message: "User not exists"
          });
        }
      });

    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Server error...."
      });
    }
  }
);


/**
 * @method - POST
 * @description - Get Logged User
 * @param - /user/login
 */

 router.get('/me', (req, res, next) => {
    var token = req.headers["x-access-token"];
    if (!token)
      return res.status(401).send({ auth: false, message: "No token provided." });
  
    jwt.verify(token, process.env.TOKEN, function(err, decoded) {
      if (err)
        return res
          .status(500)
          .send({ auth: false, message: "Failed to authenticate token." });

        console.log(decoded.id)
        res.status(200).send(decoded);

      let userId = "SELECT * FROM `users` WHERE users.id = '" + decoded.id + "' ";
      mysqlDB.query(userId, (err, results) => {
        if (err)
          return res.status(500).send("There was a problem finding the user.");
        if (!results) return res.status(404).send("No user found.");

        // res.status(200).send({auth: true, token: results})
        next(JSON.stringify(results));
      });
    });
 });

//  router.get('/me', (req, res, next) => {

//  });

module.exports = router;
