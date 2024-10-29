import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import bag from "../../assets/Chatbg.png"

const ChatsScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [token, setToken] = useState("");

  const dummyImage =
    "https://i.pinimg.com/474x/34/f1/e0/34f1e0e0276239adc9c75c83b0478256.jpg"; // Dummy image URL
  const errorImage =
    "https://i.pinimg.com/736x/8d/03/f2/8d03f2be7f0f9b111b2a94558a099ca8.jpg"; // Error image URL

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Failed to load token from AsyncStorage", error);
      }
    };
    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchMatches();
    }
  }, [token]);

  const fetchMatches = async () => {
    try {
      const formattedToken = token.replace(/^"|"$/g, "");
      const response = await axios.get(
        "https://db-4twk.onrender.com/matches",
        {
          headers: { Authorization: `Bearer ${formattedToken}` },
        }
      );
      if (response.data && response.data.matches) {
        setMatches(response.data.matches);

        console.log("matches are: ", response.data.matches);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  const handleChatPress = (match) => {
    navigation.navigate("ChatRoom", { receiverId: match.id });
  };

  return (
    <ImageBackground
      source={bag}
      style={[
        styles.backgroundImage,
        {
          width: Dimensions.get("window").width,
          height: Dimensions.get("window").height,
        },
      ]}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {matches.length === 0 ? (
          <Text style={styles.noMatchesText}>Oops, no matches available</Text>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleChatPress(item)}
                style={styles.matchItem}
              >
                <Image
                  source={{ uri: item.profile_image }}
                  style={styles.matchImage}
                />
                <Text style={styles.matchName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    // paddingHorizontal: 10,
  },
  listContent: {
    paddingTop: Dimensions.get("window").height * 0.25,
  },
  noMatchesText: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
    marginTop: 20,
  },
  matchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.45)",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.32)",
  },
  matchImage: {
    width: 55,
    height: 55,
    borderRadius: 25,
    marginRight: 24,
    marginLeft: 30,
  },
  matchName: {
    fontSize: 21,
    color: "black",
    fontWeight: "semibold",
  },
});

export default ChatsScreen;
