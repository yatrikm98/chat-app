import "./App.css";
import { Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import ChatPage from "./Pages/ChatPage";
import { Toaster} from "./components/ui/toaster"
const App = () => {
  return (
    <div className="app">
      <Route path="/" component={HomePage} exact/>
      <Route path="/chats" component={ChatPage}/>
      <Toaster/>
    </div>
  )
};

export default App;
