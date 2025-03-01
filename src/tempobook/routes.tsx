import React from "react";
import { Routes, Route } from "react-router-dom";

const TempoRoutes = () => {
  return (
    <Routes>
      <Route path="*" element={<div>Tempo Routes</div>} />
    </Routes>
  );
};

export default TempoRoutes;
