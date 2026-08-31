const fs = require('fs');
let content = fs.readFileSync('src/components/Desktop.tsx', 'utf8');

const weatherMapCode = `
    const fetchWeather = async () => {
      try {
        const ipRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const ipData = await ipRes.json();
        const weatherRes = await fetch(\`https://api.open-meteo.com/v1/forecast?latitude=\${ipData.latitude}&longitude=\${ipData.longitude}&current_weather=true&temperature_unit=fahrenheit\`);
        const data = await weatherRes.json();
        
        const wmoMap: Record<number, string> = {
          0: 'Clear sky',
          1: 'Mainly clear',
          2: 'Partly cloudy',
          3: 'Overcast',
          45: 'Fog',
          48: 'Depositing rime fog',
          51: 'Light Drizzle',
          53: 'Moderate Drizzle',
          55: 'Dense Drizzle',
          56: 'Light Freezing Drizzle',
          57: 'Dense Freezing Drizzle',
          61: 'Slight Rain',
          63: 'Moderate Rain',
          65: 'Heavy Rain',
          66: 'Light Freezing Rain',
          67: 'Heavy Freezing Rain',
          71: 'Slight Snow',
          73: 'Moderate Snow',
          75: 'Heavy Snow',
          77: 'Snow grains',
          80: 'Slight Rain Showers',
          81: 'Moderate Rain Showers',
          82: 'Violent Rain Showers',
          85: 'Slight Snow Showers',
          86: 'Heavy Snow Showers',
          95: 'Thunderstorm',
          96: 'Thunderstorm with Hail',
          99: 'Thunderstorm with Heavy Hail'
        };

        setWeather({
          temp: Math.round(data.current_weather.temperature),
          condition: wmoMap[data.current_weather.weathercode] || 'Unknown'
        });
      } catch (e) {
        console.error(e);
        setWeather({ temp: 72, condition: "Partly cloudy" });
      }
    };
`;

content = content.replace(/const fetchWeather = async \(\) => \{[\s\S]*?fetchWeather\(\);/m, weatherMapCode.trim() + '\n    fetchWeather();');

fs.writeFileSync('src/components/Desktop.tsx', content);
