import React, { useEffect, useState } from "react";
import Peer from "peerjs";
import "../assets/styles/main.css";
import { Input } from "react-chat-elements";
import { Button } from "react-chat-elements";
import { MessageList } from "react-chat-elements";

const LOBBY_NAME = "gnility";

function Home(props: any) {
  const [peer, setPeer] = useState(new Peer());
  const [peer_id, setPeer_id] = useState("");
  const [connState, setConnState] = useState("no");
  const [inlobby, setInlobby] = useState([]);
  const [ready, setReady] = useState(false);
  const [stateConn, setConn] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [rpeer, setRpeer] = useState("");

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
        if (data === "READY") {
          peers[conn.peer] = new Date().getTime();
        }
        if (data === "QUERY") {
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

    peer.on("open", (id) => {
      setPeer_id(id);
      const lconn = peer.connect(LOBBY_NAME);
      lconn.on("open", () => {
        console.log("connected to lobby");
        const lobby_query = () => {
          lconn.send("QUERY");
          if (connState === "no") {
            lconn.send("READY");
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
      if (stateConn == null) {
        setConn(conn);
        setConnState("playin");
        conn.on("data", (data) => {
          setMessages((oldArray) => [
            ...oldArray,
            {
              position: "left",
              type: "text",
              text: data,
            },
          ]);
          console.log("recived", data);
        });
      } else {
        console.log("already connected");
        conn.close();
      }
    });
  }, []);

  function handleMessage(event) {
    setMessage(event.target.value);
  }

  function getRandomPeer() {
    return inlobby[Math.floor(Math.random() * inlobby.length)];
  }

  async function connect() {
    console.log(`in lobby now : ${inlobby}`);
    let randomPeer = await getRandomPeer();
    console.log(`random peer ${randomPeer}`);
    if (!randomPeer) {
      console.log("undf peer");
    }
    if (randomPeer === peer.id) {
      console.log("ONI RAVNI");
      console.log(stateConn);
      // setConn(null);
      // setInterval(() => connect(), 3000);
    }
    if (randomPeer != peer.id) {
      console.log("connect to", randomPeer);
      let newConn = peer.connect(randomPeer);
      // console.log(newConn);
      newConn.on("open", () => {
        console.log("connection open");
        setConn(newConn);
        setConnState("playin");
      });
      newConn.on("data", (data) => {
        console.log("Received back", data);
        setMessages((oldArray) => [
          ...oldArray,
          {
            position: "left",
            type: "text",
            text: data,
          },
        ]);
      });
    }
  }

  //test
  function handleChange(event) {
    setRpeer(event.target.value);
    console.log(event.target.value);
  }

  function sendMessage() {
    if (stateConn) {
      stateConn.send(message);
      setMessages((oldArray) => [
        ...oldArray,
        {
          position: "right",
          type: "text",
          text: message,
        },
      ]);
    } else {
      console.log("no con?");
    }
  }

  return (
    <div>
      {inlobby.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
      <button onClick={connect}>join</button>
      <br />
      <div>
        <h1>this is my peer{peer.id}</h1>
      </div>
      <input type="text" value={rpeer} onChange={handleChange} />
      <br />
      <div className="chatbox">
        <MessageList
          className="message-list"
          lockable={true}
          toBottomHeight={"100%"}
          dataSource={messages}
        />

        <Input
          placeholder="Type here..."
          multiline={true}
          defaultValue={message}
          onChange={handleMessage}
          rightButtons={
            <Button
              color="white"
              backgroundColor="black"
              text="Send"
              onClick={sendMessage}
            />
          }
        />
      </div>
    </div>
  );
}
export default Home;
