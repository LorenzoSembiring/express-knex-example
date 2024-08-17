const express = require('express');
const multer = require('multer');
const upload = multer()
const AuthController = require('../controller/authController')
const router = express.Router()

const authController = new AuthController();

router.post('/register', upload.none(), authController.register)
router.post('/verify', authController.verify)
router.post('/login', upload.none(), authController.login)

module.exports = router;