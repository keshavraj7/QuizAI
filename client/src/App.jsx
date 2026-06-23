import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import JoinTest from "./pages/JoinTest";
import Dashboard from "./pages/Dashboard";
import CreateTest from "./pages/CreateTest";
import QuizPage from "./pages/QuizPage";
import Leaderboard from "./pages/Leaderboard";
import Room from "./pages/Room";
import RoomQuiz from "./pages/RoomQuiz";
import RoomLeaderboard from "./pages/RoomLeaderboard";
import ProtectedRoute
from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Analysis from "./pages/Analysis";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
 <Route
  path="/create-test"
  element={
    <ProtectedRoute>
      <CreateTest />
    </ProtectedRoute>
  }
/>

<Route
  path="/join-test"
  element={
    <ProtectedRoute>
      <JoinTest />
    </ProtectedRoute>
  }
/>
       <Route
  path="/room/:roomCode"
  element={
    <ProtectedRoute>
      <Room />
    </ProtectedRoute>
  }
/>

<Route
  path="/quiz/:id"
  element={
    <ProtectedRoute>
      <QuizPage />
    </ProtectedRoute>
  }
/>
<Route
 path="/room/:roomCode/quiz"
 element={<ProtectedRoute><RoomQuiz /></ProtectedRoute>}
/>

<Route
 path="/room/:roomCode/leaderboard"
 element={<ProtectedRoute><RoomLeaderboard /></ProtectedRoute>}
/>
<Route
  path="/room/:roomCode/analysis"
  element={<ProtectedRoute><Analysis /></ProtectedRoute>}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;