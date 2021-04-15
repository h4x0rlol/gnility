import React, { useEffect, useState } from "react";
import Peer from "peerjs";
import "../assets/styles/main.css";
import { Input } from "react-chat-elements";
import { Button } from "react-chat-elements";
import { MessageList } from "react-chat-elements";

const LOBBY_NAME = "gnility";

const userStates = {
  NOT_CONNECTED: "not_connected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
};

function Home(props: any) {
  const [peer, setPeer] = useState(new Peer());
  const [peer_id, setPeer_id] = useState("");
  // const [connState, setConnState] = useState("no");
  const [inlobby, setInlobby] = useState([]);
  const [ready, setReady] = useState(false);
  const [stateConn, setConn] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [rpeer, setRpeer] = useState("");
  const [roomConn, setRoomConn] = useState(userStates.NOT_CONNECTED);

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
        if (now - peers[k] > 1000) {
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
          if (roomConn === userStates.NOT_CONNECTED) {
            lconn.send("READY");
          }
          window.setTimeout(lobby_query, 1000);
        };
        lobby_query();
      });
      lconn.on("data", (data) => {
        // console.log("setting lobby", data);
        setInlobby(data);
      });
    });

    peer.on("connection", (conn) => {
      console.log("got connection from", conn.peer);
      if (stateConn == null) {
        setConn(conn);
        // console.log("conn", conn);
        // setConnState("playin");
        setRoomConn(userStates.CONNECTED);
        conn.on("data", (data) => {
          if (data === userStates.NOT_CONNECTED) {
            console.log("TEB9 POSLALI NAHUI");
            conn.close();
            setRoomConn(userStates.NOT_CONNECTED);
          }
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

  // const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  useEffect(() => {
    if (ready) {
      const getRandomPeer = () => {
        return inlobby[Math.floor(Math.random() * inlobby.length)];
      };

      const join = async () => {
        console.log(`in lobby now : ${inlobby}`);
        let randomPeer = await getRandomPeer();
        console.log(`random peer ${randomPeer}`);
        if (!randomPeer) {
          console.log("undf peer");
        }
        if (randomPeer === peer.id) {
          console.log("ONI RAVNI");
          // console.log(stateConn);
          // setConn(null);
          // await delay(3000);
          // connect();
        }
        if (randomPeer && randomPeer != peer.id) {
          console.log("connect to", randomPeer);
          let newConn = peer.connect(randomPeer);
          // console.log(newConn);
          newConn.on("open", () => {
            console.log("connection open");
            setConn(newConn);
            setRoomConn(userStates.CONNECTED);
          });
          newConn.on("data", (data) => {
            if (data === userStates.NOT_CONNECTED) {
              console.log("TEB9 POSLALI NAHUI");
              newConn.close();
              setRoomConn(userStates.NOT_CONNECTED);
            }
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
          setReady(false);
          // setRoomConn(userStates.CONNECTED);
        }
      };
      join();
    } else {
      // console.log("A VSE");
    }
  }, [inlobby]);

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
  function connect() {
    console.log("CONN STATE", stateConn);
    setReady(true);
    setRoomConn(userStates.CONNECTING);
  }

  function disconnect() {
    setReady(false);
    if (stateConn) {
      // change to user disconnected
      stateConn.send(userStates.NOT_CONNECTED);
      console.log("sended je");
    } else {
      console.log("no con?");
    }
    // stateConn.close();
    setRoomConn(userStates.NOT_CONNECTED);
    console.log("DISC STATE", stateConn);
  }
  return (
    <div>
      {inlobby.map((item, i) => (
        <li key={i}>{item}</li>
      ))}

      {roomConn === userStates.NOT_CONNECTED && (
        <button onClick={connect}>Connect</button>
      )}

      {roomConn === userStates.CONNECTING && <div>CONNECT LOADER</div>}

      {roomConn === userStates.CONNECTED && (
        <button onClick={disconnect}>Disconnect</button>
      )}

      <br />
      <div>
        <h1>this is my peer{peer.id}</h1>
      </div>
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
