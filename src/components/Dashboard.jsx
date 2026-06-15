import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Trash2, 
  Search, 
  Check, 
  Sparkles, 
  Layers,
  ListTodo,
  Users,
  Shield,
  User,
  Clock,
  BarChart3,
  PieChart as PieIcon
} from 'lucide-react';
import { apibaseurl, callApi } from '../lib';
import './Dashboard.css';

// Chart.js imports
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js elements
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Dashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInfo, setUserInfo] = useState({ fullname: 'Professional', email: '', phone: '', role: 'User' });
  const [allUsers, setAllUsers] = useState([]);
  const [adminStats, setAdminStats] = useState({ total: 0, active: 0, admins: 0, inactive: 0 });
  const [toastMessage, setToastMessage] = useState('');

  // Analytics Stats from backend
  const [stats, setStats] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    high_priority_tasks: 0
  });

  // Chart data states
  const [stageChartData, setStageChartData] = useState(null);
  const [userChartData, setUserChartData] = useState(null);

  // Task Creation (Quick Task on Dashboard)
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskImportant, setTaskImportant] = useState(false);
  const [taskAssignee, setTaskAssignee] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const quotes = [
    "Focus on being productive instead of busy.",
    "Your future is created by what you do today, not tomorrow.",
    "Make each day your masterpiece.",
    "Big journeys begin with small, deliberate steps.",
    "Simplify your workflow; amplify your impact."
  ];
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  function loadDashboardData() {
    const token = localStorage.getItem('token');
    if (!token) return;

    // 1. Fetch user profile
    callApi("GET", apibaseurl + "/authservice/profile", null, null, (res) => {
      if (res && res.user) {
        let userObj = res.user[0] || {};
        let roleObj = res.user[1] || {};
        
        const fullname = userObj.fullname || 'Professional';
        const email = userObj.email || '';
        const phone = userObj.phone || '';
        const role = roleObj.rolename || 'User';
        
        setUserInfo({ fullname, email, phone, role });
        
        const isUserAdmin = role === 'Administrator' || role === 'Admin' || parseInt(userObj.role) === 2;
        setIsAdmin(isUserAdmin);
        
        // Fetch stats & charts from backend
        fetchAnalytics(token);
        
        // Fetch all users list (for assignments dropdown & user card)
        callApi("GET", apibaseurl + "/authservice/getallusers/1/100", null, null, (usersRes) => {
          if (usersRes && usersRes.users) {
            setAllUsers(usersRes.users);
            if (isUserAdmin) {
              calculateAdminStats(usersRes.users);
            }
          }
        }, token);

        // Fetch task list for interactive checklist
        fetchChecklist(token);
      } else {
        // Mock fallback mode
        const activeUser = JSON.parse(localStorage.getItem('mock_active_user'));
        if (activeUser) {
          const isUserAdmin = activeUser.role === 'Administrator' || activeUser.role === 'Admin';
          setIsAdmin(isUserAdmin);
          setUserInfo({
            fullname: activeUser.fullname || 'Admin',
            email: activeUser.email || 'admin@taskworkflow.com',
            phone: activeUser.phone || '+1 555-0199',
            role: activeUser.role === 'Administrator' ? 'Admin' : (activeUser.role || 'Admin')
          });
          
          setStats({ total_tasks: 3, completed_tasks: 1, pending_tasks: 2, high_priority_tasks: 1 });
          setupMockCharts();
          const mockUsers = JSON.parse(localStorage.getItem('mock_users')) || [];
          setAllUsers(mockUsers);
          if (isUserAdmin) {
            calculateAdminStats(mockUsers);
          }
          const storedTasks = JSON.parse(localStorage.getItem('mock_tasks')) || [];
          setTasks(storedTasks.map(t => ({ task_id: t.id, title: t.name, due_date: t.date, priority: t.important ? 'High' : 'Medium', current_stage: t.completed ? 'Completed' : 'In Progress' })));
        }
      }
    }, token);
  }

  function fetchAnalytics(token) {
    callApi("GET", apibaseurl + "/dashboard", null, null, (res) => {
      if (res && res.stats) {
        setStats(res.stats);
        
        // Setup Pie Chart: Stage Distribution
        if (res.stage_distribution) {
          setStageChartData({
            labels: res.stage_distribution.labels,
            datasets: [{
              data: res.stage_distribution.data,
              backgroundColor: [
                'rgba(163, 163, 128, 0.75)', // Backlog: Olive Petal
                'rgba(215, 206, 147, 0.75)', // To Do: Golden Clover
                'rgba(239, 235, 224, 0.75)', // In Progress: Arctic Daisy
                'rgba(216, 164, 143, 0.75)', // Review: Rose Blush
                'rgba(187, 133, 136, 0.75)'  // Completed: Peach Blossom
              ],
              borderColor: [
                '#A3A380', '#D7CE93', '#EFEBCE', '#D8A48F', '#BB8588'
              ],
              borderWidth: 1
            }]
          });
        }

        // Setup Bar Chart: User Task Load
        if (res.user_task_load) {
          setUserChartData({
            labels: res.user_task_load.labels,
            datasets: [{
              label: 'Assigned Tasks',
              data: res.user_task_load.data,
              backgroundColor: 'rgba(187, 133, 136, 0.7)',
              borderColor: '#BB8588',
              borderWidth: 1,
              borderRadius: 6
            }]
          });
        }
      } else {
        setupMockCharts();
      }
    }, token);
  }

  const setupMockCharts = () => {
    setStageChartData({
      labels: ["Backlog", "To Do", "In Progress", "Review", "Completed"],
      datasets: [{
        data: [1, 2, 4, 1, 3],
        backgroundColor: [
          'rgba(163, 163, 128, 0.65)', // Olive Petal
          'rgba(215, 206, 147, 0.65)', // Golden Clover
          'rgba(239, 235, 224, 0.65)', // Arctic Daisy
          'rgba(216, 164, 143, 0.65)', // Rose Blush
          'rgba(187, 133, 136, 0.65)'  // Peach Blossom
        ],
        borderWidth: 1
      }]
    });
    setUserChartData({
      labels: ["Administrator", "Jane Smith", "Alex Rivera"],
      datasets: [{
        label: 'Assigned Tasks',
        data: [5, 3, 2],
        backgroundColor: 'rgba(187, 133, 136, 0.6)',
        borderRadius: 6
      }]
    });
  };

  function fetchChecklist(token) {
    callApi("GET", apibaseurl + "/tasks", null, null, (res) => {
      if (Array.isArray(res)) {
        setTasks(res);
      }
    }, token);
  }

  function calculateAdminStats(usersList) {
    const total = usersList.length;
    const active = usersList.filter(u => u.status === 1 || u.status === undefined).length;
    const admins = usersList.filter(u => u.role === 'Administrator' || parseInt(u.role) === 2).length;
    const inactive = total - active;

    setAdminStats({ total, active, admins, inactive });
  }


  // Task creation handler
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const payload = {
      title: taskName,
      description: "Quick task defined from dashboard.",
      priority: taskImportant ? "High" : "Medium",
      due_date: taskDate || new Date().toISOString().split('T')[0],
      assigned_user_id: taskAssignee ? parseInt(taskAssignee) : null
    };

    callApi("POST", apibaseurl + "/tasks", payload, null, (res) => {
      if (res && res.task_id) {
        triggerToast('Task successfully created!');
        setTaskName('');
        setTaskDate('');
        setTaskImportant(false);
        setTaskAssignee('');
        // Reload dashboard stats and checklist
        fetchAnalytics(token);
        fetchChecklist(token);
      } else {
        triggerToast('Failed to create task.', 'error');
      }
    }, token);
  };

  // Checkbox toggle handler
  const handleToggleTask = (taskId, currentStage) => {
    const token = localStorage.getItem('token');
    const targetStage = currentStage === 'Completed' ? 'To Do' : 'Completed';
    
    callApi("PUT", apibaseurl + `/tasks/${taskId}/status`, { status: targetStage }, null, (res) => {
      if (res && res.current_stage) {
        triggerToast(targetStage === 'Completed' ? 'Task accomplished!' : 'Task reopened.');
        fetchAnalytics(token);
        fetchChecklist(token);
      } else {
        triggerToast(res.detail || 'Invalid transition status.', 'error');
      }
    }, token);
  };

  // Task delete handler
  const handleDeleteTask = (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    const token = localStorage.getItem('token');
    callApi("DELETE", apibaseurl + `/tasks/${taskId}`, null, null, () => {
      triggerToast('Task removed.');
      fetchAnalytics(token);
      fetchChecklist(token);
    }, token);
  };


  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  // Filter & Search tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'pending') return t.current_stage !== 'Completed';
    if (activeFilter === 'completed') return t.current_stage === 'Completed';
    if (activeFilter === 'important') return t.priority === 'High' && t.current_stage !== 'Completed';
    return true; // 'all'
  });

  const completionPercentage = stats.total_tasks > 0 ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 0;

  // Chart configs
  const pieOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: { color: 'rgba(43, 44, 36, 0.8)', font: { size: 11 } }
      }
    },
    maintainAspectRatio: false
  };

  const barOptions = {
    scales: {
      x: { grid: { display: false }, ticks: { color: 'rgba(43, 44, 36, 0.7)' } },
      y: { grid: { color: 'rgba(43, 44, 36, 0.08)' }, ticks: { color: 'rgba(43, 44, 36, 0.7)', stepSize: 1 } }
    },
    plugins: {
      legend: { display: false }
    },

    maintainAspectRatio: false
  };

  return (
    <div className="dashboard-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="dashboard-toast">
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. WELCOME MOTIVATION CARD */}
      <section className="dashboard-welcome-card">
        <div className="welcome-left">
          <div className="welcome-tag">
            <Sparkles size={13} />
            <span>{formattedDate}</span>
          </div>
          <h2>{getGreeting()}, {userInfo.fullname}!</h2>
          <p className="welcome-quote">"{quote}"</p>
        </div>
        <div className="welcome-right">
          {userInfo.role !== 'Administrator' && userInfo.role !== 'Admin' && !isAdmin ? (
            <div className="circular-progress-box">
              <svg className="circular-svg" viewBox="0 0 100 100">
                <circle className="bg-circle" cx="50" cy="50" r="40" />
                <circle 
                  className="progress-circle" 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  style={{ strokeDashoffset: 251.2 - (251.2 * completionPercentage) / 100 }} 
                />
              </svg>
              <div className="progress-value">
                <span className="percent-num">{completionPercentage}%</span>
                <span className="percent-label">Done</span>
              </div>
            </div>
          ) : (
            <div className="role-badge-box">
              <div className="badge-icon admin">
                <Shield size={24} />
              </div>
              <div className="badge-text">
                <span className="badge-role">{userInfo.role}</span>
                <span className="badge-status">System Verified</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* STATS GRIDS - Relational tasks count */}
      <section className="dashboard-stats-grid">
        <div className="stat-card total">
          <div className="stat-icon-box">
            <Layers size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Allocated</span>
            <span className="stat-count">{stats.total_tasks}</span>
          </div>
          <div className="stat-glow"></div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon-box">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Pending</span>
            <span className="stat-count">{stats.pending_tasks}</span>
          </div>
          <div className="stat-glow"></div>
        </div>

        <div className="stat-card important">
          <div className="stat-icon-box">
            <AlertCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Urgent & Active</span>
            <span className="stat-count">{stats.high_priority_tasks}</span>
          </div>
          <div className="stat-glow"></div>
        </div>

        <div className="stat-card completed">
          <div className="stat-icon-box">
            <CheckCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Accomplished</span>
            <span className="stat-count">{stats.completed_tasks}</span>
          </div>
          <div className="stat-glow"></div>
        </div>
      </section>

      {/* CHARTS SECTION */}
      <section className="charts-visual-grid">
        <div className="chart-card-container">
          <div className="chart-hdr-title">
            <PieIcon size={16} />
            <span>Workflow Stages Distribution</span>
          </div>
          <div className="chart-render-wrapper">
            {stageChartData ? (
              <Pie data={stageChartData} options={pieOptions} />
            ) : (
              <span className="chart-loading">Loading chart...</span>
            )}
          </div>
        </div>

        <div className="chart-card-container">
          <div className="chart-hdr-title">
            <BarChart3 size={16} />
            <span>Task Distribution By Personnel</span>
          </div>
          <div className="chart-render-wrapper">
            {userChartData ? (
              <Bar data={userChartData} options={barOptions} />
            ) : (
              <span className="chart-loading">Loading chart...</span>
            )}
          </div>
        </div>
      </section>

      {/* DUAL WORKSPACE */}
      <div className="dashboard-workspace-grid">
        {/* Task Creation Form Block (Managers/Admins write, Users read info) */}
        <section className="dashboard-form-card">
          <div className="card-header-bar">
            <h3>Quick Task Provision</h3>
            <p>Define objective checklists and allocate target due dates.</p>
          </div>

          <form className="task-form" onSubmit={handleTaskSubmit}>
            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                required
                placeholder="e.g. Design user interface layout"
              />
            </div>
            
            <div className="form-group-row">
              <div className="form-group">
                <label>Due Date</label>
                <div className="date-input-wrapper">
                  <Calendar size={16} className="date-input-icon" />
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Assign To</label>
                <select
                  className="dashboard-select"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.fullname}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <div className={`checkbox-custom ${taskImportant ? 'checked' : ''}`}>
                  {taskImportant && <Check size={12} className="check-icon" />}
                  <input
                    type="checkbox"
                    checked={taskImportant}
                    onChange={(e) => setTaskImportant(e.target.checked)}
                  />
                </div>
                <span>Flag as High Priority (Urgent)</span>
              </label>
            </div>

            <button type="submit" className="btn-dashboard-submit">
              <PlusCircle size={18} />
              <span>Create Task</span>
            </button>
          </form>
        </section>

        {/* Interactive Tasks Checklist Section */}
        <section className="dashboard-chart-card">
          <div className="card-header-bar">
            <h3>Interactive Checklist</h3>
            <p>Track, search, and update task statuses live from this dashboard.</p>
          </div>

          <div className="checklist-controls-row">
            <div className="search-input-wrapper">
              <Search size={14} className="search-input-icon" />
              <input
                type="text"
                placeholder="Search checklist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-buttons-wrapper">
              <button 
                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveFilter('completed')}
              >
                Done
              </button>
            </div>
          </div>

          <div className="dashboard-tasks-checklist">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((t) => (
                <div key={t.task_id} className={`checklist-task-item ${t.current_stage === 'Completed' ? 'completed' : ''} ${t.priority === 'High' ? 'important' : ''}`}>
                  <label className="task-left-label">
                    <div className={`task-checkbox-custom ${t.current_stage === 'Completed' ? 'checked' : ''}`}>
                      {t.current_stage === 'Completed' && <Check size={12} className="check-icon" />}
                      <input
                        type="checkbox"
                        checked={t.current_stage === 'Completed'}
                        onChange={() => handleToggleTask(t.task_id, t.current_stage)}
                      />
                    </div>
                    <div className="task-text-details">
                      <span className="task-title-content">{t.title}</span>
                      <span className="task-date-content">Due Date: {t.due_date || 'No Date'} &bull; Assigned to: {t.assigned_to ? t.assigned_to.fullname : 'Unassigned'}</span>
                    </div>
                  </label>

                  <div className="task-right-actions">
                    {t.priority === 'High' && t.current_stage !== 'Completed' && (
                      <span className="task-badge high-priority">High</span>
                    )}
                    {userInfo.role !== 'User' && (
                      <button className="btn-delete-task" onClick={() => handleDeleteTask(t.task_id)} title="Delete Task">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="checklist-empty-state">
                <ListTodo size={24} />
                <p>No tasks matched this checklist filter.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {isAdmin && (
        /* ==================== 🛠️ ADMINISTRATOR SYSTEM STATISTICS ==================== */
        <section className="admin-status-overlay">
          <div className="card-header-bar">
            <h3>Directory Personnel Status</h3>
          </div>
          <div className="admin-quick-stats-grid">
            <div className="admin-stat-item">
              <span className="stat-label">Total Personnel</span>
              <span className="stat-value">{adminStats.total}</span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-label">Active Users</span>
              <span className="stat-value">{adminStats.active}</span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-label">System Admins</span>
              <span className="stat-value">{adminStats.admins}</span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-label">Inactive Accounts</span>
              <span className="stat-value">{adminStats.inactive}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
