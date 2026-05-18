import React, { useState, useEffect } from 'react';

const Attendance = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [eventDate, setEventDate] = useState(`Hôm nay, ${new Date().toLocaleDateString('vi-VN')}`);
  const [saveMessage, setSaveMessage] = useState(null);

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
      
      let initialAttendance = {};

      // 1. Try to fetch from server first
      try {
        const res = await fetch(`/api/v1/admin/attendance?eventDate=${encodeURIComponent(eventDate)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const serverData = await res.json();
          Object.assign(initialAttendance, serverData);
        }
      } catch (serverErr) {
        console.error('Error fetching server attendance:', serverErr);
      }

      // 2. Fallback to localStorage if server returns empty
      if (Object.keys(initialAttendance).length === 0) {
        const saved = localStorage.getItem(`attendance_${eventDate}`);
        if (saved) {
          try {
            Object.assign(initialAttendance, JSON.parse(saved));
          } catch (e) {
            console.error('Error parsing saved attendance:', e);
          }
        }
      }

      data.forEach(m => {
        if (!initialAttendance[m.studentId]) {
          initialAttendance[m.studentId] = 'present';
        }
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
  }, [eventDate]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      // Save locally first
      localStorage.setItem(`attendance_${eventDate}`, JSON.stringify(attendanceData));
      
      // Save to server
      const response = await fetch('/api/v1/admin/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          eventDate: eventDate,
          attendanceData: attendanceData
        })
      });

      if (response.ok) {
        setSaveMessage({ type: 'success', text: `Đã lưu trạng thái điểm danh cho ngày "${eventDate}" lên hệ thống thành công!` });
      } else {
        const errorData = await response.json();
        setSaveMessage({ type: 'error', text: `Không thể đồng bộ với server: ${errorData.message || 'Lỗi không xác định'}` });
      }
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Lỗi kết nối khi đồng bộ điểm danh với máy chủ.' });
      setTimeout(() => setSaveMessage(null), 3500);
    }
  };

  const handleExportExcel = () => {
    // Determine title for merged header
    const titleVal = `BẢNG ĐIỂM DANH - ${eventDate.toUpperCase()}`;
    
    // Construct gorgeous Excel compatible XML/HTML string with inline gridline styles
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Diem Danh</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; font-family: 'Google Sans', 'Segoe UI', Arial, sans-serif; }
          td, th { border: 1px solid #333333; padding: 6px 10px; text-align: center; font-size: 11pt; }
          .title { font-size: 16pt; font-weight: bold; background-color: #FFF2CC; height: 50px; text-align: center; }
          .header { font-weight: bold; background-color: #FFF2CC; height: 30px; }
          .text-left { text-align: left; }
          .bg-programming { background-color: #DDEBF7; } /* Soft blue for Programmer team */
          .bg-design { background-color: #FFF2CC; } /* Soft yellow for Designer team */
          .present-val { font-weight: bold; background-color: #E2EFDA; color: #375623; } /* Soft green */
          .late-val { font-weight: bold; background-color: #FFF2CC; color: #7F6000; } /* Soft orange/yellow */
          .absent-val { font-weight: bold; background-color: #F8CBAD; color: #C65911; } /* Soft red */
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="6" class="title">${titleVal}</td>
          </tr>
          <tr class="header">
            <th>STT</th>
            <th>Họ và Tên</th>
            <th>MSSV</th>
            <th>Mail</th>
            <th>Ban</th>
            <th>Trạng thái</th>
          </tr>
          ${filteredMembers.map((member, index) => {
            const status = attendanceData[member.studentId];
            const statusLabel = status === 'present' ? 'Có mặt' : status === 'late' ? 'Đi trễ' : 'Vắng mặt';
            const mail = member.email || `${member.studentId.toLowerCase()}@student.ptithcm.edu.vn`;
            const isDesign = member.studentId.toUpperCase().includes('DCPT');
            const ban = isDesign ? 'Thiết Kế' : 'Lập Trình';
            const banClass = isDesign ? 'bg-design' : 'bg-programming';
            
            let statusClass = 'absent-val';
            if (status === 'present') statusClass = 'present-val';
            if (status === 'late') statusClass = 'late-val';

            return `
              <tr>
                <td>${index + 1}</td>
                <td class="text-left">${member.name}</td>
                <td>${member.studentId}</td>
                <td class="text-left">${mail}</td>
                <td class="${banClass}">${ban}</td>
                <td class="${statusClass}">${statusLabel}</td>
              </tr>
            `;
          }).join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(["\uFEFF" + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Diem_danh_${eventDate.replace(/[^a-zA-Z0-9]/g, '_')}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presentCount = Object.values(attendanceData).filter(v => v === 'present').length;

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-md">
      {/* Save Toast Message */}
      {saveMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300 ${
          saveMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <span className="material-symbols-outlined">{saveMessage.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="font-bold text-label-md">{saveMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-sm mb-6 sticky top-0 z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 w-full md:w-auto">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase block mb-1" htmlFor="event-date">
              Ngày sự kiện / Cuộc họp
            </label>
            <div className="relative w-full max-w-xs">
              <select 
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-4 pr-10 text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer" 
                id="event-date"
              >
                <option value={`Hôm nay, ${new Date().toLocaleDateString('vi-VN')}`}>Hôm nay, {new Date().toLocaleDateString('vi-VN')}</option>
                <option value="Họp Thường Kì - 24/10/2023">Họp Thường Kì - 24/10/2023</option>
                <option value="Họp Tổng Kết Tháng 10 - 31/10/2023">Họp Tổng Kết Tháng 10 - 31/10/2023</option>
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
            <div className="flex gap-2">
              <button 
                onClick={handleExportExcel}
                className="bg-surface text-on-surface border border-outline-variant hover:bg-surface-container px-4 py-2.5 rounded-lg text-label-md font-label-md transition-all shadow-sm active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">download_for_offline</span>
                Xuất file Excel
              </button>
              <button 
                onClick={handleSaveAttendance}
                className="bg-primary text-on-primary hover:bg-surface-tint px-6 py-2.5 rounded-lg text-label-md font-label-md transition-all shadow-sm active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                Lưu điểm danh
              </button>
            </div>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          ) : filteredMembers.length === 0 ? (
            <div className="p-10 text-center text-on-surface-variant">Không tìm thấy thành viên nào phù hợp.</div>
          ) : (
            filteredMembers.map((member, index) => (
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