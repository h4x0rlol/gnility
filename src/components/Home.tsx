import React, { useEffect, useState } from "react";
import Peer from "peerjs";

const LOBBY_NAME = "gnility";

function Home(props: any) {
  const [peer, setPeer] = useState(new Peer());
  const [peer_id, setPeer_id] = useState("");
  const [connState, setConnState] = useState("no");
  const [inlobby, setInlobby] = useState([]);
  const [ready, setReady] = useState(false);

  peer.on("open", (id) => {
    setPeer_id(id);
    const lconn = peer.connect(LOBBY_NAME);
    lconn.on("open", () => {
      console.log("connected to lobby");
      const lobby_query = () => {
        lconn.send("CHATING");
        if (connState === "no") {
          lconn.send("FREE");
        }
        window.setTimeout(lobby_query, 1000);
      };
      lobby_query();
    });
    lconn.on("data", (data) => {
      console.log("setting lobby", data);
      setInlobby(data);
    });
  });

  peer.on("connection", (conn) => {
    console.log("got connection from", conn.peer);
  });

  useEffect(() => {
    console.log("trying to create lobby");
    const lobby = new Peer(LOBBY_NAME);
    let peers = {};
    lobby.on("open", function (id) {
      console.log("Lobby peer ID is: " + id);
    });

    lobby.on("connection", function (conn) {
      console.log("lobby connection", conn.peer);
      conn.on("data", (data) => {
        if (data === "CHATING") {
          peers[conn.peer] = new Date().getTime();
        }
        if (data === "FREE") {
          conn.send(Object.keys(peers));
        }
      });
    });
    function expire() {
      for (let k in peers) {
        let now = new Date().getTime();
        if (now - peers[k] > 3000) {
          delete peers[k];
        }
      }
      window.setTimeout(expire, 1000);
    }
    expire();
  });

  function join() {
    // console.log("start");
    // peer.on("open", (id) => {
    //   let lconn = peer.connect(LOBBY_NAME);
    //   lconn.on("open", () => {
    //     setInLobby((oldArray) => [...oldArray, id]);
    //     console.log(`connected to lobby ${id}`);
    //   });
    //   lconn.on("data", (data) => {
    //     console.log("setting lobby", data);
    //   });
    // });
  }

  return (
    <div>
      <div>lobby members {inlobby} </div>
      <button onClick={join}>join</button>
    </div>
  );
}
export default Home;
