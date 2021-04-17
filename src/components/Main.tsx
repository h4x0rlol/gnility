import React from "react";
import Peer from "peerjs";
import "../assets/styles/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";

const LOBBY_NAME = "gnility";

const userStates = {
  NOT_CONNECTED: "User disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
};

type MyProps = {};

type MyState = {
  peer: any;
  peer_id: any;
  conn: any;
  connState: any;
  inlobby: any;
  message: any;
  messages: any;
  rpeer: any;
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

class ChatRoom extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.state = {
      peer: new Peer(),
      peer_id: null,
      conn: null,
      connState: userStates.NOT_CONNECTED,
      inlobby: [],
      message: "",
      messages: [],
      rpeer: "",
    };
    this.state.peer.on("open", (id) => {
      this.setState({ peer_id: id });
      const lconn = this.state.peer.connect(LOBBY_NAME);
      lconn.on("open", () => {
        console.log("connected to lobby");
        const lobby_query = () => {
          lconn.send("QUERY");
          if (this.state.connState === userStates.NOT_CONNECTED) {
            lconn.send("READY");
          }
          window.setTimeout(lobby_query, 10);
        };
        lobby_query();
      });
      lconn.on("data", (data) => {
        // console.log("setting lobby", data);
        this.setState({ inlobby: data });
      });
    });

    this.state.peer.on("connection", (conn) => {
      console.log("got connection from", conn.peer);
      if (this.state.conn == null) {
        this.setState({ conn: conn, connState: userStates.CONNECTED });
        conn.on("data", (data) => {
          console.log("Received", data);
          if (data === userStates.NOT_CONNECTED) {
            console.log("TEB9 POSLALI NAHUI");
            // conn.close();
            // console.log("NEW CONN", conn);
            this.setState({
              conn: undefined,
              connState: userStates.NOT_CONNECTED,
            });
          }
          this.setState((prevState) => ({
            messages: [
              ...prevState.messages,
              {
                message: data,
                sentTime: "just now",
                direction: "incoming",
              },
            ],
          }));
        });
      } else {
        console.log("already connected");
        conn.close();
      }
    });
  }

  async join() {
    const rp = this.state.inlobby[
      Math.floor(Math.random() * this.state.inlobby.length)
    ];
    if (rp && rp != this.state.peer_id) {
      console.log("connect to", rp);
      const conn = this.state.peer.connect(rp);
      conn.on("open", () => {
        // console.log("TRYING NEW CONNECTION", conn);
        console.log("connection open");
        this.setState({ conn: conn, connState: userStates.CONNECTED });
      });
      conn.on("data", (data) => {
        console.log("Received back", data);
        // console.log("disconnect", data);
        if (data === userStates.NOT_CONNECTED) {
          console.log("TEB9 POSLALI NAHUI");
          this.setState({
            conn: undefined,
            connState: userStates.NOT_CONNECTED,
          });
        }
        this.setState((prevState) => ({
          messages: [
            ...prevState.messages,
            {
              message: data,
              sentTime: "just now",
              direction: "incoming",
            },
          ],
        }));
      });
    } else {
      await delay(3000);
      this.join();
    }
  }

  connect() {
    this.setState({ connState: userStates.CONNECTING });
    this.join();
  }

  handleChange(event) {
    this.setState({
      rpeer: event.target.value,
    });
  }

  sendMessage() {
    if (this.state.conn) {
      this.state.conn.send(this.state.message);
      this.setState((prevState) => ({
        messages: [
          ...prevState.messages,
          {
            message: this.state.message,
            sentTime: "just now",
            direction: "outgoing",
          },
        ],
      }));
    } else {
      console.log("no con?");
    }
  }

  disconnect() {
    if (this.state.conn) {
      this.state.conn.send(userStates.NOT_CONNECTED);
      console.log("sended je");
    } else {
      console.log("no con?");
    }
    this.setState({ conn: undefined, connState: userStates.NOT_CONNECTED });
  }

  handleMessage(value) {
    this.setState({ message: value });
  }

  render() {
    let connstatus = this.state.connState;

    return (
      <div>
        <div className="connstatus">{connstatus}</div>
        {this.state.inlobby.map((item, i) => (
          <li key={i}>{item}</li>
        ))}

        {this.state.connState === userStates.NOT_CONNECTED && (
          <button onClick={this.connect}>Connect</button>
        )}

        {this.state.connState === userStates.CONNECTING && (
          <div>CONNECT LOADER</div>
        )}

        {this.state.connState === userStates.CONNECTED && (
          <button onClick={this.disconnect}>Disconnect</button>
        )}

        <br />
        <div>
          <h1>this is my peer {this.state.peer.id}</h1>
        </div>
        <br />

        <div style={{ position: "relative", height: "500px" }}>
          <MainContainer>
            <ChatContainer>
              <MessageList autoScrollToBottom={true}>
                {this.state.messages.map((item, index) => (
                  <Message model={item} key={index} />
                ))}
              </MessageList>
              <MessageInput
                placeholder="Type message here"
                attachButton={false}
                value={this.state.message}
                onChange={this.handleMessage}
                onSend={this.sendMessage}
              />
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    );
  }
}

class Main extends React.Component {
  componentDidMount() {
    console.log("trying to create lobby");

    let peers = {};

    // this may fail unless you are the first player
    const lobby = new Peer(LOBBY_NAME);
    lobby.on("open", function (id) {
      console.log("Lobby peer ID is: " + id);
    });

    lobby.on("connection", (conn) => {
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
      for (var k in peers) {
        var now = new Date().getTime();
        if (now - peers[k] > 1000) {
          delete peers[k];
        }
      }
      window.setTimeout(expire, 10);
    }
    expire();
  }
  render() {
    return <ChatRoom />;
  }
}

export default Main;
