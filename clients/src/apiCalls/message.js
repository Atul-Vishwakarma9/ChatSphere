// import { axiosInstance } from ".";

// export const createNewMessage = async (message) => {
//     try{
//         const response = await axiosInstance.post("api/message/new-message", message);
//         return response.data;
//     }catch(error){
//         return error;

//     }
// }
// export const getAllMessages = async (chatId) => {
//     try{
//         const response = await axiosInstance.get(`api/message/get-all-messages/${chatId}`);
//         return response.data;
//     }catch(error){
//         return error;

//     }
// }

import { axiosInstance ,url } from './index';

export const createNewMessage = async (message) => {
  try {
    const response = await axiosInstance.post(url + "/api/message/new-message", message);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

export const getAllMessages = async (chatId) => {
  try {
    const response = await axiosInstance.get(url + `/api/message/get-all-messages/${chatId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};
