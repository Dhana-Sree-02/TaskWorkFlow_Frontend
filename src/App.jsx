import { useState } from "react";
import { imgurl, callApi, apibaseurl } from "./lib";
import "./App.css";
import ProgressBar from "./components/ProgressBar.jsx";


const App = () => {
  const [isSignin, setIsSignIn] = useState(true);
  const [isProgress, setIsProgress] = useState(false);
  const [errorData, setErrorData] = useState({});

  const [signupData, setSignupData] = useState({
    fullname: "",
    phone: "",
    email: "",
    password: "",
    retypepassword: "",
  });

  const [signinData, setSigninData] = useState({
    username: "",
    password: "",
  });

  function switchWindow() {
    setIsSignIn((prev) => !prev);
    setErrorData({});
  }

  function handleSigninInput(e) {
    const { name, value } = e.target;
    setSigninData({ ...signinData, [name]: value });
  }

  function handleSignupInput(e) {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });
  }

  function validateSignup() {
    let errors = {};
    if (signupData.fullname === "") errors.fullname = true;
    if (signupData.phone === "") errors.phone = true;
    if (signupData.email === "") errors.email = true;
    if (signupData.password === "") errors.password = true;
    if (
      signupData.retypepassword === "" ||
      signupData.password !== signupData.retypepassword
    )
      errors.retypepassword = true;

    setErrorData(errors);
    return Object.keys(errors).length > 0;
  }

  function validateSignin() {
    let errors = {};
    if (signinData.username === "") errors.username = true;
    if (signinData.password === "") errors.password = true;

    setErrorData(errors);
    return Object.keys(errors).length > 0;
  }

  function signin() {
    if (validateSignin()) return;

    setIsProgress(true);

    callApi(
      "POST",
      apibaseurl + "/authservice/signin",
      signinData,
      null,
      signinResponseHandler
    );
  }

  function signup() {
    if (validateSignup()) return;

    setIsProgress(true);

    callApi(
      "POST",
      apibaseurl + "/authservice/signup",
      signupData,
      null,
      signupResponseHandler
    );
  }

  function signinResponseHandler(res) {
    if (res.code !== 200) {
      alert(res.message);
    } else {
      localStorage.setItem("token", res.jwt);
      window.location.replace("/home");
    }

    setIsProgress(false);
  }

  function signupResponseHandler(res) {
    alert(res.message);
    setIsProgress(false);
  }

  return (
    <div className="outer-container">
      <div className="container">

        {/* LEFT INFO */}
        <div className="info-container">
          <div className="info-item">
            <p>Have an account?</p>
            <button onClick={() => setIsSignIn(true)}>
              Log In
            </button>
          </div>

          {/* TREE */}
          <div className="tree">
            <div className="leaves"></div>
            <div className="trunk"></div>
          </div>

          {/* RIGHT INFO */}
          <div className="info-item">
            <p>Don't have an account?</p>
            <button onClick={() => setIsSignIn(false)}>
              Sign Up
            </button>
          </div>
        </div>

        {/* FORM */}
        <div className={`form-container ${!isSignin ? "active" : ""}`}>
          {isSignin ? (
            <div className="form-box">
              <h2>Welcome Back 🌲</h2>

              <input
                type="text"
                placeholder="Email"
                name="username"
                value={signinData.username}
                onChange={handleSigninInput}
              />

              <input
                type="password"
                placeholder="Password"
                name="password"
                value={signinData.password}
                onChange={handleSigninInput}
              />

              <button className="submit-btn" onClick={signin}>
                Login
              </button>
            </div>
          ) : (
            <div className="form-box">
              <h2>Create Account 🌿</h2>

              <input
                type="text"
                placeholder="Full Name"
                name="fullname"
                value={signupData.fullname}
                onChange={handleSignupInput}
              />

              <input
                type="text"
                placeholder="Phone Number"
                name="phone"
                value={signupData.phone}
                onChange={handleSignupInput}
              />

              <input
                type="email"
                placeholder="Email"
                name="email"
                value={signupData.email}
                onChange={handleSignupInput}
              />

              <input
                type="password"
                placeholder="Password"
                name="password"
                value={signupData.password}
                onChange={handleSignupInput}
              />

              <input
                type="password"
                placeholder="Confirm Password"
                name="retypepassword"
                value={signupData.retypepassword}
                onChange={handleSignupInput}
              />

              <button className="submit-btn" onClick={signup}>
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      <ProgressBar isProgress={isProgress} />
    </div>
  );
};

export default App;