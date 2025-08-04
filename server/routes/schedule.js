const express = require('express');
const cron = require('node-cron');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Mock scheduled posts database
const scheduledPosts = [];
let scheduleIdCounter = 1;

// Active cron jobs
const activeCronJobs = new Map();

// Helper function to create cron expression from date
const createCronExpression = (date) => {
  const scheduleDate = new Date(date);
  const minute = scheduleDate.getMinutes();
  const hour = scheduleDate.getHours();
  const day = scheduleDate.getDate();
  const month = scheduleDate.getMonth() + 1;
  
  return `${minute} ${hour} ${day} ${month} *`;
};

// Helper function to publish a scheduled post
const publishScheduledPost = async (scheduleId) => {
  try {
    const schedule = scheduledPosts.find(s => s.id === scheduleId);
    if (!schedule) return;

    console.log(`Publishing scheduled post: ${schedule.post.content}`);
    
    // Update schedule status
    schedule.status = 'published';
    schedule.publishedAt = new Date().toISOString();
    
    // Remove from active cron jobs
    if (activeCronJobs.has(scheduleId)) {
      activeCronJobs.get(scheduleId).destroy();
      activeCronJobs.delete(scheduleId);
    }
    
    // In a real application, you would call the actual social media APIs here
    console.log(`Post published successfully to platforms: ${schedule.post.platforms.join(', ')}`);
  } catch (error) {
    console.error('Error publishing scheduled post:', error);
    const schedule = scheduledPosts.find(s => s.id === scheduleId);
    if (schedule) {
      schedule.status = 'failed';
      schedule.error = error.message;
    }
  }
};

// Get all scheduled posts for user
router.get('/', authenticateToken, (req, res) => {
  const userSchedules = scheduledPosts.filter(
    schedule => schedule.userId === req.user.id
  );
  res.json(userSchedules);
});

// Create new scheduled post
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      content,
      platforms,
      scheduledTime,
      images,
      hashtags,
      recurring
    } = req.body;

    // Validation
    if (!content || !platforms || platforms.length === 0 || !scheduledTime) {
      return res.status(400).json({ 
        message: 'Content, platforms, and scheduled time are required' 
      });
    }

    const scheduleDate = new Date(scheduledTime);
    if (scheduleDate <= new Date()) {
      return res.status(400).json({ 
        message: 'Scheduled time must be in the future' 
      });
    }

    const newSchedule = {
      id: scheduleIdCounter++,
      userId: req.user.id,
      post: {
        content,
        platforms,
        images: images || [],
        hashtags: hashtags || []
      },
      scheduledTime: scheduleDate.toISOString(),
      recurring: recurring || null,
      status: 'scheduled', // scheduled, published, failed, cancelled
      createdAt: new Date().toISOString(),
      publishedAt: null,
      error: null
    };

    scheduledPosts.push(newSchedule);

    // Create cron job for this scheduled post
    const cronExpression = createCronExpression(scheduleDate);
    const cronJob = cron.schedule(cronExpression, () => {
      publishScheduledPost(newSchedule.id);
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    activeCronJobs.set(newSchedule.id, cronJob);

    res.status(201).json({
      message: 'Post scheduled successfully',
      schedule: newSchedule
    });
  } catch (error) {
    console.error('Schedule post error:', error);
    res.status(500).json({ message: 'Server error scheduling post' });
  }
});

// Update scheduled post
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const scheduleIndex = scheduledPosts.findIndex(
      s => s.id === parseInt(req.params.id) && s.userId === req.user.id
    );

    if (scheduleIndex === -1) {
      return res.status(404).json({ message: 'Scheduled post not found' });
    }

    const schedule = scheduledPosts[scheduleIndex];
    
    if (schedule.status !== 'scheduled') {
      return res.status(400).json({ 
        message: 'Cannot update post that is not in scheduled status' 
      });
    }

    const {
      content,
      platforms,
      scheduledTime,
      images,
      hashtags,
      recurring
    } = req.body;

    // Update schedule
    if (content) schedule.post.content = content;
    if (platforms) schedule.post.platforms = platforms;
    if (images) schedule.post.images = images;
    if (hashtags) schedule.post.hashtags = hashtags;
    if (recurring !== undefined) schedule.recurring = recurring;
    
    if (scheduledTime) {
      const newScheduleDate = new Date(scheduledTime);
      if (newScheduleDate <= new Date()) {
        return res.status(400).json({ 
          message: 'Scheduled time must be in the future' 
        });
      }
      
      schedule.scheduledTime = newScheduleDate.toISOString();
      
      // Update cron job
      if (activeCronJobs.has(schedule.id)) {
        activeCronJobs.get(schedule.id).destroy();
      }
      
      const cronExpression = createCronExpression(newScheduleDate);
      const cronJob = cron.schedule(cronExpression, () => {
        publishScheduledPost(schedule.id);
      }, {
        scheduled: true,
        timezone: 'UTC'
      });
      
      activeCronJobs.set(schedule.id, cronJob);
    }

    res.json({
      message: 'Scheduled post updated successfully',
      schedule
    });
  } catch (error) {
    console.error('Update scheduled post error:', error);
    res.status(500).json({ message: 'Server error updating scheduled post' });
  }
});

// Cancel scheduled post
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const scheduleIndex = scheduledPosts.findIndex(
      s => s.id === parseInt(req.params.id) && s.userId === req.user.id
    );

    if (scheduleIndex === -1) {
      return res.status(404).json({ message: 'Scheduled post not found' });
    }

    const schedule = scheduledPosts[scheduleIndex];
    
    if (schedule.status !== 'scheduled') {
      return res.status(400).json({ 
        message: 'Cannot cancel post that is not in scheduled status' 
      });
    }

    // Cancel cron job
    if (activeCronJobs.has(schedule.id)) {
      activeCronJobs.get(schedule.id).destroy();
      activeCronJobs.delete(schedule.id);
    }

    // Update status
    schedule.status = 'cancelled';

    res.json({ message: 'Scheduled post cancelled successfully' });
  } catch (error) {
    console.error('Cancel scheduled post error:', error);
    res.status(500).json({ message: 'Server error cancelling scheduled post' });
  }
});

// Get upcoming scheduled posts
router.get('/upcoming', authenticateToken, (req, res) => {
  try {
    const now = new Date();
    const upcomingSchedules = scheduledPosts.filter(
      schedule => 
        schedule.userId === req.user.id &&
        schedule.status === 'scheduled' &&
        new Date(schedule.scheduledTime) > now
    ).sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));

    res.json(upcomingSchedules);
  } catch (error) {
    console.error('Get upcoming schedules error:', error);
    res.status(500).json({ message: 'Server error fetching upcoming schedules' });
  }
});

// Get schedule calendar view
router.get('/calendar', authenticateToken, (req, res) => {
  try {
    const { month, year } = req.query;
    const targetDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) - 1, 1);
    const nextMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);

    const monthlySchedules = scheduledPosts.filter(
      schedule => {
        const scheduleDate = new Date(schedule.scheduledTime);
        return schedule.userId === req.user.id &&
               scheduleDate >= targetDate &&
               scheduleDate < nextMonth;
      }
    );

    // Group by date
    const calendarData = {};
    monthlySchedules.forEach(schedule => {
      const dateKey = schedule.scheduledTime.split('T')[0];
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = [];
      }
      calendarData[dateKey].push(schedule);
    });

    res.json({
      month: targetDate.getMonth() + 1,
      year: targetDate.getFullYear(),
      schedules: calendarData
    });
  } catch (error) {
    console.error('Get calendar schedules error:', error);
    res.status(500).json({ message: 'Server error fetching calendar schedules' });
  }
});

// Get optimal posting times
router.get('/optimal-times', authenticateToken, (req, res) => {
  try {
    const { platform } = req.query;
    
    const optimalTimes = {
      facebook: {
        weekdays: [
          { time: '09:00', engagement: 85 },
          { time: '13:00', engagement: 92 },
          { time: '15:00', engagement: 88 }
        ],
        weekends: [
          { time: '10:00', engagement: 78 },
          { time: '14:00', engagement: 82 }
        ]
      },
      instagram: {
        weekdays: [
          { time: '11:00', engagement: 90 },
          { time: '14:00', engagement: 95 },
          { time: '17:00', engagement: 87 }
        ],
        weekends: [
          { time: '10:00', engagement: 85 },
          { time: '13:00', engagement: 89 }
        ]
      },
      twitter: {
        weekdays: [
          { time: '09:00', engagement: 88 },
          { time: '12:00', engagement: 91 },
          { time: '18:00', engagement: 86 }
        ],
        weekends: [
          { time: '11:00', engagement: 80 },
          { time: '16:00', engagement: 83 }
        ]
      },
      linkedin: {
        weekdays: [
          { time: '08:00', engagement: 89 },
          { time: '12:00', engagement: 93 },
          { time: '17:00', engagement: 87 }
        ],
        weekends: [
          { time: '10:00', engagement: 70 }
        ]
      }
    };

    if (platform && optimalTimes[platform]) {
      res.json({ platform, times: optimalTimes[platform] });
    } else {
      res.json(optimalTimes);
    }
  } catch (error) {
    console.error('Get optimal times error:', error);
    res.status(500).json({ message: 'Server error fetching optimal times' });
  }
});

module.exports = router;