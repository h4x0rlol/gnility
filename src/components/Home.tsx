import React, { useEffect, useState } from "react";
import "../assets/styles/home.css";
import Main from "./Main";

// MOVE NAME GENERATION HERE
export const Home = () => {
  const [inSearch, setInSearch] = useState(true);

  const handlePress = () => {
    setInSearch(!inSearch);
  };

  return (
    <div>
      {!inSearch ? (
        <div id="home">
          <img id="logo" src="/images/logo.png" alt="logo.png" />
          <div id="home_text"></div>
          <h1>is</h1>
          <h1>a simple WebRTC peer to peer chat on a random themes</h1>
          <div id="home_start">
            <div>
              <h2>Start chating</h2>
            </div>
            <div>
              <i id="arrow" onClick={handlePress}></i>
            </div>
          </div>
          <div id="home_link">
            <h3>Source code available </h3>
            <a href="https://github.com/h4x0rlol/gnility">here</a>
          </div>
        </div>
      ) : (
        <div id="lobby">
          <i id="back_arrow" onClick={handlePress}></i>
          <Main />
        </div>
      )}
    </div>
  );
};
