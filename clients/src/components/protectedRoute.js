import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setAllUsers, setAllChats } from "../redux/usersSlice";
import { getLoggedUser, getAllUsers } from "../apiCalls/users";
import { getAllChats } from "../apiCalls/chat";
import toast from "react-hot-toast";
import { showLoader, hideLoader } from "../redux/loaderSlice";

function ProtectedRoute({ children }) {
  // ✅ CORRECTED: Access the user state from the correct key: state.user
  const user = useSelector((state) => state.user?.user); 
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(showLoader());

      // ✅ FIXED: Use Promise.all to fetch all data concurrently
      const [userResponse, allUsersResponse, chatsResponse] = await Promise.all([
        getLoggedUser(),
        getAllUsers(),
        getAllChats()
      ]);

      if (userResponse.success) {
        dispatch(setUser(userResponse.data));
      } else {
        toast.error(userResponse.message);
        localStorage.removeItem('token');
        navigate('/login');
        return; // Stop execution if user fetch fails
      }

      if (allUsersResponse.success) {
        dispatch(setAllUsers(allUsersResponse.data)); 
      }

      if (chatsResponse.success) {
        dispatch(setAllChats(chatsResponse.data));
      }

    } catch (error) {
      toast.error('An error occurred while fetching data.');
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      dispatch(hideLoader());
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getData();
    } else {
      navigate('/login');
    }
  }, []);

  // ✅ FIXED: Only render children if a user object exists
  return <div>{user && children}</div>; 
}

export default ProtectedRoute;