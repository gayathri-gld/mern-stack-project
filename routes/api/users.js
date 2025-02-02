const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");

//@rout POST api/users
//@desc Register user
//acess public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password of min 6 char").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      //See if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ error: [{ msg: "User already exists" }] });
      }
      //Get user gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        m: "mm",
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });
      //Encrypt password
      const salt = await bcrypt.genSalt(10); //we need salt for hashing width before encryption

      user.password = await bcrypt.hash(password, salt);
      await user.save(); //saving to the database

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.send({ token });
        }
      );
      //Return jsonwebtoken
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
