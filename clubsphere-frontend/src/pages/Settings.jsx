import React, { useState } from 'react';

const Settings = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const studentId = localStorage.getItem('studentId');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới không khớp.' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          studentId,
          oldPassword,
          newPassword
        })
      });
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: result.message || 'Đổi mật khẩu thất bại' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30">
          <h2 className="text-xl font-bold text-on-surface">Cài đặt tài khoản</h2>
          <p className="text-sm text-on-surface-variant">Quản lý bảo mật và thông tin cá nhân của bạn.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Đổi mật khẩu</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-on-surface">Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  className="w-full p-2 border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary outline-none"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-on-surface">Mật khẩu mới</label>
                <input 
                  type="password" 
                  className="w-full p-2 border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-on-surface">Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  className="w-full p-2 border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {message && (
                <div className={`text-sm p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="bg-primary text-on-primary px-6 py-2 rounded-lg font-medium hover:bg-surface-tint transition-all disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
