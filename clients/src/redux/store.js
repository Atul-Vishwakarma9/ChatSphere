import { configureStore } from "@reduxjs/toolkit";
import loaderReducer from './loaderSlice';
import userReducer from './usersSlice';

const store = configureStore({
    reducer: { 
        // IMPORTANT: Explicitly name the state keys for correct access.
        loader: loaderReducer, 
        user: userReducer 
    }
});

export default store;
