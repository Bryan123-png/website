const express = require('express');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Mock analytics data
const generateMockAnalytics = (userId) => {
  const now = new Date();
  const last30Days = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    last30Days.push({
      date: date.toISOString().split('T')[0],
      likes: Math.floor(Math.random() * 100) + 10,
      shares: Math.floor(Math.random() * 50) + 5,
      comments: Math.floor(Math.random() * 30) + 2,
      clicks: Math.floor(Math.random() * 200) + 20,
      impressions: Math.floor(Math.random() * 1000) + 100
    });
  }
  
  return last30Days;
};

// Get overall analytics dashboard
router.get('/dashboard', authenticateToken, (req, res) => {
  try {
    const dailyData = generateMockAnalytics(req.user.id);
    
    // Calculate totals
    const totals = dailyData.reduce((acc, day) => {
      acc.likes += day.likes;
      acc.shares += day.shares;
      acc.comments += day.comments;
      acc.clicks += day.clicks;
      acc.impressions += day.impressions;
      return acc;
    }, { likes: 0, shares: 0, comments: 0, clicks: 0, impressions: 0 });
    
    // Calculate engagement rate
    const engagementRate = totals.impressions > 0 
      ? ((totals.likes + totals.shares + totals.comments) / totals.impressions * 100).toFixed(2)
      : 0;
    
    // Platform breakdown
    const platformData = {
      facebook: {
        followers: Math.floor(Math.random() * 5000) + 1000,
        engagement: Math.floor(Math.random() * 500) + 100,
        growth: (Math.random() * 10 - 5).toFixed(1) // -5% to +5%
      },
      twitter: {
        followers: Math.floor(Math.random() * 3000) + 500,
        engagement: Math.floor(Math.random() * 300) + 50,
        growth: (Math.random() * 10 - 5).toFixed(1)
      },
      instagram: {
        followers: Math.floor(Math.random() * 8000) + 2000,
        engagement: Math.floor(Math.random() * 800) + 200,
        growth: (Math.random() * 10 - 5).toFixed(1)
      },
      linkedin: {
        followers: Math.floor(Math.random() * 2000) + 300,
        engagement: Math.floor(Math.random() * 200) + 30,
        growth: (Math.random() * 10 - 5).toFixed(1)
      }
    };
    
    res.json({
      overview: {
        totalPosts: Math.floor(Math.random() * 50) + 20,
        totalEngagement: totals.likes + totals.shares + totals.comments,
        totalImpressions: totals.impressions,
        engagementRate: parseFloat(engagementRate)
      },
      dailyData,
      totals,
      platformData,
      topPerformingPosts: [
        {
          id: 1,
          content: "Check out our latest product launch! 🚀",
          platform: "instagram",
          engagement: 245,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          content: "Behind the scenes of our team meeting",
          platform: "linkedin",
          engagement: 189,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          content: "Weekend vibes! What are your plans?",
          platform: "facebook",
          engagement: 156,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

// Get engagement metrics for specific time period
router.get('/engagement', authenticateToken, (req, res) => {
  try {
    const { period = '30d', platform } = req.query;
    
    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        likes: Math.floor(Math.random() * 50) + 5,
        shares: Math.floor(Math.random() * 25) + 2,
        comments: Math.floor(Math.random() * 15) + 1,
        platform: platform || 'all'
      });
    }
    
    res.json({ data, period, platform });
  } catch (error) {
    console.error('Engagement metrics error:', error);
    res.status(500).json({ message: 'Server error fetching engagement metrics' });
  }
});

// Get follower growth data
router.get('/followers', authenticateToken, (req, res) => {
  try {
    const { platform = 'all' } = req.query;
    
    const data = [];
    const now = new Date();
    let baseFollowers = 1000;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const growth = Math.floor(Math.random() * 20) - 5; // -5 to +15 followers per day
      baseFollowers += growth;
      
      data.push({
        date: date.toISOString().split('T')[0],
        followers: Math.max(baseFollowers, 0),
        growth: growth,
        platform: platform
      });
    }
    
    res.json({ data, platform });
  } catch (error) {
    console.error('Follower growth error:', error);
    res.status(500).json({ message: 'Server error fetching follower data' });
  }
});

// Get best posting times
router.get('/best-times', authenticateToken, (req, res) => {
  try {
    const bestTimes = {
      facebook: {
        weekdays: ['9:00 AM', '1:00 PM', '3:00 PM'],
        weekends: ['10:00 AM', '2:00 PM']
      },
      instagram: {
        weekdays: ['11:00 AM', '2:00 PM', '5:00 PM'],
        weekends: ['10:00 AM', '1:00 PM']
      },
      twitter: {
        weekdays: ['9:00 AM', '12:00 PM', '6:00 PM'],
        weekends: ['11:00 AM', '4:00 PM']
      },
      linkedin: {
        weekdays: ['8:00 AM', '12:00 PM', '5:00 PM'],
        weekends: ['10:00 AM']
      }
    };
    
    res.json(bestTimes);
  } catch (error) {
    console.error('Best times error:', error);
    res.status(500).json({ message: 'Server error fetching best posting times' });
  }
});

// Get hashtag performance
router.get('/hashtags', authenticateToken, (req, res) => {
  try {
    const hashtagData = [
      { tag: '#socialmedia', usage: 45, engagement: 234 },
      { tag: '#marketing', usage: 38, engagement: 189 },
      { tag: '#business', usage: 32, engagement: 156 },
      { tag: '#entrepreneur', usage: 28, engagement: 145 },
      { tag: '#startup', usage: 25, engagement: 123 },
      { tag: '#innovation', usage: 22, engagement: 98 },
      { tag: '#technology', usage: 20, engagement: 87 },
      { tag: '#growth', usage: 18, engagement: 76 }
    ];
    
    res.json(hashtagData);
  } catch (error) {
    console.error('Hashtag performance error:', error);
    res.status(500).json({ message: 'Server error fetching hashtag data' });
  }
});

module.exports = router;