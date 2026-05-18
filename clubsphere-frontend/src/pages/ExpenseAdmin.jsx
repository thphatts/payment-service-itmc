import React, { useState, useEffect } from 'react';

const ExpenseAdmin = () => {
  const [expenses, setExpenses] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'VẬN HÀNH',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    receiptUrl: '',
    campaignId: ''
  });
  const [file, setFile] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [expRes, campRes] = await Promise.all([
        fetch('/api/v1/admin/expenses', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/v1/admin/campaigns', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (expRes.ok) setExpenses(await expRes.json());
      if (campRes.ok) setCampaigns(await campRes.json());
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalReceiptUrl = form.receiptUrl;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/v1/uploads', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalReceiptUrl = uploadData.url;
        } else {
          alert('Upload ảnh thất bại!');
          return;
        }
      }

      const payload = {
        ...form,
        receiptUrl: finalReceiptUrl,
        amount: parseFloat(form.amount),
        campaignId: form.campaignId ? parseInt(form.campaignId) : null
      };

      const res = await fetch('/api/v1/admin/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsCreating(false);
        setForm({ title: '', category: 'VẬN HÀNH', amount: '', expenseDate: new Date().toISOString().split('T')[0], description: '', receiptUrl: '', campaignId: '' });
        setFile(null);
        fetchData();
      } else {
        alert("Có lỗi xảy ra khi tạo khoản chi.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khoản chi này?")) return;
    try {
      const res = await fetch(`/api/v1/admin/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Quản lý Chi tiêu</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Ghi nhận và minh bạch các khoản chi của CLB.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold shadow-md hover:bg-surface-tint transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Thêm khoản chi
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-label-sm font-bold text-on-surface-variant uppercase border-b border-outline-variant/30">
              <th className="px-6 py-4">Ngày</th>
              <th className="px-6 py-4">Nội dung</th>
              <th className="px-6 py-4">Phân loại</th>
              <th className="px-6 py-4">Số tiền</th>
              <th className="px-6 py-4">Người tạo</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-10 text-center">Đang tải...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-10 text-center">Chưa có khoản chi nào.</td></tr>
            ) : (
              expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-4 text-body-sm">{new Date(exp.expenseDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-on-surface">{exp.title}</p>
                    <p className="text-xs text-on-surface-variant truncate max-w-xs">{exp.description}</p>
                  </td>
                  <td className="px-6 py-4 text-body-sm">
                    <span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded-md text-xs font-bold">{exp.category}</span>
                  </td>
                  <td className="px-6 py-4 text-body-sm font-bold text-error">-{exp.amount.toLocaleString()}₫</td>
                  <td className="px-6 py-4 text-body-sm text-on-surface-variant">{exp.createdBy}</td>
                  <td className="px-6 py-4 text-right">
                    {exp.receiptUrl && (
                      <a href={exp.receiptUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm mr-4">Hóa đơn</a>
                    )}
                    <button onClick={() => handleDelete(exp.id)} className="text-error hover:bg-error-container p-2 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-outline-variant/50">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-bold text-headline-sm">Thêm Khoản Chi Mới</h3>
              <button onClick={() => setIsCreating(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-label-sm font-bold text-on-surface-variant">Nội dung chi</label>
                  <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-outline-variant rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm font-bold text-on-surface-variant">Số tiền (VNĐ)</label>
                  <input required type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full border border-outline-variant rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm font-bold text-on-surface-variant">Ngày chi</label>
                  <input required type="date" value={form.expenseDate} onChange={e => setForm({...form, expenseDate: e.target.value})} className="w-full border border-outline-variant rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm font-bold text-on-surface-variant">Phân loại</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-outline-variant rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary outline-none">
                    <option value="SỰ KIỆN">Sự kiện</option>
                    <option value="VẬN HÀNH">Vận hành</option>
                    <option value="GIẢI THƯỞNG">Giải thưởng</option>
                    <option value="KHÁC">Khác</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm font-bold text-on-surface-variant">Đợt thu quỹ (Không bắt buộc)</label>
                  <select value={form.campaignId} onChange={e => setForm({...form, campaignId: e.target.value})} className="w-full border border-outline-variant rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary outline-none">
                    <option value="">-- Chọn đợt --</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.title || c.campaignCode}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-label-sm font-bold text-on-surface-variant">Hình ảnh hóa đơn / Chứng từ</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={e => setFile(e.target.files[0])} 
                      className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-primary hover:file:bg-primary-fixed-dim"
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">Hoặc nhập link trực tiếp:</p>
                  <input type="text" placeholder="https://..." value={form.receiptUrl} onChange={e => setForm({...form, receiptUrl: e.target.value})} className="w-full border border-outline-variant rounded-xl px-4 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-2 rounded-xl border border-outline-variant font-bold text-on-surface-variant">Hủy</button>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:bg-surface-tint">Lưu khoản chi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseAdmin;
