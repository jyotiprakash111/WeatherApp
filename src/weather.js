import React, { useState } from "react";
import axios from "axios";
import "./weather.css";

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const geoResponse = await axios.get(
        "http://api.openweathermap.org/geo/1.0/direct",
        {
          params: {
            q: city,
            limit: 1,
            appid: "ee8836ded686076fbbd4d0fe9945a62d",
          },
        }
      );

      if (geoResponse.data.length === 0) {
        alert("City not found");
        setLoading(false);
        return;
      }

      const { lat, lon } = geoResponse.data[0];

      const weatherResponse = await axios.get(
        "https://api.openweathermap.org/data/2.5/forecast",
        {
          params: {
            lat: lat,
            lon: lon,
            cnt: 40, // Fetch enough data points for 5 days
            units: "metric",
            appid: "ee8836ded686076fbbd4d0fe9945a62d",
          },
        }
      );

      // Filter data to show only 5 days starting from today's date
      const currentDate = new Date().setHours(0, 0, 0, 0);
      const fiveDaysData = weatherResponse.data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt * 1000).setHours(0, 0, 0, 0);
        return (
          forecastDate >= currentDate &&
          forecastDate <= currentDate + 4 * 24 * 60 * 60 * 1000
        );
      });

      // Group data by date
      const groupedData = fiveDaysData.reduce((acc, forecast) => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(forecast);
        return acc;
      }, {});

      setWeatherData(groupedData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
    setLoading(false);
  };

  return (
    <div>
      <header className="header-container">
        <div className='header-content'>
          <h1 style={{color:"#d35400"}}>Weather in your city</h1>
          <div className='search-container'>
            <input
              type='text'
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder='Enter city name'
            />
            <button onClick={handleSearch}>Search</button>
            {loading && <div className='loader'></div>}
          </div>
        </div>
      </header>
      
      {weatherData && (
        <div className='table-container'>
          {Object.keys(weatherData).map((date) => (
            <div key={date} className='table-item'>
              <table className='weather-table'>
                <tbody>
                  <tr>
                    <th colSpan="4">Date: {date}</th>
                  </tr>
                  <tr>
                    <th colSpan='4'>Temperature (°C)</th>
                  </tr>
                  <tr>
                    <td colSpan="2">Min</td>
                    <td colspan="2">Max</td>
                  </tr>
                  <tr>
                    {weatherData[date].map((forecast, index) => (
                      <React.Fragment key={index}>
                        {index === 0 && (
                          <>
                             <td colSpan="2">{forecast.main.temp_min}</td> 
                             <td colSpan="2">{forecast.main.temp_max}</td>
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </tr>
                  {weatherData[date].map((forecast, index) => (
                    <React.Fragment key={index}>
                      {index === 0 && (
                        <>
                          <tr>
                            <th colSpan='2'>Pressure</th>
                            <td>{forecast.main.pressure} hPa</td>
                          </tr>
                          <tr>
                            <th colSpan='2'>Humidity</th>
                            <td>{forecast.main.humidity} %</td>
                          </tr>
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
