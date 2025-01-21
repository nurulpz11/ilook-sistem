import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login/Login";
import Home from "./components/Home/Home";
import Penjahit from "./components/Jahit/Penjahit";
import Spk from "./components/Jahit/Spk";
import Layout from "./components/Layout/Layout";
import SpkCmt from "./components/Jahit/SpkCmt";
import Pengiriman from "./components/Jahit/Pengiriman";
import Hutang from "./components/Jahit/Hutang";
import Cashbon from "./components/Jahit/Cashbon";
import Pendapatan from "./components/Jahit/Pendapatan";
import Deadline from "./components/Jahit/Deadline";

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
          <Route path="spkcmt" element={<SpkCmt />} />
          <Route path="pengiriman" element={<Pengiriman />} />
          <Route path="hutang" element={<Hutang />} />
          <Route path="cashbon" element={<Cashbon />} />
          <Route path="pendapatan" element={<Pendapatan />} />
          <Route path="deadline" element={<Deadline />} />
       </Route>
        
      </Routes>
    </Router>
  );
};

export default App;
