import {StyleSheet,Text,View,Image,TextInput,ScrollView,TouchableOpacity,SafeAreaView,Modal,Dimensions} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { button1 } from "../common/button";
import * as Yup from "yup";
import {errormessage,head1,input,link,link2,} from "../common/formcss";
import AgePicker from "./AgePicker";
import bag from "../../assets/app main bg.png"
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Formik } from "formik";

const { width, height } = Dimensions.get('window');

const Signup = ({ navigation }) => {
  const recaptchaRef = useRef();
  const [selectGender, setSelectGender] = useState();

  const [file, setFile] = useState(null);
  const [error, setError] = useState();
  const [uploadedHash, setUploadedHash] = useState([""]);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpData, setOtpData] = useState({ email: '', otp: '' });
  const openOtpModal = () => setOtpModalVisible(true);
  const closeOtpModal = () => setOtpModalVisible(false);


  const handleOtpSubmit = async () => {
    const email = fdata.email;
    const lowercasedEmail = email.toLowerCase();
    console.log("Email:", lowercasedEmail);
    console.log("OTP:", otpData.otp);
    const formData = new FormData();
    formData.append('email', lowercasedEmail); 
    formData.append('otp', otpData.otp);

    try {
      const response = await axios.post('http://10.105.51.160:3000/verify-otp', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
        },
      });
      console.log("respone is ",response.message)
      if (response.status === 200) {
        console.log("OTP verified successfully:", response.data);
        navigation.navigate("Login")
      } else {
        console.log("Error verifying OTP:", response.data);
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
    }
    closeOtpModal();
  };

  useEffect(() => {
    console.log(fdata);
  }, [fdata])
  const handleAcceptTerms = () => {
    setFdata((prev) => ({ ...prev, termsAccepted: true }));
    console.log("fdata is ", fdata)
    setModalVisible(false);
  };
  const [isUploading, setIsUploading] = useState({
    cover: false,
    profile: false,
  });
  const [isUploaded, setIsUploaded] = useState({
    cover: false,
    profile: false,
  });

  const [fdata, setFdata] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    PhoneNo: "",
    rollNo: "",
    gender: "",
    bio: "",
    profileImage1: "",
    profileImage2: "",
    year: "",
    hall: "",
    termsAccepted: true,
  });

  const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Required")
      .matches(/^[\w-\.]+@(iitkgp\.ac\.in|kgpian\.iitkgp\.ac\.in)$/, "Email must be from iitkgp.ac.in or kgpian.iitkgp.ac.in domain")
    ,
    password: Yup.string()
      .min(8, "Password too short")
      .required("Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Required"),
    PhoneNo: Yup.string()
      .length(10, "Phone number must be exactly 10 digits")
      .matches(/^\d+$/, "Phone number must be digits only")
      .required("Required"),
    year: Yup.number().required("Required"),
    hall: Yup.string().required("Required"),
    rollNo: Yup.string()
      .length(9, "Roll number must be exactly 9 characters")
      .required("Required"),
    gender: Yup.string().required("Required"),
    bio: Yup.string()
      .max(50, "Length very long max 50 characters")
      .required("Required"),
    profileImage1: Yup.string().required("Required"),
    profileImage2: Yup.string().required("Required"),
    termsAccepted: Yup.boolean()
      .oneOf([true], "You must accept the terms and conditions") // Validation for terms
      .required("Required")
  });



  useEffect(() => {
    if (uploadedHash.length === 2) {
      console.log("uploaded hasshes array are");
      setFdata((prevData) => ({
        ...prevData,
        profileImage1: `https://aquamarine-immense-unicorn-398.mypinata.cloud/ipfs/${uploadedHash[0]}`,
        profileImage2: `https://aquamarine-immense-unicorn-398.mypinata.cloud/ipfs/${uploadedHash[1]}`,
      }));
    }
  }, [uploadedHash]);
  const [errormsg, setErrormsg] = useState(null);

  const pickImage = async (imageType) => {

    const { status } = await ImagePicker.
      requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        `Sorry, we need camera
  roll permission to upload images.`
      );
    } else {
      const result = await ImagePicker.launchImageLibraryAsync();
      console.log("hello");

      if (!result.canceled) {
        console.log("result ", result.assets[0].uri);
        console.log("result.assets[0]", result.assets[0]);
        const fileUri = result.assets[0].uri; // Use the URI to send to backend
        const fileName = result.assets[0].fileName || 'image.jpg'; // Generate a name if none is provided
        console.log("uri is", fileUri)
        const formData = new FormData();
        formData.append('file', {
          uri: fileUri,
          name: fileName,
          type: 'image/jpeg', // Use appropriate MIME type
        });
        formData.append('fileUri', fileUri); // Send fileUri as well
        console.log("formdata is ", formData)
        try {
          const response = await axios.post('http:///10.105.51.160:4000/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          console.log('File uploaded successfully:', response.data.url);
          Alert.alert("Success", "Image uploaded successfully!");

        } catch (error) {
          alert('Error uploading image. Please try again.');
          console.log(error);
        }

        setError(null);
      }
    }
  };

  const uploadToPinata = async (fileUri) => {
    const pinataApiKey = "3e0881efdbdec9c61ac1";
    const pinataSecretKey =
      "1e135930632b53f1a7b8274b08b29d67980a738d97ca8510c709ba66a622f3ce";

    const response = await fetch(fileUri.uri);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri.uri,
      name: fileUri.fileName || `image_${Date.now()}.jpg`,
      type: fileUri.mimeType || "image/jpeg",
    });
    console.log("formdata in up is ", formData);

    try {
      console.log("FormData is", formData);
      const pinataResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretKey,
          },
        }
      );

      const ipfsHash = pinataResponse.data.IpfsHash;
      console.log("IPFS hash is", ipfsHash);
      return ipfsHash;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw error;
    }
  };

  const Sendtobackend = async () => {
    try {
      openOtpModal();
      // console.log("fdata to be sent:", JSON.stringify(fdata));
      // console.log("when sending to bakcned fdata is", fdata)
      const response = await fetch("http://10.105.51.160:3000/registerapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fdata),
      });
      // console.log("response is ", response)

      const data = await response.json();

      console.log(data);

      if (data.error === "Invalid Credentials") {
        setErrormsg("Invalid Credentials");
      } else if (data.message === "Email Already Exists") {
        alert(data.message);
        navigation.navigate("Login", { userdata: data.user });
      } else if (data.message === "User Registered Succesfully") {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        alert(data.message);
        navigation.navigate("Login", { userdata: data.user });
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrormsg("Failed to register. Please try again later.");
    }
  };

  const handleAgeChange = (selectedAge) => {
    console.log("selected age is ", selectedAge);
    setFdata({ ...fdata, year: selectedAge });
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Image style={styles.patternbg} source={bag} />


        <View style={styles.container1}>
          <View style={styles.s1}></View>
          <ScrollView style={styles.s2}>
            <Text style={head1}>Create a New Account</Text>
            <Text style={link2}>
              Already Registered?&nbsp;
              <Text style={link} onPress={() => navigation.navigate("Login")}>
                Login here
              </Text>
            </Text>
            {errormsg ? <Text style={errormessage}>{errormsg}</Text> : null}
            <View>
              <Formik
                initialValues={fdata}
                validationSchema={validationSchema}
                onSubmit={(values) => Sendtobackend(values)}
              >
                {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                  <>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                      style={input}
                      placeholder="Enter your Name"
                      onChangeText={(text) => {
                        setFieldValue("name", text);
                        setFdata((prev) => {
                          const updatedData = { ...prev, name: text };
                          console.log("Updated fdata after name change:", updatedData); // Log here
                          return updatedData;
                        });
                      }}
                      onBlur={handleBlur("name")}
                      value={values.name}
                    />
                    {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={input}
                      placeholder="Enter your Email"
                      onChangeText={(text) => {
                        setFieldValue("email", text);
                        setFdata((prev) => {
                          const updatedData = { ...prev, email: text };
                          console.log("Updated fdata after email change:", updatedData); // Log here
                          return updatedData;
                        });
                      }}
                      onBlur={handleBlur("email")}
                      value={values.email}
                    />
                    {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                      style={input}
                      placeholder="Enter your Password"
                      secureTextEntry
                      onChangeText={(text) => {
                        setFieldValue("password", text);
                        setFdata((prev) => {
                          const updatedData = { ...prev, password: text };
                          console.log("Updated fdata after email change:", updatedData); // Log here
                          return updatedData;
                        });
                      }}
                      onBlur={handleBlur("password")}
                      value={values.password}
                    />
                    {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                      style={input}
                      placeholder="Confirm your Password"
                      secureTextEntry
                      onChangeText={(text) => {
                        setFieldValue("confirmPassword", text);
                        setFdata((prev) => {
                          const updatedData = { ...prev, confirmPassword: text };
                          console.log("Updated fdata after email change:", updatedData); // Log here
                          return updatedData;
                        });
                      }}
                      onBlur={handleBlur("confirmPassword")}
                      value={values.confirmPassword}
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text style={styles.error}>{errors.confirmPassword}</Text>
                    )}

                    <Text style={styles.label}>Roll No</Text>
                    <TextInput
                      style={input}
                      placeholder="Enter Your Roll No"
                      onChangeText={(text) => {
                        setFieldValue("rollNo", text);
                        setFdata((prev) => {
                          const updatedData = { ...prev, rollNo: text };
                          console.log("Updated fdata after email change:", updatedData); // Log here
                          return updatedData;
                        });
                      }}
                      onBlur={handleBlur("rollNo")}
                      value={values.rollNo}
                    />
                    {touched.rollNo && errors.rollNo && <Text style={styles.error}>{errors.rollNo}</Text>}

                    <Text style={styles.label}>Year</Text>
                    <AgePicker onAgeChange={handleAgeChange} />
                    {touched.year && errors.year && <Text style={styles.error}>{errors.year}</Text>}

                    <Text style={styles.label}>Hall</Text>
                    <TextInput
                      style={input}
                      placeholder="Enter Your Hall"
                      onChangeText={(text) => {
                        setFieldValue("hall", text);
                        setFdata((prev) => {
                          const updatedData = { ...prev, hall: text };
                          console.log("Updated fdata after email change:", updatedData); // Log here
                          return updatedData;
                        });
                      }}
                      onBlur={handleBlur("hall")}
                      value={values.hall}
                    />
                    {touched.hall && errors.hall && <Text style={styles.error}>{errors.hall}</Text>}

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                      style={input}
                      placeholder="Enter Your Phone No"
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        setFieldValue("PhoneNo", text);
                        setFdata((prev) => {
                          const updatedData = { ...prev, PhoneNo: text };
                          console.log("Updated fdata after email change:", updatedData); // Log here
                          return updatedData;
                        });
                      }}
                      onBlur={handleBlur("PhoneNo")}
                      value={values.PhoneNo}
                    />
                    {touched.PhoneNo && errors.PhoneNo && <Text style={styles.error}>{errors.PhoneNo}</Text>}

                    <Text style={styles.label}>Gender</Text>
                    <Picker
                      selectedValue={selectGender}
                      onValueChange={(itemValue) => {
                        setSelectGender(itemValue);
                        setFieldValue("gender", itemValue);
                        setFdata((prev) => {
                          const updatedData = { ...prev, gender: itemValue };
                          console.log("Updated fdata after email change:", updatedData); // Log here
                          return updatedData;
                        });

                        setFdata({ ...fdata, gender: itemValue }); // Update fdata
                      }}
                      onBlur={handleBlur("gender")}
                      style={input}
                    >
                      <Picker.Item label="Select Gender" value="" />
                      <Picker.Item label="Male" value="Male" />
                      <Picker.Item label="Female" value="Female" />
                      <Picker.Item label="Other" value="Other" />
                    </Picker>
                    {touched.gender && errors.gender && <Text style={styles.error}>{errors.gender}</Text>}

                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                      style={input}
                      placeholder="Tell us about yourself"
                      onChangeText={(text) => {
                        setFieldValue("bio", text);
                        setFdata((prev) => {
                          const updatedData = { ...prev, bio: text };
                          console.log("Updated fdata after email change:", updatedData); // Log here
                          return updatedData;
                        });
                      }}
                      onBlur={handleBlur("bio")}
                      value={values.bio}
                      maxLength={50}
                    />
                    {touched.bio && errors.bio && <Text style={styles.error}>{errors.bio}</Text>}

                    {/* Upload Image Logic for both images */}
                    <Text style={styles.label}>Profile Image 1</Text>
                    <TouchableOpacity
                      style={{ ...styles.button, ...input }}
                      onPress={() => pickImage("profileImage1", setFieldValue)}
                    >
                      <Text style={styles.buttonText}>
                        {isUploading.profileImage1 ? "Uploading..." : "Upload Profile Image 1"}
                      </Text>
                    </TouchableOpacity>
                    {isUploaded.profileImage1 && <Text style={styles.success}>Image 1 uploaded!</Text>}
                    {touched.profileImage1 && errors.profileImage1 && (
                      <Text style={styles.error}>{errors.profileImage1}</Text>
                    )}

                    <Text style={styles.label}>Profile Image 2</Text>
                    <TouchableOpacity
                      style={{ ...styles.button, ...input }}
                      onPress={() => pickImage("profileImage2", setFieldValue)}
                    >
                      <Text style={styles.buttonText}>
                        {isUploading.profileImage2 ? "Uploading..." : "Upload Profile Image 2"}
                      </Text>
                    </TouchableOpacity>
                    {isUploaded.profileImage2 && <Text style={styles.success}>Image 2 uploaded!</Text>}
                    {touched.profileImage2 && errors.profileImage2 && (
                      <Text style={styles.error}>{errors.profileImage2}</Text>
                    )}

                    {/* Terms and Conditions Modal */}
                    <View style={styles.termsContainer}>
                      <Text style={styles.termsText}>
                        By signing up, you agree to our{" "}
                        <Text style={styles.termsLink} onPress={() => setModalVisible(true)}>
                          Terms and Conditions
                        </Text>
                      </Text>
                      {/* Modal for Terms and Conditions */}
                      <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                      >
                        <View style={styles.modalContainer}>
                          <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Terms and Conditions</Text>
                            <Text style={styles.modalText}>
                              I'm uploading my photo and making a profile with my consent, allowing Spring Fest to use it on the website for connection purposes.
                            </Text>
                            <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptTerms}>
                              <Text style={styles.buttonText}>Accept</Text>

                            </TouchableOpacity>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                              <Text style={styles.buttonText}>Close</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>


                    </View>
                    {touched.termsAccepted && errors.termsAccepted && (
                      <Text style={styles.error}>{errors.termsAccepted}</Text>
                    )}
                  </>
                )}
              </Formik>

            </View>

            <TouchableOpacity onPress={Sendtobackend}>
              <Text style={button1}>Otp</Text>
            </TouchableOpacity>

            {/* OTP Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={otpModalVisible}
              onRequestClose={closeOtpModal}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Verify Your Account</Text>

                  <Text style={styles.label}>OTP</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter OTP"
                    keyboardType="numeric"
                    onChangeText={(text) => setOtpData({ ...otpData, otp: text })}
                    value={otpData.otp}
                    placeholderTextColor="#A9A9A9"
                  />

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.acceptButton} onPress={handleOtpSubmit}>
                      <Text style={styles.buttonText}>Enter App</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={closeOtpModal}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    padding: 20,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  patternbg: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  checkbox: {
    marginLeft: 10,
  },
  container1: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "90%",
    width: "100%",
  },
  s1: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "10%",
  },
  small1: {
    color: "#fff",
    fontSize: 17,
  },
  h1: {
    fontSize: 30,
    color: "#fff",
  },
  s2: {
    display: "flex",
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    width: "80%",
    height: "65%",
    borderRadius: 30,
    padding: 20,
    marginBottom: 20,
    shadowColor: "black",
    shadowOffset: {
      width: 10,
      height: 12,
    },
    shadowOpacity: 1,
    shadowRadius: 7,
    elevation: 8,
  },
  termsText: {
    flex: 1,
    marginLeft: 20,
    marginTop: 20,
    fontWeight: "500"
  },
  formgroup: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginVertical: 90,
  },
  acceptButton: {
    backgroundColor: 'pink',
    borderRadius: 25, // This makes the button round
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10, // Space between buttons
  },
  closeButton: {
    backgroundColor: 'lightgray',
    borderRadius: 25, // This also makes the button round
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 17,
    color: "#000",
    marginLeft: 10,
    marginBottom: 5,
    fontWeight: "500"
  },
  input: {
    backgroundColor: "#ed0992",
    borderRadius: 30,
    padding: 10,
  },
  fp: {
    display: "flex",
    alignItems: "flex-end",
    marginHorizontal: 10,
    marginVertical: 5,
  },
  termsContainer: {
    padding: 16,
  },
  termsText: {
    fontSize: 16,
  },
  termsLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: width * 0.8, // Modal width is 80% of screen width
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    elevation: 10, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: 'blue', // Green color
    paddingVertical: 15,
    borderRadius: 5,
    marginRight: 10, // Margin between buttons
    alignItems: 'center',
  },
  closeButton: {
    flex: 1,
    backgroundColor: 'pink', // Red color
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
