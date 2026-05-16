import React, { useState } from 'react';

const MyPayment = () => {
  const [studentId, setStudentId] = useState('');
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const fetchQrCode = async () => {
    if (!studentId) {
      setError('Vui lòng nhập MSSV');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/campaigns/CAMP01/qr?studentId=${studentId}`);
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
    <div className="max-w-[1440px] mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Thanh toán khoản đóng góp</h2>
        <p className="text-base text-gray-500 mt-2">Nhập MSSV để nhận mã QR thanh toán cá nhân.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input MSSV */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin sinh viên</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mã số sinh viên (MSSV)</label>
                <input 
                  type="text" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
                  placeholder="Vd: N21DCCN001"
                />
              </div>
              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
              <button 
                onClick={fetchQrCode}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Đang xử lý...' : 'Lấy mã QR thanh toán'}
                <span className="material-symbols-outlined">qr_code_2</span>
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined">info</span>
              Lưu ý:
            </h4>
            <ul className="text-sm text-blue-800 space-y-2 list-disc ml-4">
              <li>Mã QR đã bao gồm số tiền và nội dung chuyển khoản tự động.</li>
              <li>Vui lòng không tự ý thay đổi nội dung chuyển khoản để hệ thống có thể xác nhận tự động.</li>
              <li>Nếu thanh toán qua chuyển khoản tay, hãy copy chính xác nội dung hiển thị.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: QR Area */}
        <div className="lg:col-span-7">
          {qrData ? (
            <div className="bg-white rounded-xl shadow-xl p-8 lg:p-12 border border-gray-200 animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <h3 className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-2">Số tiền cần đóng</h3>
                <div className="text-5xl font-black text-blue-600 tracking-tight">
                  {qrData.amount.toLocaleString()} <span className="text-2xl font-bold">VND</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-gray-200 pb-4">
                  <span className="text-base text-gray-500">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-full sm:w-auto justify-between">
                    <span className="text-xl font-bold text-gray-900 tracking-wider font-mono">
                      {qrData.content}
                    </span>
                    <button onClick={handleCopy} className="text-blue-600 p-1">
                      {isCopied ? <span className="text-xs text-green-600">Đã copy!</span> : <span className="material-symbols-outlined">content_copy</span>}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Chủ tài khoản:</span>
                    <span className="text-sm font-bold text-gray-900">{qrData.accountName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Số tài khoản:</span>
                    <span className="text-sm font-bold text-gray-900">{qrData.accountNo}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Ngân hàng:</span>
                    <span className="text-sm font-bold text-gray-900">{qrData.bankId}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center mb-6">
                <div className="p-4 border-2 border-blue-100 rounded-2xl bg-white shadow-inner">
                  <img alt="QR Code" src={qrData.qrUrl} className="w-64 h-64" />
                </div>
                <p className="text-xs text-gray-400 mt-4">Quét mã bằng ứng dụng Ngân hàng (VietQR)</p>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-xl text-center border border-green-100">
                <span className="material-symbols-outlined text-green-600 text-3xl mb-2 animate-pulse">sync</span>
                <p className="text-sm font-bold text-green-800">Đang chờ hệ thống xác nhận giao dịch...</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">payments</span>
              <h3 className="text-lg font-bold text-gray-400">Vui lòng nhập MSSV để hiển thị mã QR</h3>
              <p className="text-sm text-gray-400 mt-2">Mã QR cá nhân hóa sẽ giúp hệ thống cộng tiền vào tài khoản của bạn ngay lập tức.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPayment;