import React, { useState, useEffect } from 'react';

const FundAdmin = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/students/overview');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({ text: 'Không thể kết nối với Backend', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const totalFund = students.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const paidCount = students.filter(s => s.status === 'PAID').length;
  const totalMembers = students.length;

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản lý Quỹ câu lạc bộ</h1>
        <p className="text-base text-gray-500 mt-2">Theo dõi các khoản thu và trạng thái đóng quỹ của thành viên.</p>
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
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">info</span>
              Thông tin đợt thu
            </h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Tên đợt:</span>
                <span className="font-bold text-gray-900">QUỸ CLB CAMP01</span>
              </div>
              <div className="flex justify-between">
                <span>Mức phí:</span>
                <span className="font-bold text-gray-900">100,000₫ / người</span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái:</span>
                <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold">ĐANG THU</span>
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
                onClick={fetchStudents}
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
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{student.amount.toLocaleString()}₫</td>
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
    </div>
  );
};

export default FundAdmin;