const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/data.json');

// Helper function to read data
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { users: [], tweets: [], nextUserId: 1, nextTweetId: 1 };
  }
}

// Helper function to write data
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
    throw error;
  }
}

// Get all tweets
exports.getAllTweets = async (req, res) => {
  try {
    const data = await readData();
    
    // Sort tweets by timestamp (newest first)
    const sortedTweets = data.tweets.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.json(sortedTweets);
  } catch (error) {
    console.error('Error getting tweets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new tweet
exports.createTweet = async (req, res) => {
  try {
    const { userId, content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ message: 'User ID and content are required' });
    }

    if (content.length > 280) {
      return res.status(400).json({ message: 'Tweet content cannot exceed 280 characters' });
    }

    const data = await readData();

    // Find user to get username
    const user = data.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create new tweet
    const newTweet = {
      id: data.nextTweetId,
      userId,
      username: user.username,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: []
    };

    data.tweets.push(newTweet);
    data.nextTweetId++;

    await writeData(data);

    res.status(201).json({
      message: 'Tweet created successfully',
      tweet: newTweet
    });

  } catch (error) {
    console.error('Error creating tweet:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Toggle like on tweet
exports.toggleLike = async (req, res) => {
  try {
    const tweetId = parseInt(req.params.id);
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const data = await readData();

    // Find tweet
    const tweet = data.tweets.find(t => t.id === tweetId);
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    // Check if user already liked the tweet
    const likedIndex = tweet.likedBy.indexOf(userId);
    
    if (likedIndex > -1) {
      // Unlike the tweet
      tweet.likedBy.splice(likedIndex, 1);
      tweet.likes--;
    } else {
      // Like the tweet
      tweet.likedBy.push(userId);
      tweet.likes++;
    }

    await writeData(data);

    res.json({
      message: likedIndex > -1 ? 'Tweet unliked' : 'Tweet liked',
      tweet
    });

  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add comment to tweet
exports.addComment = async (req, res) => {
  try {
    const tweetId = parseInt(req.params.id);
    const { userId, username, content } = req.body;

    if (!userId || !username || !content) {
      return res.status(400).json({ message: 'User ID, username, and content are required' });
    }

    const data = await readData();

    // Find tweet
    const tweet = data.tweets.find(t => t.id === tweetId);
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    // Create new comment
    const newComment = {
      id: tweet.comments.length + 1,
      userId,
      username,
      content,
      timestamp: new Date().toISOString()
    };

    tweet.comments.push(newComment);

    await writeData(data);

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment,
      tweet
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};