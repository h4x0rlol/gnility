import React, { useEffect, useState } from "react";
import "../assets/styles/home.css";
import Main from "./Main";
import TextField from "@material-ui/core/TextField";

export const Home = () => {
  const [inSearch, setInSearch] = useState(false);
  const [name, setName] = useState("");

  const handlePress = () => {
    setInSearch(!inSearch);
  };

  const handleChange = (e) => {
    setName(e.target.value);
  };

  return (
    <div>
      {!inSearch ? (
        <div id="home">
          <img id="logo" src="/images/logo.png" alt="logo.png" />
          <div id="home_text">
            <h1>is</h1>
            <h1>a simple WebRTC peer to peer chat on a random themes</h1>
          </div>

          <div id="home_start">
            <div id="start">
              <h2>Start chating</h2>
            </div>
            <TextField
              id="outlined-basic"
              label="Your name"
              variant="outlined"
              color="secondary"
              value={name}
              onChange={handleChange}
              InputLabelProps={{
                style: { color: "#ADD8E6" },
              }}
              InputProps={{
                style: { color: "#ADD8E6" },
              }}
            />
            <div id="arrow_div">
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
          <Main name={name} />
        </div>
      )}
    </div>
  );
};
