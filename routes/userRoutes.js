const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);

// Example protected route
router.get('/protected', auth, (req, res) => {
    res.json({ message: `Hello ${req.user.email}, you are authenticated.` });
});

module.exports = router;