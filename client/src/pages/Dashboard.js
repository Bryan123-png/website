import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Calendar,
  Eye,
  Heart,
  Share2,
  BarChart3
} from 'lucide-react';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upcomingPosts, setUpcomingPosts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, upcomingRes] = await Promise.all([
        axios.get('/api/analytics/dashboard'),
        axios.get('/api/schedule/upcoming')
      ]);
      
      setAnalytics(analyticsRes.data);
      setUpcomingPosts(upcomingRes.data.slice(0, 5)); // Show only next 5
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const engagementChartData = {
    labels: analytics?.dailyData?.slice(-7).map(d => 
      new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
    ) || [],
    datasets: [
      {
        label: 'Likes',
        data: analytics?.dailyData?.slice(-7).map(d => d.likes) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Comments',
        data: analytics?.dailyData?.slice(-7).map(d => d.comments) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      },
      {
        label: 'Shares',
        data: analytics?.dailyData?.slice(-7).map(d => d.shares) || [],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4
      }
    ]
  };

  const platformChartData = {
    labels: Object.keys(analytics?.platformData || {}),
    datasets: [
      {
        data: Object.values(analytics?.platformData || {}).map(p => p.followers),
        backgroundColor: [
          '#1877F2', // Facebook
          '#1DA1F2', // Twitter
          '#E4405F', // Instagram
          '#0A66C2'  // LinkedIn
        ],
        borderWidth: 0
      }
    ]
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your social media.</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Posts"
          value={analytics?.overview?.totalPosts || 0}
          change={5.2}
          icon={MessageSquare}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Engagement"
          value={analytics?.overview?.totalEngagement?.toLocaleString() || '0'}
          change={12.5}
          icon={Heart}
          color="bg-green-500"
        />
        <StatCard
          title="Total Impressions"
          value={analytics?.overview?.totalImpressions?.toLocaleString() || '0'}
          change={8.1}
          icon={Eye}
          color="bg-purple-500"
        />
        <StatCard
          title="Engagement Rate"
          value={`${analytics?.overview?.engagementRate || 0}%`}
          change={2.3}
          icon={BarChart3}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Trends (Last 7 Days)</h3>
          <div className="h-64">
            <Line 
              data={engagementChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Followers by Platform</h3>
          <div className="h-64">
            <Doughnut 
              data={platformChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Posts */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Posts</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {upcomingPosts.length > 0 ? (
              upcomingPosts.map((post, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {post.post.content.substring(0, 50)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.scheduledTime).toLocaleDateString()} at {new Date(post.scheduledTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    {post.post.platforms.map((platform, idx) => (
                      <span key={idx} className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming posts scheduled</p>
            )}
          </div>
        </div>

        {/* Top Performing Posts */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Posts</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics?.topPerformingPosts?.map((post, index) => (
              <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {post.content.substring(0, 50)}...
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {post.platform} • {new Date(post.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-900">{post.engagement}</span>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No posts data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;