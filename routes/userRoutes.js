const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// GET /api/users
router.get('/', userController.getAllUsers);

// GET /api/users/search?query=username
router.get('/search', userController.searchUsers);

// GET /api/users/:userId
router.get('/:userId', userController.getUserById);

// POST /api/users/:userId/follow
router.post('/:userId/follow', userController.followUser);

// POST /api/users/:userId/unfollow
router.post('/:userId/unfollow', userController.unfollowUser);

module.exports = router;