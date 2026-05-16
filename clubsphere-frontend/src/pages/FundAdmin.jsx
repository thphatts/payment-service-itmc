import React, { useState, useEffect } from 'react';

const FundAdmin = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState({ title: '', amountRequired: 0, description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', amountRequired: 0, description: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const studentRes = await fetch('/api/v1/admin/students/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const studentData = await studentRes.json();
      setStudents(studentData);

      const campaignRes = await fetch('/api/v1/admin/campaign/CAMP01', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (campaignRes.ok) {
        const campaignData = await campaignRes.json();
        setCampaign(campaignData);
        setEditForm(campaignData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ text: 'Không thể kết nối với Backend', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateCampaign = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/admin/campaign/CAMP01', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const result = await response.json();
        setCampaign(result.campaign);
        setIsEditing(false);
        setMessage({ text: 'Cập nhật thông tin quỹ thành công!', type: 'success' });
      } else {
        setMessage({ text: 'Lỗi khi cập nhật thông tin quỹ', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Lỗi kết nối server', type: 'error' });
    }
  };

  const totalFund = students.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const paidCount = students.filter(s => s.status === 'PAID').length;
  const totalMembers = students.length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-md">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Quản lý Quỹ câu lạc bộ</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Theo dõi các khoản thu và trạng thái đóng quỹ.</p>
        </div>
        <button 
          onClick={() => { setIsEditing(true); setEditForm(campaign); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-surface border border-outline-variant rounded-xl text-label-md font-label-md text-on-surface hover:bg-surface-container transition-all shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          Cài đặt quỹ
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg flex justify-between items-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span className="text-sm font-medium">{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="material-symbols-outlined text-[18px]">close</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-primary rounded-xl p-8 text-on-primary shadow-lg shadow-primary/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <p className="text-primary-container text-label-sm font-label-sm uppercase tracking-wider mb-2">Tổng quỹ thu được</p>
            <h3 className="text-display-lg font-black tracking-tight mb-6">
              {totalFund.toLocaleString()}₫
            </h3>
            <div className="pt-6 border-t border-on-primary/20">
              <div className="flex justify-between text-label-sm mb-2">
                <span className="text-primary-container uppercase">Tiến độ đóng quỹ</span>
                <span className="font-bold">{paidCount} / {totalMembers}</span>
              </div>
              <div className="w-full bg-on-primary/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-on-primary h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${(paidCount / (totalMembers || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-surface border border-outline-variant/50 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Thông tin đợt thu
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-1">Tên đợt thu</p>
                <p className="text-body-md font-bold text-on-surface">{campaign.title || 'QUỸ CLB'}</p>
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-1">Mức phí yêu cầu</p>
                <p className="text-body-md font-bold text-on-surface">{(campaign.amountRequired || 0).toLocaleString()}₫ / người</p>
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-1">Nội dung / Mô tả</p>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">{campaign.description || 'Chưa có mô tả'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Table */}
        <div className="lg:col-span-8">
          <div className="bg-surface rounded-xl shadow-sm border border-outline-variant/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="text-label-md font-label-md font-bold text-on-surface uppercase">Danh sách nộp quỹ</h3>
              <button 
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-label-sm font-bold text-on-surface hover:bg-surface-container transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Làm mới
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface-container-low text-label-sm font-label-sm text-on-surface-variant uppercase border-b border-outline-variant/30">
                    <th className="px-6 py-3">Tên thành viên</th>
                    <th className="px-6 py-3">MSSV</th>
                    <th className="px-6 py-3">Đã nộp</th>
                    <th className="px-6 py-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-on-surface-variant">Đang tải dữ liệu...</td>
                    </tr>
                  ) : (
                    students.map((student, index) => (
                      <tr key={index} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-xs">
                              {student.name.charAt(0)}
                            </div>
                            <span className="text-body-sm font-bold text-on-surface">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-body-sm font-mono text-on-surface-variant">{student.studentId}</td>
                        <td className="px-6 py-3 text-body-sm font-bold text-on-surface">{(student.amount || 0).toLocaleString()}₫</td>
                        <td className="px-6 py-3 text-right">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-label-sm font-bold ${
                            student.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {student.status}
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
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border border-outline-variant/50">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="text-headline-md font-bold text-on-surface">Cài đặt đợt thu</h3>
              <button onClick={() => setIsEditing(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateCampaign} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-label-sm font-bold text-on-surface-variant uppercase">Tên đợt thu</label>
                <input 
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-label-sm font-bold text-on-surface-variant uppercase">Mức phí (VNĐ)</label>
                <input 
                  type="number"
                  value={editForm.amountRequired}
                  onChange={(e) => setEditForm({...editForm, amountRequired: parseInt(e.target.value)})}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-label-sm font-bold text-on-surface-variant uppercase">Mô tả</label>
                <textarea 
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none resize-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-outline-variant text-label-md font-bold text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-label-md font-bold hover:bg-surface-tint shadow-md transition-all active:scale-95"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundAdmin;