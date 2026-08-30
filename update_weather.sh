#!/bin/bash
# Insert the weather state and effect into Desktop.tsx just after startOpen state
sed -i '/const \[startOpen, setStartOpen\] = useState(false);/a \  const [weather, setWeather] = useState<{ temp: number, condition: string } | null>(null);\n  useEffect(() => {\n    const fetchWeather = async () => {\n      try {\n        const response = await fetch("https://wttr.in/?format=j1");\n        const data = await response.json();\n        setWeather({\n          temp: parseInt(data.current_condition[0].temp_F),\n          condition: data.current_condition[0].weatherDesc[0].value\n        });\n      } catch (e) {\n        console.error(e);\n        setWeather({ temp: 84, condition: "Mostly Cloudy" });\n      }\n    };\n    fetchWeather();\n  }, []);' src/components/Desktop.tsx

# Replace the static Weather widget with the dynamic one
sed -i 's/<span className="text-\[11px\] font-semibold">72°F<\/span>/<span className="text-[11px] font-semibold">{weather ? `${weather.temp}°F` : `...`}<\/span>/' src/components/Desktop.tsx
sed -i 's/<span className="text-\[10px\] text-white\/70">Mostly Clear<\/span>/<span className="text-[10px] text-white\/70 truncate max-w-\[60px\]">{weather ? weather.condition : `Loading`}<\/span>/' src/components/Desktop.tsx
