import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Text, Platform, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import Message from './Message';
import EmojiPicker from './EmojiPicker';
import { useUserContext } from '../context/userContext';

const ChatRoom = ({ route }) => {
  const { receiverId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  const { user } = useUserContext();

  console.log("reciverid is",receiverId);

  // to get user data
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
        try {
            const [userData, storedToken] = await Promise.all([
                user,
                AsyncStorage.getItem('token')
            ]);
            console.log("User data:", userData);
            console.log("Stored token:", storedToken);

            if (!mounted) return;

            if (userData && storedToken) {
                const parsedUserData = JSON.parse(userData);
                const formattedToken = storedToken.replace(/^"|"$/g, '');
                console.log("Parsed user data:", parsedUserData.id);
                console.log("Formatted token:", formattedToken);

                setUserId(parsedUserData.id);
                setToken(formattedToken);

                initializeSocket(parsedUserData.id);

                await fetchMessages(formattedToken, parsedUserData.id);
            }
        } catch (error) {
            console.error('Initialization error:', error);
        }
    };

    initialize();

    return () => {
        mounted = false;
        socketRef.current?.disconnect();
        console.log("Socket disconnected");
    };
}, [receiverId]);


const initializeSocket = (currentUserId) => {
  if (socketRef.current) {
    console.log("disconnectingggggggggggg")
      socketRef.current.disconnect();
  }
  socketRef.current = io('http://10.105.51.160:3000', {
      transports: ['websocket'],
      query: { userId: currentUserId }
  });

  socketRef.current.on('connect', async () => {
      console.log("Socket connected");
      socketRef.current.emit('registerUser', currentUserId);
  });
 

  socketRef.current.on('receiveMessage', (newMessage) => {
      console.log("Received message:", newMessage);
      console.log("after send")
      
    
    //   setMessages(prevMessages => {
    //     // Check if message already exists to prevent duplicates
    //     if (prevMessages.some(msg => msg.id === newMessage.id)) {
    //         return prevMessages;
    //     }
    //     return [...prevMessages, newMessage];
    // });
    setMessages(prevMessages => [...prevMessages, newMessage])


      setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
  });

  socketRef.current.on('disconnect', () => {
      console.log("Socket disconnected");
  });
};


const fetchMessages = async (currentToken, currentUserId) => {
  try {
      const response = await fetch(`http://10.105.51.160:3000/messages/${receiverId}`, {
          headers: { Authorization: `Bearer ${currentToken}` },
      });
     

      const data = await response.json();
      if (data?.messages) {
        const processedMessages = data.messages.map(msg => ({
          ...msg,
          id: msg.id || `${msg.senderId}-${msg.timestamp}`,
          timestamp: new Date(msg.timestamp).toISOString() // Ensure timestamp is valid ISO string
      }));

          const sortedMessages = processedMessages.sort((a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          setMessages(sortedMessages);
          console.log("messeges from fetch is ",messages)

          setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
      }}
   catch (error) {
      console.error('Error fetching messages:', error);
  }
};

const sendMessage = async () => {
  if (!message.trim()) return;
  console.log("hello")

  const messageId = Date.now().toString();
  const timestamp = new Date().toISOString();
  console.log("timestam from pratyush ki gand is",timestamp)

  const newMessageData = {
      id: messageId,
      receiverId,
      message: message.trim(),
      senderId: userId,
      timestamp,
      isFromMe: true
  };
  console.log("newMessagedata is ",newMessageData)

  setMessages(prevMessages => {
     const updatedMessages = [...prevMessages, newMessageData];
     updatedMessages.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  return [...updatedMessages];
  });
  

  setMessage('');
 

  setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
  }, 100);

  try {
      const response = await fetch('http://10.105.51.160:3000/send-message', {
          method: 'POST',
          headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              receiverId,
              message: newMessageData.message,
              senderId: userId,
              timestamp
          }),
      });
      console.log("response.ok is",response.ok)

      if (response.ok) {
          console.log("Message sent to server");
          socketRef.current.emit('sendMessage', newMessageData);
          console.log("before send")
      } else {
          setMessages(prevMessages =>
              prevMessages.filter(msg => msg.id !== messageId)
          );
      }
  } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages =>
          prevMessages.filter(msg => msg.id !== messageId)
      );
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 90}
    >
      <ImageBackground
        style={styles.background}
        resizeMode="cover"
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Message 
              message={item} 
              isFromMe= {item.senderId === userId || item.sender_id===userId}
            />
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Text style={styles.emojiButton}>😊</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
        <EmojiPicker
          visible={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onEmojiSelect={(emoji) => setMessage(prev => prev + emoji)}
        />
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"black"
  },
  background: {
    flex: 1,
  },
  messagesList: {
    padding: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    backgroundColor: 'black', // Optional: slight transparency for input area
    borderTopWidth: 0,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 10,
    maxHeight: 100,
    backgroundColor: 'white',
  },
  sendButton: {
    backgroundColor: '#ed0992',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#A8A8A8',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emojiButton: {
    fontSize: 24,
  },
});

export default ChatRoom;
