'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

type CountResult = PostgrestSingleResponse<{ count: number }>;

export default function AnalyticsContent() {
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
        const offersResult = (await supabase
          .from('offers')
          .select('*', { count: 'exact', head: true })) as unknown as CountResult;
        if (offersResult.error) throw offersResult.error;
        const offers = offersResult.data?.count || 0;

        // Count voucher opt-ins
        const voucherResult = (await supabase
          .from('launch_notifications')
          .select('*', { count: 'exact', head: true })) as unknown as CountResult;
        if (voucherResult.error) throw voucherResult.error;
        const voucherOptIns = voucherResult.data?.count || 0;

        // Count all listings
        const listingsResult = (await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })) as unknown as CountResult;
        if (listingsResult.error) throw listingsResult.error;
        const listings = listingsResult.data?.count || 0;

        // Count new listings in last 7 days
        const since = new Date();
        since.setDate(since.getDate() - 7);
        const query = supabase
          .from('listings')
          .select('*', { count: 'exact', head: true }) as any;
        const newListingsResult = (await query
          .gte('created_at', since.toISOString())) as CountResult;
        if (newListingsResult.error) throw newListingsResult.error;
        const newListings = newListingsResult.data?.count || 0;

        setStats({
          offers,
          voucherOptIns,
          listings,
          newListings,
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