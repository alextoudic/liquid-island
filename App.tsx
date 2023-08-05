import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Profile from "./Profile";

const App = () => (
  <SafeAreaProvider>
    <Profile />
    <StatusBar style="auto" />
  </SafeAreaProvider>
);

export default App;
