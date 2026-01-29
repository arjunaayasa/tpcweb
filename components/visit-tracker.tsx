'use client';

import { useEffect } from 'react';

const VISIT_TRACKER_KEY = 'tpc_visit_tracked';

export default function VisitTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.location.pathname.startsWith('/admin-tpc')) {
      return;
    }

    if (sessionStorage.getItem(VISIT_TRACKER_KEY)) {
      return;
    }

    sessionStorage.setItem(VISIT_TRACKER_KEY, '1');

    fetch('/api/track', { method: 'POST', keepalive: true }).catch(() => undefined);
  }, []);

  return null;
}
