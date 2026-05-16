import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const navigate = useNavigate();

    useEffect(() => {
        const cursorGlow = document.getElementById('cursor-glow');
        const handleMouseMove = (e) => {
            if (cursorGlow) {
                cursorGlow.style.left = e.clientX + 'px';
                cursorGlow.style.top = e.clientY + 'px';
                cursorGlow.style.opacity = '0.6';
            }
        };
        const handleMouseLeave = () => {
            if (cursorGlow) cursorGlow.style.opacity = '0';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('studentId', data.email); // result[2] in backend was studentId

                setStatus('success');
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } else {
                const errorText = await response.text();
                setStatus('error');
                setMessage(errorText || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Không thể kết nối đến máy chủ.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-tech-background text-tech-on-background font-body-base min-h-screen overflow-x-hidden selection:bg-tech-primary/30 selection:text-tech-primary flex items-center justify-center p-gutter lg:p-0">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-tech-primary/10 blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-tech-primary/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 circuit-bg opacity-30"></div>
                
                <svg className="absolute inset-0 w-full h-full opacity-10" fill="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
                    <path className="text-tech-primary" d="M0 100H400L450 150H800L850 100H1440" stroke="currentColor" strokeWidth="1"></path>
                    <path className="text-tech-primary" d="M0 800H600L650 750H1100L1150 800H1440" stroke="currentColor" strokeWidth="1"></path>
                    <circle className="text-tech-primary" cx="450" cy="150" fill="currentColor" r="3"></circle>
                    <circle className="text-tech-primary" cx="850" cy="100" fill="currentColor" r="3"></circle>
                    <circle className="text-tech-primary" cx="650" cy="750" fill="currentColor" r="3"></circle>
                </svg>
            </div>

            <main className="relative z-10 w-full max-w-[1200px] grid lg:grid-cols-2 glass-panel rounded-xl overflow-hidden tech-glow border border-tech-outline-variant/30">
                {/* Branding & Welcome Side */}
                <div className="relative hidden lg:flex flex-col items-center justify-center p-xl bg-tech-container-lowest/50 border-r border-tech-outline-variant/20 overflow-hidden">
                    <div className="absolute inset-0 opacity-20 puzzle-motif bg-tech-primary/20 scale-150 rotate-12"></div>
                    <div className="relative z-10 text-center space-y-md">
                        <div className="mb-lg flex justify-center">
                            <img 
                                alt="iTMC Logo" 
                                className="object-contain filter drop-shadow-[0_0_15px_rgba(163,201,255,0.4)] h-56" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuChKJX4FLZZkxjyDibR0FAqT_xw3tn1nm7hrKOec4U8CmcNZXbEWiBFb0AaoMYVDM5qXwU3heus3nDczyRYqQzkeRZ1-AXMlzcC-RlHqIl_g5_v0LCKDtLLiJ2VQPYsI5Hb9gn7gtuEJvJnANCAXQJ_h1iLef0bLwuAv9wp8j_M3s-m08mlwnJtYXkYkfjB4oslIowiJQ-D49feucyYndv0-hjM88AMbYsUKgnQmBITaDUoekJnkIIW0iwW3JUAf0p5rRAgLIIYC-F6" 
                            />
                        </div>
                        <h1 className="font-display-lg text-display-lg text-tech-primary tracking-tighter leading-none">
                            iTMC Portal
                        </h1>
                        <p className="font-headline-md text-title-sm text-tech-on-surface max-w-[400px] mx-auto italic">"Connect the piece. Create future"</p>
                        <div className="pt-lg flex items-center justify-center gap-base">
                            <div className="h-[1px] w-8 bg-tech-outline-variant"></div>
                            <span className="font-label-caps text-label-caps text-tech-secondary tracking-[0.2em]">HỆ THỐNG QUẢN TRỊ V2.0</span>
                            <div className="h-[1px] w-8 bg-tech-outline-variant"></div>
                        </div>
                    </div>
                    <div className="absolute bottom-base left-base right-base flex justify-between px-md py-sm">
                        <span className="text-label-caps font-label-caps text-white/50">SECURE NODE: ACTIVE</span>
                        <span className="text-label-caps font-label-caps text-white/50">ENCRYPTION: AES-256</span>
                    </div>
                </div>

                {/* Mobile Branding Header */}
                <div className="lg:hidden flex flex-col items-center p-md bg-tech-container-lowest/50 border-b border-tech-outline-variant/20">
                    <img 
                        alt="iTMC Logo Small" 
                        className="object-contain mb-sm h-24" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuChKJX4FLZZkxjyDibR0FAqT_xw3tn1nm7hrKOec4U8CmcNZXbEWiBFb0AaoMYVDM5qXwU3heus3nDczyRYqQzkeRZ1-AXMlzcC-RlHqIl_g5_v0LCKDtLLiJ2VQPYsI5Hb9gn7gtuEJvJnANCAXQJ_h1iLef0bLwuAv9wp8j_M3s-m08mlwnJtYXkYkfjB4oslIowiJQ-D49feucyYndv0-hjM88AMbYsUKgnQmBITaDUoekJnkIIW0iwW3JUAf0p5rRAgLIIYC-F6" 
                    />
                    <h1 className="font-display-lg-mobile text-display-lg-mobile text-tech-primary">iTMC Portal</h1>
                </div>

                {/* Login Form Side */}
                <div className="flex flex-col items-center justify-center p-md lg:p-xl space-y-lg bg-tech-surface/40">
                    <div className="w-full max-w-[400px] space-y-md">
                        <div className="text-center lg:text-left">
                            <h2 className="font-headline-md text-headline-md text-tech-on-surface">Đăng Nhập</h2>
                            <p className="text-tech-on-surface font-body-base mt-xs opacity-70">Vui lòng truy cập tài khoản hệ thống của bạn</p>
                        </div>
                        
                        <form className="space-y-md mt-lg" onSubmit={handleSubmit}>
                            <div className="space-y-sm">
                                <label className="font-label-caps text-label-caps text-tech-primary block px-xs" htmlFor="studentId">MÃ SỐ SINH VIÊN</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-tech-primary transition-colors">person</span>
                                    <input 
                                        className="w-full pl-12 pr-4 py-4 bg-tech-container-lowest border border-tech-outline-variant rounded-lg text-tech-on-surface focus:outline-none focus:border-tech-primary focus:ring-1 focus:ring-tech-primary/40 transition-all placeholder:text-white/20" 
                                        id="studentId" 
                                        name="studentId" 
                                        placeholder="Ví dụ: N23DCCN000" 
                                        required 
                                        type="text"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-sm">
                                <div className="flex justify-between items-center px-xs">
                                    <label className="font-label-caps text-label-caps text-tech-primary block" htmlFor="password">MẬT KHẨU</label>
                                    <a className="text-label-caps font-label-caps text-tech-secondary hover:text-tech-secondary/80 transition-colors" href="#">QUÊN MẬT KHẨU?</a>
                                </div>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-tech-primary transition-colors">lock_open</span>
                                    <input 
                                        className="w-full pl-12 pr-4 py-4 bg-tech-container-lowest border border-tech-outline-variant rounded-lg text-tech-on-surface focus:outline-none focus:border-tech-primary focus:ring-1 focus:ring-tech-primary/40 transition-all placeholder:text-white/20" 
                                        id="password" 
                                        name="password" 
                                        placeholder="••••••••" 
                                        required 
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className={`text-sm px-2 ${status === 'error' ? 'text-red-400' : 'text-tech-primary'}`}>
                                    {message}
                                </div>
                            )}

                            <button 
                                className={`w-full py-4 rounded-lg font-headline-md text-title-sm text-black shadow-lg transition-all duration-300 mt-md ${status === 'success' ? 'bg-green-400' : 'orange-gradient shadow-tech-secondary/20 hover:shadow-tech-secondary/40 hover:scale-[1.01] active:scale-95'}`}
                                type="submit"
                                disabled={isLoading}
                            >
                                {status === 'loading' ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                        Đang Kết Nối...
                                    </div>
                                ) : status === 'success' ? (
                                    'Thành Công!'
                                ) : (
                                    'Đăng Nhập Ngay'
                                )}
                            </button>
                        </form>
                    </div>
                    <div className="lg:absolute lg:bottom-md text-center lg:text-left w-full lg:max-w-[400px]">
                        <p className="font-label-caps text-[10px] text-white/20 leading-relaxed">
                            © 2024 iTMC SYSTEMS. TẤT CẢ QUYỀN ĐƯỢC BẢO LƯU. TRUY CẬP ĐƯỢC GIÁM SÁT THEO TIÊU CHUẨN BẢO MẬT ISO/IEC 27001.
                        </p>
                    </div>
                </div>
            </main>

            {/* Interactive Cursor Glow Effect */}
            <div 
                className="fixed top-0 left-0 w-[400px] h-[400px] bg-tech-primary/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-500 z-0" 
                id="cursor-glow"
            ></div>
        </div>
    );
};

export default Login;
