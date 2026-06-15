import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare, LogIn, Lock, Mail, ArrowLeft, HelpCircle } from 'lucide-react';
import { callApi, apibaseurl } from '../lib';
import ProgressBar from './ProgressBar';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [isProgress, setIsProgress] = useState(false);
  const [errors, setErrors] = useState({});
  const [signinData, setSigninData] = useState({
    username: '',
    password: ''
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setSigninData({ ...signinData, [name]: value });
    // Clear field error on key press
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const validate = () => {
    let errs = {};
    if (!signinData.username.trim()) errs.username = true;
    if (!signinData.password) errs.password = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsProgress(true);

    callApi(
      'POST',
      apibaseurl + '/authservice/signin',
      signinData,
      null,
      loginResponseHandler
    );
  };

  const loginResponseHandler = (res) => {
    setIsProgress(false);
    if (res.code !== 200) {
      alert(res.message || "Failed to log in.");
    } else {
      localStorage.setItem('token', res.jwt);
      window.location.replace('/home');
    }
  };

  const autofillDemo = () => {
    setSigninData({
      username: 'admin@taskworkflow.com',
      password: 'admin'
    });
    setErrors({});
  };

  return (
    <div className="login-page">
      {/* HEADER */}
      <header className="login-header">
        <div className="login-header-container">
          <Link to="/" className="header-logo-link">
            <div className="logo-badge">
              <CheckSquare size={20} className="logo-badge-icon" />
            </div>
            <span className="logo-text">Task<span>Workflow</span></span>
          </Link>
          <Link to="/" className="btn-back-home">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* CORE CONTAINER */}
      <main className="login-main">
        <div className="login-card-container">
          <div className="login-glass-card">
            <div className="login-card-header">
              <h2>Welcome Back</h2>
              <p>Log in to access your custom task checklists and coordinate flows.</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className={`form-input-group ${errors.username ? 'has-error' : ''}`}>
                <label>Registered Email</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="name@company.com"
                    name="username"
                    value={signinData.username}
                    onChange={handleInput}
                  />
                </div>
                {errors.username && <span className="error-text">Please enter a valid email address.</span>}
              </div>

              <div className={`form-input-group ${errors.password ? 'has-error' : ''}`}>
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    name="password"
                    value={signinData.password}
                    onChange={handleInput}
                  />
                </div>
                {errors.password && <span className="error-text">Please provide your password.</span>}
              </div>

              <div className="form-options">
                <label className="remember-checkbox">
                  <input type="checkbox" defaultChecked />
                  <span>Remember session</span>
                </label>
                <a href="#!" className="forgot-password-link">Forgot password?</a>
              </div>

              <button type="submit" className="btn-login-submit">
                <LogIn size={18} />
                <span>Log In</span>
              </button>
            </form>

            <div className="login-divider">
              <span>Or</span>
            </div>

            {/* Quick Demo Assist */}
            

            <div className="login-card-footer">
              <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="login-footer">
        <p>Copyright &copy; 2026 TaskWorkflow. All rights reserved.</p>
      </footer>

      <ProgressBar isProgress={isProgress} />
    </div>
  );
};

export default Login;
