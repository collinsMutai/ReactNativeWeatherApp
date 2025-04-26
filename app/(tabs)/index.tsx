import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Button,
  Keyboard,
  Image,
} from "react-native";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import Constants from "expo-constants";

export default function HomeScreen() {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [searching, setSearching] = useState(false);
  const [units, setUnits] = useState<"metric" | "imperial">("metric");

  const API_KEY = Constants.expoConfig?.extra?.openWeatherApiKey;

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      fetchWeatherByCoords(loc.coords.latitude, loc.coords.longitude);
    } catch (err) {
      setErrorMsg("Failed to get location");
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setSearching(true);
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`
      );
      const data = await res.json();
      console.log("data", data);
      setWeather(data);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg("Could not fetch weather");
    } finally {
      setSearching(false);
    }
  };

  const fetchWeatherByCity = async () => {
    if (!city.trim()) return;
    Keyboard.dismiss();
    try {
      setSearching(true);
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}`
      );
      const data = await res.json();
      console.log("data", data);

      if (data.cod !== 200) {
        setErrorMsg(`City not found: ${city}`);
        return;
      }
      setWeather(data);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg("Could not fetch weather for that city");
    } finally {
      setSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather App</Text>
      <TextInput
        placeholder="Enter city name"
        value={city}
        onChangeText={setCity}
        style={styles.input}
      />
      <Button
        title="Search"
        onPress={fetchWeatherByCity}
        disabled={searching}
      />
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
      {searching && <ActivityIndicator size="large" />}
      <Text style={{ marginTop: 20 }}>Units</Text>
      <Picker
        selectedValue={units}
        onValueChange={(itemValue) => {
          setUnits(itemValue);
          if (city) {
            fetchWeatherByCity();
          } else if (location) {
            fetchWeatherByCoords(location.latitude, location.longitude);
          }
        }}
        style={{ height: 50, width: "100%" }}
      >
        <Picker.Item label="Metric (°C)" value="metric" />
        <Picker.Item label="Imperial (°F)" value="imperial" />
      </Picker>

      {weather && !searching && (
        <View style={styles.weatherBox}>
          <Text style={styles.cityName}>{weather.name}</Text>
          <Text style={styles.temp}>
            {weather.main.temp}°{units === "metric" ? "C" : "F"}
          </Text>

          <Image
            source={{
              uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
            }}
            style={styles.weatherIcon}
          />
          <Text style={styles.desc}>{weather.weather[0].description}</Text>
          <Text style={styles.desc}>{weather.weather[0].main}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0F7FA",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  weatherBox: {
    marginTop: 30,
    alignItems: "center",
  },
  cityName: {
    fontSize: 24,
    fontWeight: "600",
  },
  temp: {
    fontSize: 48,
    fontWeight: "bold",
    marginVertical: 10,
  },
  desc: {
    fontSize: 16,
    fontStyle: "italic",
  },
  error: {
    marginTop: 10,
    color: "red",
    textAlign: "center",
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
});
