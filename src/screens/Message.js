import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Message = React.memo(({ message, isFromMe }) => {
  // Convert timestamp to a locale time string once when the component renders
  const formattedTime = new Date(message.timestamp).toLocaleTimeString();

  return (
      <View style={[styles.messageContainer, isFromMe ? styles.myMessage : styles.otherMessage]}>
          <Text style={styles.messageText}>{message.message}</Text>
          <Text style={styles.timestamp}>{formattedTime}</Text>
      </View>
  );
});

const styles = StyleSheet.create({
    messageContainer: {
        maxWidth: '70%',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6', // Light green
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#ECECEC', // Light grey
    },
    messageText: {
        fontSize: 16,
        color: '#000',
    },
    timestamp: {
        fontSize: 10,
        color: '#999',
        textAlign: 'right',
        marginTop: 5,
    },
});

export default Message;
