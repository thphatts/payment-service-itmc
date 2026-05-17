import React, { useState, useEffect } from 'react';

const MyPayment = () => {
  const [studentId, setStudentId] = useState('');
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');

  useEffect(() => {
    // Fetch available campaigns
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/v1/admin/campaigns', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data);
          if (data.length > 0) {
            setSelectedCampaign(data[data.length - 1].campaignCode);
          } else {
            setSelectedCampaign('CAMP01');
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách đợt quỹ', err);
        setSelectedCampaign('CAMP01');
      }
    };
    fetchCampaigns();
  }, []);

  const fetchQrCode = async () => {
    if (!studentId) {
      setError('Vui lòng nhập MSSV');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      // Use dynamic campaign code and add timestamp to avoid browser caching!
      const response = await fetch(`/api/campaigns/${selectedCampaign}/qr?studentId=${studentId}&t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setQrData(data);
      } else {
        setError(data.error || 'Có lỗi xảy ra');
        setQrData(null);
      }
    } catch (err) {
      setError('Không thể kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (qrData) {
      navigator.clipboard.writeText(qrData.content).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-md">
      <div className="mb-8">
        <h2 className="text-headline-lg font-headline-lg text-on-surface">Thanh toán khoản đóng góp</h2>
        <p className="text-body-md text-on-surface-variant mt-2">Nhập MSSV để nhận mã QR thanh toán cá nhân.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface rounded-xl p-6 shadow-sm border border-outline-variant">
            <h3 className="text-title-sm font-bold text-on-surface mb-4 uppercase tracking-wide">Thông tin sinh viên</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-label-sm font-bold text-on-surface-variant uppercase">Mã số sinh viên (MSSV)</label>
                <input 
                  type="text" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary outline-none font-mono text-title-sm"
                  placeholder="Vd: N21DCCN001"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-label-sm font-bold text-on-surface-variant uppercase">Chọn đợt đóng quỹ</label>
                <div className="relative">
                  <select
                    value={selectedCampaign}
                    onChange={(e) => {
                      setSelectedCampaign(e.target.value);
                      setQrData(null); // Clear old QR when campaign changes
                    }}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary outline-none font-bold text-on-surface appearance-none cursor-pointer"
                  >
                    {campaigns.length === 0 ? (
                      <option value="CAMP01">Quỹ CLB (CAMP01)</option>
                    ) : (
                      campaigns.map((c) => (
                        <option key={c.campaignCode} value={c.campaignCode}>
                          {c.title || c.campaignCode} ({c.campaignCode})
                        </option>
                      ))
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    arrow_drop_down
                  </span>
                </div>
              </div>

              {error && <p className="text-label-sm text-error font-medium">{error}</p>}
              <button 
                onClick={fetchQrCode}
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-surface-tint text-on-primary font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? 'Đang xử lý...' : 'Lấy mã QR thanh toán'}
                <span className="material-symbols-outlined">qr_code_2</span>
              </button>
            </div>
          </div>

          <div className="bg-primary-container border border-primary/20 rounded-xl p-6">
            <h4 className="font-bold text-on-primary-container mb-2 flex items-center gap-2 uppercase text-label-sm tracking-widest">
              <span className="material-symbols-outlined text-[20px]">info</span>
              Lưu ý:
            </h4>
            <ul className="text-body-sm text-on-primary-container/80 space-y-2 list-disc ml-4">
              <li>Mã QR đã bao gồm số tiền và nội dung chuyển khoản tự động.</li>
              <li>Vui lòng không tự ý thay đổi nội dung chuyển khoản.</li>
              <li>Hệ thống sẽ tự động cập nhật trạng thái sau 1-3 phút.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: QR Area */}
        <div className="lg:col-span-7">
          {qrData ? (
            <div className="bg-surface rounded-xl shadow-xl p-8 lg:p-12 border border-outline-variant/50 animate-in fade-in duration-500">
              <div className="text-center mb-8 border-b border-outline-variant/20 pb-4">
                <h3 className="text-label-sm text-on-surface-variant uppercase tracking-widest font-bold mb-1">Đợt đóng quỹ</h3>
                <p className="text-title-md font-bold text-primary mb-4 bg-primary-container/40 py-2 px-4 rounded-lg inline-block">
                  {campaigns.find(c => c.campaignCode === selectedCampaign)?.title || selectedCampaign}
                </p>
                <h3 className="text-label-sm text-on-surface-variant uppercase tracking-widest font-bold mb-2">Số tiền cần đóng</h3>
                <div className="text-display-lg font-black text-primary tracking-tight">
                  {qrData.amount.toLocaleString()} <span className="text-title-sm font-bold">VND</span>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-6 mb-8 border border-outline-variant/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-outline-variant/20 pb-4">
                  <span className="text-body-md text-on-surface-variant">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-lg border border-outline-variant/50 shadow-sm w-full sm:w-auto justify-between">
                    <span className="text-title-sm font-bold text-on-surface tracking-wider font-mono">
                      {qrData.content}
                    </span>
                    <button onClick={handleCopy} className="text-primary p-1 hover:bg-primary/5 rounded">
                      {isCopied ? <span className="text-xs text-green-600">Đã copy!</span> : <span className="material-symbols-outlined text-[20px]">content_copy</span>}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-label-sm text-on-surface-variant uppercase">Chủ tài khoản:</span>
                    <span className="text-body-sm font-bold text-on-surface">{qrData.accountName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-label-sm text-on-surface-variant uppercase">Số tài khoản:</span>
                    <span className="text-body-sm font-bold text-on-surface">{qrData.accountNo}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-label-sm text-on-surface-variant uppercase">Ngân hàng:</span>
                    <span className="text-body-sm font-bold text-on-surface">{qrData.bankId}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center mb-6">
                <div className="p-4 border-2 border-primary-container rounded-2xl bg-white shadow-inner">
                  <img alt="QR Code" src={qrData.qrUrl} className="w-64 h-64" />
                </div>
                <p className="text-label-sm text-on-surface-variant mt-4 uppercase tracking-widest">Quét mã bằng ứng dụng Ngân hàng (VietQR)</p>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-xl text-center border border-green-100">
                <span className="material-symbols-outlined text-green-600 text-3xl mb-2 animate-pulse">sync</span>
                <p className="text-label-sm font-bold text-green-800 uppercase tracking-wide">Đang chờ hệ thống xác nhận giao dịch...</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-surface-container-low border-2 border-dashed border-outline-variant rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">payments</span>
              <h3 className="text-title-sm font-bold text-on-surface-variant uppercase tracking-wide">Vui lòng nhập MSSV</h3>
              <p className="text-body-sm text-on-surface-variant mt-2 max-w-[300px]">Mã QR cá nhân hóa sẽ giúp hệ thống cộng tiền vào tài khoản của bạn ngay lập tức.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPayment;