//StAuth10244: I Sami Nachwati, 000879289 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TextInput, Dimensions, Button, Share, Alert, Linking, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import Checkbox from 'expo-checkbox';
import { restaurants } from './restaurants';

export default function App() {
  
  
    // useState variables
  const [markerArray, setMarkerArray] = useState([]);
  const [requestOn, setRequestOn] = useState(false);
  const [checkedStars, setCheckedStars] = useState({
    upToThree: false,
    threeToFour: false,
    fourToFive: false
  });
  const [favorites, setFavorites] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('All'); 



  // Function used to toggle the restaurants
  const toggleRestaurants = () => {
    setRequestOn(!requestOn);
    if (!requestOn) {
      createMarkers();
    } else {
      setMarkerArray([]);
    }
  }


  // function used to open the link from the user 
  const handleOpenURL = async (url) => {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert("Can't open this URL:", url);
  }
};



  // function used to create the markers on the map
  const createMarkers = (checkboxState = checkedStars) => {
    let arr = [];
    let anyChecked = Object.values(checkboxState).some(status => status);
    restaurants.forEach(restaurant => {
      const starRating = restaurant.star_count;
      let shouldDisplay = false;

      if (checkboxState.upToThree && starRating <= 3) {
        shouldDisplay = true;
      } else if (checkboxState.threeToFour && starRating > 3 && starRating <= 4) {
        shouldDisplay = true;
      } else if (checkboxState.fourToFive && starRating > 4 && starRating <= 5) {
        shouldDisplay = true;
      }

      if ((shouldDisplay || !anyChecked) && restaurant.name.toLowerCase().includes(searchText.toLowerCase()) && (selectedCategory === 'All' || restaurant.category_name.toLowerCase().includes(selectedCategory.toLowerCase()))) {
        arr.push({
          latAndLng: {
            latitude: parseFloat(restaurant.lat),
            longitude: parseFloat(restaurant.lng)
          },
          name: restaurant.name,
          address: restaurant.address,
          url: restaurant.url,
          email: restaurant.email,
          phone: restaurant.phone,
          category: restaurant.category_name,
          stars: starRating,
          pinColor: '#E75480'
        });
      }
    });

    setMarkerArray(arr);
  }


  // load the markers right away
  useEffect(() => {
    createMarkers();
  }, [searchText, checkedStars, selectedCategory]);


  // ensure specific markers show based on the checkbox selection
  const handleCheckboxChange = (range) => {
    setCheckedStars(prevState => ({
      ...prevState,
      [range]: !prevState[range]
    }));
  }


 // handle the search from the user
  const handleSearchChange = (text) => {
    setSearchText(text);
  }


 // clear all the favorited restaurants
  const clearFavorites = () => {
    setFavorites([]);
  };


 // function used to toggle a favorite restaurant
  const toggleFavorites = (restaurant) => {
    const index = favorites.findIndex(fav => fav.name === restaurant.name);
    if (index >= 0) {
      setFavorites(favorites.filter(fav => fav.name !== restaurant.name));
    } else {
      setFavorites([...favorites, restaurant]);
    }
  };


  // method used to share the selected restaurant with others
  const shareRestaurant = async (restaurant) => {
    try {
      await Share.share({
        message: `Check out this place: ${restaurant.name}, located at ${restaurant.address}. More info here: ${restaurant.url || "No URL provided"}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share at this time.');
    }
  };


  // an alert used to show options to the user with sharing, favoriting, or cancelling out.
  const showAlert = (markerItem) => {
    Alert.alert(
      markerItem.name,
      `Details:\n${markerItem.address}\n${markerItem.phone || 'No phone number'}\n${markerItem.email || 'No email'}`,
      [
        { text: "Share", onPress: () => shareRestaurant(markerItem) },
        { text: favorites.some(fav => fav.name === markerItem.name) ? "Remove from Favorites" : "Add to Favorites", onPress: () => toggleFavorites(markerItem) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };



  // return sequence of web elements
  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={{ latitude: 43.2557, longitude: -79.8711, latitudeDelta: 0.30, longitudeDelta: 0.30 }}>
        {markerArray.map((markerItem, index) => (
          <Marker 
            key={index} 
            coordinate={markerItem.latAndLng} 
            title={markerItem.name} 
            description={markerItem.address} 
            pinColor={markerItem.pinColor}
          >
            <Callout onPress={() => showAlert(markerItem)}>
              <View style={styles.calloutView}>
                <Text style={styles.calloutTitle}>{markerItem.name}</Text>
                <Text style={styles.calloutDescription}>{markerItem.address}</Text>
                <Text style={styles.calloutStarRating}>Stars: {markerItem.stars}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <View style={styles.options}>
        <TouchableHighlight onPress={toggleRestaurants} underlayColor="white" style={styles.button}>
          <View>
            <Text style={styles.text}>RESTAURANTS</Text>
          </View>
        </TouchableHighlight>
        <TextInput
          placeholder="Restaurant Name..."
          placeholderTextColor='orange'
          style={styles.input}
          onChangeText={handleSearchChange}
          value={searchText}
        />
      </View>
      <View style={styles.checkboxContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Checkbox
            value={checkedStars.upToThree}
            onValueChange={() => handleCheckboxChange('upToThree')}
            color={checkedStars.upToThree ? '#4630EB' : undefined}
          />
          <Text style={{ marginLeft: 8 }}>Up to 3 stars</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Checkbox
            value={checkedStars.threeToFour}
            onValueChange={() => handleCheckboxChange('threeToFour')}
            color={checkedStars.threeToFour ? '#4630EB' : undefined}
          />
          <Text style={{ marginLeft: 8 }}>3 to 4 stars</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Checkbox
            value={checkedStars.fourToFive}
            onValueChange={() => handleCheckboxChange('fourToFive')}
            color={checkedStars.fourToFive ? '#4630EB' : undefined}
          />
          <Text style={{ marginLeft: 8 }}>4 to 5 stars</Text>
        </View>
      </View>
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryText}>Category:</Text>
        <View style={styles.categoryButtons}>
          <Button
            title="All"
            onPress={() => setSelectedCategory('All')}
            color={selectedCategory === 'All' ? '#4630EB' : undefined}
          />
          <Button
            title="Cafe"
            onPress={() => setSelectedCategory('Cafe')}
            color={selectedCategory === 'Cafe' ? '#4630EB' : undefined}
          />
          <Button
            title="Bar"
            onPress={() => setSelectedCategory('Bar')}
            color={selectedCategory === 'Bar' ? '#4630EB' : undefined}
          />
          <Button
            title="Restaurant"
            onPress={() => setSelectedCategory('Restaurant')}
            color={selectedCategory === 'Restaurant' ? '#4630EB' : undefined}
          />
        </View>
      </View>
        <View style={styles.favoritesContainer}>
          <View style={styles.favlist}>
            <Text style={styles.favoritesTitle}>My Favorite Restaurants</Text>
            <Button
                title="Clear All"
                onPress={clearFavorites}
                color="red"
                style={styles.clearButton}
            />
          </View>
          {favorites.map((item, index) => (
            <View style={styles.favitem}>
              <Text key={index} style={styles.itemName}>{item.name}</Text>
              <TouchableOpacity onPress={() => handleOpenURL(item.url)}>
                <Text style={styles.itemUrl}> Visit Site </Text>
              </TouchableOpacity>

            </View>
          ))}
        </View>
    </View>
  );
}



// styling of the web elements
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'beige' 
  },
  map: {
    width: Dimensions.get('window').width,
    height: '40%'
  },
  options: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  button: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'orange',
    marginRight: 10, 
  },
  text: {
    color: 'white'
  },
  input: {
    flex: 1, 
    padding: 10,
    backgroundColor: 'white',
    borderColor: 'orange',
    borderRadius: 20,
    borderWidth: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    paddingVertical: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  categoryText: {
    fontSize: 17,
    marginRight: 10,
  },
  categoryButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calloutView: {
    width: 200, 
    height: 'auto',
    paddingHorizontal: 10, 
    paddingVertical: 5,
    borderRadius: 10,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  calloutDescription: {
    fontSize: 14,
  },
  calloutStarRating: {
    fontSize: 14,
    color: 'orange',
    marginTop: 5,
  },
   favoritesContainer: {
    marginTop: 10, 
    margin: 10,
    alignItems: 'center'
  },
  favoritesTitle: {
    fontSize: 17,
  },
  favitem: {
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start', 
    width: '100%', 
    gap: 20
  },

  itemUrl: {
    color: 'blue'
  },

  clearButton: {
  backgroundColor: 'red', 
  color: 'white', 
  },

  favlist: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%', 
    marginBottom: 10, 
  }



});
