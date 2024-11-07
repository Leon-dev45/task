import axios from 'axios';
import React, {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ImageBackground,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {API_KEY} from './constant/api';

function App(): React.JSX.Element {
  const [weatherDetails, setWeatherDetails] = useState<any>(null);
  const [search, setSearch] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [found, setFound] = useState<boolean>(true);
  const [location, setLocation] = useState<boolean>(false);

  // Refresh function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getLocation();
    setRefreshing(false);
  }, []);

  // Get User Permission
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Geolocation Permission',
          message: 'Can we access your location?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === 'granted') {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  //Changing search text function
  const searchText = (search: string) => {
    setSearch(search);
  };

  // Search weather from city
  const searchWeather = () => {
    axios
      .get(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${search}`,
      )
      .then(response => {
        setFound(true);
        setWeatherDetails(response['data']);
      })
      .catch(_ => setFound(false));
    setSearch('');
  };

  // Get User Location
  const getLocation = () => {
    const result = requestLocationPermission();
    result.then(res => {
      if (res) {
        setLocation(true);
        Geolocation.getCurrentPosition(
          position => {
            axios
              .get(
                `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${position['coords']['latitude']},${position['coords']['longitude']}`,
              )
              .then(response => {
                setFound(true);
                setWeatherDetails(response['data']);
              })
              .catch(_ => setFound(false));
          },
          error => {
            setLocation(false);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      }
    });
  };

  // Get location when starting the app
  useEffect(() => {
    getLocation();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <ImageBackground
          source={require('./assets/background.png')}
          style={styles.bg}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.search}
              placeholderTextColor={'white'}
              placeholder="Search a city..."
              onChangeText={search => searchText(search)}
              value={search}
            />
            <TouchableOpacity style={styles.searchbtn} onPress={searchWeather}>
              <Text style={{color: 'white', fontSize: 12}}>Search</Text>
            </TouchableOpacity>
          </View>
          {/* Check for fetched weather details */}
          {weatherDetails !== null || !found ? (
            // Check for location permission
            location ? (
              // Check if the api key is disabled or the user has inserted a country that is present in the api
              !found ? (
                <View style={{alignItems: 'center'}}>
                  <Text style={styles.country}>
                    The country was not found or the api has been disabled
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.country}>
                    {weatherDetails['location']['region']}
                  </Text>
                  <Text style={styles.temp}>
                    {weatherDetails['current']['temp_c']}°C
                  </Text>
                  <Text style={styles.weather}>
                    {weatherDetails['current']['condition']['text']}
                  </Text>
                </>
              )
            ) : (
              <View style={{alignItems: 'center'}}>
                <Text style={styles.country}>
                  Location permission not provided
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#48319D',
                    height: 50,
                    width: 150,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 10,
                    marginTop: 20,
                  }}
                  onPress={getLocation}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    Try again
                  </Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <ActivityIndicator
              size={'large'}
              color={'white'}
              style={{marginTop: 30}}
            />
          )}
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bg: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    marginTop: 90,
  },
  search: {
    width: '70%',
    height: '100%',
    backgroundColor: 'rgba(72, 49, 157, 0.75)',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    padding: 5,
    color: 'white',
  },
  searchbtn: {
    backgroundColor: 'rgb(72, 49, 157)',
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  country: {
    color: 'white',
    fontSize: 30,
    textAlign: 'center',
    marginTop: 20,
  },
  temp: {
    color: 'white',
    fontSize: 60,
    textAlign: 'center',
  },
  weather: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default App;
