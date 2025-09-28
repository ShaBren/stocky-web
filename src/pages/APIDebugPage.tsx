import { useState } from 'react';
import { api } from '../lib/api';
import { getRuntimeConfig } from '../lib/runtime-config';

export function APIDebugPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testEndpoint = async (endpoint: string, name: string) => {
    try {
      addResult(`🔍 Testing ${name}: ${endpoint}`);
      const response = await api.get(endpoint);
      addResult(`✅ ${name} - Status: ${response.status}, Data length: ${JSON.stringify(response.data).length}`);
      return true;
    } catch (error: any) {
      addResult(`❌ ${name} - Error: ${error.message}`);
      if (error.response) {
        addResult(`   Status: ${error.response.status}, Response: ${JSON.stringify(error.response.data)}`);
      }
      return false;
    }
  };

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);

    // Show current configuration
    try {
      const config = getRuntimeConfig();
      addResult(`📋 Current API Base URL: ${config.apiBaseUrl}`);
      addResult(`📋 Axios Base URL: ${api.defaults.baseURL}`);
    } catch (error) {
      addResult(`❌ Failed to get runtime config: ${error}`);
    }

    // Test various endpoints
    const endpoints = [
      { path: '/health/', name: 'Health Check' },
      { path: '/auth/users/me/', name: 'User Profile' },
      { path: '/items/', name: 'Items List' },
      { path: '/locations/', name: 'Locations List' },
      { path: '/shopping-lists/', name: 'Shopping Lists' },
      { path: '/shopping-lists/?limit=1', name: 'Shopping Lists (with params)' }
    ];

    for (const endpoint of endpoints) {
      await testEndpoint(endpoint.path, endpoint.name);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">API Debug Tool</h1>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={runTests}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Run API Tests'}
          </button>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>

        <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3">Test Results:</h3>
          {results.length === 0 ? (
            <p className="text-gray-500 italic">No results yet. Click "Run API Tests" to start.</p>
          ) : (
            <div className="space-y-1">
              {results.map((result, index) => (
                <div key={index} className="text-sm font-mono text-gray-800">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="font-semibold text-yellow-800 mb-2">Usage Instructions:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• This tool tests various API endpoints to identify configuration issues</li>
            <li>• It shows the current API base URL being used</li>
            <li>• Compare successful vs failed endpoints to identify patterns</li>
            <li>• Check the browser network tab for additional debugging info</li>
          </ul>
        </div>
      </div>
    </div>
  );
}