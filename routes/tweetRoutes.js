const express = require('express');
const tweetController = require('../controllers/tweetController');

const router = express.Router();
 /*ijwhksx*/
// GET /api/tweets
router.get('/', tweetController.getAllTweets);

// POST /api/tweets
router.post('/', tweetController.createTweet);

// POST /api/tweets/:tweetId/like
router.post('/:tweetId/like', tweetController.toggleLike);

// POST /api/tweets/:tweetId/comment
router.post('/:tweetId/comment', tweetController.addComment);

module.exports = router;