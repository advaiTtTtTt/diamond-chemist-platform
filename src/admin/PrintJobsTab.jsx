import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const STATUS_FILTERS = ['all', 'PAID', 'PRINTING', 'READY', 'COLLECTED', 'ERROR'];

function statusBadge(status) {
  const map = {
    PENDING_PAYMENT: { cls: 'grey', label: 'Awaiting Payment' },
    PAID: { cls: 'blue', label: 'Paid – Printing Soon' },
    PRINTING: { cls: 'indigo', label: 'Printing Now...' },
    READY: { cls: 'amber', label: 'Ready for Pickup' },
    COLLECTED: { cls: 'green', label: 'Collected' },
    ERROR: { cls: 'red', label: 'Print Failed' },
    CANCELLED: { cls: 'grey', label: 'Cancelled' },
  };
  return map[status] || { cls: 'grey', label: status };
}

function PrintJobCard({ job, onRefresh }) {
  const [holdProgress, setHoldProgress] = useState(0);
  const holdRef = useRef(null);
  const badge = statusBadge(job.status);

  const downloadFile = async () => {
    const { data: session } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke('admin-print-download', {
      body: { job_id: job.id },
      headers: { Authorization: `Bearer ${session.session.access_token}` },
    });
    if (data?.url) window.open(data.url, '_blank');
    else alert(error?.message || data?.error || 'Download failed');
  };

  const markCollected = async () => {
    if (!confirm(`Confirm collection for ${job.pickup_code}?`)) return;
    const { data: session } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke('collect-print-job', {
      body: { pickup_code: job.pickup_code },
      headers: { Authorization: `Bearer ${session.session.access_token}` },
    });
    if (error || data?.error) alert(data?.error || 'Failed');
    else onRefresh();
  };

  const reprint = async () => {
    const { data: session } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke('reprint-print-job', {
      body: { job_id: job.id },
      headers: { Authorization: `Bearer ${session.session.access_token}` },
    });
    if (error || data?.error) alert(data?.error || 'Failed');
    else onRefresh();
  };

  const startHold = () => {
    setHoldProgress(0);
    const start = Date.now();
    holdRef.current = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 2000) * 100);
      setHoldProgress(p);
      if (p >= 100) {
        clearInterval(holdRef.current);
        markCollected();
        setHoldProgress(0);
      }
    }, 50);
  };

  const endHold = () => {
    if (holdRef.current) clearInterval(holdRef.current);
    setHoldProgress(0);
  };

  const time = new Date(job.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`print-admin-card ${job.status === 'PRINTING' ? 'shimmer' : ''}`}>
      <div className="print-admin-card-head">
        <strong className="print-admin-code">{job.pickup_code}</strong>
        <span className={`print-status-badge print-badge-${badge.cls}`}>{badge.label}</span>
        <span className="print-admin-time">{time}</span>
      </div>
      <p className="print-admin-file">{job.file_name}</p>
      <p className="print-admin-meta">
        {job.page_count} pages × {job.copies} copies · {job.colour_mode === 'colour' ? 'Colour' : 'B&W'} · {job.paper_size.toUpperCase()} · {job.sides}
      </p>
      <p className="print-admin-customer">
        {job.customer_name} · 📱 {job.customer_phone}
      </p>
      <p className="print-admin-paid">Paid ₹{Number(job.total_amount).toFixed(2)}</p>
      {job.notes && (
        <div style={{ background: '#FFFDF0', padding: 8, borderRadius: 6, border: '1px dashed #E5D599', marginTop: 8, fontSize: 13, color: '#8A7A3B' }}>
          <strong>Customer Note:</strong> {job.notes}
        </div>
      )}
      {job.status === 'ERROR' && job.error_log && (
        <div className="print-admin-error-log">{job.error_log}</div>
      )}
      <div className="print-admin-actions">
        <button className="print-btn-outline sm" onClick={downloadFile}>Download File</button>
        {job.status === 'READY' && (
          <button
            className="print-btn-primary sm collect-hold"
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
          >
            <span className="collect-hold-fill" style={{ width: `${holdProgress}%` }} />
            Hold to Mark Collected
          </button>
        )}
        {job.status === 'ERROR' && (
          <button className="print-btn-outline sm" onClick={reprint}>Reprint</button>
        )}
      </div>
    </div>
  );
}

function PrintAgentStatus({ agent }) {
  if (!agent) return null;
  const lastSeen = agent.last_seen ? new Date(agent.last_seen) : null;
  // eslint-disable-next-line react-hooks/purity
  const secsAgo = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 1000) : 9999;
  const online = secsAgo < 30;

  return (
    <div className={`print-agent-widget ${online ? 'online' : 'offline'}`}>
      <div className="print-agent-dot-wrap">
        <span className={`print-agent-dot ${online ? 'pulse' : ''}`}></span>
        <strong>{online ? 'Agent Online' : 'Agent Offline'}</strong>
        <span> — Last seen {secsAgo < 60 ? `${secsAgo} seconds ago` : `${Math.floor(secsAgo / 60)} minutes ago`}</span>
      </div>
      {!online && secsAgo > 300 && (
        <p className="print-agent-warning">
          ⚠️ Print agent may be offline. New jobs will queue and print when the agent reconnects.
        </p>
      )}
      <div className="print-agent-meta">
        <span>Version: {agent.agent_version || '—'}</span>
        <span>Printer: {agent.printer_name || '—'}</span>
        <span>Host: {agent.hostname || '—'}</span>
        <span>Printed today: {agent.jobs_printed_today || 0}</span>
      </div>
    </div>
  );
}

export function PrintJobsTab() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [agent, setAgent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState('jobs');

  const fetchJobs = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return;
    const { data, error } = await supabase.functions.invoke('get-print-jobs', {
      body: { status: filter !== 'all' ? filter : null, search: search || null },
      headers: { Authorization: `Bearer ${session.session.access_token}` },
    });
    if (data && !error) {
      setJobs(data.jobs || []);
      setStats(data.stats || {});
      setAgent(data.agent);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    const channel = supabase.channel('print-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'print_jobs' }, fetchJobs)
      .subscribe();
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search]);

  return (
    <div className="print-admin-tab">
      <div className="print-admin-subtabs">
        <button className={subTab === 'jobs' ? 'active' : ''} onClick={() => setSubTab('jobs')}>Print Jobs</button>
        <button className={subTab === 'agent' ? 'active' : ''} onClick={() => setSubTab('agent')}>Agent Status</button>
      </div>

      {subTab === 'agent' ? (
        <PrintAgentStatus agent={agent} />
      ) : (
        <>
          <div className="stats-row print-stats-row">
            <div className="stat-card print-stat"><div className="num">{stats.todayJobs || 0}</div><div className="label">Today's Jobs</div></div>
            <div className="stat-card print-stat"><div className="num">{stats.pendingPickup || 0}</div><div className="label">Pending Pickup</div></div>
            <div className="stat-card print-stat"><div className="num">₹{stats.todayRevenue || 0}</div><div className="label">Today's Revenue</div></div>
            <div className="stat-card print-stat"><div className="num">{stats.printsToday || 0}</div><div className="label">Prints Today</div></div>
          </div>

          <PrintAgentStatus agent={agent} />

          <div className="print-admin-filters">
            <div className="print-filter-pills">
              {STATUS_FILTERS.map(f => (
                <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <input className="form-input" placeholder="Search pickup code..." value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchJobs()} />
          </div>

          {loading ? <p>Loading...</p> : jobs.length === 0 ? (
            <div className="empty-state"><p>No print jobs yet</p></div>
          ) : jobs.map(j => <PrintJobCard key={j.id} job={j} onRefresh={fetchJobs} />)}
        </>
      )}
    </div>
  );
}
