import { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Platform,
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { BlurView } from "@react-native-community/blur";
import axios from "axios";

export default function WeatherView() {
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentWeatherFocust, setCurrentWeatherFocust] = useState<{
    city_name: string;
    temp: number;
    app_temp: number;
    weather: { icon: string; description: string };
    rh: number;
    wind_spd: number;
    datetime: string;
  } | null>(null);
  const [weeklyForecast, setWeeklyForecast] = useState<
    | {
        valid_date: string;
        temp: number;
        weather: { icon: string };
        max_temp: number;
        min_temp: number;
      }[]
    | null
  >(null);
  const [hourlyForecast, setHourlyForecast] = useState<
    { timestamp_local: string; temp: number; weather: { icon: string } }[]
  >([]);
  const [errorFetching, setErrorFetching] = useState(false);
  const [loading, setLoading] = useState(true);

  // get users location permission
  useEffect(() => {
    setLoading(true);
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg(
          "Location Permission is needed in order for the app to function accurately"
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      setUserLocation(location);
    })();
  }, []);

  // fetches weather when user location is set
  useEffect(() => {
    if (userLocation) {
      getWeatherFocus();
    } else {
      setErrorFetching(true);
      setLoading(false);
      setErrorMsg("Error getting location, please try again");
    }
  }, [userLocation]);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (userLocation) {
    text = JSON.stringify(userLocation);
  }

  //Gets current and 16 day weather focust
  const getWeatherFocus = async () => {
    setLoading(true);
    try {
      if (!userLocation) {
        throw new Error("Error getting location, please try again");
      }

      console.log("User location: ", userLocation);

      const currentWeatherLocation = await axios.put(
        "http://192.168.0.182:3001/insertSearchTerm",
        {
          searchTerm:
            userLocation?.coords.latitude +
            "," +
            userLocation?.coords.longitude,
        }
      );
      if (!currentWeatherLocation) {
        throw new Error("Error getting weather location, please try again");
      }

      console.log(
        "Hourly Forecast: ",
        currentWeatherLocation.data.dailyForecastData.data
      );

      setCurrentWeatherFocust(
        currentWeatherLocation.data.dailyForecastData.data[0]
      );
      setWeeklyForecast(
        currentWeatherLocation.data.sixteenDayForecastData.data
      );

      setHourlyForecast(currentWeatherLocation.data.hourlyForecastData.data);
      setErrorFetching(false);
      setLoading(false);
    } catch (error) {
      setErrorFetching(true);
      setLoading(false);
      console.error("Error fetching: ", error);
    }
  };

  const dateFormatter = (date: string) => {
    // Adjust the date format to a valid ISO 8601 format
    const isoDate = date.replace(":", "T") + ":00:00";
    const parsedDate = new Date(isoDate);
    if (isNaN(parsedDate.getTime())) {
      return "Invalid Date";
    }
    return parsedDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const WeeklydateFormatter = (date: string) => {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return "Invalid Date";
    }
    return parsedDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  //formats date time to only hours
  const timeFormatter = (date: string) => {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return "Invalid Time";
    }
    return parsedDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#485881",
      }}
    >
      {!loading ? (
        <View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "white",
              marginBottom: 5,
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              marginTop: 20,
              elevation: 20,
            }}
          >
            Weather Focust
          </Text>
          <View
            style={{
              borderBottomColor: "#333F5D",
              borderBottomWidth: 1,
              width: "100%",
              marginTop: 10,
            }}
          ></View>
          <FlatList
            data={[null]}
            renderItem={() => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 10,

                  borderRadius: 10,
                  marginHorizontal: 10,
                  paddingVertical: 15,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    marginHorizontal: 15,
                    marginTop: 20,
                  }}
                >
                  {currentWeatherFocust || errorFetching ? (
                    <View>
                      <View
                        style={{
                          backgroundColor: "#485881",
                          borderRadius: 20,
                          padding: 10,
                          elevation: 20,
                          shadowColor: "black",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              gap: 8,
                            }}
                          >
                            <Image
                              style={{ width: 25, height: 25 }}
                              tintColor={"white"}
                              source={require("../assets/images/location.png")}
                            />

                            <Text style={styles.cityName}>
                              {currentWeatherFocust?.city_name?.toUpperCase()}
                            </Text>
                          </View>
                          <View>
                            <Text
                              style={{
                                fontSize: 16,
                                color: "white",
                              }}
                            >
                              {dateFormatter(
                                currentWeatherFocust?.datetime || ""
                              )}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={{
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            shadowColor: "#000",
                            shadowOffset: {
                              width: 0,
                              height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 50,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                            }}
                          >
                            <Text style={styles.temperatureText}>
                              {currentWeatherFocust?.temp}°
                            </Text>
                            <Image
                              style={{ width: 100, height: 100 }}
                              source={{
                                uri: `https://www.weatherbit.io/static/img/icons/${currentWeatherFocust?.weather.icon}.png`,
                              }}
                            />
                          </View>
                          <Text
                            style={{
                              fontSize: 20,
                              color: "white",
                            }}
                          >
                            {currentWeatherFocust?.weather?.description}
                          </Text>
                          <View
                            style={{
                              borderBottomColor: "#333F5D",
                              borderBottomWidth: 1,
                              width: "100%",
                              marginTop: 25,
                            }}
                          ></View>
                          <Text style={{ fontSize: 20, color: "white" }}>
                            Feels like: {currentWeatherFocust?.app_temp}°
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 40,
                              marginTop: 25,
                            }}
                          >
                            {weeklyForecast && (
                              <View
                                style={{
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 8,
                                }}
                              >
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                  }}
                                >
                                  {/* <Imgae/> */}
                                  <Text
                                    style={{
                                      fontSize: 14,
                                      color: "white",
                                    }}
                                  >
                                    {weeklyForecast[0]?.max_temp}°
                                  </Text>
                                </View>

                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: "#aeb3bd",
                                  }}
                                >
                                  HI
                                </Text>
                              </View>
                            )}

                            {weeklyForecast && (
                              <View
                                style={{
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 8,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: "white",
                                  }}
                                >
                                  {weeklyForecast[0]?.min_temp}°
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: "#aeb3bd",
                                  }}
                                >
                                  Low
                                </Text>
                              </View>
                            )}

                            {currentWeatherFocust && (
                              <View
                                style={{
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 8,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: "white",
                                  }}
                                >
                                  {currentWeatherFocust.rh}%
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: "#aeb3bd",
                                  }}
                                >
                                  Humidity
                                </Text>
                              </View>
                            )}

                            {currentWeatherFocust && (
                              <View
                                style={{
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 8,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: "white",
                                  }}
                                >
                                  {currentWeatherFocust.wind_spd}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: "#aeb3bd",
                                  }}
                                >
                                  Wind Speed
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>

                      <View>
                        <View
                          style={{
                            alignItems: "center",
                            backgroundColor: "#485881",
                            borderRadius: 10,
                            padding: 10,
                            marginTop: 20,
                            elevation: 20,
                            flexDirection: "column",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 20,
                              fontWeight: "bold",
                              color: "white",
                              marginTop: 20,
                              marginBottom: 25,
                            }}
                          >
                            Hourly Weather Focust
                          </Text>
                          <FlatList
                            data={hourlyForecast?.slice(0, 24)}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item, index }) => (
                              <View
                                style={{
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  paddingHorizontal: 10,
                                  marginHorizontal: 10,
                                  paddingVertical: 15,
                                  elevation: 20,
                                }}
                              >
                                <View
                                  style={{
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      color: "white",
                                    }}
                                  >
                                    {index === 0
                                      ? "Now"
                                      : timeFormatter(
                                          item.timestamp_local || ""
                                        )}
                                  </Text>
                                  <Image
                                    style={{ width: 50, height: 50 }}
                                    source={{
                                      uri: `https://www.weatherbit.io/static/img/icons/${item.weather.icon}.png`,
                                    }}
                                  />
                                </View>
                                <Text
                                  style={{
                                    fontSize: 20,
                                    color: "white",
                                  }}
                                >
                                  {item.temp}°
                                </Text>
                              </View>
                            )}
                            keyExtractor={(item) => item.timestamp_local}
                          />
                        </View>
                      </View>

                      <View
                        style={{
                          alignItems: "center",
                          backgroundColor: "#485881",
                          borderRadius: 10,
                          marginTop: 20,
                          elevation: 20,
                          flexDirection: "column",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            color: "white",
                            marginTop: 20,
                            marginBottom: 25,
                            textAlign: "center",
                          }}
                        >
                          Weekly Weather Focust
                        </Text>
                        <FlatList
                          data={weeklyForecast}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          renderItem={({ item, index }) => (
                            <View
                              style={{
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingHorizontal: 10,
                                backgroundColor: "#485881",
                                borderRadius: 10,
                                marginHorizontal: 10,
                                paddingVertical: 15,
                                marginBottom: 50,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 6,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 16,
                                    color: "white",
                                  }}
                                >
                                  {index === 0
                                    ? "Today"
                                    : WeeklydateFormatter(
                                        item.valid_date || ""
                                      )}
                                </Text>
                                <Image
                                  style={{ width: 50, height: 50 }}
                                  source={{
                                    uri: `https://www.weatherbit.io/static/img/icons/${item.weather.icon}.png`,
                                  }}
                                />
                              </View>
                              <Text
                                style={{
                                  fontSize: 20,
                                  color: "white",
                                }}
                              >
                                {item.temp}°
                              </Text>
                            </View>
                          )}
                          keyExtractor={(item) => item.valid_date}
                        />
                      </View>
                      <View style={{ marginBottom: 100 }}></View>
                    </View>
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "red",
                        }}
                      >
                        {text}
                        {errorFetching ? "Error fetching weather" : ""}
                      </Text>
                      <Pressable
                        onPress={() => {
                          getWeatherFocus();
                        }}
                        style={{
                          backgroundColor: "black",
                          paddingHorizontal: 20,
                          borderRadius: 10,
                          marginTop: 20,
                          paddingVertical: 10,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 20,
                          }}
                        >
                          Retry
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            )}
          />
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "white",
              marginTop: 20,
            }}
          >
            Getting Weather focust...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cityName: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  temperatureText: {
    fontSize: 60,
    fontWeight: "bold",
    color: "black",
  },
});
