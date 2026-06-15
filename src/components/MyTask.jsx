import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Trash2, 
  Edit, 
  Search, 
  Check, 
  Calendar, 
  AlertCircle, 
  ListTodo,
  X,
  Plus,
  Users as UsersIcon,
  MessageSquare,
  History,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { apibaseurl, callApi } from '../lib';
import './MyTask.css';

const MyTask = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({ id: 0, fullname: '', email: '', role: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, pending, completed, important
  const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'

  // Task Details Modal states
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  // Task Create Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDate, setNewDate] = useState('');
  const [newAssignee, setNewAssignee] = useState('');

  // Task Edit Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editDate, setEditDate] = useState('');
  const [editStage, setEditStage] = useState('Backlog');

  const [isProgress, setIsProgress] = useState(false);

  // Workflow stages config
  const STAGES = ["Backlog", "To Do", "In Progress", "Review", "Completed"];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setIsProgress(true);
    // 1. Load User Profile to check role & ID
    callApi("GET", apibaseurl + "/authservice/profile", null, null, (profileRes) => {
      if (profileRes && profileRes.user) {
        const u = profileRes.user[0] || {};
        const r = profileRes.user[1] || {};
        const parsedUser = {
          id: u.id || 0,
          fullname: u.fullname || 'Professional',
          email: u.email || '',
          role: r.rolename === 'Administrator' || r.rolename === 'Admin' || parseInt(u.role) === 2 ? 2 : 
                r.rolename === 'Manager' || parseInt(u.role) === 3 ? 3 : 1
        };
        setCurrentUser(parsedUser);

        // Load tasks and users
        fetchTasks(token);
        fetchUsers(token);
      } else {
        // Fallback for mock mode
        const mockActive = JSON.parse(localStorage.getItem('mock_active_user')) || { fullname: 'Demo', email: 'admin@taskworkflow.com', role: 'Administrator' };
        const parsedUser = {
          id: mockActive.id || 1,
          fullname: mockActive.fullname,
          email: mockActive.email,
          role: mockActive.role === 'Administrator' ? 2 : 1
        };
        setCurrentUser(parsedUser);
        fetchTasks(token);
        // Load mock users
        const mockUsers = JSON.parse(localStorage.getItem('mock_users')) || [];
        setUsers(mockUsers);
      }
      setIsProgress(false);
    }, token);
  };

  const fetchTasks = (token = localStorage.getItem('token')) => {
    callApi("GET", apibaseurl + "/tasks", null, null, (res) => {
      if (Array.isArray(res)) {
        setTasks(res);
      } else {
        // Local mock fallback if API isn't running tasks controller
        const storedTasks = JSON.parse(localStorage.getItem('mock_tasks')) || [];
        const mapped = storedTasks.map(t => ({
          task_id: t.id,
          title: t.name,
          description: t.description || "Establish structural framework & design tokens.",
          priority: t.important ? "High" : "Medium",
          due_date: t.date,
          created_at: "2026-06-09T00:00:00",
          current_stage: t.completed ? "Completed" : "In Progress",
          assigned_to: { fullname: "Administrator", email: "admin@taskworkflow.com" }
        }));
        setTasks(mapped);
      }
    }, token);
  };

  const fetchUsers = (token = localStorage.getItem('token')) => {
    callApi("GET", apibaseurl + "/authservice/getallusers/1/100", null, null, (res) => {
      if (res && res.users) {
        setUsers(res.users);
      }
    }, token);
  };

  // --- Toast Trigger Helper ---
  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // --- Task Creation ---
  const handleCreateTask = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const payload = {
      title: newTitle,
      description: newDescription,
      priority: newPriority,
      due_date: newDate || new Date().toISOString().split('T')[0],
      assigned_user_id: newAssignee ? parseInt(newAssignee) : null
    };

    setIsProgress(true);
    callApi("POST", apibaseurl + "/tasks", payload, null, (res) => {
      setIsProgress(false);
      if (res && res.task_id) {
        triggerToast("Task created successfully!");
        setIsCreateModalOpen(false);
        // Reset form
        setNewTitle('');
        setNewDescription('');
        setNewPriority('Medium');
        setNewDate('');
        setNewAssignee('');
        // Reload tasks
        fetchTasks(token);
      } else {
        triggerToast("Failed to create task", "error");
      }
    }, token);
  };

  // --- Delete Task ---
  const handleDeleteTask = (taskId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    const token = localStorage.getItem('token');
    setIsProgress(true);
    callApi("DELETE", apibaseurl + `/tasks/${taskId}`, null, null, (res) => {
      setIsProgress(false);
      triggerToast("Task deleted successfully!");
      if (selectedTask && selectedTask.task_id === taskId) {
        setSelectedTask(null);
      }
      fetchTasks(token);
    }, token);
  };

  // --- Open Edit Task Modal ---
  const handleOpenEditModal = (task, e) => {
    if (e) e.stopPropagation();
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditDate(task.due_date || '');
    setEditStage(task.current_stage);
    setIsEditModalOpen(true);
  };

  // --- Edit Task Submission ---
  const handleUpdateTask = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!editingTask) return;

    const payload = {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      due_date: editDate || null
    };

    setIsProgress(true);
    callApi("PUT", apibaseurl + `/tasks/${editingTask.task_id}`, payload, null, (res) => {
      // If the stage changed, update it too
      if (editStage !== editingTask.current_stage) {
        callApi("PUT", apibaseurl + `/tasks/${editingTask.task_id}/status`, { status: editStage }, null, (statusRes) => {
          setIsProgress(false);
          if (statusRes && statusRes.current_stage) {
            triggerToast("Task details and workflow stage updated successfully!");
            setIsEditModalOpen(false);
            setEditingTask(null);
            fetchTasks(token);
            if (selectedTask && selectedTask.task_id === editingTask.task_id) {
              const updated = { ...selectedTask, ...payload, current_stage: editStage };
              setSelectedTask(updated);
              fetchCommentsAndLogs(editingTask.task_id);
            }
          } else {
            const errMsg = statusRes && statusRes.detail ? statusRes.detail : `Invalid transition to ${editStage}`;
            triggerToast(`Details saved, but workflow transition failed: ${errMsg}`, "error");
            setIsEditModalOpen(false);
            setEditingTask(null);
            fetchTasks(token);
          }
        }, token);
      } else {
        setIsProgress(false);
        triggerToast("Task details updated successfully!");
        setIsEditModalOpen(false);
        setEditingTask(null);
        fetchTasks(token);
        if (selectedTask && selectedTask.task_id === editingTask.task_id) {
          const updated = { ...selectedTask, ...payload };
          setSelectedTask(updated);
        }
      }
    }, token);
  };

  // --- Open Task Details Modal (Comments & Logs) ---
  const handleOpenDetails = (task) => {
    setSelectedTask(task);
    setAssigneeId(task.assigned_to ? task.assigned_to.user_id : '');
    fetchCommentsAndLogs(task.task_id);
  };

  const fetchCommentsAndLogs = (taskId) => {
    const token = localStorage.getItem('token');
    // Fetch comments
    callApi("GET", apibaseurl + `/comments/${taskId}`, null, null, (res) => {
      if (Array.isArray(res)) setComments(res);
    }, token);

    // Fetch history logs
    callApi("GET", apibaseurl + `/tasks/${taskId}/logs`, null, null, (res) => {
      if (Array.isArray(res)) setLogs(res);
    }, token);
  };

  // --- Submit Comment ---
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    const token = localStorage.getItem('token');
    const payload = {
      task_id: selectedTask.task_id,
      comment: newComment
    };

    callApi("POST", apibaseurl + "/comments", payload, null, (res) => {
      setNewComment('');
      triggerToast("Comment added!");
      fetchCommentsAndLogs(selectedTask.task_id);
    }, token);
  };

  // --- Assign Task ---
  const handleAssignTask = (userId) => {
    if (!selectedTask) return;
    const token = localStorage.getItem('token');
    const payload = {
      task_id: selectedTask.task_id,
      user_id: parseInt(userId)
    };

    setIsProgress(true);
    callApi("POST", apibaseurl + "/assign-task", payload, null, (res) => {
      setIsProgress(false);
      triggerToast("Task assignee updated!");
      fetchTasks(token);
      fetchCommentsAndLogs(selectedTask.task_id);
    }, token);
  };

  // --- Status Transition (Drag and Drop / Toggle) ---
  const handleStatusChange = (taskId, targetStage) => {
    const token = localStorage.getItem('token');
    const task = tasks.find(t => t.task_id === taskId);
    if (!task) return;

    // Check same stage
    if (task.current_stage === targetStage) return;

    setIsProgress(true);
    callApi("PUT", apibaseurl + `/tasks/${taskId}/status`, { status: targetStage }, null, (res) => {
      setIsProgress(false);
      if (res && res.current_stage) {
        triggerToast(`Task moved to ${targetStage}!`);
        fetchTasks(token);
        // Refresh details modal if active
        if (selectedTask && selectedTask.task_id === taskId) {
          setSelectedTask(prev => ({ ...prev, current_stage: targetStage }));
          fetchCommentsAndLogs(taskId);
        }
      } else {
        // Validation error from backend
        const errMsg = res && res.detail ? res.detail : `Invalid transition to ${targetStage}`;
        triggerToast(errMsg, "error");
      }
    }, token);
  };

  // --- HTML5 Drag and Drop Events ---
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId.toString());
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const taskIdStr = e.dataTransfer.getData("text/plain");
    const taskId = parseInt(taskIdStr);
    if (!isNaN(taskId)) {
      handleStatusChange(taskId, targetStage);
    }
  };

  // --- Filters and Search ---
  const filteredTasks = tasks.filter(t => {
    const titleMatch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || descMatch;
    
    if (!matchesSearch) return false;

    if (activeFilter === 'pending') return t.current_stage !== 'Completed';
    if (activeFilter === 'completed') return t.current_stage === 'Completed';
    if (activeFilter === 'important') return t.priority === 'High' && t.current_stage !== 'Completed';
    return true; // 'all'
  });

  // Group tasks by status for Kanban Board
  const getTasksByStage = (stage) => {
    return filteredTasks.filter(t => t.current_stage === stage);
  };

  // --- Render Functions ---
  const renderPriorityBadge = (priority) => {
    return (
      <span className={`priority-badge ${priority.toLowerCase()}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="mytask-container">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className={`mytask-toast ${toastType}`}>
          {toastType === 'success' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER TITLE */}
      <div className="mytask-header">
        <div className="header-top-row">
          <div className="title-left">
            <ListTodo size={22} className="header-icon" />
            <label>Task Workspace Portal</label>
          </div>
          
          <div className="header-actions">
            {/* View Mode Toggle Buttons */}
            <div className="view-toggle-buttons">
              <button 
                className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => setViewMode('kanban')}
                title="Kanban Board View"
              >
                <LayoutGrid size={16} />
                <span>Kanban Board</span>
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Table Directory View"
              >
                <List size={16} />
                <span>Table List</span>
              </button>
            </div>

            {/* Create Task Button (Admin only) */}
            {currentUser.role === 2 ? (
              <button className="btn-create-task" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={16} />
                <span>Create Task</span>
              </button>
            ) : null}
          </div>
        </div>
        <p className="title-subtitle">Manage, assign, and track the progression of operational tasks and work objectives.</p>
      </div>

      {/* FILTER & SEARCH CONTROL ROW */}
      <div className="mytask-controls">
        <div className="mytask-search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search tasks or description..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mytask-filters">
          <button 
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pending')}
          >
            Active ({tasks.filter(t => t.current_stage !== 'Completed').length})
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            Completed ({tasks.filter(t => t.current_stage === 'Completed').length})
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'important' ? 'active' : ''}`}
            onClick={() => setActiveFilter('important')}
          >
            High Priority ({tasks.filter(t => t.priority === 'High' && t.current_stage !== 'Completed').length})
          </button>
        </div>
      </div>

      {/* --- KANBAN BOARD VIEW --- */}
      {viewMode === 'kanban' ? (
        <div className="kanban-board-container">
          {STAGES.map(stage => {
            const stageTasks = getTasksByStage(stage);
            return (
              <div 
                key={stage} 
                className="kanban-column"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <div className="column-header">
                  <div className="column-title-group">
                    <span className="dot-indicator"></span>
                    <h3>{stage}</h3>
                  </div>
                  <span className="column-count">{stageTasks.length}</span>
                </div>

                <div className="kanban-cards-area">
                  {stageTasks.length > 0 ? (
                    stageTasks.map(t => (
                      <div 
                        key={t.task_id}
                        className={`kanban-card ${t.priority.toLowerCase()}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.task_id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleOpenDetails(t)}
                      >
                        <div className="card-top">
                          {renderPriorityBadge(t.priority)}
                          <span className="card-due-indicator">
                            <Calendar size={11} />
                            {t.due_date || 'No Date'}
                          </span>
                        </div>
                        <h4 className="card-title">{t.title}</h4>
                        <p className="card-desc">
                          {t.description ? t.description.slice(0, 75) + (t.description.length > 75 ? '...' : '') : 'No description provided.'}
                        </p>
                        <div className="card-footer">
                          <div className="card-assignee">
                            <div className="avatar-small">
                              {t.assigned_to ? t.assigned_to.fullname.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="assignee-name">
                              {t.assigned_to ? t.assigned_to.fullname : 'Unassigned'}
                            </span>
                          </div>
                          
                          {currentUser.role !== 1 && (
                            <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="icon-action-btn edit" 
                                onClick={(e) => handleOpenEditModal(t, e)} 
                                title="Edit Task"
                              >
                                <Edit size={12} />
                              </button>
                              <button 
                                className="icon-action-btn delete" 
                                onClick={(e) => handleDeleteTask(t.task_id, e)} 
                                title="Delete Task"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="kanban-column-empty">
                      <span>Drop Tasks Here</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* --- LIST TABLE VIEW --- */
        <div className="mytask-table-container">
          {filteredTasks.length > 0 ? (
            <table className="mytask-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>S#</th>
                  <th>Task Name</th>
                  <th>Stage / Status</th>
                  <th style={{ width: '150px' }}>Target Date</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Priority</th>
                  <th style={{ width: '150px' }}>Assigned To</th>
                  {currentUser.role !== 1 && <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t, index) => (
                  <tr key={t.task_id} className="table-task-row" onClick={() => handleOpenDetails(t)}>
                    <td style={{ textAlign: 'center', fontWeight: '600' }} className="num-col">
                      {index + 1}
                    </td>
                    <td className="task-name-col">
                      <span className="task-title-text">{t.title}</span>
                    </td>
                    <td>
                      <span className={`stage-tag ${t.current_stage.toLowerCase().replace(" ", "-")}`}>
                        {t.current_stage}
                      </span>
                    </td>
                    <td className="task-date-col">
                      <div className="date-cell">
                        <Calendar size={13} className="cell-icon" />
                        <span>{t.due_date || 'No Date'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {renderPriorityBadge(t.priority)}
                    </td>
                    <td>
                      <div className="table-assignee">
                        <div className="avatar-small">
                          {t.assigned_to ? t.assigned_to.fullname.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span>{t.assigned_to ? t.assigned_to.fullname : 'Unassigned'}</span>
                      </div>
                    </td>
                    {currentUser.role !== 1 && (
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div className="actions-cell-wrapper">
                          <button 
                            className="action-btn edit" 
                            onClick={(e) => handleOpenEditModal(t, e)}
                            title="Edit Task"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="action-btn delete" 
                            onClick={(e) => handleDeleteTask(t.task_id, e)}
                            title="Delete Task"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="table-empty-state">
              <ListTodo size={32} />
              <h4>No tasks found</h4>
              <p>Try modifying your search queries or filter categories.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ================= TASK DETAIL MODAL OVERLAY ============ */}
      {/* ========================================================= */}
      {selectedTask && (
        <div className="details-modal-backdrop" onClick={() => setSelectedTask(null)}>
          <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <ListTodo size={18} className="modal-title-icon" />
                <h3>Task Details Workspace</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedTask(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-split">
              {/* Left Column: Metadata & Controls */}
              <div className="modal-split-left">
                <div className="details-info-section">
                  <h2>{selectedTask.title}</h2>
                  <p className="details-description">
                    {selectedTask.description || 'No description provided for this task.'}
                  </p>
                </div>

                <div className="details-grid-meta">
                  <div className="meta-card">
                    <span className="meta-lbl">Workflow Stage</span>
                    {/* Status dropdown transition control */}
                    <select 
                      className="details-select-status"
                      value={selectedTask.current_stage}
                      onChange={(e) => handleStatusChange(selectedTask.task_id, e.target.value)}
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="meta-card">
                    <span className="meta-lbl">Priority Level</span>
                    {renderPriorityBadge(selectedTask.priority)}
                  </div>

                  <div className="meta-card">
                    <span className="meta-lbl">Target Due Date</span>
                    <span className="meta-val">
                      <Calendar size={13} style={{ marginRight: '6px' }} />
                      {selectedTask.due_date || 'No Date Allocated'}
                    </span>
                  </div>

                  <div className="meta-card">
                    <span className="meta-lbl">Assigned Personnel</span>
                    {currentUser.role !== 1 ? (
                      <select 
                        className="details-select-assignee"
                        value={assigneeId}
                        onChange={(e) => {
                          setAssigneeId(e.target.value);
                          handleAssignTask(e.target.value);
                        }}
                      >
                        <option value="">Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.fullname} ({u.email})</option>
                        ))}
                      </select>
                    ) : (
                      <span className="meta-val">
                        {selectedTask.assigned_to ? selectedTask.assigned_to.fullname : 'Unassigned'}
                      </span>
                    )}
                  </div>
                </div>

                {/* MongoDB Action Logs History Feed */}
                <div className="logs-history-section">
                  <div className="section-hdr">
                    <History size={15} />
                    <h4>Timeline Audit Logs</h4>
                  </div>
                  <div className="logs-feed">
                    {logs.length > 0 ? (
                      logs.map((log, index) => (
                        <div key={index} className="log-item">
                          <span className="log-dot"></span>
                          <div className="log-txt-row">
                            <span className="log-action"><strong>{log.action}</strong>: </span>
                            {log.action === "Status Changed" && (
                              <span>Moved from <span className="log-hl">{log.old_status}</span> to <span className="log-hl">{log.new_status}</span></span>
                            )}
                            {log.action === "Assignment Changed" && (
                              <span>Reassigned from <span className="log-hl">{log.old_assignee}</span> to <span className="log-hl">{log.new_assignee}</span></span>
                            )}
                            {log.action === "Comment Added" && <span>Added collaboration details.</span>}
                            {log.action === "Task Created" && <span>Task entered Backlog.</span>}
                            {log.action === "Task Metadata Updated" && <span>Objective metadata revised.</span>}
                            <span className="log-meta-footer">by {log.updated_by} &bull; {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="logs-empty">
                        <History size={20} />
                        <span>No historical logs found for this task.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Comments Collaboration (MongoDB) */}
              <div className="modal-split-right">
                <div className="comments-collaboration-section">
                  <div className="section-hdr">
                    <MessageSquare size={15} />
                    <h4>Comment Collaboration</h4>
                  </div>

                  <div className="comments-chat-history">
                    {comments.length > 0 ? (
                      comments.map((c, i) => (
                        <div key={i} className="comment-bubble-item">
                          <div className="comment-hdr">
                            <span className="comment-user">{c.user_name}</span>
                            <span className="comment-time">
                              {new Date(c.created_at).toLocaleDateString()} {new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="comment-txt">{c.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="comments-empty-state">
                        <MessageSquare size={24} />
                        <h5>No discussions yet</h5>
                        <p>Start the collaboration by posting notes below.</p>
                      </div>
                    )}
                  </div>

                  <form className="comment-post-form" onSubmit={handleAddComment}>
                    <input 
                      type="text" 
                      placeholder="Write a message..." 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                    />
                    <button type="submit">Send</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ================= TASK CREATE MODAL OVERLAY ============ */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="edit-modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Plus size={18} className="modal-title-icon" />
                <h3>Create New Task Objective</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsCreateModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleCreateTask}>
              <div className="modal-form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Design Login Page Interface"
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Description</label>
                <textarea 
                  className="modal-textarea"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide explicit operational details..."
                  rows={3}
                />
              </div>

              <div className="modal-form-group">
                <label>Priority Rank</label>
                <select 
                  className="modal-select"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label>Target Due Date</label>
                <div className="modal-date-input-wrapper">
                  <Calendar size={15} className="modal-date-icon" />
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label>Assignee</label>
                <select 
                  className="modal-select"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullname} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-update">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ================= TASK EDIT MODAL OVERLAY ============ */}
      {/* ========================================================= */}
      {isEditModalOpen && (
        <div className="edit-modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Edit size={18} className="modal-title-icon" />
                <h3>Update Task Credentials</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleUpdateTask}>
              <div className="modal-form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Description</label>
                <textarea 
                  className="modal-textarea"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="modal-form-group">
                <label>Priority Rank</label>
                <select 
                  className="modal-select"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label>Target Completion Date</label>
                <div className="modal-date-input-wrapper">
                  <Calendar size={15} className="modal-date-icon" />
                  <input 
                    type="date" 
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label>Workflow Stage</label>
                <select 
                  className="modal-select"
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value)}
                >
                  {STAGES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-update">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTask;
