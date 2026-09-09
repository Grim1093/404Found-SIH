'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Copy, Terminal, Code2, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface EndpointConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'WS';
  path: string;
  description: string;
  codeSnippets: {
    language: string;
    code: string;
  }[];
}

const ENDPOINTS: EndpointConfig[] = [
  {
    method: 'POST',
    path: '/api/analysis/upload',
    description: 'Upload an audio file for deepfake detection analysis.',
    codeSnippets: [
      {
        language: 'cURL',
        code: `curl -X POST https://api.voxguard.internal/api/analysis/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@/path/to/recording.wav"`
      },
      {
        language: 'Python',
        code: `import requests

url = "https://api.voxguard.internal/api/analysis/upload"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
files = {"file": open("recording.wav", "rb")}

response = requests.post(url, headers=headers, files=files)
print(response.json())`
      },
      {
        language: 'Node.js',
        code: `const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('file', fs.createReadStream('recording.wav'));

axios.post('https://api.voxguard.internal/api/analysis/upload', form, {
  headers: {
    ...form.getHeaders(),
    'Authorization': 'Bearer YOUR_API_KEY'
  }
}).then(res => console.log(res.data));`
      }
    ]
  },
  {
    method: 'WS',
    path: '/ws/monitor',
    description: 'Connect to the WebSocket to receive real-time updates for active calls and alerts.',
    codeSnippets: [
      {
        language: 'JavaScript',
        code: `const ws = new WebSocket('wss://api.voxguard.internal/ws/monitor?token=YOUR_API_KEY');

ws.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  console.log('Event received:', payload.event);
  console.log('Data:', payload.data);
};`
      }
    ]
  },
  {
    method: 'GET',
    path: '/api/calls',
    description: 'Retrieve a list of calls. Supports pagination and filtering.',
    codeSnippets: [
      {
        language: 'cURL',
        code: `curl -X GET "https://api.voxguard.internal/api/calls?skip=0&limit=50" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
      }
    ]
  }
];

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<Record<string, number>>({});

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-info-muted text-info border-info/30';
      case 'POST': return 'bg-genuine-muted text-genuine border-genuine/30';
      case 'PUT':
      case 'PATCH': return 'bg-suspicious-muted text-suspicious border-suspicious/30';
      case 'DELETE': return 'bg-cloned-muted text-cloned border-cloned/30';
      case 'WS': return 'bg-text-secondary/10 text-text-primary border-border';
      default: return 'bg-surface-elevated text-text-primary';
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <PageHeader 
        title="API Documentation" 
        description="Integrate VoxGuard directly into your VoIP infrastructure or custom applications."
      />

      <div className="space-y-8">
        <Card>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-surface-elevated border border-border rounded-lg text-text-secondary">
              <Terminal size={24} />
            </div>
            <div>
              <h2 className="text-lg font-medium text-text-primary">Getting Started</h2>
              <p className="text-sm text-text-secondary mt-1 max-w-3xl">
                All requests to the VoxGuard API require authentication using a Bearer token. 
                You can generate API keys from the Settings page. Include the key in the Authorization header of your HTTP requests.
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-surface-elevated rounded border border-border font-mono text-sm text-text-secondary flex items-center justify-between">
            <span>Authorization: Bearer {'<YOUR_API_KEY>'}</span>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard('Authorization: Bearer <YOUR_API_KEY>')}>
              <Copy size={14} />
            </Button>
          </div>
        </Card>

        <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Endpoints</h3>

        {ENDPOINTS.map((endpoint, index) => {
          const currentTab = activeTab[endpoint.path] || 0;
          
          return (
            <Card key={index} padding="none" className="overflow-hidden">
              <div className="p-4 border-b border-border bg-surface-hover/30 flex flex-col md:flex-row md:items-center gap-4">
                <div className={cn("px-2 py-1 rounded text-xs font-bold border", getMethodColor(endpoint.method))}>
                  {endpoint.method}
                </div>
                <div className="font-mono text-sm font-medium text-text-primary break-all">
                  {endpoint.path}
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-text-secondary mb-6">
                  {endpoint.description}
                </p>
                
                <div className="border border-border rounded-lg overflow-hidden bg-[#0A0A0A]">
                  <div className="flex border-b border-border bg-surface-elevated">
                    {endpoint.codeSnippets.map((snippet, tabIndex) => (
                      <button
                        key={tabIndex}
                        className={cn(
                          "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                          currentTab === tabIndex 
                            ? "border-foreground text-text-primary bg-surface-hover/50" 
                            : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover/30"
                        )}
                        onClick={() => setActiveTab(prev => ({ ...prev, [endpoint.path]: tabIndex }))}
                      >
                        {snippet.language}
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative group">
                    <pre className="p-4 text-sm font-mono text-text-secondary overflow-x-auto">
                      <code>{endpoint.codeSnippets[currentTab].code}</code>
                    </pre>
                    <button 
                      className="absolute top-2 right-2 p-1.5 rounded bg-surface-elevated border border-border text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:text-text-primary"
                      onClick={() => copyToClipboard(endpoint.codeSnippets[currentTab].code)}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
