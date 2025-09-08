import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from './../../apiCalls/auth';
import { toast } from 'react-hot-toast';
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../../redux/loaderSlice";
import { setUser } from "../../redux/usersSlice"; // ✅ Make sure to update Redux

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUserState] = React.useState({ email: '', password: '' });

  async function onFormSubmit(event) {
    event.preventDefault();
    try {
      dispatch(showLoader());
      const response = await loginUser(user);
      dispatch(hideLoader());

      if (response?.success) {
        toast.success(response.message);

        // Save token
        localStorage.setItem('token', response.token);

        // Update Redux
        dispatch(setUser(response.user));

        // Redirect to home
        navigate("/");
      } else {
        toast.error(response?.message || "Login failed");
      }
    } catch (error) {
      dispatch(hideLoader());
      console.error("Login Error:", error);

      // Proper error message for network/server issues
      toast.error(error?.response?.data?.message || "Network error: Unable to reach server");
    }
  }

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="container">
      <div className="container-back-img"></div>
      <div className="container-back-color"></div>
      <div className="card">
        <div className="card_title">
          <h1>Login Here</h1>
        </div>
        <div className="form">
          <form onSubmit={onFormSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={user.email}
              onChange={(e) => setUserState({ ...user, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={user.password}
              onChange={(e) => setUserState({ ...user, password: e.target.value })}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
        <div className="card_terms">
          <span>Don't have an account yet? <Link to="/signup">Signup Here</Link></span>
        </div>
      </div>
    </div>
  );
}

export default Login;
