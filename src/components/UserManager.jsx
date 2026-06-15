import React, { useEffect, useRef, useState } from 'react';
import { 
  UserPlus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  AlertCircle,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX
} from 'lucide-react';
import './UserManager.css';
import ProgressBar from './ProgressBar';
import { apibaseurl, callApi } from '../lib';

const UserManager = ({ logout }) => {
  const [data, setData] = useState(null);
  const [token, setToken] = useState("");
  const [isProgress, setIsProgress] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingUserId, setEditingUserId] = useState(null);

  // Form Fields
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(1); // 1: Employee, 2: Admin, 3: Manager
  const [status, setStatus] = useState(1); // 1: Active, 0: Inactive

  const PAGE_SIZE = 5;

  useEffect(() => {
    const storedtoken = localStorage.getItem("token");
    if (!storedtoken) return logout();
    setToken(storedtoken);
    loadUsers(1, storedtoken);
  }, []);

  function loadUsers(page, jwtToken = token) {
    setIsProgress(true);
    setActivePage(page);
    callApi("GET", apibaseurl + `/authservice/getallusers/${page}/${PAGE_SIZE}`, null, null, (res) => {
      setIsProgress(false);
      if (res && res.users) {
        setData(res);
      }
    }, jwtToken);
  }


  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // --- Add User Modal Trigger ---
  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingUserId(null);
    setFullname('');
    setPhone('');
    setEmail('');
    setPassword('');
    setRole(1);
    setStatus(1);
    setIsModalOpen(true);
  };

  // --- Edit User Modal Trigger ---
  const handleOpenEdit = (user) => {
    setModalMode('edit');
    setEditingUserId(user.id);
    setFullname(user.fullname);
    setPhone(user.phone || '');
    setEmail(user.email);
    setPassword(user.password || '');
    setRole(user.role || 1);
    setStatus(user.status !== undefined ? user.status : 1);
    setIsModalOpen(true);
  };

  // --- Form Submission Handler ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const jwtToken = localStorage.getItem("token");

    if (modalMode === 'add') {
      const payload = { fullname, phone, email, password, role: parseInt(role), status: parseInt(status) };
      setIsProgress(true);
      callApi("POST", apibaseurl + "/authservice/adduser", payload, null, (res) => {
        setIsProgress(false);
        if (res && res.code === 200) {
          triggerToast("User account created successfully!");
          setIsModalOpen(false);
          loadUsers(activePage, jwtToken);
        } else {
          alert(res?.message || "Failed to create user account.");
        }
      }, jwtToken);
    } else {
      const payload = { fullname, phone, email, password, role: parseInt(role), status: parseInt(status) };
      setIsProgress(true);
      callApi("PUT", apibaseurl + `/authservice/edituser/${editingUserId}`, payload, null, (res) => {
        setIsProgress(false);
        if (res && res.code === 200) {
          triggerToast("User profile updated successfully!");
          setIsModalOpen(false);
          loadUsers(activePage, jwtToken);
        } else {
          alert(res?.message || "Failed to update profile.");
        }
      }, jwtToken);
    }
  };

  // --- Delete User Handler ---
  const handleDeleteUser = (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user account?")) return;
    const jwtToken = localStorage.getItem("token");

    setIsProgress(true);
    callApi("DELETE", apibaseurl + `/authservice/deleteuser/${userId}`, null, null, (res) => {
      setIsProgress(false);
      if (res && res.code === 200) {
        triggerToast("User profile deleted successfully!");
        loadUsers(activePage, jwtToken);
      } else {
        alert(res?.message || "Failed to delete user profile.");
      }
    }, jwtToken);
  };

  const getRoleLabel = (roleId) => {
    switch (parseInt(roleId)) {
      case 1: return <span className="u-role employee">Employee</span>;
      case 2: return <span className="u-role administrator">Admin</span>;
      case 3: return <span className="u-role manager">Manager</span>;
      default: return <span className="u-role employee">Employee</span>;
    }
  };

  return (
    <div className='umanager'>
      {toastMessage && (
        <div className="umanager-toast">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className='umanager-header'>
        <div className="header-left-title">
          <UsersIcon size={22} className="title-icon" />
          <label>User Directory Management</label>
        </div>
        <p className="header-subtitle">Admin portal to register, modify, and monitor user profiles and access roles.</p>
      </div>

      <div className='umanager-content'>
        {data && data.users && data.users.length > 0 ? (
          <table className="umanager-table">
            <thead>
              <tr>
                <th style={{ 'width': '60px', 'textAlign': 'center' }}>S#</th>
                <th>Full Name</th>
                <th>Access Role</th>
                <th style={{ 'width': '180px' }}>Phone Number</th>
                <th>Registered Email</th>
                <th style={{ 'width': '120px', 'textAlign': 'center' }}>Status</th>
                <th style={{ 'width': '120px', 'textAlign': 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user, index) => (
                <tr key={user.id} className={user.status === 0 ? 'inactive-row' : ''}>
                  <td style={{ 'textAlign': 'center', 'fontWeight': '600' }}>
                    {((data.page - 1) * data.size) + (index + 1)}
                  </td>
                  <td className="user-name-cell">{user.fullname}</td>
                  <td>{getRoleLabel(user.role)}</td>
                  <td>{user.phone || 'No Phone'}</td>
                  <td>{user.email}</td>
                  <td style={{ 'textAlign': 'center' }}>
                    {user.status === 0 ? (
                      <span className="status-badge inactive"><UserX size={12} /> Inactive</span>
                    ) : (
                      <span className="status-badge active"><UserCheck size={12} /> Active</span>
                    )}
                  </td>
                  <td style={{ 'textAlign': 'center' }}>
                    <div className="user-actions">
                      <button 
                        className="user-btn edit" 
                        onClick={() => handleOpenEdit(user)}
                        title="Edit User Details"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        className="user-btn delete" 
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User Profile"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="umanager-empty">
            <UsersIcon size={40} />
            <p>No registered user profiles found in the directory database.</p>
          </div>
        )}
      </div>

      <div className='umanager-footer'>
        <button className="btn-add-new" onClick={handleOpenAdd}>
          <UserPlus size={16} />
          <span>Add New User</span>
        </button>

        <div className='pages'>
          <button 
            disabled={activePage === 1}
            onClick={() => loadUsers(activePage - 1)}
            className="page-nav-btn"
          >
            <ChevronLeft size={14} />
          </button>
          
          {Array.from({ length: data?.totalpages || 1 }, (_, index) => (
            <label 
              key={index} 
              className={index + 1 === activePage ? 'active' : ''} 
              onClick={() => loadUsers(index + 1)}
            >
              {index + 1}
            </label>
          ))}

          <button 
            disabled={activePage === (data?.totalpages || 1)}
            onClick={() => loadUsers(activePage + 1)}
            className="page-nav-btn"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ================= ADD/EDIT USER MODAL ================== */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="umanager-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="umanager-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <UserPlus size={18} className="modal-title-icon" />
                <h3>{modalMode === 'add' ? 'Register New User' : 'Update User Profile'}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555-0199"
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Registered Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jane@taskworkflow.com"
                  required
                  disabled={modalMode === 'edit'} // Email is login username, cannot change in edit
                />
              </div>

              <div className="modal-form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={modalMode === 'edit' ? "Change password..." : "Enter password..."}
                  required={modalMode === 'add'}
                />
              </div>

              <div className="modal-form-group-row">
                <div className="modal-form-group">
                  <label>Access Role</label>
                  <select 
                    className="modal-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value={1}>Employee</option>
                    <option value={2}>Admin</option>
                    <option value={3}>Manager</option>
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>Status</label>
                  <select 
                    className="modal-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-update">
                  {modalMode === 'add' ? 'Register Account' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ProgressBar isProgress={isProgress} />
    </div>
  );
}

export default UserManager;
