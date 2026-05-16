import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();

  // Hàm helper để check active menu
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-surface text-on-surface font-body-sm antialiased h-screen overflow-hidden flex selection:bg-primary-container selection:text-on-primary-container">
      
      {/* SideNavBar (Desktop) */}
      <aside className="bg-surface dark:bg-inverse-surface w-[260px] h-screen border-r border-outline-variant dark:border-outline flex flex-col py-6 z-20 shrink-0">
        {/* Brand / Header */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-primary flex items-center justify-center shrink-0 shadow-sm">
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              group_work
            </span>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-headline-md font-headline-md font-bold text-on-surface dark:text-inverse-on-surface truncate">
              CLB ITMC
            </h1>
            <p className="text-label-sm font-label-sm text-on-surface-variant dark:text-surface-variant truncate">
              Hệ thống quản lý
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 mb-6">
          <button className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-surface-tint hover:shadow-md transition-all duration-200 py-2.5 rounded-lg text-label-md font-label-md">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Event
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-1">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 ${
              isActive('/') 
                ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary border-l-4 border-primary dark:border-inverse-primary font-bold' 
                : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-variant'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isActive('/') ? 'icon-fill' : ''}`}>
              dashboard
            </span>
            <span className="text-label-md font-label-md">Dashboard</span>
          </Link>

          <Link
            to="/members"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 ${
              isActive('/members') 
                ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary border-l-4 border-primary dark:border-inverse-primary font-bold' 
                : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-variant'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isActive('/members') ? 'icon-fill' : ''}`}>
              group
            </span>
            <span className="text-label-md font-label-md">Members</span>
          </Link>

          <Link
            to="/attendance"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 ${
              isActive('/attendance') 
                ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary border-l-4 border-primary dark:border-inverse-primary font-bold' 
                : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-variant'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isActive('/attendance') ? 'icon-fill' : ''}`}>
              calendar_check
            </span>
            <span className="text-label-md font-label-md">Attendance</span>
          </Link>

          <Link
            to="/fund-admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 ${
              isActive('/fund-admin') 
                ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary border-l-4 border-primary dark:border-inverse-primary font-bold' 
                : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-variant'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isActive('/fund-admin') ? 'icon-fill' : ''}`}>
              account_balance_wallet
            </span>
            <span className="text-label-md font-label-md">Finance</span>
          </Link>

          <Link
            to="/my-payment"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 ${
              isActive('/my-payment') 
                ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary border-l-4 border-primary dark:border-inverse-primary font-bold' 
                : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-variant'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isActive('/my-payment') ? 'icon-fill' : ''}`}>
              payments
            </span>
            <span className="text-label-md font-label-md">My Payments</span>
          </Link>

          <div className="pt-4 mt-4 border-t border-outline-variant/30">
             <Link
                to="/settings"
                className="flex items-center gap-3 text-on-surface-variant dark:text-surface-variant px-4 py-3 rounded-lg hover:bg-surface-container-high dark:hover:bg-surface-variant transition-colors duration-150"
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
                <span className="text-label-md font-label-md">Settings</span>
              </Link>
          </div>
        </nav>

        {/* Footer Tab */}
        <div className="px-2 mt-auto pt-4 border-t border-outline-variant/50">
          <div className="flex items-center gap-3 px-4 py-2">
             <img src="https://i.pravatar.cc/150?img=11" alt="avatar" className="w-8 h-8 rounded-full border border-outline-variant" />
             <div className="overflow-hidden">
               <p className="text-sm font-bold text-on-surface truncate">Admin User</p>
               <p className="text-xs text-on-surface-variant cursor-pointer hover:underline">Log out</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* TopNavBar */}
        <header className="bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none flex justify-between items-center w-full h-16 px-gutter z-10 sticky top-0">
          <div className="flex items-center flex-1">
            <div className="hidden md:flex items-center w-full max-w-md bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px]">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 text-body-sm w-full p-0 text-on-surface placeholder:text-outline" 
                placeholder="Tìm kiếm nhanh..." 
                type="text"
              />
            </div>
            {/* Mobile Menu Icon */}
            <button className="md:hidden text-on-surface-variant p-2 rounded-lg hover:bg-surface-container">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-all relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
            </button>
            <div className="h-6 w-px bg-outline-variant/50 mx-2 hidden sm:block"></div>
            <button className="hidden sm:flex items-center gap-2 bg-primary-container text-on-primary-container hover:bg-primary-fixed-dim px-3 py-1.5 rounded-lg transition-all text-label-sm font-label-sm font-bold">
              <span className="material-symbols-outlined text-[16px]">add</span>
              + New
            </button>
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-surface-container-high hover:border-primary transition-all cursor-pointer ml-2">
              <img src="https://i.pravatar.cc/150?img=11" alt="profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-surface-container-lowest">
            <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default Layout;