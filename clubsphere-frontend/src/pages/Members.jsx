import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PAID', 'UNPAID'
  const [searchTerm, setSearchTerm] = useState('');
  const role = localStorage.getItem('role') || 'MEMBER';

  const fetchMembers = async (campaignCode) => {
    try {
      setLoading(true);
      const url = campaignCode 
        ? `/api/v1/admin/students/overview?campaignCode=${campaignCode}`
        : '/api/v1/admin/students/overview';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/v1/admin/campaigns', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
        if (data.length > 0) {
          // Select the latest campaign by default
          const latest = data[data.length - 1].campaignCode;
          setSelectedCampaign(latest);
          fetchMembers(latest);
        } else {
          fetchMembers();
        }
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      fetchMembers();
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/v1/finance/my-engagement', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('Error fetching current user profile:', error);
    }
  };

  const handleProceedFile = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/users/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });
      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setSelectedFile(null); // Clear selected file after successful import
        fetchMembers(); // Refresh list
      } else {
        setMessage({ type: 'error', text: result.message || 'Import thất bại' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sinh viên ${studentId}? Mọi dữ liệu giao dịch liên quan sẽ bị xóa.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/v1/admin/users/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchMembers();
      } else {
        setMessage({ type: 'error', text: result.message || 'Xóa thất bại' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi kết nối đến máy chủ' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchCurrentUser();
  }, []);

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Danh sách thành viên</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Quản lý và theo dõi thông tin thành viên câu lạc bộ.</p>
        </div>
        
        {/* Actions bar for Admin */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {role === 'ADMIN' && (
            <>
              {/* Excel Select Button */}
              <label className="bg-surface text-on-surface border border-outline-variant px-5 py-2.5 rounded-lg font-label-md hover:bg-surface-container transition-all shadow-sm flex items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-sm">upload_file</span>
                {selectedFile ? 'Đổi file' : 'Chọn file Excel'}
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => setSelectedFile(e.target.files[0])} 
                  accept=".xlsx,.xls,.csv" 
                />
              </label>

              {/* Explicit Proceed file button when selected */}
              {selectedFile && (
                <div className="flex items-center gap-2 bg-primary-container/20 border border-primary/20 px-3 py-1.5 rounded-lg animate-in fade-in slide-in-from-left-3 duration-200">
                  <span className="material-symbols-outlined text-primary text-[18px]">draft</span>
                  <span className="text-body-sm font-bold text-on-surface-variant max-w-[150px] truncate">{selectedFile.name}</span>
                  
                  <button 
                    onClick={handleProceedFile}
                    className="ml-2 bg-primary text-on-primary hover:bg-surface-tint px-3 py-1.5 rounded-md text-label-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">play_circle</span>
                    Proceed File
                  </button>
                  
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="text-on-surface-variant hover:text-error transition-colors p-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              )}

              <button className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-md hover:bg-surface-tint transition-all shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">person_add</span>
                + Thêm thủ công
              </button>
            </>
          )}
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Filters and Campaign selection */}
      <div className="bg-surface rounded-xl border border-outline-variant p-4 mb-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search and Campaign Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
              search
            </span>
            <input 
              type="text" 
              placeholder="Tìm tên hoặc MSSV..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline bg-surface text-on-surface text-body-medium focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/60"
            />
          </div>

          {/* Campaign selection dropdown */}
          <div className="relative min-w-[220px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
              account_balance_wallet
            </span>
            <select
              value={selectedCampaign}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCampaign(val);
                fetchMembers(val);
              }}
              className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-outline bg-surface text-on-surface text-body-medium focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
            >
              <option value="">-- Đợt quỹ mặc định --</option>
              {campaigns.map((camp) => (
                <option key={camp.id} value={camp.campaignCode}>
                  {camp.title} ({camp.campaignCode})
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
              arrow_drop_down
            </span>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-lg self-start lg:self-auto shrink-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-md text-label-medium font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-4 py-2 rounded-md text-label-medium font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'PAID'
                ? 'bg-green-100 text-green-800 shadow-sm border border-green-200'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Đã đóng
          </button>
          <button
            onClick={() => setStatusFilter('UNPAID')}
            className={`px-4 py-2 rounded-md text-label-medium font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'UNPAID'
                ? 'bg-amber-100 text-amber-800 shadow-sm border border-amber-200'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">pending</span>
            Chưa đóng
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/50">
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">Thành viên</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">MSSV</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">Ban</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">Trạng thái Quỹ</th>
                {role === 'ADMIN' && (
                  <th className="py-3 px-4 text-right text-label-sm font-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">Thao tác</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                <tr>
                  <td colSpan={role === 'ADMIN' ? "5" : "4"} className="py-10 text-center text-on-surface-variant">Đang tải danh sách...</td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={role === 'ADMIN' ? "5" : "4"} className="py-10 text-center text-on-surface-variant">Chưa có thành viên nào. {role === 'ADMIN' && 'Hãy import file Excel để bắt đầu.'}</td>
                </tr>
              ) : (() => {
                const filtered = members.filter(member => {
                  const matchesSearch = 
                    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    member.studentId.toLowerCase().includes(searchTerm.toLowerCase());
                  
                  if (statusFilter === 'PAID') {
                    return matchesSearch && member.status === 'PAID';
                  } else if (statusFilter === 'UNPAID') {
                    return matchesSearch && member.status === 'UNPAID';
                  }
                  return matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={role === 'ADMIN' ? "5" : "4"} className="py-10 text-center text-on-surface-variant">
                        Không tìm thấy thành viên nào khớp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  );
                }

                return filtered.map((member, index) => {
                  const isDesign = member.studentId.toUpperCase().includes('DCPT');
                  const ban = isDesign ? 'Thiết Kế' : 'Lập Trình';
                  const isCurrentUser = currentUser && currentUser.studentId === member.studentId;

                  return (
                  <tr 
                    key={index} 
                    className={`transition-colors group ${
                      isCurrentUser 
                        ? 'bg-primary/5 hover:bg-primary/10 border-l-4 border-primary font-bold' 
                        : 'hover:bg-primary/5'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant font-bold text-xs shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-body-md font-medium text-on-surface flex items-center gap-2">
                            <span>{member.name}</span>
                            {isCurrentUser && (
                              <span className="bg-primary text-on-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                Bạn
                              </span>
                            )}
                          </div>
                          <div className="text-label-sm text-on-surface-variant">{member.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-body-sm text-on-surface font-mono">
                      {member.studentId}
                    </td>
                    <td className="py-3 px-4 text-body-sm text-on-surface">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-label-sm font-bold ${isDesign ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {ban}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-body-sm text-on-surface">
                      {member.status === 'PAID' ? (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-green-100 text-green-800 border border-green-200 gap-1 items-center">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Đã đóng ({member.amount.toLocaleString()}₫)
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-amber-100 text-amber-800 border border-amber-200 gap-1 items-center">
                          <span className="material-symbols-outlined text-[14px]">pending</span>
                          Chưa đóng
                        </span>
                      )}
                    </td>
                    {role === 'ADMIN' && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-on-surface-variant hover:text-primary rounded-md transition-colors">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(member.studentId)}
                            className="p-1.5 text-on-surface-variant hover:text-error rounded-md transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Members;