import { StyleSheet, Text, View, Image, ScrollView, KeyboardAvoidingView, Platform, Modal, Button, TextInput, Pressable, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { useUserContext } from "../context/userContext";

const Profile = ({ navigation }) => {
    const [errormsg, setErrormsg] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [partnerName, setPartnerName] = useState('');
    const [partnerEmail, setPartnerEmail] = useState('');

    const { user, setUser, token } = useUserContext();

    useEffect(() => {
        console.log("from this it is", user);
    }, []);

    const invitePromPartner = async () => {
        try {
            const response = await axios.post(
                'https://lol-2eal.onrender.com/invitePromPartner',
                { partnerName, partnerEmail },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Alert.alert("Success", response.data.message);
            setPartnerName('');
            setPartnerEmail('');
            setModalVisible(false);
        } catch (error) {
            if (error.response) {
                console.error("Server response error:", error.response.data);
                Alert.alert("Error", error.response.data.message || "Failed to send invitation");
            } else if (error.request) {
                console.error("No response from server:", error.request);
                Alert.alert("Error", "No response from server");
            } else {
                console.error("Unexpected error:", error.message);
                Alert.alert("Error", "An unexpected error occurred");
            }
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 2 }} keyboardShouldPersistTaps="handled">
                <View style={styles.container}>
                    <View style={styles.notificationButtonContainer}>
                        <Button title="🔔" onPress={() => setNotificationVisible(true)} />
                    </View>

                    <View style={styles.container1}>
                        <View style={styles.profileCard}>
                            {JSON.parse(user)?.profile_image ? (
                                <Image 
                                    source={{ uri: JSON.parse(user)?.profile_image }} 
                                    style={styles.profilePic} 
                                    onError={() => setErrormsg('Failed to load profile image')}
                                />
                            ) : (
                                <Text style={styles.errormessage}>Upload a Profile Pic</Text>
                            )}
                            <Text style={styles.name}>{JSON.parse(user)?.email || 'N/A'}</Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Name</Text>
                                <Text style={styles.detailValue}>{JSON.parse(user)?.name || 'N/A'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Gender</Text>
                                <Text style={styles.detailValue}>{JSON.parse(user)?.gender || 'N/A'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Age</Text>
                                <Text style={styles.detailValue}>{JSON.parse(user)?.age || 'N/A'}</Text>
                            </View>

                            <Pressable
                                onPress={() => {
                                    AsyncStorage.clear();
                                    navigation.navigate("login");
                                }}
                            >
                                <Text>Log Out</Text>
                            </Pressable>
                        </View>
                        
                        <Button title="Invite to Prom" onPress={() => setModalVisible(true)} />
                    </View>

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
                            
                            <Button title="Send Invitation" onPress={invitePromPartner} />
                            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
                        </View>
                    </Modal>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={notificationVisible}
                        onRequestClose={() => setNotificationVisible(false)}
                    >
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Prom Requests</Text>
                            {notifications.length > 0 ? (
                                notifications.map((request) => (
                                    <View key={request.id} style={styles.requestItem}>
                                        <Text>{`Request from ${request.senderName}`}</Text>
                                        <Button title="Accept" onPress={() => acceptRequest(request.id)} />
                                        <Button title="Reject" onPress={() => rejectRequest(request.id)} color="red" />
                                    </View>
                                ))
                            ) : (
                                <Text>No new requests</Text>
                            )}
                            <Button title="Close" onPress={() => setNotificationVisible(false)} />
                        </View>
                    </Modal>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: "black",
        justifyContent:'center'
    },
    notificationButtonContainer: {
        position: 'absolute',
        top: 40, 
        right: 20,
        zIndex: 10,
    },
    container1: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    profileCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: '80%',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 4,
    },
    name: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
    },
    detailRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    detailLabel: {
        fontSize: 16,
        color: 'white',
    },
    detailValue: {
        fontSize: 16,
        color: 'white',
    },
    errormessage: {
        fontSize: 16,
        color: 'red',
        marginBottom: 10,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        display:'flex',
        marginTop:200,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        width: '80%',
        paddingHorizontal: 10,
    },
    requestItem: {
        marginBottom: 10,
        padding: 10,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
    },
});
