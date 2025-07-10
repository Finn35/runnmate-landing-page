'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the analytics component to prevent build-time imports
const AnalyticsContent = dynamic(
  () => import('./AnalyticsContent'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Marketplace Analytics</h1>
        <p>Loading analytics data...</p>
      </div>
    )
  }
);

export default function AnalyticsDashboard() {
  return <AnalyticsContent />;
} 