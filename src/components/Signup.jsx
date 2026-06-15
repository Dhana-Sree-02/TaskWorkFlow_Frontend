import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare, UserPlus, Lock, Mail, User, Phone, ArrowLeft } from 'lucide-react';
import { callApi, apibaseurl } from '../lib';
import ProgressBar from './ProgressBar';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [isProgress, setIsProgress] = useState(false);
  const [errors, setErrors] = useState({});
  const [signupData, setSignupData] = useState({
    fullname: '',
    phone: '',
    email: '',
    password: '',
    retypepassword: ''
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });
    // Reset field error on key press
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const validate = () => {
    let errs = {};
    if (!signupData.fullname.trim()) errs.fullname = 'Full name is required';
    
    // Simple phone pattern check
    if (!signupData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[+]?[0-9\s-]{6,15}$/.test(signupData.phone)) {
      errs.phone = 'Please enter a valid phone number';
    }

    // Email check
    if (!signupData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      errs.email = 'Please enter a valid email';
    }

    // Password checks
    if (!signupData.password) {
      errs.password = 'Password is required';
    } else if (signupData.password.length < 5) {
      errs.password = 'Password must be at least 5 characters';
    }

    if (signupData.password !== signupData.retypepassword) {
      errs.retypepassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsProgress(true);

    callApi(
      'POST',
      apibaseurl + '/authservice/signup',
      signupData,
      null,
      signupResponseHandler
    );
  };

  const signupResponseHandler = (res) => {
    setIsProgress(false);
    alert(res.message || 'Registration complete!');
    if (res.code === 200) {
      navigate('/login');
    }
  };

  return (
    <div className="signup-page">
      {/* HEADER */}
      <header className="signup-header">
        <div className="signup-header-container">
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
      <main className="signup-main">
        <div className="signup-card-container">
          <div className="signup-glass-card">
            <div className="signup-card-header">
              <h2>Create Account</h2>
              <p>Sign up to start organizing tasks, managing collaborators, and auditing stats.</p>
            </div>

            <form onSubmit={handleSignup} className="signup-form">
              <div className={`form-input-group ${errors.fullname ? 'has-error' : ''}`}>
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    name="fullname"
                    value={signupData.fullname}
                    onChange={handleInput}
                  />
                </div>
                {errors.fullname && <span className="error-text">{errors.fullname}</span>}
              </div>

              <div className={`form-input-group ${errors.phone ? 'has-error' : ''}`}>
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="+1 555-0100"
                    name="phone"
                    value={signupData.phone}
                    onChange={handleInput}
                  />
                </div>
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className={`form-input-group ${errors.email ? 'has-error' : ''}`}>
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    name="email"
                    value={signupData.email}
                    onChange={handleInput}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className={`form-input-group ${errors.password ? 'has-error' : ''}`}>
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    placeholder="Minimum 5 characters"
                    name="password"
                    value={signupData.password}
                    onChange={handleInput}
                  />
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className={`form-input-group ${errors.retypepassword ? 'has-error' : ''}`}>
                <label>Confirm Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    name="retypepassword"
                    value={signupData.retypepassword}
                    onChange={handleInput}
                  />
                </div>
                {errors.retypepassword && <span className="error-text">{errors.retypepassword}</span>}
              </div>

              <button type="submit" className="btn-signup-submit">
                <UserPlus size={18} />
                <span>Register Account</span>
              </button>
            </form>

            <div className="signup-card-footer">
              <p>Already have an account? <Link to="/login">Log In</Link></p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="signup-footer">
        <p>Copyright &copy; 2026 TaskWorkflow. All rights reserved.</p>
      </footer>

      <ProgressBar isProgress={isProgress} />
    </div>
  );
};

export default Signup;
