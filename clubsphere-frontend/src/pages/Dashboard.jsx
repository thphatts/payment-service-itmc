import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalFund: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-xl">
      {/* Header / Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <h1 className="text-2xl font-bold text-on-surface">Dashboard Overview</h1>
        <div className="flex gap-2">
          <button onClick={fetchStats} className="flex items-center gap-2 bg-surface text-on-surface border border-outline-variant hover:bg-surface-container px-4 py-2 rounded-lg text-label-md font-label-md transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Làm mới
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Card 1 */}
        <div className="bg-surface border border-outline-variant/60 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(70,72,212,0.08)] transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined">groups</span>
            </div>
          </div>
          <div>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Members</p>
            <h3 className="text-headline-lg font-headline-lg text-on-surface">{stats.totalMembers}</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface border border-outline-variant/60 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(70,72,212,0.08)] transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined">how_to_reg</span>
            </div>
          </div>
          <div>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Active Members</p>
            <h3 className="text-headline-lg font-headline-lg text-on-surface">{stats.activeMembers}</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface border border-outline-variant/60 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(70,72,212,0.08)] transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
          </div>
          <div>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Quỹ câu lạc bộ</p>
            <h3 className="text-headline-lg font-headline-lg text-on-surface">{stats.totalFund.toLocaleString()}₫</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface border border-outline-variant/60 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(70,72,212,0.08)] transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#fef08a] text-[#854d0e] flex items-center justify-center">
              <span className="material-symbols-outlined">campaign</span>
            </div>
          </div>
          <div>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Active Campaigns</p>
            <h3 className="text-headline-lg font-headline-lg text-on-surface">1</h3>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-lg">
          {/* Data Table */}
          <div className="bg-surface border border-outline-variant/50 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="text-label-md font-label-md font-bold text-on-surface uppercase tracking-wide">Recent Activity</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest text-label-sm font-label-sm text-on-surface-variant border-b border-outline-variant/30">
                    <th className="px-5 py-3 font-medium">MEMBER</th>
                    <th className="px-5 py-3 font-medium">ACTION</th>
                    <th className="px-5 py-3 font-medium">DATE</th>
                    <th className="px-5 py-3 font-medium text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm font-body-sm text-on-surface divide-y divide-outline-variant/20">
                  {stats.recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-10 text-center text-gray-500">Chưa có hoạt động gần đây.</td>
                    </tr>
                  ) : (
                    stats.recentActivity.map((activity, index) => (
                      <tr key={index} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-5 py-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant font-bold text-xs">
                            {activity.name.charAt(0)}
                          </div>
                          <span className="font-medium">{activity.name}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            {activity.action}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-on-surface-variant">
                          {new Date(activity.date).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`inline-flex px-2 py-1 rounded text-label-sm font-label-sm ${
                            activity.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="space-y-lg">
          <div className="bg-surface border border-outline-variant/50 rounded-xl shadow-sm p-5 relative overflow-hidden">
            <h3 className="text-label-md font-label-md font-bold text-on-surface uppercase tracking-wide mb-5">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/members')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <span className="material-symbols-outlined text-primary">person_add</span>
                <span className="text-sm font-medium">Add New Member</span>
              </button>
              <button 
                onClick={() => navigate('/members')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <span className="material-symbols-outlined text-primary">upload_file</span>
                <span className="text-sm font-medium">Import Members</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;