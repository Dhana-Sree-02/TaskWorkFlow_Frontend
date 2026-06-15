import React, { useEffect, useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  Shield, 
  CheckSquare, 
  Activity, 
  Award, 
  Clock
} from 'lucide-react';
import './Profile.css';
import ProgressBar from './ProgressBar';
import { apibaseurl, callApi } from '../lib';

const Profile = ({ logout }) => {
  const [data, setData] = useState(null);
  const [token, setToken] = useState("");
  const [isProgress, setIsProgress] = useState(false);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    backlog: 0,
    adherence: 100
  });

  useEffect(() => {
    const storedtoken = localStorage.getItem("token");
    if (!storedtoken) return logout();
    
    setToken(storedtoken);
    setIsProgress(true);
    
    // Fetch profile data
    callApi("GET", apibaseurl + "/authservice/profile", null, null, (res) => {
      setData(res);
      setIsProgress(false);
    }, storedtoken);

    // Fetch user tasks to calculate workflow statistics
    callApi("GET", apibaseurl + "/tasks", null, null, (tasksRes) => {
      if (Array.isArray(tasksRes)) {
        const total = tasksRes.length;
        const completed = tasksRes.filter(t => t.current_stage === 'Completed').length;
        const inProgress = tasksRes.filter(t => t.current_stage === 'In Progress' || t.current_stage === 'Review').length;
        const backlog = tasksRes.filter(t => t.current_stage === 'Backlog' || t.current_stage === 'To Do').length;
        
        // Calculate dynamic adherence score (completed / total ratio)
        const adherence = total > 0 ? Math.round((completed / total) * 100) : 100;

        setTaskStats({
          total,
          completed,
          inProgress,
          backlog,
          adherence: adherence
        });
      }
    }, storedtoken);
  }, []);

  if (!data) return null;

  const user = data.user[0];
  const role = data.user[1];

  return (
    <div className="swayo-profile-page">
      {/* Profile Card */}
      <div className="swayo-profile-card">
        
        {/* Header Section */}
        <div className="card-profile-header">
          <div className="profile-header-left">
            <div className="profile-avatar-circle">
              {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-identity-info">
              <h3>{user.fullname}</h3>
              <span className="profile-role-subtitle">{role?.rolename || 'Active Member'}</span>
            </div>
          </div>
          <div className="profile-badge-row">
            <span className="profile-active-badge">Active Workspace Account</span>
          </div>
        </div>

        {/* Details Section */}
        <div className="card-profile-details">
          <h4 className="section-title">Personal Information</h4>
          
          <div className="detail-row">
            <div className="detail-label">
              <User size={15} />
              <span>Full Name:</span>
            </div>
            <div className="detail-value">{user.fullname}</div>
          </div>

          <div className="detail-row">
            <div className="detail-label">
              <Phone size={15} />
              <span>Phone number:</span>
            </div>
            <div className="detail-value">{user.phone || 'No phone registered'}</div>
          </div>

          <div className="detail-row">
            <div className="detail-label">
              <Mail size={15} />
              <span>Registered Email:</span>
            </div>
            <div className="detail-value">{user.email}</div>
          </div>

          <div className="detail-row">
            <div className="detail-label">
              <Shield size={15} />
              <span>Security Role:</span>
            </div>
            <div className="detail-value">{role?.rolename}</div>
          </div>
        </div>

        {/* Task Workflow Analytics Section */}
        <div className="profile-workflow-section">
          <h4 className="section-title">Task Workflow Activity</h4>
          
          <div className="stats-metric-grid">
            <div className="metric-box">
              <CheckSquare className="metric-icon purple" size={20} />
              <div className="metric-info">
                <span className="val">{taskStats.completed}</span>
                <span className="lbl">Completed Tasks</span>
              </div>
            </div>

            <div className="metric-box">
              <Activity className="metric-icon indigo" size={20} />
              <div className="metric-info">
                <span className="val">{taskStats.inProgress}</span>
                <span className="lbl">In Progress / Review</span>
              </div>
            </div>

            <div className="metric-box">
              <Clock className="metric-icon gray" size={20} />
              <div className="metric-info">
                <span className="val">{taskStats.backlog}</span>
                <span className="lbl">Backlog / To Do</span>
              </div>
            </div>

            <div className="metric-box">
              <Award className="metric-icon gold" size={20} />
              <div className="metric-info">
                <span className="val">{taskStats.adherence}%</span>
                <span className="lbl">Workflow Adherence</span>
              </div>
            </div>
          </div>

          {/* Progress Bar of Workflow Stages */}
          <div className="workflow-progress-wrapper">
            <div className="progress-label-row">
              <span>Overall Workflow Completion Rate</span>
              <span>{taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%</span>
            </div>
            <div className="workflow-progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <ProgressBar isProgress={isProgress} />
    </div>
  );
};

export default Profile;
