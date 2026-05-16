import React, { useState, useEffect } from 'react';

const Attendance = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({});

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/students/overview');
      const data = await response.json();
      setMembers(data);
      
      // Khởi tạo dữ liệu điểm danh mặc định là "Có mặt" cho tất cả
      const initialAttendance = {};
      data.forEach(m => {
        initialAttendance[m.studentId] = 'present';
      });
      setAttendanceData(initialAttendance);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const presentCount = Object.values(attendanceData).filter(v => v === 'present').length;

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 sticky top-0 z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 w-full md:w-auto">
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1" htmlFor="event-date">
              Ngày sự kiện / Cuộc họp
            </label>
            <div className="relative w-full max-w-xs">
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-4 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 appearance-none cursor-pointer" 
                id="event-date"
              >
                <option>Hôm nay, {new Date().toLocaleDateString('vi-VN')}</option>
                <option>Họp Thường Kì - 24/10/2023</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                arrow_drop_down
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between w-full md:w-auto gap-6">
            <div className="flex flex-col items-end md:items-center">
              <span className="text-xs font-bold text-gray-500 uppercase">Sĩ số</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-blue-600">{presentCount}</span>
                <span className="text-sm text-gray-500">/ {members.length}</span>
              </div>
            </div>
            <button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">save</span>
              Lưu điểm danh
            </button>
          </div>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full md:h-auto overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="relative max-w-md w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 placeholder:text-gray-400" 
              placeholder="Tìm kiếm hội viên..." 
              type="text"
            />
          </div>
        </div>

        {/* List Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-[73px] z-10">
          <div className="col-span-5 lg:col-span-4">Hội Viên</div>
          <div className="col-span-7 lg:col-span-8 flex justify-end pr-4">Trạng Thái Điểm Danh</div>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-2 md:p-0">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Đang tải danh sách thành viên...</div>
          ) : members.length === 0 ? (
            <div className="p-10 text-center text-gray-500">Chưa có thành viên nào. Hãy import ở trang Members.</div>
          ) : (
            members.map((member, index) => (
              <div key={index} className="flex flex-col md:grid md:grid-cols-12 gap-4 p-4 md:px-6 md:py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors bg-white rounded-lg md:rounded-none mb-2 md:mb-0 items-center">
                <div className="col-span-5 lg:col-span-4 flex items-center gap-4 w-full">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{member.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">{member.studentId}</p>
                  </div>
                </div>
                <div className="col-span-7 lg:col-span-8 w-full md:w-auto flex md:justify-end mt-3 md:mt-0">
                  <div className="flex bg-gray-50 rounded-lg p-1 w-full md:w-auto overflow-x-auto shadow-inner border border-gray-200">
                    <label 
                      onClick={() => handleAttendanceChange(member.studentId, 'present')}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-md cursor-pointer transition-all whitespace-nowrap ${
                        attendanceData[member.studentId] === 'present' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${attendanceData[member.studentId] === 'present' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className="text-[13px] font-bold">Có mặt</span>
                    </label>
                    <label 
                      onClick={() => handleAttendanceChange(member.studentId, 'late')}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-md cursor-pointer transition-all whitespace-nowrap ${
                        attendanceData[member.studentId] === 'late' ? 'bg-white shadow-sm text-yellow-600' : 'text-gray-500'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${attendanceData[member.studentId] === 'late' ? 'bg-yellow-500' : 'bg-gray-300'}`}></span>
                      <span className="text-[13px] font-bold">Đi trễ</span>
                    </label>
                    <label 
                      onClick={() => handleAttendanceChange(member.studentId, 'absent')}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-md cursor-pointer transition-all whitespace-nowrap ${
                        attendanceData[member.studentId] === 'absent' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${attendanceData[member.studentId] === 'absent' ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                      <span className="text-[13px] font-bold">Vắng mặt</span>
                    </label>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;