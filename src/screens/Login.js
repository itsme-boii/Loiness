import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import bg from "../../assets/Background1.png";
import { button1 } from "../common/button";
import {
  errormessage,
  formgroup,
  head1,
  head2,
  input,
  label,
  link,
  link2,
} from "../common/formcss";
import bag from "../../assets/app main bg.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useUserContext } from "../context/userContext";

const Login = ({ navigation }) => {
  const [fdata, setFdata] = useState({
    email: "",
    password: "",
  });

  const [errormsg, setErrormsg] = useState(null);

  const { user, setUser, setToken } = useUserContext();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const token = await AsyncStorage.getItem("token");
      console.log("token is ", token);
    }
    fetchData();
  }, []);

  const Sendtobackend = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("user");
    console.log("token is ", token);
    if (fdata.email == "" || fdata.password == "") {
      setErrormsg("All fields are required");
      return;
    } else {
      fetch("https://lol-2eal.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fdata),
      })
        .then((res) => res.json())
        .then(async (data) => {
          console.log("it is in login In second case", data.token);

          if (data.error) {
            setErrormsg(data.error);
          } else {
            console.log("entering local storage");
            await AsyncStorage.setItem("token", JSON.stringify(data.token));
            const token = JSON.stringify(data.token);
            setToken(token);

            const formattedToken = token.replace(/^"|"$/g, "");
            alert("Logged in successfully");

            if (!user) {
              try {
                console.log("entering not user");
                const response = await axios.get(
                  "https://lol-2eal.onrender.com/user",
                  {
                    headers: {
                      Authorization: `Bearer ${formattedToken}`,
                    },
                  }
                );
                const data = response.data.data;
                console.log("data in !user is ", data);

                setUser(data);
                await AsyncStorage.setItem("user", JSON.stringify(data));

                console.log("done");
                console.log("user in context from login is ", user);
              } catch (error) {
                console.error("Error getting User", error);
              }
            } else {
              const response = await axios.get(
                "https://lol-2eal.onrender.com/user",
                {
                  headers: {
                    Authorization: `Bearer ${formattedToken}`,
                  },
                }
              );
              console.log("response  from login is", response.data.data);
              const data = response.data.data;
              console.log("data is ", data);
              const email = JSON.parse(user).email;
              console.log("user from api", data.email);
              if (email !== data.email) {
                console.log("yes we are fixing you ass");
                console.log("userResponse");
                setUser(JSON.stringify(data));
              } else {
                console.log("user is not set yet");
                console.log("user is set");
              }
            }
            if (user) console.log("navigating to home");
            navigation.navigate("Home");
          }

          setLoading(false);
        })
        .catch((error) => {
          console.error("Error during fetch:", error);
          setErrormsg("Failed to login. Please try again later.");
          setLoading(false);
        });
    }
  };
  return (
    <ImageBackground
      source={bag}
      resizeMode="cover"
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 2 }}
        >
          <View style={styles.container1}>
            <View style={styles.s2}>
              <View>
                <Text style={head1}>Login</Text>
                <Text style={head2}>Sign in to continue</Text>
                {errormsg ? <Text style={errormessage}>{errormsg}</Text> : null}
                <View style={formgroup}>
                  <Text style={label}>Email</Text>
                  <TextInput
                    style={input}
                    placeholder="Enter your email"
                    onPressIn={() => setErrormsg(null)}
                    onChangeText={(text) => setFdata({ ...fdata, email: text })}
                  />
                </View>
                <View style={formgroup}>
                  <Text style={label}>Password</Text>
                  <TextInput
                    style={input}
                    placeholder="Enter your password"
                    secureTextEntry={true}
                    onChangeText={(text) =>
                      setFdata({ ...fdata, password: text })
                    }
                    onPressIn={() => setErrormsg(null)}
                  />
                </View>
                {/* <View style={styles.fp}>
                  <Text style={link}>Forgot Password?</Text>
                </View> */}
                <Text style={button1} onPress={() => Sendtobackend()}>
                  {loading ? (
                    <ActivityIndicator size={18} color="white" />
                  ) : (
                    "Login"
                  )}
                </Text>
                <View style={link2}>
                  <Text style={{ textAlign: "center" }}>
                    Don't have an account?&nbsp;
                  </Text>
                  <Text
                    style={[link, { textAlign: "center" }]}
                    onPress={() => navigation.navigate("Signup")}
                  >
                    Create a new account
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: Dimensions.get("window").height * 1.2,
    display: "flex",
    flex: 1,
  },
  patternbg: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  container1: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  s1: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "20%",
  },
  small1: {
    color: "black",
    fontSize: 17,
  },
  h1: {
    fontSize: 30,
    color: "black",
  },
  s2: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    width: "80%",
    borderRadius: 30,
    padding: 20,
    paddingVertical: 50,
    marginTop: 80,
    shadowColor: "black",
    shadowOffset: {
      width: 10,
      height: 12,
    },
    shadowOpacity: 1,
    shadowRadius: 7,
    elevation: 8,
  },
  formgroup: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginVertical: 10,
  },
  label: {
    fontSize: 17,
    color: "#000",
    marginLeft: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#FFB0CC",
    borderRadius: 20,
    padding: 10,
  },
  fp: {
    display: "flex",
    alignItems: "flex-end",
    marginHorizontal: 10,
    marginVertical: 5,
  },
  logo: {
    height: 80,
    resizeMode: "contain",
  },
});
