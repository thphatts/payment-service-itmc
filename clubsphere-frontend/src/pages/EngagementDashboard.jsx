import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const EngagementDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  const fetchEngagement = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/engagement/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching engagement overview:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagement();
  }, []);

  const handleSendReminder = (studentId, name) => {
    setToast({
      type: 'success',
      text: `Đã gửi thông báo nhắc nhở tham gia hoạt động đến hội viên ${name} (${studentId}) thành công!`
    });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank = rankFilter === 'ALL' || item.rank === rankFilter;
    return matchesSearch && matchesRank;
  });

  // Calculate statistics
  const totalCount = data.length;
  const avgScore = totalCount > 0 ? (data.reduce((sum, item) => sum + item.engagementScore, 0) / totalCount).toFixed(1) : 0;
  const excellentCount = data.filter(item => item.rank === 'XUẤT SẮC').length;
  const atRiskCount = data.filter(item => item.rank === 'CẦN LƯU Ý').length;

  // Chart data for Rank distribution
  const ranksDistribution = [
    { name: 'Xuất sắc', value: data.filter(item => item.rank === 'XUẤT SẮC').length, color: '#D946EF' }, // Purple
    { name: 'Tích cực', value: data.filter(item => item.rank === 'TÍCH CỰC').length, color: '#F59E0B' },  // Gold
    { name: 'Trung bình', value: data.filter(item => item.rank === 'TRUNG BÌNH').length, color: '#3B82F6' }, // Blue
    { name: 'Cần lưu ý', value: data.filter(item => item.rank === 'CẦN LƯU Ý').length, color: '#EF4444' }   // Red
  ].filter(item => item.value > 0);

  // Performance range distribution for BarChart
  const performanceRanges = [
    { name: '0-50', count: data.filter(item => item.engagementScore < 50).length, fill: '#EF4444' },
    { name: '50-70', count: data.filter(item => item.engagementScore >= 50 && item.engagementScore < 70).length, fill: '#3B82F6' },
    { name: '70-90', count: data.filter(item => item.engagementScore >= 70 && item.engagementScore < 90).length, fill: '#F59E0B' },
    { name: '90-100', count: data.filter(item => item.engagementScore >= 90).length, fill: '#D946EF' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300 ${
          toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="font-bold text-label-md">{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-headline-md font-bold text-on-surface">Đánh giá Sự tích cực hội viên</h1>
            <p className="text-body-md text-on-surface-variant">Tự động đánh giá thông qua hoạt động Điểm danh (60%) và đóng Quỹ (40%)</p>
          </div>
          <button 
            onClick={fetchEngagement}
            className="bg-primary text-on-primary hover:bg-surface-tint px-4 py-2.5 rounded-lg text-label-md font-label-md transition-all shadow-sm active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Cập nhật dữ liệu
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-surface p-5 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">group</span>
          </div>
          <div>
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase block">Tổng hội viên</span>
            <span className="text-headline-md font-bold text-on-surface">{totalCount}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface p-5 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">monitoring</span>
          </div>
          <div>
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase block">Điểm TB toàn CLB</span>
            <span className="text-headline-md font-bold text-on-surface">{avgScore} / 100</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface p-5 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">workspace_premium</span>
          </div>
          <div>
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase block">Hội viên Xuất sắc</span>
            <span className="text-headline-md font-bold text-green-700">{excellentCount}</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface p-5 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">error</span>
          </div>
          <div>
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase block">Hội viên Cần lưu ý</span>
            <span className="text-headline-md font-bold text-red-600">{atRiskCount}</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Range Chart */}
        <div className="bg-surface p-5 rounded-xl border border-outline-variant shadow-sm lg:col-span-2">
          <h3 className="text-title-md font-bold text-on-surface mb-4">Phân bố Khoảng điểm tích cực</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceRanges} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {performanceRanges.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rank Pie Chart */}
        <div className="bg-surface p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-title-md font-bold text-on-surface mb-2">Tỷ lệ Xếp hạng</h3>
            <p className="text-body-sm text-on-surface-variant mb-4">Tỉ lệ phần trăm xếp loại hoạt động của hội viên</p>
          </div>
          <div className="h-44 relative flex items-center justify-center">
            {ranksDistribution.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">Chưa có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ranksDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ranksDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {ranksDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-label-sm font-bold text-on-surface-variant">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Member Engagement List */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative max-w-md w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none" 
              placeholder="Tìm kiếm hội viên..." 
              type="text"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'Tất cả xếp loại' },
              { id: 'XUẤT SẮC', label: 'Xuất sắc' },
              { id: 'TÍCH CỰC', label: 'Tích cực' },
              { id: 'TRUNG BÌNH', label: 'Trung bình' },
              { id: 'CẦN LƯU Ý', label: 'Cần lưu ý' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRankFilter(tab.id)}
                className={`px-4 py-2 rounded-lg text-label-md font-bold whitespace-nowrap transition-colors ${
                  rankFilter === tab.id 
                    ? 'bg-secondary-container text-on-secondary-container' 
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Member Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/50 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                <th className="px-6 py-3">Hội viên</th>
                <th className="px-6 py-3">Tỉ lệ họp</th>
                <th className="px-6 py-3">Hoàn thành quỹ</th>
                <th className="px-6 py-3 text-center">Điểm số</th>
                <th className="px-6 py-3">Xếp loại</th>
                <th className="px-6 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-on-surface-variant">Đang tải bảng đánh giá sự tích cực...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-on-surface-variant">Không có thành viên nào phù hợp bộ lọc.</td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  let badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
                  if (item.rank === 'XUẤT SẮC') badgeClass = 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200';
                  else if (item.rank === 'TÍCH CỰC') badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
                  else if (item.rank === 'CẦN LƯU Ý') badgeClass = 'bg-red-100 text-red-800 border-red-200 animate-pulse';

                  return (
                    <tr key={index} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-label-lg border border-outline-variant/30">
                          {item.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-body-md font-bold text-on-surface">{item.fullName}</div>
                          <div className="text-label-sm text-on-surface-variant font-mono">{item.studentId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="flex justify-between text-label-sm font-bold text-on-surface mb-1">
                            <span>{item.attendanceRate}%</span>
                          </div>
                          <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${item.attendanceRate}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="flex justify-between text-label-sm font-bold text-on-surface mb-1">
                            <span>{item.fundPaidRate}%</span>
                          </div>
                          <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                            <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${item.fundPaidRate}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-headline-sm text-on-surface">
                        {item.engagementScore}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-label-sm font-bold border ${badgeClass}`}>
                          {item.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.rank === 'CẦN LƯU Ý' && (
                          <button
                            onClick={() => handleSendReminder(item.studentId, item.fullName)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-label-sm font-bold transition-colors inline-flex items-center gap-1.5 border border-red-200"
                          >
                            <span className="material-symbols-outlined text-[16px]">mail</span>
                            Nhắc nhở
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EngagementDashboard;
