import React, { useState, useMemo, useEffect } from 'react';
import { ImageBackground, Text, View, Button, Alert, TouchableOpacity,Image } from 'react-native';
import TinderCard from 'react-tinder-card';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import bg from "../../assets/Background1.png"
import { MoveVertical } from 'lucide-react';


const Card = () => {
  const [characters, setCharacters] = useState([]);
  const [lastDirection, setLastDirection] = useState();
  const [token, setToken] = useState(null);
  const alreadyRemoved = [];
  const childRefs = useMemo(() => Array(characters.length).fill(0).map(() => React.createRef()), [characters]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {

          setToken(JSON.parse(storedToken));
        }
      } catch (error) {
        console.error('Failed to load token from AsyncStorage', error);
      }
    };

    getToken();
  }, []);

  const fetchUsers = async () => {
    if (!token) return;
    try {

      console.log("token is ", token);

      const response = await axios.get(`http://10.105.51.160:3000/getUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      console.log("data is ", data);

      if (Array.isArray(data.data)) {
        const filteredData = data.data.filter(user => !alreadyRemoved.includes(user.id));
        setCharacters(filteredData);
      } else {
        Alert.alert('Error', 'Fetched data is not in the expected format.');
      }
    } catch (error) {
      console.error('Error fetching users', error);
      Alert.alert('Error', 'Failed to fetch users.');
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);


  const swiped = async (direction, nameToDelete) => {
    const characterId = characters.find(character => character.name === nameToDelete)?.id;
    console.log("chracterid is ", characterId);
    console.log("dirrection is ", direction)
    if (direction === 'right') {
      console.log("calling liked user")
      await likeUser(characterId);
    } else if (direction === 'left') {
      console.log("calling disliked user")
      await dislikeUser(characterId);
    }
    console.log('removing: ' + nameToDelete + ' to the ' + direction);
    setLastDirection(direction);
    alreadyRemoved.push(nameToDelete);
  };

  const outOfFrame = (name) => {
    console.log(name + ' left the screen!');
    setCharacters(prevCharacters => prevCharacters.filter(character => character.name !== name));
  };

  const swipe = (dir) => {
    const cardsLeft = characters.filter(person => !alreadyRemoved.includes(person.name));
    if (cardsLeft.length) {
      const toBeRemoved = cardsLeft[cardsLeft.length - 1].name;
      const index = characters.map(person => person.name).indexOf(toBeRemoved);
      alreadyRemoved.push(toBeRemoved);
      childRefs[index].current.swipe(dir);
    }
  };

  const likeUser = async (likedUserId) => {
    try {
      const response = await axios.post('http://10.105.51.160:3000/like', { likedUserId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("response is ", response)
      if(response.data === "It's a match!"){
      'It\'s a match!'
      } ;
    } catch (error) {
      console.error('Error liking user', error);
    }
  };

  const dislikeUser = async (dislikedUserId) => {
    try {
      await axios.post('http://10.105.51.160:3000/dislike', { dislikedUserId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error disliking user', error);
    }
  };

  return (
    <View style={styles.container}>
  <Text style={styles.header}></Text>
  
  {/* Conditionally render based on characters length */}
  {characters.length === 0 ? (
    // Show this text when all profiles have been seen
    <Text style={styles.infoText}>All profiles shown</Text>
  ) : (
    <>
      <View style={styles.cardContainer}>
        {characters.map((character, index) => (
          <TinderCard
            ref={childRefs[index]}
            key={character.id}
            onSwipe={(dir) => swiped(dir, character.name)}
            onCardLeftScreen={() => outOfFrame(character.name)}
            swipeRequirementType={'position'}
            swipeThreshold={60}
          >
            <View style={styles.card}>
              <ImageBackground>
                <Image 
                  source={{ uri: character.profile_image }} 
                  style={styles.cardImage} 
                  resizeMode="cover"
                />
                <View style={styles.infoText}>
                  <Text>
                    {/* Additional info can be added here if needed */}
                  </Text>
                </View>
                <Text style={styles.cardTitle}>{character.name}</Text>
              </ImageBackground>
            </View>
          </TinderCard>
        ))}
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => swipe('left')} style={styles.button}>
          <FontAwesome name="times" size={47} color="red" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => swipe('right')} style={styles.button}>
          <FontAwesome name="heart" size={47} color="green" />
        </TouchableOpacity>
      </View>
      {lastDirection && (
        <Text style={styles.infoText}>Swipe a card or press a button to get started!</Text>
      )}
    </>
  )}
</View>

  );
};

export default Card;

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height:'100%',
    backgroundColor:"black"
  },
  header: {
    color: '#000',
    fontSize: 30,
    marginBottom: -10,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 260,
    height: 300,
    
  },
  card: {
    position: 'absolute',
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 300,
    height: 300,
    shadowColor: 'yellow',
    shadowOpacity: 0.7,
    shadowRadius: 20,
    borderRadius: 20,
    borderWidth: 2,  // Add border width  // Set border color
    padding: 5,  // Add padding to create space for border
    resizeMode: 'cover'
  },
  cardImage: {
    width: '98%',  // Make the image smaller than the card
    height: '91%',  // Adjust height as well
    overflow: 'hidden',
    borderRadius: 20,  // Rounded corners for the image
    alignSelf: 'center',  // Center the image within the card
    justifyContent: 'center', 
    MoveVertical:20// Center the content vertically// Center the image within the card
  },
  
  cardTitle: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    margin: 10,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
},
  buttons: {
    margin: 20,
    zIndex: -100,
  },
  infoText: {
    height: 28,
    marginTop:25,
    justifyContent: 'center',
    display: 'flex',
    zIndex: -100,
    color:'white'
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '60%',
    marginTop: 10,
    gap: 130
  },
  patternbg: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  cardImageBackground: {
    flex: 1,  // Make the image background take the full space
    justifyContent: 'center',  // Center the content vertically
    alignItems: 'center',  // Center the content horizontally
  },
};
