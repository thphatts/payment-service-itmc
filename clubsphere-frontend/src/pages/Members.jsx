import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const role = localStorage.getItem('role') || 'MEMBER';

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/students/overview', {
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

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

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
    fetchMembers();
  }, []);

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Danh sách thành viên</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Quản lý và theo dõi thông tin thành viên câu lạc bộ.</p>
        </div>
        <div className="flex gap-2">
          {role === 'ADMIN' && (
            <>
              <label className="bg-surface text-on-surface border border-outline-variant px-5 py-2.5 rounded-lg font-label-md hover:bg-surface-container transition-all shadow-sm flex items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-sm">upload_file</span>
                Import Excel
                <input type="file" className="hidden" onChange={handleImport} accept=".xlsx,.xls,.csv" />
              </label>
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

      {/* Data Table Card */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/50">
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">Thành viên</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">MSSV</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">Trạng thái Quỹ</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">Tiền đã nộp</th>
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
              ) : (
                members.map((member, index) => (
                  <tr key={index} className="hover:bg-primary/5 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant font-bold text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-body-md font-medium text-on-surface">{member.name}</div>
                          <div className="text-label-sm text-on-surface-variant">{member.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-body-sm text-on-surface font-mono">
                      {member.studentId}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm ${
                        member.status === 'PAID' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'PAID' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                        {member.status === 'PAID' ? 'Đã nộp' : 'Chưa đóng'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-body-sm font-medium text-on-surface">
                      {member.amount.toLocaleString()}₫
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Members;