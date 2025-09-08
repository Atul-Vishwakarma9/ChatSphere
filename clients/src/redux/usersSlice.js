import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
    name: 'user',
    initialState: { 
        user: null, 
        // IMPORTANT: Renamed 'allUsers' to 'users' to be consistent with the data
        // key returned by the API and used in other components like `protectedRoute.js`.
        users: [],
        allChats: [],
        selectedChat: null
    },
    reducers: {
        setUser: (state, action) => { state.user = action.payload; },
        setAllUsers: (state, action) => { state.users = action.payload; },
        setAllChats: (state, action) => { state.allChats = action.payload; },
        setSelectedChat: (state, action) => { state.selectedChat = action.payload; }
    }
});

export const { setUser, setAllUsers, setAllChats, setSelectedChat} = usersSlice.actions;
export default usersSlice.reducer;
