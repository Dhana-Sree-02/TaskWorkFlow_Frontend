import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  MessageSquare,
  History,
  X,
  Plus
} from 'lucide-react';
import { apibaseurl, callApi } from '../lib';
import './SemanticSearch.css';
import '../components/MyTask.css'; // Reuse modal styles

const SemanticSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isProgress, setIsProgress] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [users, setUsers] = useState([]);
  const [assigneeId, setAssigneeId] = useState('');
  const [currentUser, setCurrentUser] = useState({ id: 0, fullname: '', email: '', role: 1 });

  const STAGES = ["Backlog", "To Do", "In Progress", "Review", "Completed"];

  const sampleQueries = [
    "Pending high priority tasks",
    "Tasks related to UI development",
    "Tasks assigned to frontend team",
    "Database optimization work",
    "Tasks waiting for review"
  ];

  useEffect(() => {
    // Load users and current user profile for detail modal integration
    const token = localStorage.getItem('token');
    if (!token) return;

    callApi("GET", apibaseurl + "/authservice/profile", null, null, (profileRes) => {
      if (profileRes && profileRes.user) {
        const u = profileRes.user[0] || {};
        const r = profileRes.user[1] || {};
        setCurrentUser({
          id: u.id || 0,
          fullname: u.fullname || 'Professional',
          email: u.email || '',
          role: r.rolename === 'Administrator' || r.rolename === 'Admin' || parseInt(u.role) === 2 ? 2 : 1
        });
      }
    }, token);

    callApi("GET", apibaseurl + "/authservice/getallusers/1/100", null, null, (res) => {
      if (res && res.users) {
        setUsers(res.users);
      }
    }, token);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const token = localStorage.getItem('token');
    setIsProgress(true);
    
    callApi("POST", apibaseurl + "/semantic-search", { query }, null, (res) => {
      setIsProgress(false);
      if (Array.isArray(res)) {
        setResults(res);
      } else {
        setResults([]);
      }
    }, token);
  };

  const handleSampleClick = (q) => {
    setQuery(q);
    // Timeout to allow state update before trigger
    setTimeout(() => {
      const token = localStorage.getItem('token');
      setIsProgress(true);
      callApi("POST", apibaseurl + "/semantic-search", { query: q }, null, (res) => {
        setIsProgress(false);
        if (Array.isArray(res)) {
          setResults(res);
        } else {
          setResults([]);
        }
      }, token);
    }, 50);
  };

  // --- Task Detail Modal Integration ---
  const handleOpenDetails = (task) => {
    setSelectedTask(task);
    setAssigneeId(task.assigned_to ? task.assigned_to.user_id : '');
    fetchCommentsAndLogs(task.task_id);
  };

  const fetchCommentsAndLogs = (taskId) => {
    const token = localStorage.getItem('token');
    callApi("GET", apibaseurl + `/comments/${taskId}`, null, null, (res) => {
      if (Array.isArray(res)) setComments(res);
    }, token);

    callApi("GET", apibaseurl + `/tasks/${taskId}/logs`, null, null, (res) => {
      if (Array.isArray(res)) setLogs(res);
    }, token);
  };

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
      fetchCommentsAndLogs(selectedTask.task_id);
    }, token);
  };

  const handleStatusChange = (taskId, targetStage) => {
    const token = localStorage.getItem('token');
    callApi("PUT", apibaseurl + `/tasks/${taskId}/status`, { status: targetStage }, null, (res) => {
      if (res && res.current_stage) {
        setSelectedTask(prev => ({ ...prev, current_stage: targetStage }));
        // Refresh search results
        handleSearch();
        fetchCommentsAndLogs(taskId);
      } else {
        alert(res.detail || "Invalid transition.");
      }
    }, token);
  };

  const handleAssignTask = (userId) => {
    if (!selectedTask) return;
    const token = localStorage.getItem('token');
    const payload = {
      task_id: selectedTask.task_id,
      user_id: parseInt(userId)
    };

    callApi("POST", apibaseurl + "/assign-task", payload, null, (res) => {
      handleSearch();
      fetchCommentsAndLogs(selectedTask.task_id);
    }, token);
  };

  return (
    <div className="semantic-search-container">
      {/* Title */}
      <div className="mytask-header">
        <div className="title-left">
          <Sparkles size={22} className="header-icon" />
          <label>Intelligent Semantic Search</label>
        </div>
        <p className="title-subtitle">Perform AI-powered task matching using MongoDB Vector similarity embeddings.</p>
      </div>

      {/* Search Bar Input */}
      <div className="search-interface-card">
        <form onSubmit={handleSearch} className="semantic-search-form">
          <div className="semantic-input-group">
            <Search size={20} className="input-search-icon" />
            <input 
              type="text" 
              placeholder="Search contextually (e.g. 'ui development work assigned to me' or 'pending review')..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-search-submit" disabled={isProgress}>
            {isProgress ? 'Computing...' : 'AI Search'}
          </button>
        </form>

        {/* Sample Queries */}
        <div className="sample-queries-box">
          <span className="sample-lbl">Try query:</span>
          <div className="sample-tags-row">
            {sampleQueries.map((q, idx) => (
              <button 
                key={idx} 
                type="button" 
                className="sample-query-tag"
                onClick={() => handleSampleClick(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Listing */}
      <div className="search-results-section">
        <h3>Search Matches ({results.length})</h3>
        
        {isProgress ? (
          <div className="search-loading-state">
            <div className="search-spinner"></div>
            <span>Running Vector Similarity matching...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="search-results-grid">
            {results.map((t) => {
              const scorePercent = Math.round(t.score * 100);
              return (
                <div 
                  key={t.task_id} 
                  className="search-result-card" 
                  onClick={() => handleOpenDetails(t)}
                >
                  <div className="res-card-hdr">
                    <span className={`stage-tag ${t.current_stage.toLowerCase().replace(" ", "-")}`}>
                      {t.current_stage}
                    </span>
                    <span className="similarity-score-badge">
                      <Sparkles size={11} style={{ marginRight: '4px' }} />
                      {scorePercent}% match
                    </span>
                  </div>

                  <h4>{t.title}</h4>
                  <p className="res-desc">
                    {t.description || 'No description allocated.'}
                  </p>

                  <div className="res-card-ftr">
                    <span className={`priority-badge ${t.priority.toLowerCase()}`}>
                      {t.priority}
                    </span>
                    
                    <div className="res-assignee">
                      <div className="avatar-small">
                        {t.assigned_to ? t.assigned_to.fullname.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span>{t.assigned_to ? t.assigned_to.fullname : 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="search-empty-state">
            <Search size={32} />
            <h4>No semantic matches discovered</h4>
            <p>Enter a contextual query describing task goals, statuses, or priorities above.</p>
          </div>
        )}
      </div>

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
                    <span className={`priority-badge ${selectedTask.priority.toLowerCase()}`}>
                      {selectedTask.priority}
                    </span>
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
    </div>
  );
};

export default SemanticSearch;
