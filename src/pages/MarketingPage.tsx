import React, { useState } from 'react';
import { aiAPI } from '../services/supabaseApi';
import { useNotifications } from '../contexts/NotificationContext';
import { TrendingUp, Zap, Target, MessageSquare } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MarketingPage: React.FC = () => {
  const [campaignType, setCampaignType] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();

  const campaignTypes = [
    'Social Media Campaign',
    'Email Newsletter',
    'Website Banner',
    'Print Advertisement',
    'Radio/TV Commercial',
    'Event Promotion',
  ];

  const audiences = [
    'Parents of Young Children (3-8 years)',
    'Parents of Teenagers (13-18 years)',
    'Adult Learners',
    'Corporate Training',
    'University Students',
    'Professional Development',
  ];

  const generateContent = async () => {
    if (!campaignType || !targetAudience) {
      addNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please select campaign type and target audience.',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await aiAPI.generateMarketing(campaignType, targetAudience, additionalContext);
      setGeneratedContent(response.content);
      
      addNotification({
        type: 'success',
        title: 'Content Generated',
        message: 'AI-powered marketing content has been generated successfully.',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: error.message || 'Failed to generate marketing content',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <p className="text-gray-600">Create and manage marketing campaigns with AI assistance</p>
      </div>

      {/* AI Content Generator */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Content Generator</h3>
            <p className="text-sm text-gray-600">Generate compelling marketing content with AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Type
            </label>
            <select
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select campaign type...</option>
              {campaignTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select target audience...</option>
              {audiences.map((audience) => (
                <option key={audience} value={audience}>{audience}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Context (Optional)
          </label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Add any specific requirements, tone, or key messages..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          onClick={generateContent}
          disabled={loading}
          className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          <span>{loading ? 'Generating...' : 'Generate Content'}</span>
        </button>
      </div>

      {/* Generated Content */}
      {generatedContent && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Generated Content</h3>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
              {generatedContent}
            </pre>
          </div>

          <div className="mt-4 flex space-x-3">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Save Campaign
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
              Copy Content
            </button>
            <button 
              onClick={generateContent}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">24.5%</p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Leads</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">89</p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingPage;