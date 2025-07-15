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

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const data = await readData();
    
    // Remove passwords from response
    const usersWithoutPasswords = data.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const data = await readData();

    const user = data.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    // Get user's tweets
    const userTweets = data.tweets.filter(tweet => tweet.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      user: userWithoutPassword,
      tweets: userTweets
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Follow user
exports.followUser = async (req, res) => {
  try {
    const userToFollowId = parseInt(req.params.id);
    const { followerId } = req.body;

    if (!followerId) {
      return res.status(400).json({ message: 'Follower ID is required' });
    }

    if (userToFollowId === followerId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const data = await readData();

    // Find both users
    const userToFollow = data.users.find(u => u.id === userToFollowId);
    const follower = data.users.find(u => u.id === followerId);

    if (!userToFollow || !follower) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update follower counts
    userToFollow.followers++;
    follower.following++;

    await writeData(data);

    res.json({
      message: `${follower.username} is now following ${userToFollow.username}`,
      userToFollow: { ...userToFollow, password: undefined },
      follower: { ...follower, password: undefined }
    });

  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollowId = parseInt(req.params.id);
    const { followerId } = req.body;

    if (!followerId) {
      return res.status(400).json({ message: 'Follower ID is required' });
    }

    const data = await readData();

    // Find both users
    const userToUnfollow = data.users.find(u => u.id === userToUnfollowId);
    const follower = data.users.find(u => u.id === followerId);

    if (!userToUnfollow || !follower) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update follower counts
    if (userToUnfollow.followers > 0) userToUnfollow.followers--;
    if (follower.following > 0) follower.following--;

    await writeData(data);

    res.json({
      message: `${follower.username} unfollowed ${userToUnfollow.username}`,
      userToUnfollow: { ...userToUnfollow, password: undefined },
      follower: { ...follower, password: undefined }
    });

  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const data = await readData();

    // Search users by username (case insensitive)
    const matchingUsers = data.users.filter(user =>
      user.username.toLowerCase().includes(query.toLowerCase())
    ).map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      query,
      results: matchingUsers,
      count: matchingUsers.length
    });

  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};