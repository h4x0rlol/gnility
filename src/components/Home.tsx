import React, { useEffect, useState } from "react";
import "../assets/styles/home.css";
import Main from "./Main";
import scrollIntoView from "scroll-into-view-if-needed";

export const Home = () => {
  const [inSearch, setInSearch] = useState(false);
  const [lobby, setLobby] = useState(null);
  useEffect(() => {
    const node = document.getElementById("lobby");
    setLobby(node);
  }, []);

  const handlePress = () => {
    setInSearch(!inSearch);
    console.log(lobby);
    if (lobby) {
      scrollIntoView(lobby, {
        block: "center",
        inline: "center",
        behavior: "smooth",
      });
    }
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
        <Main />
      )}
    </div>
  );
};
