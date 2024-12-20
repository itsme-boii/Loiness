import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import Login from "./src/screens/Login";
import Signup from "./src/screens/Signup";
import Chats from "./src/screens/Chats";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Card from "./src/screens/TinderCards";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MyTabBar from "./src/screens/Navbar";
import Profile from "./src/screens/Profile";
import Matches from "./src/screens/MatchesScreen";
import Welcome from "./src/screens/Welcome";
import ChatRoom from "./src/screens/ChatRoom";
import { UserContextProvider, useUserContext } from "./src/context/userContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UserContextProvider>
          <NavigationContainer>
            <MainNavigator />
          </NavigationContainer>
        </UserContextProvider>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const MainNavigator = () => {
  const { isLoggedIn } = useUserContext();

  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="HomeTabs" options={{ headerShown: false }}>
            {() => (
              <Tab.Navigator tabBar={(props) => <MyTabBar {...props} />}>
                <Tab.Screen
                  name="Home"
                  component={Card}
                  options={{
                    headerStyle: {
                      backgroundColor: "black", // Background color of header
                      borderBottomWidth: 1, // Width of the bottom border
                      borderBottomColor: "white", // Change this to your desired background color
                    },
                    headerTintColor: "#fff",
                  }}
                />
                <Tab.Screen
                  name="Matches"
                  component={Matches}
                  options={{
                    headerStyle: {
                      backgroundColor: "black", // Background color of header
                      borderBottomWidth: 1, // Width of the bottom border
                      borderBottomColor: "white", // Change this to your desired background color
                    },
                    headerTintColor: "#fff",
                  }}
                />
                <Tab.Screen
                  name="Chats"
                  component={Chats}
                  options={{
                    headerStyle: {
                      backgroundColor: "black", // Background color of header
                      borderBottomWidth: 1, // Width of the bottom border
                      borderBottomColor: "white", // Change this to your desired background color
                    },
                    headerTintColor: "#fff",
                  }}
                />
                <Tab.Screen
                  name="Profile"
                  component={Profile}
                  options={{
                    headerStyle: {
                      backgroundColor: "black", // Background color of header
                      borderBottomWidth: 1, // Width of the bottom border
                      borderBottomColor: "white", // Change this to your desired background color
                    },
                    headerTintColor: "#fff",
                  }}
                />
              </Tab.Navigator>
            )}
          </Stack.Screen>
          {/* Add the ChatRoom screen to the Stack Navigator */}
          <Stack.Screen
            name="ChatRoom"
            component={ChatRoom}
            options={{ headerShown: true }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Welcome"
            component={Welcome}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={Signup}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Home" component={Card} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabButtonText: {
    textTransform: "uppercase",
  },
  iconMenu: {
    fontFamily: "tinderclone",
    height: 20,
    paddingBottom: 7,
  },
});
