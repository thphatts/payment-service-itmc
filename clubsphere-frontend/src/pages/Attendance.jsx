import React, { useState, useEffect } from 'react';

const Attendance = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({});

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
    <div className="w-full max-w-7xl mx-auto space-y-md">
      {/* Page Header */}
      <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-sm mb-6 sticky top-0 z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 w-full md:w-auto">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase block mb-1" htmlFor="event-date">
              Ngày sự kiện / Cuộc họp
            </label>
            <div className="relative w-full max-w-xs">
              <select 
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-4 pr-10 text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer" 
                id="event-date"
              >
                <option>Hôm nay, {new Date().toLocaleDateString('vi-VN')}</option>
                <option>Họp Thường Kì - 24/10/2023</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                arrow_drop_down
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between w-full md:w-auto gap-6">
            <div className="flex flex-col items-end md:items-center">
              <span className="text-label-sm font-label-sm text-on-surface-variant uppercase">Sĩ số</span>
              <div className="flex items-baseline gap-1">
                <span className="text-display-lg font-bold text-primary">{presentCount}</span>
                <span className="text-body-md text-on-surface-variant">/ {members.length}</span>
              </div>
            </div>
            <button className="bg-primary text-on-primary hover:bg-surface-tint px-6 py-2.5 rounded-lg text-label-md font-label-md transition-all shadow-sm active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">save</span>
              Lưu điểm danh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest">
          <div className="relative max-w-md w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none" 
              placeholder="Tìm kiếm hội viên..." 
              type="text"
            />
          </div>
        </div>

        {/* List Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-low border-b border-outline-variant/50 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
          <div className="col-span-5 lg:col-span-4">Hội Viên</div>
          <div className="col-span-7 lg:col-span-8 flex justify-end pr-4">Trạng Thái Điểm Danh</div>
        </div>

        {/* Member List */}
        <div className="divide-y divide-outline-variant/30">
          {loading ? (
            <div className="p-10 text-center text-on-surface-variant">Đang tải danh sách thành viên...</div>
          ) : members.length === 0 ? (
            <div className="p-10 text-center text-on-surface-variant">Chưa có thành viên nào.</div>
          ) : (
            members.map((member, index) => (
              <div key={index} className="flex flex-col md:grid md:grid-cols-12 gap-4 p-4 md:px-6 md:py-3 hover:bg-primary/5 transition-colors items-center">
                <div className="col-span-5 lg:col-span-4 flex items-center gap-4 w-full">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold border border-outline-variant/30">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-body-md font-bold text-on-surface">{member.name}</h3>
                    <p className="text-label-sm text-on-surface-variant font-mono">{member.studentId}</p>
                  </div>
                </div>
                <div className="col-span-7 lg:col-span-8 w-full md:w-auto flex md:justify-end mt-3 md:mt-0">
                  <div className="flex bg-surface-container-low rounded-lg p-1 w-full md:w-auto shadow-inner border border-outline-variant/30">
                    {[
                      { id: 'present', label: 'Có mặt', color: 'text-green-600', dot: 'bg-green-500' },
                      { id: 'late', label: 'Đi trễ', color: 'text-yellow-600', dot: 'bg-yellow-500' },
                      { id: 'absent', label: 'Vắng mặt', color: 'text-red-600', dot: 'bg-red-500' }
                    ].map(status => (
                      <label 
                        key={status.id}
                        onClick={() => handleAttendanceChange(member.studentId, status.id)}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-md cursor-pointer transition-all whitespace-nowrap ${
                          attendanceData[member.studentId] === status.id ? 'bg-white shadow-sm ' + status.color : 'text-on-surface-variant'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${attendanceData[member.studentId] === status.id ? status.dot : 'bg-outline'}`}></span>
                        <span className="text-label-md font-bold">{status.label}</span>
                      </label>
                    ))}
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