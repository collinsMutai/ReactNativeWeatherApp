// app.config.js
import "dotenv/config";

export default {
  expo: {
    name: "WeatherApp",
    slug: "weatherapp",
    version: "1.0.0",
    extra: {
      openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
    },
  },
};
