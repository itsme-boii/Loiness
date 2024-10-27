import { StyleSheet, Text, View, Image, ImageBackground, Dimensions } from "react-native";
import React from "react";
// import pattern from '../../assets/pattern.png'
import { button1 } from "../common/button";
const Welcome = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/app loading.png")}
        resizeMode="contain"
      >
        <View style={styles.container1}>
          <View style={{
            marginTop: Dimensions.get('window').height / 5.2,
            gap: 20,
          }}>
            <Text style={button1} onPress={() => navigation.navigate("Login")}>
              Login
            </Text>
            <Text style={button1} onPress={() => navigation.navigate("Signup")}>
              Signup
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    backgroundColor: "#202020",
  },
  head: {
    fontSize: 30,
    color: "#fff",
  },
  container1: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    marginTop: 40,
  },
  logo: {
    height: "20%",
    resizeMode: "contain",
    marginBottom: 50,
  },
});
