import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';

const FinanceTransparency = () => {
  const [summary, setSummary] = useState(null);
  const [myEngagement, setMyEngagement] = useState(null);
  const [loading, setLoading] = useState(true);

  // New states for member payment transparency
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'contributions'
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [contributions, setContributions] = useState([]);
  const [contribLoading, setContribLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PAID' | 'UNPAID'

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/api/v1/finance/summary', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (error) {
        console.error("Error fetching finance summary", error);
      }
    };

    const fetchEngagement = async () => {
      try {
        const res = await fetch('/api/v1/finance/my-engagement', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setMyEngagement(data);
        }
      } catch (error) {
        console.error("Error fetching personal engagement", error);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const res = await fetch('/api/v1/admin/campaigns', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data);
          if (data.length > 0) {
            setSelectedCampaign(data[data.length - 1].campaignCode);
          }
        }
      } catch (error) {
        console.error("Error fetching campaigns", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
    fetchEngagement();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (!selectedCampaign || activeTab !== 'contributions') return;

    const fetchContributions = async () => {
      try {
        setContribLoading(true);
        const res = await fetch(`/api/v1/admin/students/overview?campaignCode=${selectedCampaign}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setContributions(data);
        }
      } catch (error) {
        console.error("Error fetching contributions", error);
      } finally {
        setContribLoading(false);
      }
    };
    fetchContributions();
  }, [selectedCampaign, activeTab]);

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Đang tải dữ liệu minh bạch...</div>;
  }

  if (!summary) {
    return <div className="p-8 text-center text-error">Không thể tải dữ liệu. Vui lòng thử lại sau.</div>;
  }

  // Pre-process data for charts
  const categoryDataMap = {};
  (summary.recentExpenses || []).forEach(exp => {
    const cat = exp.category || 'Khác';
    categoryDataMap[cat] = (categoryDataMap[cat] || 0) + exp.amount;
  });
  
  const pieData = Object.keys(categoryDataMap).map(key => ({
    name: key,
    value: categoryDataMap[key]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const getEngagementTip = (score) => {
    if (score >= 90) return 'Bạn đang là Hội viên Xuất sắc! Hãy tiếp tục duy trì phong độ tuyệt vời này để dẫn dắt CLB nhé! 🥇';
    if (score >= 70) return 'Tuyệt vời! Bạn chỉ cần tích cực tham gia đầy đủ các sự kiện tiếp theo để đạt danh hiệu Kim Cương. 🥈';
    if (score >= 50) return 'Hãy tích cực đi họp đầy đủ và hoàn thành các đợt quỹ để thăng hạng Tích cực bạn nhé! 🥉';
    return '⚠️ Cảnh báo: Mức độ tham gia hoạt động của bạn hiện đang ở mức thấp. Hãy đi họp đầy đủ hơn để tránh bị gián đoạn sinh hoạt.';
  };

  const getRankBadgeClass = (rank) => {
    if (rank === 'XUẤT SẮC') return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800';
    if (rank === 'TÍCH CỰC') return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
    if (rank === 'CẦN LƯU Ý') return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 animate-pulse';
    return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Tài chính Minh bạch</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Nơi mọi sinh viên đều có thể theo dõi dòng tiền và trạng thái đóng quỹ của Câu lạc bộ.</p>
        </div>
      </div>

      {/* Personal Engagement Card */}
      {myEngagement && (
        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/60 shadow-sm flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[28px]">workspace_premium</span>
              <h2 className="text-title-md font-bold text-on-surface">Mức độ Hoạt động của Bạn</h2>
              <span className={`px-3 py-0.5 rounded-full text-label-sm font-bold border ${getRankBadgeClass(myEngagement.rank)}`}>
                Xếp loại: {myEngagement.rank}
              </span>
            </div>
            
            <p className="text-body-md text-on-surface-variant font-medium">
              {getEngagementTip(myEngagement.engagementScore)}
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
              <div>
                <span className="text-label-sm font-bold text-on-surface-variant uppercase block mb-1">Tỉ lệ tham gia họp</span>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${myEngagement.attendanceRate}%` }}></div>
                  </div>
                  <span className="text-body-sm font-bold text-on-surface whitespace-nowrap">{myEngagement.attendanceRate}%</span>
                </div>
              </div>
              <div>
                <span className="text-label-sm font-bold text-on-surface-variant uppercase block mb-1">Tỉ lệ hoàn thành quỹ</span>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: `${myEngagement.fundPaidRate}%` }}></div>
                  </div>
                  <span className="text-body-sm font-bold text-on-surface whitespace-nowrap">{myEngagement.fundPaidRate}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-surface-container rounded-xl p-4 md:px-8 border border-outline-variant/40 shrink-0 min-w-[150px] shadow-inner">
            <span className="text-label-sm font-bold text-on-surface-variant uppercase block mb-1">Điểm tích lũy</span>
            <div className="text-display-md font-black text-primary">{myEngagement.engagementScore}</div>
            <span className="text-label-sm text-on-surface-variant font-bold">/ 100 điểm</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-outline-variant/40 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-title-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          Tổng quan & Chi tiêu
        </button>
        <button
          onClick={() => setActiveTab('contributions')}
          className={`pb-3 text-title-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'contributions'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">groups</span>
          Trạng thái đóng quỹ thành viên
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/50 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <ArrowUpRight size={28} />
              </div>
              <div>
                <p className="text-label-sm font-bold text-on-surface-variant uppercase">Tổng Thu</p>
                <h3 className="text-headline-md font-black text-on-surface">{(summary.totalIn || 0).toLocaleString()}₫</h3>
              </div>
            </div>

            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/50 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <ArrowDownRight size={28} />
              </div>
              <div>
                <p className="text-label-sm font-bold text-on-surface-variant uppercase">Tổng Chi</p>
                <h3 className="text-headline-md font-black text-on-surface">{(summary.totalOut || 0).toLocaleString()}₫</h3>
              </div>
            </div>

            <div className="bg-primary rounded-2xl p-6 text-on-primary shadow-lg shadow-primary/20 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              <div className="w-14 h-14 rounded-full bg-on-primary/20 flex items-center justify-center shrink-0 z-10">
                <DollarSign size={28} />
              </div>
              <div className="z-10">
                <p className="text-label-sm font-bold text-primary-container uppercase">Số dư hiện tại</p>
                <h3 className="text-headline-md font-black">{(summary.balance || 0).toLocaleString()}₫</h3>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/50 shadow-sm">
              <h3 className="text-title-md font-bold text-on-surface mb-6">Cơ cấu Chi tiêu (Gần đây)</h3>
              {pieData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => value.toLocaleString() + '₫'} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-on-surface-variant">Chưa có dữ liệu chi tiêu.</div>
              )}
            </div>

            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/50 shadow-sm flex flex-col">
              <h3 className="text-title-md font-bold text-on-surface mb-4">Lịch sử Chi tiêu</h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {summary.recentExpenses && summary.recentExpenses.length > 0 ? (
                  summary.recentExpenses.map(exp => (
                    <div key={exp.id} className="flex justify-between items-center p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-body-md">{exp.title}</p>
                          <p className="text-label-sm text-on-surface-variant flex gap-2">
                            <span>{new Date(exp.expenseDate).toLocaleDateString('vi-VN')}</span>
                            <span>•</span>
                            <span className="font-medium text-primary">{exp.category || 'Khác'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-error">-{exp.amount.toLocaleString()}₫</p>
                        {exp.receiptUrl && (
                          <a href={exp.receiptUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Xem hóa đơn</a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-on-surface-variant py-8">Chưa có khoản chi nào được ghi nhận.</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Member Contributions Tab */
        <div className="space-y-6">
          {/* Controls & Campaign Selector */}
          <div className="bg-surface rounded-2xl p-5 border border-outline-variant/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="block text-label-sm font-bold text-on-surface-variant uppercase">Đợt đóng quỹ</label>
              <div className="relative w-72">
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary outline-none font-bold text-on-surface appearance-none cursor-pointer"
                >
                  {campaigns.map((c) => (
                    <option key={c.campaignCode} value={c.campaignCode}>
                      {c.title || c.campaignCode}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  arrow_drop_down
                </span>
              </div>
            </div>

            {/* Overall stats */}
            {contributions.length > 0 && (
              <div className="flex items-center gap-4 bg-primary-container/20 border border-primary/10 px-5 py-3 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <div>
                  <span className="text-label-sm text-on-surface-variant font-bold uppercase block">Tiến trình đợt quỹ</span>
                  <span className="text-body-md font-black text-on-surface">
                    Đã hoàn thành: {contributions.filter(c => c.status === 'PAID').length} / {contributions.length} hội viên ({
                      (contributions.length > 0 ? (contributions.filter(c => c.status === 'PAID').length / contributions.length * 100) : 0).toFixed(1)
                    }%)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* List layout */}
          <div className="bg-surface rounded-2xl border border-outline-variant/50 shadow-sm overflow-hidden">
            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative max-w-xs w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none" 
                  placeholder="Tìm theo tên hoặc MSSV..." 
                  type="text"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'PAID', label: 'Đã đóng' },
                  { id: 'UNPAID', label: 'Chưa đóng' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-label-md font-bold whitespace-nowrap transition-colors ${
                      statusFilter === tab.id 
                        ? 'bg-secondary-container text-on-secondary-container' 
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contribution Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/50 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                    <th className="px-6 py-3.5">Thành viên</th>
                    <th className="px-6 py-3.5">Số tiền đã đóng</th>
                    <th className="px-6 py-3.5">Trạng thái</th>
                    <th className="px-6 py-3.5">Ngày đóng quỹ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {contribLoading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-on-surface-variant">Đang tải danh sách đóng quỹ...</td>
                    </tr>
                  ) : contributions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-on-surface-variant">Không có thành viên nào trong đợt quỹ này.</td>
                    </tr>
                  ) : (
                    (() => {
                      const list = contributions.filter(item => {
                        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                              item.studentId.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
                        return matchesSearch && matchesStatus;
                      });

                      if (list.length === 0) {
                        return (
                          <tr>
                            <td colSpan="4" className="px-6 py-10 text-center text-on-surface-variant">Không tìm thấy thành viên phù hợp bộ lọc.</td>
                          </tr>
                        );
                      }

                      return list.map((item, index) => {
                        const isCurrentUser = myEngagement && myEngagement.studentId === item.studentId;
                        
                        return (
                          <tr 
                            key={index} 
                            className={`transition-colors ${
                              isCurrentUser 
                                ? 'bg-primary/5 hover:bg-primary/10 border-l-4 border-primary font-bold' 
                                : 'hover:bg-primary/5'
                            }`}
                          >
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-label-lg border border-outline-variant/30 shrink-0">
                                {item.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-body-md text-on-surface flex items-center gap-2">
                                  <span>{item.name}</span>
                                  {isCurrentUser && (
                                    <span className="bg-primary text-on-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                      Bạn
                                    </span>
                                  )}
                                </div>
                                <div className="text-label-sm text-on-surface-variant font-mono font-normal">{item.studentId}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold font-mono text-body-md text-on-surface">
                              {item.amount > 0 ? (
                                <span className="text-green-600">{(item.amount || 0).toLocaleString()}₫</span>
                              ) : (
                                <span className="text-on-surface-variant">0₫</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {item.status === 'PAID' ? (
                                <span className="px-2.5 py-1 rounded-full text-label-sm font-bold bg-green-100 text-green-800 border border-green-200 inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                  Đã đóng
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-label-sm font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">pending</span>
                                  Chưa đóng
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-label-md text-on-surface-variant font-medium">
                              {item.date ? new Date(item.date).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '—'}
                            </td>
                          </tr>
                        );
                      });
                    })()
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceTransparency;
