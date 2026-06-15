import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  ArrowRight, 
  Shield, 
  Activity, 
  Users, 
  Sparkles, 
  Check, 
  LogIn, 
  UserPlus, 
  Menu, 
  X,
  Layers,
  Clock
} from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('create');

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const featureTabs = {
    create: {
      title: "Live Infrastructure Analytics",
      desc: "Monitor server response latency, Postgres connection limits, database thread health, and live system uptime stats in one click.",
      bulletPoints: ["Uptime analytics tracking", "PostgreSQL pool metrics", "Real-time system health checks", "Latency analysis graphs"]
    },
    track: {
      title: "Role-based Dashboards",
      desc: "Log in with custom roles to see personalized portals. Administrators gain direct system-wide stats while regular users see verified credential guides.",
      bulletPoints: ["Automated custom greetings", "Personalized verified credentials", "Uptime & performance counters", "Optimal system status cards"]
    },
    manage: {
      title: "Advanced User Management",
      desc: "Take full control of user profiles. List registered accounts via smooth paginated tables and modify/deactivate users seamlessly.",
      bulletPoints: ["Paginated directory mapping", "Security auditing options", "Quick collaborator filters", "Active/inactive status control"]
    }
  };

  return (
    <div className="landing-page">
      {/* HEADER */}
      <header className="landing-header">
        <div className="landing-nav-container">
          <div className="landing-logo">
            <div className="logo-badge">
              <CheckSquare size={22} className="logo-badge-icon" />
            </div>
            <span className="logo-text">Task<span>Workflow</span></span>
          </div>

          {/* Desktop Nav */}
          <nav className="landing-desktop-nav">
            <a href="#features" className="nav-link">Features</a>
            <a href="#workflow" className="nav-link">How it Works</a>
            <a href="#metrics" className="nav-link">Benefits</a>
          </nav>

          <div className="landing-desktop-actions">
            <Link to="/login" className="btn-signin-nav">
              <LogIn size={16} />
              <span>Log In</span>
            </Link>
            <Link to="/signup" className="btn-signup-nav">
              <UserPlus size={16} />
              <span>Get Started</span>
            </Link>
          </div>

          {/* Hamburger Menu Toggle */}
          <button className="mobile-nav-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`landing-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <nav className="mobile-drawer-nav">
            <a href="#features" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#workflow" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
            <a href="#metrics" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Benefits</a>
            <hr className="drawer-divider" />
            <Link to="/login" className="mobile-btn-login" onClick={() => setMobileMenuOpen(false)}>
              <LogIn size={18} />
              <span>Log In</span>
            </Link>
            <Link to="/signup" className="mobile-btn-signup" onClick={() => setMobileMenuOpen(false)}>
              <UserPlus size={18} />
              <span>Register</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="landing-hero">
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-tag">
              <Sparkles size={14} className="hero-tag-icon" />
              <span>Empower Your Productivity</span>
            </div>
            <h1 className="hero-title">
              Orchestrate your workflow, <br />
              <span className="gradient-text">effortlessly.</span>
            </h1>
            <p className="hero-desc">
              TaskWorkflow is a premium task management suite built for developers, project leads, and professionals. Organize daily objectives, coordinate roles, and review live stats in a jaw-dropping glassmorphism dashboard.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn-hero-primary">
                <span>Start for Free</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-hero-secondary">
                <span>Explore Live Demo</span>
              </Link>
            </div>
            <div className="hero-trust">
              <div className="avatar-group">
                <div className="mock-avatar">A</div>
                <div className="mock-avatar">J</div>
                <div className="mock-avatar">R</div>
              </div>
              <p className="trust-text">Join thousands of planners getting things done daily.</p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="glass-mockup-frame">
              <div className="mockup-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <div className="mockup-search">taskworkflow.com/home</div>
              </div>
              <div className="mockup-body">
                <div className="mockup-sidebar">
                  <div className="mockup-sb-item active"></div>
                  <div className="mockup-sb-item"></div>
                  <div className="mockup-sb-item"></div>
                  <div className="mockup-sb-item"></div>
                </div>
                <div className="mockup-workspace">
                  <div className="mockup-welcome">
                    <div>
                      <div className="mockup-title">Welcome back, John!</div>
                      <div className="mockup-subtitle">Your productivity is up by 15% this week.</div>
                    </div>
                  </div>
                  <div className="mockup-stats-grid">
                    <div className="mockup-stat-card">
                      <div className="m-card-title">Completed</div>
                      <div className="m-card-val">74%</div>
                      <div className="m-card-bar"><div className="fill green" style={{width: '74%'}}></div></div>
                    </div>
                    <div className="mockup-stat-card">
                      <div className="m-card-title">Important</div>
                      <div className="m-card-val">4 Tasks</div>
                      <div className="m-card-bar"><div className="fill purple" style={{width: '60%'}}></div></div>
                    </div>
                  </div>
                  <div className="mockup-task-item">
                    <div className="checkbox-ring checked"></div>
                    <div>
                      <div className="task-name-line checked">Draft brand styling specifications</div>
                      <div className="task-meta-line">High Priority • May 25</div>
                    </div>
                  </div>
                  <div className="mockup-task-item">
                    <div className="checkbox-ring"></div>
                    <div>
                      <div className="task-name-line">Revamp collapsable drawer layout</div>
                      <div className="task-meta-line">Normal Priority • May 26</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="visual-glow-circle circle-1"></div>
            <div className="visual-glow-circle circle-2"></div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="landing-features">
        <div className="section-header">
          <h2 className="section-title">Engines built to accelerate execution</h2>
          <p className="section-subtitle">Everything you need to map out operations, assign priorities, and audit project members.</p>
        </div>

        <div className="features-showcase-container">
          <div className="features-tabs-menu">
            <button 
              className={`tab-menu-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <Layers size={18} />
              <span>Task Creator</span>
            </button>
            <button 
              className={`tab-menu-btn ${activeTab === 'track' ? 'active' : ''}`}
              onClick={() => setActiveTab('track')}
            >
              <Activity size={18} />
              <span>Status Boards</span>
            </button>
            <button 
              className={`tab-menu-btn ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              <Users size={18} />
              <span>Team Directory</span>
            </button>
          </div>

          <div className="features-tab-content">
            <div className="content-detail-panel">
              <h3 className="panel-title">{featureTabs[activeTab].title}</h3>
              <p className="panel-desc">{featureTabs[activeTab].desc}</p>
              <ul className="panel-list">
                {featureTabs[activeTab].bulletPoints.map((bp, idx) => (
                  <li key={idx} className="panel-list-item">
                    <div className="check-bullet">
                      <Check size={12} className="check-bullet-icon" />
                    </div>
                    <span>{bp}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="panel-cta-btn">
                <span>Start using this feature</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="content-visual-panel">
              {activeTab === 'create' && (
                <div className="feature-demo-widget create-widget">
                  <div className="widget-header">New Task Form</div>
                  <div className="widget-field">
                    <label>Task Description</label>
                    <div className="widget-input">Integrate sliding menu controls</div>
                  </div>
                  <div className="widget-row">
                    <div className="widget-field half">
                      <label>Due Date</label>
                      <div className="widget-input">2026-05-26</div>
                    </div>
                    <div className="widget-checkbox">
                      <div className="checkbox-box checked"><Check size={12} className="white-check" /></div>
                      <span>Important</span>
                    </div>
                  </div>
                  <button className="widget-submit-btn">Create Task</button>
                </div>
              )}
              {activeTab === 'track' && (
                <div className="feature-demo-widget list-widget">
                  <div className="widget-header">Live Task Monitor</div>
                  <div className="widget-task-row">
                    <div className="widget-task-cb checked"><Check size={10} className="check-white" /></div>
                    <div className="widget-task-info">
                      <div className="task-t struck">Verify index.css styling tokens</div>
                      <div className="task-d">Completed</div>
                    </div>
                    <span className="task-priority-tag low">Normal</span>
                  </div>
                  <div className="widget-task-row">
                    <div className="widget-task-cb"></div>
                    <div className="widget-task-info">
                      <div className="task-t">Perform local visual verification</div>
                      <div className="task-d">Pending</div>
                    </div>
                    <span className="task-priority-tag high">Important</span>
                  </div>
                </div>
              )}
              {activeTab === 'manage' && (
                <div className="feature-demo-widget user-widget">
                  <div className="widget-header">Collaborators Directory</div>
                  <div className="user-grid-item">
                    <div className="user-initial u-1">A</div>
                    <div className="user-card-info">
                      <div className="user-fullname">Administrator</div>
                      <div className="user-sub">admin@taskworkflow.com</div>
                    </div>
                    <span className="user-role-badge lead">Admin</span>
                  </div>
                  <div className="user-grid-item">
                    <div className="user-initial u-2">J</div>
                    <div className="user-card-info">
                      <div className="user-fullname">Jane Smith</div>
                      <div className="user-sub">jane@taskworkflow.com</div>
                    </div>
                    <span className="user-role-badge member">Manager</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="workflow" className="landing-workflow">
        <div className="section-header">
          <h2 className="section-title">Get started in three easy steps</h2>
          <p className="section-subtitle">No credit card required. Seamlessly transition from a guest viewer to an empowered planner in seconds.</p>
        </div>

        <div className="workflow-steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h4 className="step-title">Create Account</h4>
            <p className="step-text">Register a new profile in under 20 seconds. It establishes your workspace immediately.</p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <h4 className="step-title">Draft Task Lists</h4>
            <p className="step-text">Add your tasks using the dashboard creator. Flag key items to keep them highly visible.</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h4 className="step-title">Track & Refine</h4>
            <p className="step-text">Log in at any time to check off items, edit dates via interactive modals, and review metrics.</p>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="metrics" className="landing-benefits">
        <div className="benefits-backdrop">
          <div className="benefits-grid">
            <div className="benefits-left">
              <h2 className="benefits-title">Engineered to keep you ahead</h2>
              <p className="benefits-description">
                Cluttered workspaces invite stress. TaskWorkflow's beautiful, single-screen interactive workspaces streamline task progression and improve mental clarity.
              </p>
              <div className="benefits-checklist">
                <div className="checklist-item">
                  <div className="benefit-icon-wrapper">
                    <Shield size={20} className="b-icon" />
                  </div>
                  <div>
                    <h5>Secure Authentication</h5>
                    <p>Cryptographic JWT tokens secure your network transactions and local directories.</p>
                  </div>
                </div>
                <div className="checklist-item">
                  <div className="benefit-icon-wrapper">
                    <Clock size={20} className="b-icon" />
                  </div>
                  <div>
                    <h5>Real-time Status Updates</h5>
                    <p>Track exactly what is completed, important, or pending without reloading directories.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="benefits-right">
              <div className="metrics-box">
                <div className="metric-metric">
                  <div className="metric-number">99.9%</div>
                  <div className="metric-label">Uptime Reliability</div>
                </div>
                <hr className="metric-divider" />
                <div className="metric-metric">
                  <div className="metric-number">15+ mins</div>
                  <div className="metric-label">Saved Daily per Planner</div>
                </div>
                <hr className="metric-divider" />
                <div className="metric-metric">
                  <div className="metric-number">2.4x</div>
                  <div className="metric-label">Better Task Completion Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-badge">
                <CheckSquare size={18} className="footer-logo-badge-icon" />
              </div>
              <span className="footer-logo-text">Task<span>Workflow</span></span>
            </div>
            <p className="footer-brand-tagline">Premium, visual, and highly responsive work management.</p>
          </div>
          <div className="footer-links-group">
            <div className="footer-col">
              <h6>Product</h6>
              <a href="#features">Features</a>
              <a href="#workflow">Workflow</a>
              <a href="#metrics">Benefits</a>
            </div>
            <div className="footer-col">
              <h6>Security</h6>
              <Link to="/login">Authorization</Link>
              <Link to="/signup">Registration</Link>
              <a href="#!">JWT Tokens</a>
            </div>
            <div className="footer-col">
              <h6>Company</h6>
              <a href="#!">About Us</a>
              <a href="#!">Careers</a>
              <a href="#!">Privacy Policy</a>
            </div>
          </div>
        </div>
        <hr className="footer-divider" />
        <div className="footer-bottom">
          <p className="footer-copyright">Copyright &copy; 2026 TaskWorkflow. All rights reserved.</p>
          <div className="footer-socials">
            <span className="social-icon">Tw</span>
            <span className="social-icon">Gh</span>
            <span className="social-icon">Li</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
