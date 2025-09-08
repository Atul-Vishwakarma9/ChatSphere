import { useSelector, shallowEqual } from "react-redux";
import { useNavigate } from "react-router-dom";

function Header({ socket }) {
  const user = useSelector(state => state.user.user, shallowEqual);
  const navigate = useNavigate();

  function getFullname() {
    const fname = user?.firstname?.charAt(0).toUpperCase() + user?.firstname?.slice(1).toLowerCase();
    const lname = user?.lastname?.charAt(0).toUpperCase() + user?.lastname?.slice(1).toLowerCase();
    return `${fname} ${lname}`;
  }

  function getInitials() {
    const f = user?.firstname?.charAt(0)?.toUpperCase() || '';
    const l = user?.lastname?.charAt(0)?.toUpperCase() || '';
    return f + l;
  }

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    socket.emit('user-offline', user?._id);
  }

  return (
    <div className="app-header">
      <div className="app-logo">
        <i className="fa fa-comments" aria-hidden="true"></i>
        ChatSphere
      </div>
      <div className="app-user-profile">
        {user?.profilePic ? (
          <img src={user.profilePic} alt="profile-pic" className="logged-user-profile-pic" onClick={() => navigate('/profile')} />
        ) : (
          <div className="logged-user-profile-pic" onClick={() => navigate('/profile')}>
            {getInitials()}
          </div>
        )}
        <div className="logged-user-name">{getFullname()}</div>
        <button className="logout-button" onClick={logout}>
          <i className="fa fa-power-off"></i>
        </button>
      </div>
    </div>
  );
}

export default Header;
