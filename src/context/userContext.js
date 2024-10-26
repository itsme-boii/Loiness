import React, { createContext, useContext, useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
	const [user, setUser] = React.useState(null);
	const [isLoggedIn, setIsLoggedIn] = React.useState(false);
	const [token,setToken] = React.useState(null);

	useEffect(() => {
		AsyncStorage.getItem("user").then((data) => {

			console.log("user data from context: ", data);
			if (data) {
				setUser(data);
				setIsLoggedIn(true);
			}
		});

		AsyncStorage.getItem("token").then((data)=>{
			console.log("token data from context");
			if(data){
				setToken(data);
			}
		})
	}, [user,token]);

	return (
		<UserContext.Provider
			value={{
				user,
				setUser,
				isLoggedIn,
				token,
				setToken,
				setIsLoggedIn,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export { UserContext, UserContextProvider };

export const useUserContext = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUserContext must be used within an UserProvider");
	}
	return context;
};