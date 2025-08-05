const express = require('express');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Mock posts database
const posts = [];
let postIdCounter = 1;

// Get all posts for authenticated user
router.get('/', authenticateToken, (req, res) => {
  const userPosts = posts.filter(post => post.userId === req.user.id);
  res.json(userPosts);
});

// Get single post
router.get('/:id', authenticateToken, (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id) && p.userId === req.user.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  res.json(post);
});

// Create new post
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      content,
      platforms,
      scheduledTime,
      images,
      hashtags,
      status = 'draft'
    } = req.body;

    // Validation
    if (!content || !platforms || platforms.length === 0) {
      return res.status(400).json({ 
        message: 'Content and at least one platform are required' 
      });
    }

    const newPost = {
      id: postIdCounter++,
      userId: req.user.id,
      content,
      platforms,
      scheduledTime: scheduledTime || null,
      images: images || [],
      hashtags: hashtags || [],
      status, // draft, scheduled, published, failed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: null,
      engagement: {
        likes: 0,
        shares: 0,
        comments: 0,
        clicks: 0
      }
    };

    posts.push(newPost);

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// Update post
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const postIndex = posts.findIndex(
      p => p.id === parseInt(req.params.id) && p.userId === req.user.id
    );

    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const {
      content,
      platforms,
      scheduledTime,
      images,
      hashtags,
      status
    } = req.body;

    // Update post
    posts[postIndex] = {
      ...posts[postIndex],
      content: content || posts[postIndex].content,
      platforms: platforms || posts[postIndex].platforms,
      scheduledTime: scheduledTime !== undefined ? scheduledTime : posts[postIndex].scheduledTime,
      images: images || posts[postIndex].images,
      hashtags: hashtags || posts[postIndex].hashtags,
      status: status || posts[postIndex].status,
      updatedAt: new Date().toISOString()
    };

    res.json({
      message: 'Post updated successfully',
      post: posts[postIndex]
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error updating post' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, (req, res) => {
  const postIndex = posts.findIndex(
    p => p.id === parseInt(req.params.id) && p.userId === req.user.id
  );

  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }

  posts.splice(postIndex, 1);
  res.json({ message: 'Post deleted successfully' });
});

// Publish post immediately
router.post('/:id/publish', authenticateToken, (req, res) => {
  try {
    const postIndex = posts.findIndex(
      p => p.id === parseInt(req.params.id) && p.userId === req.user.id
    );

    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Simulate publishing to social media platforms
    posts[postIndex].status = 'published';
    posts[postIndex].publishedAt = new Date().toISOString();
    posts[postIndex].updatedAt = new Date().toISOString();

    // Simulate some engagement after publishing
    setTimeout(() => {
      if (posts[postIndex]) {
        posts[postIndex].engagement = {
          likes: Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 20),
          comments: Math.floor(Math.random() * 15),
          clicks: Math.floor(Math.random() * 100)
        };
      }
    }, 2000);

    res.json({
      message: 'Post published successfully',
      post: posts[postIndex]
    });
  } catch (error) {
    console.error('Publish post error:', error);
    res.status(500).json({ message: 'Server error publishing post' });
  }
});

// Get posts by status
router.get('/status/:status', authenticateToken, (req, res) => {
  const { status } = req.params;
  const userPosts = posts.filter(
    post => post.userId === req.user.id && post.status === status
  );
  res.json(userPosts);
});

module.exports = router;