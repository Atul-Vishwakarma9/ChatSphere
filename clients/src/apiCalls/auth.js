// import { axiosInstance } from ".";

// export const signupUser = async (user) => {
//     try{
//         const response = await axiosInstance.post('api/auth/signup', user);
//         return response.data;
//     }catch(error){
//         return error;
//     }
// }

// export const loginUser = async (credentials) => {
//     try{
//         const response = await axiosInstance.post('api/auth/login', credentials);
//         return response.data;
//     }catch(error){
//         return error;
//     }
// }







import { axiosInstance, url } from './index';

export const signupUser = async (user) => {
  try {
    const response = await axiosInstance.post(url + "/api/auth/signup", user);
    return response.data; // { success, message }
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

export const loginUser = async (user) => {
  try {
    const response = await axiosInstance.post(url + "/api/auth/login", user);
    return response.data; // { success, message, user, token }
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};
