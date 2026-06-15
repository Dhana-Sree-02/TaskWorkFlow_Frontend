import React, { useEffect, useState } from 'react';
import './Home.css';
import { apibaseurl, callApi } from '../lib';
import ProgressBar from './ProgressBar';
import Profile from './Profile';
import UserManager from './UserManager';
import Dashboard from './Dashboard';
import MyTask from './MyTask';
import SemanticSearch from './SemanticSearch';

import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  User, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  ListTodo
} from 'lucide-react';

const Home = () => {
    const [fullname, setFullname] = useState("");
    const [isProgress, setIsProgress] = useState(false);
    const [token, setToken] = useState("");
    const [menuList, setMenuList] = useState([]);
    const [activeComponent, setActiveComponent] = useState(null);
    const [activeMenu, setActiveMenu] = useState(0);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    useEffect(() => {
        const storedtoken = localStorage.getItem("token");
        if (!storedtoken)
            logout();
        else {
            setToken(storedtoken);
            setIsProgress(true);
            callApi("GET", apibaseurl + "/authservice/uinfo", null, null, loadUinfo, storedtoken);
        }
    }, []);

    function loadUinfo(res) {
        setIsProgress(false);
        if (res.code != 200) return;
        setFullname(res.fullname);
        setMenuList(res.menulist);
        
        // Auto-load Dashboard (mid 1) on load
        if (res.menulist && res.menulist.length > 0) {
            const hasDashboard = res.menulist.find(m => m.mid === 1);
            if (hasDashboard) {
                loadModule(1, res.menulist);
            } else {
                loadModule(res.menulist[0].mid, res.menulist);
            }
        }
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("mock_active_user");
        window.location.replace("/");
    }

    function loadModule(mid, list = menuList) {
        setIsProgress(true);
        setActiveMenu(mid);
        setIsMobileDrawerOpen(false); // Close mobile drawer if open
        
        const component = {
            1: <Dashboard />, // 1 is Dashboard
            2: <MyTask />,    // 2 is My Tasks
            3: <SemanticSearch />, // 3 is Semantic Search
            4: <UserManager logout={logout} />, 
            5: <Profile logout={logout} />
        };
        
        setActiveComponent(component[mid]);
        setIsProgress(false);
    }

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const toggleMobileDrawer = () => {
        setIsMobileDrawerOpen(!isMobileDrawerOpen);
    };

    // Helper to render beautiful Lucide Icons based on menu mid
    const getMenuIcon = (mid) => {
        switch(mid) {
            case 1: return <LayoutDashboard size={20} />;
            case 2: return <ListTodo size={20} />;
            case 3: return <Sparkles size={20} />;
            case 4: return <Users size={20} />;
            case 5: return <User size={20} />;
            default: return <LayoutDashboard size={20} />;
        }
    };


    return (
        <div className={`home ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            
            {/* HEADER */}
            <div className='home-header'>
                <div className="header-left">
                    <button className="mobile-drawer-toggle" onClick={toggleMobileDrawer} aria-label="Toggle Navigation">
                        <Menu size={22} />
                    </button>
                    <div className="logo-area">
                        <div className="logo-icon"><ListTodo size={22} /></div>
                        <h1>Task WorkFlow</h1>
                    </div>
                </div>

                <div className='header-right'>
                    <div className="user-greeting">
                        <div className="avatar-mini">
                            {fullname ? fullname.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="greeting-text">Hi, <strong>{fullname}</strong></span>
                    </div>
                    <button className="logout-btn" onClick={() => logout()} title="Logout Session">
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* WORKSPACE AREA */}
            <div className='home-workspace'>
                
                {/* Desktop Sidebar (Slide Menu) */}
                <aside className={`home-menus ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                    <div className="sidebar-profile-card">
                        <div className="avatar-large">
                            {fullname ? fullname.charAt(0).toUpperCase() : 'U'}
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="profile-details animate-fade">
                                <h4>{fullname}</h4>
                                <span className="role-tag"><Sparkles size={10} /> Active Professional</span>
                            </div>
                        )}
                    </div>
                    
                    <nav className="sidebar-nav">
                        <ul>
                            {menuList.map((m) => (
                                <li 
                                    key={m.mid} 
                                    className={activeMenu == m.mid ? 'active' : ''} 
                                    onClick={() => loadModule(m.mid)}
                                    title={m.menu}
                                >
                                    <div className="menu-icon-wrapper">
                                        {getMenuIcon(m.mid)}
                                    </div>
                                    <span className="menu-label">{m.menu}</span>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <button className="sidebar-collapse-toggle" onClick={toggleSidebar} aria-label="Collapse sidebar">
                        {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </aside>

                {/* Mobile Navigation Drawer (Overlay Slide Out Menu) */}
                <div className={`mobile-drawer-backdrop ${isMobileDrawerOpen ? 'active' : ''}`} onClick={() => setIsMobileDrawerOpen(false)}>
                    <aside className={`mobile-drawer ${isMobileDrawerOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-header">
                            <div className="logo-area">
                                <div className="logo-icon"><ListTodo size={20} /></div>
                                <h2>Task WorkFlow</h2>
                            </div>
                        </div>

                        <div className="drawer-profile-card">
                            <div className="avatar-large">
                                {fullname ? fullname.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="profile-details">
                                <h4>{fullname}</h4>
                                <span className="role-tag">Active Professional</span>
                            </div>
                        </div>

                        <nav className="drawer-nav">
                            <ul>
                                {menuList.map((m) => (
                                    <li 
                                        key={m.mid} 
                                        className={activeMenu == m.mid ? 'active' : ''} 
                                        onClick={() => loadModule(m.mid)}
                                    >
                                        <div className="menu-icon-wrapper">
                                            {getMenuIcon(m.mid)}
                                        </div>
                                        <span>{m.menu}</span>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <button className="drawer-logout-btn" onClick={() => logout()}>
                            <LogOut size={18} />
                            <span>Logout Account</span>
                        </button>
                    </aside>
                </div>

                {/* MAIN CONTENT VIEW AREA */}
                <main className='home-content'>
                    {activeComponent}
                </main>
            </div>

            {/* FOOTER */}
            <footer className='home-footer'>
                <span>TaskWorkflow Manager &copy; 2026. All rights reserved.</span>
            </footer>

            <ProgressBar isProgress={isProgress}/>
        </div>
    );
}

export default Home;

