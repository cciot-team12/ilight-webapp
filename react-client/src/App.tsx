import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import HomeScreen from "./screens/home/HomeScreen";

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <HomeScreen />
    </LocalizationProvider>
  );
}

export default App;
