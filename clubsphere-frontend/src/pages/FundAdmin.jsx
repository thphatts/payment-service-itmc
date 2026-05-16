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
      // Fetch students
      const studentRes = await fetch('/api/v1/admin/students/overview');
      const studentData = await studentRes.json();
      setStudents(studentData);

      // Fetch campaign (mặc định CAMP01)
      const campaignRes = await fetch('/api/v1/admin/campaign/CAMP01');
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
        headers: { 'Content-Type': 'application/json' },
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
    <div className="w-full max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản lý Quỹ câu lạc bộ</h1>
          <p className="text-base text-gray-500 mt-2">Theo dõi các khoản thu và trạng thái đóng quỹ của thành viên.</p>
        </div>
        <button 
          onClick={() => { setIsEditing(true); setEditForm(campaign); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          Cài đặt quỹ
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex justify-between items-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span className="text-sm font-medium">{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="material-symbols-outlined text-sm">close</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Summary Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-blue-600 rounded-xl p-8 text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-2">Tổng quỹ thu được</p>
            <h3 className="text-5xl font-black tracking-tight mb-6">
              {totalFund.toLocaleString()}₫
            </h3>
            <div className="pt-6 border-t border-white/20">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-blue-100">TIẾN ĐỘ ĐÓNG QUỸ</span>
                <span className="font-bold">{paidCount} / {totalMembers}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${(paidCount / (totalMembers || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">info</span>
              Thông tin đợt thu
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Tên đợt thu</p>
                <p className="text-sm font-bold text-gray-900">{campaign.title || 'QUỸ CLB CAMP01'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Mức phí yêu cầu</p>
                <p className="text-sm font-bold text-gray-900">{(campaign.amountRequired || 0).toLocaleString()}₫ / người</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Nội dung / Mô tả</p>
                <p className="text-sm text-gray-600 leading-relaxed">{campaign.description || 'Chưa có mô tả'}</p>
              </div>
              <div className="pt-2">
                <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">ĐANG DIỄN RA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Table */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Danh sách nộp quỹ</h3>
              <button 
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
                Làm mới
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4">Tên thành viên</th>
                    <th className="px-6 py-4">MSSV</th>
                    <th className="px-6 py-4">Đã nộp</th>
                    <th className="px-6 py-4 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400">Đang tải dữ liệu...</td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                        Chưa có dữ liệu thành viên. Hãy qua trang Members để import.
                      </td>
                    </tr>
                  ) : (
                    students.map((student, index) => (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                              {student.name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-gray-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-500">{student.studentId}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{(student.amount || 0).toLocaleString()}₫</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
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

      {/* Edit Campaign Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Điều chỉnh thông tin quỹ</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên đợt thu</label>
                <input 
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ví dụ: Quỹ CLB Tháng 10"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mức phí (VNĐ)</label>
                <input 
                  type="number"
                  value={editForm.amountRequired}
                  onChange={(e) => setEditForm({...editForm, amountRequired: parseInt(e.target.value)})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nội dung / Mô tả</label>
                <textarea 
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Nhập nội dung chi tiết của đợt thu này..."
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"
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