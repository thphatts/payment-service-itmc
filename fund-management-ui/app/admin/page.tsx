"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  CheckCircle, 
  XCircle, 
  RefreshCcw, 
  LayoutDashboard,
  Wallet,
  ArrowRight,
  Loader2
} from "lucide-react";

interface Student {
  studentId: string;
  name: string;
  email: string;
  department: string;
  status: "PAID" | "UNPAID";
  amount: number;
  date?: string;
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PAID" | "UNPAID">("ALL");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/v1/admin/students/overview");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "ALL" || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalPaid = students.filter(s => s.status === "PAID").length;
  const totalAmount = students.reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-4 md:p-8">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Quản lý đóng quỹ CLB ITMC</p>
          </div>
          <button 
            onClick={fetchStudents}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all active:scale-95"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới dữ liệu
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Tổng thành viên", value: students.length, icon: Users, color: "text-blue-400" },
            { label: "Đã đóng quỹ", value: totalPaid, icon: CheckCircle, color: "text-green-400" },
            { label: "Tổng quỹ thu được", value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount), icon: Wallet, color: "text-purple-400" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text"
              placeholder="Tìm kiếm MSSV hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
            {["ALL", "PAID", "UNPAID"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f ? "bg-white text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                {f === "ALL" ? "Tất cả" : f === "PAID" ? "Đã đóng" : "Chưa đóng"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">MSSV</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">Họ và Tên</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">Ban</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">Trạng thái</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">Số tiền</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">Ngày đóng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-gray-400">Đang tải dữ liệu...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <p className="text-gray-500">Không tìm thấy sinh viên nào</p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr key={`${student.studentId}-${index}`} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-primary">{student.studentId}</td>
                      <td className="px-6 py-4 font-medium">{student.name}</td>
                      <td className="px-6 py-4 text-gray-400">{student.department}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          student.status === "PAID" 
                            ? "bg-green-400/10 text-green-400 border border-green-400/20" 
                            : "bg-red-400/10 text-red-400 border border-red-400/20"
                        }`}>
                          {student.status === "PAID" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {student.status === "PAID" ? "Đã nộp" : "Chưa nộp"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {student.amount > 0 ? (
                          <span className="text-white font-medium">
                            {new Intl.NumberFormat('vi-VN').format(student.amount)} VNĐ
                          </span>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {student.date ? new Date(student.date).toLocaleDateString('vi-VN') : "-"}
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
  );
}
