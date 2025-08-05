const express = require('express');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Mock connected platforms database
const connectedPlatforms = [];

// Available platforms configuration
const availablePlatforms = {
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    features: ['posts', 'images', 'videos', 'scheduling', 'analytics'],
    maxCharacters: 63206,
    supportedMedia: ['image', 'video', 'gif']
  },
  instagram: {
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    features: ['posts', 'stories', 'images', 'videos', 'scheduling'],
    maxCharacters: 2200,
    supportedMedia: ['image', 'video']
  },
  twitter: {
    name: 'Twitter',
    icon: 'twitter',
    color: '#1DA1F2',
    features: ['posts', 'threads', 'images', 'videos', 'scheduling'],
    maxCharacters: 280,
    supportedMedia: ['image', 'video', 'gif']
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0A66C2',
    features: ['posts', 'articles', 'images', 'videos', 'scheduling'],
    maxCharacters: 3000,
    supportedMedia: ['image', 'video', 'document']
  },
  youtube: {
    name: 'YouTube',
    icon: 'youtube',
    color: '#FF0000',
    features: ['videos', 'scheduling', 'analytics'],
    maxCharacters: 5000,
    supportedMedia: ['video']
  },
  tiktok: {
    name: 'TikTok',
    icon: 'music',
    color: '#000000',
    features: ['videos', 'scheduling'],
    maxCharacters: 150,
    supportedMedia: ['video']
  }
};

// Get all available platforms
router.get('/available', (req, res) => {
  res.json(availablePlatforms);
});

// Get connected platforms for user
router.get('/connected', authenticateToken, (req, res) => {
  const userPlatforms = connectedPlatforms.filter(
    platform => platform.userId === req.user.id
  );
  res.json(userPlatforms);
});

// Connect a new platform
router.post('/connect', authenticateToken, (req, res) => {
  try {
    const { platform, accountName, accountId } = req.body;

    // Validation
    if (!platform || !accountName) {
      return res.status(400).json({ 
        message: 'Platform and account name are required' 
      });
    }

    if (!availablePlatforms[platform]) {
      return res.status(400).json({ 
        message: 'Invalid platform' 
      });
    }

    // Check if platform already connected
    const existingConnection = connectedPlatforms.find(
      p => p.userId === req.user.id && 
           p.platform === platform && 
           p.accountId === accountId
    );

    if (existingConnection) {
      return res.status(400).json({ 
        message: 'Platform account already connected' 
      });
    }

    // Create new connection
    const newConnection = {
      id: connectedPlatforms.length + 1,
      userId: req.user.id,
      platform,
      accountName,
      accountId: accountId || `${platform}_${Date.now()}`,
      connectedAt: new Date().toISOString(),
      isActive: true,
      lastSync: new Date().toISOString(),
      permissions: availablePlatforms[platform].features,
      stats: {
        followers: Math.floor(Math.random() * 10000) + 100,
        following: Math.floor(Math.random() * 1000) + 50,
        posts: Math.floor(Math.random() * 500) + 10
      }
    };

    connectedPlatforms.push(newConnection);

    res.status(201).json({
      message: 'Platform connected successfully',
      platform: newConnection
    });
  } catch (error) {
    console.error('Connect platform error:', error);
    res.status(500).json({ message: 'Server error connecting platform' });
  }
});

// Disconnect a platform
router.delete('/disconnect/:id', authenticateToken, (req, res) => {
  try {
    const platformIndex = connectedPlatforms.findIndex(
      p => p.id === parseInt(req.params.id) && p.userId === req.user.id
    );

    if (platformIndex === -1) {
      return res.status(404).json({ message: 'Connected platform not found' });
    }

    connectedPlatforms.splice(platformIndex, 1);

    res.json({ message: 'Platform disconnected successfully' });
  } catch (error) {
    console.error('Disconnect platform error:', error);
    res.status(500).json({ message: 'Server error disconnecting platform' });
  }
});

// Update platform settings
router.put('/:id/settings', authenticateToken, (req, res) => {
  try {
    const platformIndex = connectedPlatforms.findIndex(
      p => p.id === parseInt(req.params.id) && p.userId === req.user.id
    );

    if (platformIndex === -1) {
      return res.status(404).json({ message: 'Connected platform not found' });
    }

    const { isActive, permissions } = req.body;

    // Update platform settings
    if (isActive !== undefined) {
      connectedPlatforms[platformIndex].isActive = isActive;
    }

    if (permissions) {
      connectedPlatforms[platformIndex].permissions = permissions;
    }

    connectedPlatforms[platformIndex].lastSync = new Date().toISOString();

    res.json({
      message: 'Platform settings updated successfully',
      platform: connectedPlatforms[platformIndex]
    });
  } catch (error) {
    console.error('Update platform settings error:', error);
    res.status(500).json({ message: 'Server error updating platform settings' });
  }
});

// Sync platform data
router.post('/:id/sync', authenticateToken, (req, res) => {
  try {
    const platformIndex = connectedPlatforms.findIndex(
      p => p.id === parseInt(req.params.id) && p.userId === req.user.id
    );

    if (platformIndex === -1) {
      return res.status(404).json({ message: 'Connected platform not found' });
    }

    // Simulate syncing data from platform
    connectedPlatforms[platformIndex].lastSync = new Date().toISOString();
    connectedPlatforms[platformIndex].stats = {
      followers: Math.floor(Math.random() * 10000) + 100,
      following: Math.floor(Math.random() * 1000) + 50,
      posts: Math.floor(Math.random() * 500) + 10
    };

    res.json({
      message: 'Platform data synced successfully',
      platform: connectedPlatforms[platformIndex]
    });
  } catch (error) {
    console.error('Sync platform error:', error);
    res.status(500).json({ message: 'Server error syncing platform data' });
  }
});

// Get platform-specific posting guidelines
router.get('/:platform/guidelines', (req, res) => {
  const { platform } = req.params;
  
  if (!availablePlatforms[platform]) {
    return res.status(404).json({ message: 'Platform not found' });
  }

  const guidelines = {
    facebook: {
      bestTimes: ['9:00 AM', '1:00 PM', '3:00 PM'],
      optimalLength: '40-80 characters',
      tips: [
        'Use engaging visuals',
        'Ask questions to encourage engagement',
        'Post consistently',
        'Use relevant hashtags (1-2 max)'
      ]
    },
    instagram: {
      bestTimes: ['11:00 AM', '2:00 PM', '5:00 PM'],
      optimalLength: '138-150 characters',
      tips: [
        'Use high-quality images',
        'Include 5-10 relevant hashtags',
        'Post stories regularly',
        'Use Instagram-specific features'
      ]
    },
    twitter: {
      bestTimes: ['9:00 AM', '12:00 PM', '6:00 PM'],
      optimalLength: '71-100 characters',
      tips: [
        'Keep it concise',
        'Use trending hashtags',
        'Engage with replies quickly',
        'Share timely content'
      ]
    },
    linkedin: {
      bestTimes: ['8:00 AM', '12:00 PM', '5:00 PM'],
      optimalLength: '150-300 characters',
      tips: [
        'Share professional insights',
        'Use industry-relevant hashtags',
        'Post during business hours',
        'Include call-to-actions'
      ]
    }
  };

  res.json({
    platform: availablePlatforms[platform],
    guidelines: guidelines[platform] || {
      bestTimes: ['9:00 AM', '1:00 PM', '5:00 PM'],
      optimalLength: 'Varies',
      tips: ['Follow platform best practices']
    }
  });
});

module.exports = router;