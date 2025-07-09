'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    offers: 0,
    voucherOptIns: 0,
    listings: 0,
    newListings: 0,
    loading: true,
    error: '',
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Count offers
        const { count: offers, error: offersError } = await supabase
          .from('offers')
          .select('*', { count: 'exact', head: true });
        if (offersError) throw offersError;

        // Count voucher opt-ins
        const { count: voucherOptIns, error: voucherError } = await supabase
          .from('launch_notifications')
          .select('*', { count: 'exact', head: true });
        if (voucherError) throw voucherError;

        // Count all listings
        const { count: listings, error: listingsError } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true });
        if (listingsError) throw listingsError;

        // Count new listings in last 7 days
        const since = new Date();
        since.setDate(since.getDate() - 7);
        const { count: newListings, error: newListingsError } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', since.toISOString());
        if (newListingsError) throw newListingsError;

        setStats({
          offers: offers || 0,
          voucherOptIns: voucherOptIns || 0,
          listings: listings || 0,
          newListings: newListings || 0,
          loading: false,
          error: '',
        });
      } catch (err: unknown) {
        let errorMsg = 'Error loading analytics';
        if (typeof err === 'string') errorMsg = err;
        else if (err instanceof Error) errorMsg = err.message;
        setStats((s) => ({ ...s, loading: false, error: errorMsg }));
      }
    }
    fetchStats();
  }, []);

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Marketplace Analytics</h1>
      {stats.loading ? (
        <p>Loading...</p>
      ) : stats.error ? (
        <p style={{ color: 'red' }}>{stats.error}</p>
      ) : (
        <ul style={{ fontSize: 18, lineHeight: 2 }}>
          <li><strong>Offers made:</strong> {stats.offers}</li>
          <li><strong>Voucher opt-ins:</strong> {stats.voucherOptIns}</li>
          <li><strong>Total listings:</strong> {stats.listings}</li>
          <li><strong>New listings (last 7 days):</strong> {stats.newListings}</li>
        </ul>
      )}
      <div style={{ marginTop: 32, fontSize: 14, color: '#666' }}>
        <strong>Note:</strong> Buy Now actions are not currently tracked, but each triggers an email notification.
      </div>
    </div>
  );
} 