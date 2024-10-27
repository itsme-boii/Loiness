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
  
      console.log("The prom requests are: ", response.data.promRequests);
  
      if (Array.isArray(response.data.promRequests)) {
        setPromRequests(response.data.promRequests); 
      } else {
        console.error("Expected an array of prom requests");
      }
    } catch (error) {
      console.error("Error fetching prom requests:", error);
    }
  }, [userId, token]);  

  useEffect(() => {
    fetchPromRequests();
    const interval = setInterval(() => {
      fetchPromRequests();
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
      fetchPromRequests();
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
      fetchPromRequests();
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
                <Text style={styles.detailLabel}>Roll_No</Text>
                <Text style={styles.detailValue}>
                  {JSON.parse(user)?.rollNo || "N/A"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone_No</Text>
                <Text style={styles.detailValue}>
                  {JSON.parse(user)?.phoneNo || "N/A"}
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
                <TouchableOpacity
              style={styles.inviteButton1}
              onPress={inviteToProm}
            >
              <Text style={styles.inviteButtonText1}>Invite to Prom</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inviteButton2}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.inviteButtonText2}>Cancel</Text>
            </TouchableOpacity>
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
    justifyContent: "center",
    alignContent: "center",
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
    marginBottom:10
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
    backgroundColor: "rgba(255, 255, 255, 0.5)",
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
    fontSize: 15,
    fontWeight: "bold",
    color: "black",
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
    color: "black",
  },
  detailValue: {
    fontSize: 16,
    color: "black",
  },
  errormessage: {
    fontSize: 16,
    color: "red",
    marginBottom: 10,
  },
  modalView: {
    margin: 20,
    backgroundColor: "rgba(255, 255, 255, 0.99)",
    marginTop: 200,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingBottom: 20,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 21,
    fontWeight: "bold",
  },
  input: {
    height: 45,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 18,
    width: "100%",
    paddingHorizontal: 10,
    borderRadius:8
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
  inviteButton1: {
    backgroundColor: "#ed0992",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical:0,
  },
  inviteButtonText1: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  inviteButton2: {
    backgroundColor: "red",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  inviteButtonText2: {
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
