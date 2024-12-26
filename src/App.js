import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login/Login";
import Home from "./components/Home/Home";

import Penjahit from "./components/Jahit/Penjahit";
import Spk from "./components/Jahit/Spk";
import Layout from "./components/Layout/Layout";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rute tanpa sidebar */}
        <Route path="/" element={<Login />} />

       {/* Rute dengan Layout (sidebar) */}
       <Route path="/" element={<Layout />}>
          <Route path="home" element={<Home />} />
          <Route path="penjahit" element={<Penjahit />} />
          <Route path="spk" element={<Spk />} />
          </Route>
        
      </Routes>
    </Router>
  );
};

export default App;
