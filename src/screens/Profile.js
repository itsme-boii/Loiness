import {
  StyleSheet,
  Text,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  Modal,
  TextInput,
  Button,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useCallback, useState, useEffect } from "react";
import { useUserContext } from "../context/userContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const Profile = ({}) => {
  const [errormsg, setErrormsg] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [promRequests, setPromRequests] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigation = useNavigation();
  const { user, setUser, token, setToken } = useUserContext();

  //   const [allUsers, setAllUsers] = useState([]);

  const userId = JSON.parse(user)?.id;

  const fetchPromRequests = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://lol-2eal.onrender.com/promnight/check/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("the promrequest ARE: ", response.data.promRequests);

      setPromRequests(response.data.promRequests);
    } catch (error) {
      console.error("Error fetching prom requests:", error);
    }
  }, [userId, token]);

  //   const addNameToTheRequester = async () => {
  //     // use the response.data.data to get the user which has the id of requester_id in the promrequests and display the name of the user in the promrequests by creating a property called requester_name in the promrequests array

  //     for (let i = 0; i < promRequests.length; i++) {
  //       for (let j = 0; j < allUsers.length; j++) {
  //         if (promRequests[i].requester_id === allUsers[j].id) {
  //           promRequests[i].requester_name = allUsers[j].name;
  //         }
  //       }
  //     }
  //   };

  //   const getAllUsers = async () => {
  //     try {
  //       const response = await axios.get(
  //         "https://lol-2eal.onrender.com/getUsers",
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       console.log("the users ARE: ", response.data.data);

  //       setAllUsers(response.data.data);
  //     } catch (error) {
  //       console.error("Error fetching users:", error);
  //     }
  //   };

  useEffect(() => {
    fetchPromRequests();
    // getAllUsers();
    // addNameToTheRequester();
    const interval = setInterval(() => {
      fetchPromRequests();
      //   addNameToTheRequester();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchPromRequests]);

  const logout = async () => {
    try {
      await AsyncStorage.clear();
      setUser(null);
      setToken(null);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
      Alert.alert("Error", "Failed to log out");
    }
  };

  const inviteToProm = async () => {
    try {
      const response = await axios.post(
        "https://lol-2eal.onrender.com/invitePromPartner",
        { partnerName, partnerEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", response.data.message);
      setModalVisible(false);
    } catch (error) {
      console.error("Error inviting to prom:", error.response.data.message);
      Alert.alert("Error", "Failed to send invitation");
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      const response = await axios.post(
        "https://lol-2eal.onrender.com/acceptPromNight",
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", response.data.message);
      fetchPromRequests(); // Refresh the list of requests
    } catch (error) {
      console.error("Error accepting request:", error.response.data.message);
      Alert.alert("Error", "Failed to accept request");
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      const response = await axios.post(
        "https://lol-2eal.onrender.com/cancelPromNight",
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", response.data.message);
      fetchPromRequests(); // Refresh the list of requests
    } catch (error) {
      console.error("Error rejecting request:", error.response.data.message);
      Alert.alert("Error", "Failed to reject request");
    }
  };

  const NotificationBadge = ({ count }) =>
    count > 0 ? (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    ) : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ImageBackground
        source={require("../../assets/app main bg.png")}
        resizeMode="cover"
        style={{
          flex: 1,
        }}
      >
        <View style={styles.container}>
          {/* Notification Icon */}
          <TouchableOpacity
            style={styles.notificationContainer}
            onPress={() => setShowNotifications(!showNotifications)}
          >
            <Image
              source={require("../../assets/bell.png")}
              style={styles.notificationIcon}
            />
            <NotificationBadge count={promRequests.length} />
          </TouchableOpacity>

          {/* Notifications Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showNotifications}
            onRequestClose={() => setShowNotifications(false)}
          >
            <View style={styles.notificationModal}>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>Prom Requests</Text>
                {promRequests.length > 0 ? (
                  promRequests.map((request, index) => (
                    <View key={index} style={styles.requestItem}>
                      <Text style={styles.requestText}>
                        Request from: {request.requester_name}
                      </Text>
                      <View style={styles.requestButtons}>
                        <TouchableOpacity
                          style={[
                            styles.acceptButton,
                            { backgroundColor: "#ed0992" },
                          ]}
                          onPress={() => acceptRequest(request.id)}
                        >
                          <Text style={styles.acceptButtonText}>Accept</Text>
                        </TouchableOpacity>
                        <Button
                          title="Reject"
                          onPress={() => rejectRequest(request.id)}
                          color="red"
                        />
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noRequests}>No pending requests</Text>
                )}
                <Button
                  title="Close"
                  onPress={() => setShowNotifications(false)}
                />
              </View>
            </View>
          </Modal>

          <View style={styles.container1}>
            {/* Rest of your existing profile card code */}
            <View style={styles.profileCard}>
              {JSON.parse(user)?.profile_image ? (
                <Image
                  source={{ uri: JSON.parse(user)?.profile_image }}
                  style={styles.profilePic}
                  onError={() => setErrormsg("Failed to load profile image")}
                />
              ) : (
                <Text style={styles.errormessage}>Upload a Profile Pic</Text>
              )}
              <Text style={styles.name}>
                {JSON.parse(user)?.email || "N/A"}
              </Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={styles.detailValue}>
                  {JSON.parse(user)?.name || "N/A"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gender</Text>
                <Text style={styles.detailValue}>
                  {JSON.parse(user)?.gender || "N/A"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Age</Text>
                <Text style={styles.detailValue}>
                  {JSON.parse(user)?.age || "N/A"}
                </Text>
              </View>

              <Pressable onPress={logout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Log Out</Text>
              </Pressable>
            </View>

            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.inviteButtonText}>Invite to Prom</Text>
            </TouchableOpacity>

            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Invite to Prom Night</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Partner Name"
                  value={partnerName}
                  onChangeText={setPartnerName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Partner Email"
                  value={partnerEmail}
                  onChangeText={setPartnerEmail}
                  keyboardType="email-address"
                />
                <Button title="Send Invitation" onPress={inviteToProm} />
                <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
                  color="red"
                />
              </View>
            </Modal>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
  },
  container1: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1000,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    tintColor: "white",
  },
  notificationModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  notificationContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  requestItem: {
    marginVertical: 10,
  },
  requestText: {
    fontSize: 16,
  },
  requestButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  noRequests: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
  },
  badge: {
    position: "absolute",
    right: -4,
    top: -6,
    backgroundColor: "#ed0992",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  profileCard: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: "80%",
    borderRadius: 20,
    padding: 20,
    marginTop: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 15,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  detailRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: "white",
  },
  detailValue: {
    fontSize: 16,
    color: "white",
  },
  errormessage: {
    fontSize: 16,
    color: "red",
    marginBottom: 10,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    marginTop: 200,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    width: "80%",
    paddingHorizontal: 10,
  },
  logoutButton: {
    backgroundColor: "#9999ff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutText: {
    color: "white",
    fontSize: 18,
  },
  inviteButton: {
    backgroundColor: "#ed0992",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  inviteButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  acceptButton: {
    flex: 1,
    padding: 10,
    marginRight: 5,
    borderRadius: 5,
    alignItems: "center",
    maxWidth: 100,
  },
  acceptButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
