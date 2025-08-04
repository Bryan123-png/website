import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Settings,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Users,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react';

const Platforms = () => {
  const [platforms, setPlatforms] = useState([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  useEffect(() => {
    fetchPlatforms();
    fetchConnectedPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/platforms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlatforms(response.data);
    } catch (error) {
      console.error('Error fetching platforms:', error);
    }
  };

  const fetchConnectedPlatforms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/platforms/connected', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnectedPlatforms(response.data);
    } catch (error) {
      console.error('Error fetching connected platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platformId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/platforms/connect`, 
        { platformId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchConnectedPlatforms();
      setShowConnectModal(false);
    } catch (error) {
      console.error('Error connecting platform:', error);
    }
  };

  const handleDisconnect = async (accountId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/platforms/disconnect/${accountId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnectedPlatforms(connectedPlatforms.filter(p => p.id !== accountId));
    } catch (error) {
      console.error('Error disconnecting platform:', error);
    }
  };

  const handleSync = async (accountId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/platforms/sync/${accountId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchConnectedPlatforms();
    } catch (error) {
      console.error('Error syncing platform:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform) => {
    // In a real app, you'd use actual platform icons
    const icons = {
      facebook: '📘',
      instagram: '📷',
      twitter: '🐦',
      linkedin: '💼',
      youtube: '📺',
      tiktok: '🎵',
      pinterest: '📌'
    };
    return icons[platform.toLowerCase()] || '🌐';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platforms</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your social media platform connections
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowConnectModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Connect Platform
          </button>
        </div>
      </div>

      {/* Connected Platforms */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Connected Accounts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {connectedPlatforms.length > 0 ? (
            connectedPlatforms.map((account) => (
              <div key={account.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getPlatformIcon(account.platform)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                        </h4>
                        {getStatusIcon(account.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(account.status)}`}>
                          {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">@{account.username}</p>
                      <p className="text-xs text-gray-500">
                        Connected on {new Date(account.connectedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSync(account.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Sync data"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDisconnect(account.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Disconnect"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Followers</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {account.followers?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Engagement</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {account.engagementRate || 'N/A'}%
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Posts</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {account.postsCount || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Last Sync</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {account.lastSync ? new Date(account.lastSync).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>

                {/* Platform-specific features */}
                {account.features && account.features.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Available Features</h5>
                    <div className="flex flex-wrap gap-2">
                      {account.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-2">
                <Users className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No connected platforms</h3>
              <p className="text-gray-500 mb-4">
                Connect your social media accounts to start managing your content.
              </p>
              <button
                onClick={() => setShowConnectModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Connect your first platform
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Platform Guidelines */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Platform Guidelines</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <div key={platform.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">{getPlatformIcon(platform.name)}</div>
                  <h4 className="text-lg font-medium text-gray-900">{platform.name}</h4>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Character limit:</span>
                    <span className="font-medium">{platform.characterLimit || 'No limit'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Image size:</span>
                    <span className="font-medium">{platform.imageSize || 'Various'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Video length:</span>
                    <span className="font-medium">{platform.videoLength || 'Various'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best posting time:</span>
                    <span className="font-medium">{platform.bestTime || 'Varies'}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <a
                    href={platform.guidelinesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                  >
                    View guidelines
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connect Platform Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Connect Platform</h3>
              <div className="space-y-3">
                {platforms.map((platform) => {
                  const isConnected = connectedPlatforms.some(cp => cp.platform.toLowerCase() === platform.name.toLowerCase());
                  return (
                    <button
                      key={platform.id}
                      onClick={() => !isConnected && handleConnect(platform.id)}
                      disabled={isConnected}
                      className={`w-full flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                        isConnected
                          ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                          : 'border-gray-300 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <div className="text-2xl">{getPlatformIcon(platform.name)}</div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{platform.name}</p>
                        <p className="text-sm text-gray-500">{platform.description}</p>
                      </div>
                      {isConnected && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Platforms;