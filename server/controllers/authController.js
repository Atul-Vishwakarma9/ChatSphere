const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./../models/user');

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).send({
        success: false,
        message: 'First name, last name, email, and password are required',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.send({
        success: false,
        message: 'User already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ firstname, lastname, email, password: hashedPassword });
    await newUser.save();

    res.status(201).send({
      success: true,
      message: 'User created successfully!',
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// LOGIN (no changes needed)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.send({
        success: false,
        message: 'User does not exist',
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.send({
        success: false,
        message: 'Invalid password',
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

    res.send({
      success: true,
      message: 'User logged in successfully',
      token,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
