import React, { useState, useEffect } from 'react';

const FundAdmin = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignCode, setSelectedCampaignCode] = useState('');
  const [campaign, setCampaign] = useState({ campaignCode: '', title: '', amountRequired: 0, description: '' });
  
  // States for dynamic campaign creation and confirmation
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaignForm, setNewCampaignForm] = useState({ campaignCode: '', title: '', amountRequired: 100000, description: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch list of all campaigns
      const campaignsRes = await fetch('/api/v1/admin/campaigns', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      let campaignList = [];
      if (campaignsRes.ok) {
        campaignList = await campaignsRes.json();
        setCampaigns(campaignList);
      }

      // Determine the active selected campaign code
      let currentCode = selectedCampaignCode;
      if (!currentCode && campaignList.length > 0) {
        currentCode = campaignList[campaignList.length - 1].campaignCode;
        setSelectedCampaignCode(currentCode);
      } else if (!currentCode) {
        currentCode = 'CAMP01';
        setSelectedCampaignCode(currentCode);
      }

      // 2. Fetch specific campaign details
      const campaignRes = await fetch(`/api/v1/admin/campaign/${currentCode}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (campaignRes.ok) {
        const campaignData = await campaignRes.json();
        setCampaign(campaignData);
      } else {
        // Fallback default campaign details
        setCampaign({ 
          campaignCode: currentCode, 
          title: currentCode === 'CAMP01' ? 'Quỹ Câu Lạc Bộ ITMC - Học kỳ 2' : `Đợt thu quỹ ${currentCode}`, 
          amountRequired: 100000, 
          description: 'Đóng phí duy trì hoạt động CLB' 
        });
      }

      // 3. Fetch members payment overview for the selected campaign
      const studentRes = await fetch(`/api/v1/admin/students/overview?campaignCode=${currentCode}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (studentRes.ok) {
        const studentData = await studentRes.json();
        setStudents(studentData);
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
  }, [selectedCampaignCode]);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/admin/campaign', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCampaignForm),
      });

      if (response.ok) {
        const result = await response.json();
        setIsCreating(false);
        setNewCampaignForm({ campaignCode: '', title: '', amountRequired: 100000, description: '' });
        setSelectedCampaignCode(result.campaign.campaignCode); // Auto-switch to newly created campaign
        setMessage({ text: `Tạo quỹ mới "${result.campaign.title}" thành công!`, type: 'success' });
      } else {
        const errData = await response.json();
        setMessage({ text: errData.message || 'Lỗi khi tạo quỹ mới', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Lỗi kết nối server', type: 'error' });
    }
  };

  const handleExportExcel = () => {
    // Determine title for merged header
    const titleVal = campaign.title ? campaign.title.toUpperCase() : `QUỸ ITMC THÁNG ${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
    
    // Construct gorgeous Excel compatible XML/HTML string with inline gridline styles matching the screenshot
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Danh Sach Dong Quy</x:Name>
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
          .true-val { font-weight: bold; background-color: #E2EFDA; color: #375623; } /* Soft green */
          .false-val { font-weight: bold; background-color: #F8CBAD; color: #C65911; } /* Soft red */
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
            <th>Quỹ</th>
          </tr>
          ${students.map((student, index) => {
            const isPaid = student.status === 'PAID';
            const mail = student.email || `${student.studentId.toLowerCase()}@student.ptithcm.edu.vn`;
            const isDesign = student.studentId.toUpperCase().includes('DCPT');
            const ban = isDesign ? 'Thiết Kế' : 'Lập Trình';
            const banClass = isDesign ? 'bg-design' : 'bg-programming';
            const quyClass = isPaid ? 'true-val' : 'false-val';
            
            return `
              <tr>
                <td>${index + 1}</td>
                <td class="text-left">${student.name}</td>
                <td>${student.studentId}</td>
                <td class="text-left">${mail}</td>
                <td class="${banClass}">${ban}</td>
                <td class="${quyClass}">${isPaid ? 'TRUE' : 'FALSE'}</td>
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
    link.setAttribute("download", `Thu_Quy_ITMC_${selectedCampaignCode}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFund = students.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const paidCount = students.filter(s => s.status === 'PAID').length;
  const totalMembers = students.length;
  const role = localStorage.getItem('role') || 'MEMBER';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-md">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">{role === 'ADMIN' ? 'Quản lý Quỹ câu lạc bộ' : 'Finance'}</h1>
          <p className="text-body-md text-on-surface-variant mt-1">{role === 'ADMIN' ? 'Theo dõi các khoản thu và trạng thái đóng quỹ.' : 'Xem danh sách đóng quỹ của các thành viên.'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Campaign Selector Dropdown */}
          <div className="relative flex-1 md:flex-none">
            <select
              value={selectedCampaignCode}
              onChange={(e) => setSelectedCampaignCode(e.target.value)}
              className="bg-surface border border-outline-variant rounded-xl py-2 pl-4 pr-10 text-body-sm font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer shadow-sm min-w-[200px]"
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

          {role === 'ADMIN' && (
            <>
              {/* Export beautiful Excel button for current campaign */}
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-5 py-2 bg-green-700 text-white hover:bg-green-800 rounded-xl text-label-md font-label-md transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[20px]">download_for_offline</span>
                Xuất file Excel
              </button>

              <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-xl text-label-md font-label-md hover:bg-surface-tint transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Tạo quỹ mới
              </button>
            </>
          )}
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg flex justify-between items-center animate-in fade-in slide-in-from-top-3 ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          <span className="text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
            {message.text}
          </span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="material-symbols-outlined text-[18px]">close</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-primary rounded-xl p-8 text-on-primary shadow-lg shadow-primary/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <p className="text-primary-container text-label-sm font-label-sm uppercase tracking-wider mb-2">Tổng quỹ thu được</p>
            <h3 className="text-display-lg font-black tracking-tight mb-6">
              {totalFund.toLocaleString()}₫
            </h3>
            <div className="pt-6 border-t border-on-primary/20">
              <div className="flex justify-between text-label-sm mb-2">
                <span className="text-primary-container uppercase">Tiến độ đóng quỹ</span>
                <span className="font-bold">{paidCount} / {totalMembers}</span>
              </div>
              <div className="w-full bg-on-primary/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-on-primary h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${(paidCount / (totalMembers || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-surface border border-outline-variant/50 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Thông tin đợt thu
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-1">Mã quỹ</p>
                <p className="text-body-md font-mono text-on-surface">{campaign.campaignCode}</p>
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-1">Tên đợt thu</p>
                <p className="text-body-md font-bold text-on-surface">{campaign.title || 'QUỸ CLB'}</p>
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-1">Mức phí yêu cầu</p>
                <p className="text-body-md font-bold text-on-surface">{(campaign.amountRequired || 0).toLocaleString()}₫ / người</p>
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-1">Nội dung / Mô tả</p>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">{campaign.description || 'Chưa có mô tả'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Table */}
        <div className="lg:col-span-8">
          <div className="bg-surface rounded-xl shadow-sm border border-outline-variant/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="text-label-md font-label-md font-bold text-on-surface uppercase">Danh sách nộp quỹ</h3>
              <button 
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-label-sm font-bold text-on-surface hover:bg-surface-container transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Làm mới
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface-container-low text-label-sm font-label-sm text-on-surface-variant uppercase border-b border-outline-variant/30">
                    <th className="px-6 py-3">Tên thành viên</th>
                    <th className="px-6 py-3">MSSV</th>
                    <th className="px-6 py-3">Đã nộp</th>
                    <th className="px-6 py-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-on-surface-variant">Đang tải dữ liệu...</td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-on-surface-variant">Chưa có thành viên nào đóng quỹ này.</td>
                    </tr>
                  ) : (
                    students.map((student, index) => (
                      <tr key={index} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-xs">
                              {student.name.charAt(0)}
                            </div>
                            <span className="text-body-sm font-bold text-on-surface">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-body-sm font-mono text-on-surface-variant">{student.studentId}</td>
                        <td className="px-6 py-3 text-body-sm font-bold text-on-surface">{(student.amount || 0).toLocaleString()}₫</td>
                        <td className="px-6 py-3 text-right">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-label-sm font-bold ${
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

      {/* Create New Campaign Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border border-outline-variant/50">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="text-headline-md font-bold text-on-surface">Tạo Quỹ Đợt Mới</h3>
              <button onClick={() => setIsCreating(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-label-sm font-bold text-on-surface-variant uppercase">Mã quỹ (Ví dụ: CAMP02)</label>
                <input 
                  type="text"
                  required
                  placeholder="CAMP02"
                  value={newCampaignForm.campaignCode}
                  onChange={(e) => setNewCampaignForm({...newCampaignForm, campaignCode: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-label-sm font-bold text-on-surface-variant uppercase">Tên đợt thu</label>
                <input 
                  type="text"
                  required
                  placeholder="Quỹ CLB - Học kỳ 2"
                  value={newCampaignForm.title}
                  onChange={(e) => setNewCampaignForm({...newCampaignForm, title: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-label-sm font-bold text-on-surface-variant uppercase">Mức phí (VNĐ)</label>
                <input 
                  type="number"
                  required
                  value={newCampaignForm.amountRequired}
                  onChange={(e) => setNewCampaignForm({...newCampaignForm, amountRequired: parseInt(e.target.value) || 0})}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-label-sm font-bold text-on-surface-variant uppercase">Mô tả</label>
                <textarea 
                  rows="3"
                  placeholder="Mô tả mục đích đợt thu quỹ này..."
                  value={newCampaignForm.description}
                  onChange={(e) => setNewCampaignForm({...newCampaignForm, description: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none resize-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2.5 rounded-xl border border-outline-variant text-label-md font-bold text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-label-md font-bold hover:bg-surface-tint shadow-md transition-all active:scale-95"
                >
                  Tạo đợt quỹ
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