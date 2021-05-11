import React from "react";
import Peer from "peerjs";
import "../assets/styles/styles.min.css";
import "../assets/styles/custom.css";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";
import { getRandomName } from "../utils/generateRandomName";
import { makeRequest } from "../utils/getRandomTheme";
import {
  delay,
  ChatProps,
  ChatState,
  MainProps,
  MainState,
  userStates,
  LOBBY_NAME,
} from "../utils/constants";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  Status,
} from "@chatscope/chat-ui-kit-react";

/* TODO

  RANDOM THEMES
  UI

*/

class ChatRoom extends React.Component<ChatProps, ChatState> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getTheme = this.getTheme.bind(this);
    this.handleCustomChange = this.handleCustomChange.bind(this);

    this.state = {
      peer: new Peer(),
      peer_id: undefined,
      conn: undefined,
      connState: userStates.NOT_CONNECTED,
      inlobby: [],
      message: "",
      messages: [],
      rpeer: "",
      typing: false,
      rname: "",
      theme: "",
      lconn: undefined,
      inChat: false,
      customTheme: "",
    };

    this.state.peer.on("open", (id) => {
      this.setState({ peer_id: id });
      const lconn = this.state.peer.connect(LOBBY_NAME);
      this.setState({ lconn: lconn });
      this.state.lconn.on("open", () => {
        console.log("connected to lobby");
        const lobby_query = () => {
          lconn.send("QUERY");
          if (this.state.connState === userStates.NOT_CONNECTED) {
            lconn.send("READY");
          }
          window.setTimeout(lobby_query, 100);
        };
        lobby_query();
      });
      this.state.lconn.on("data", (data) => {
        // console.log("setting lobby", data);
        this.setState({ inlobby: data });
      });
    });

    this.state.peer.on("connection", (conn) => {
      console.log("got connection from", conn.peer);
      if (this.state.conn == null) {
        this.setState({ conn: conn, connState: userStates.CONNECTED });
        conn.on("open", () => {
          conn.send({
            id: userStates.USERNAME,
            name: this.props.name,
          });
        });
        conn.on("data", (data) => {
          console.log("Received", data);
          if (data === userStates.NOT_CONNECTED) {
            console.log("TEB9 POSLALI NAHUI");
            // conn.close();
            // console.log("NEW CONN", conn);
            this.setState({
              conn: undefined,
              connState: userStates.NOT_CONNECTED,
              rname: "",
            });
          } else if (data === userStates.TYPING) {
            this.setState({
              typing: true,
            });
          } else if (data.id === userStates.USERNAME) {
            // console.log("dated");
            this.setState({
              rname: data.name,
            });
          } else {
            this.setState({ typing: false });
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
          }
        });
      } else {
        console.log("already connected");
        conn.close();
      }
    });
    window.addEventListener("beforeunload", (ev) => {
      ev.preventDefault();
      this.disconnect();
    });
  }

  async join() {
    const rp =
      this.state.inlobby[Math.floor(Math.random() * this.state.inlobby.length)];
    if (rp && rp != this.state.peer_id) {
      console.log("connect to", rp);
      const conn = this.state.peer.connect(rp);
      conn.on("open", () => {
        // console.log("TRYING NEW CONNECTION", conn);
        console.log("connection open");
        this.setState({ conn: conn, connState: userStates.CONNECTED });
        conn.send({
          id: userStates.USERNAME,
          name: this.props.name,
        });
      });
      conn.on("data", (data) => {
        console.log("Received back", data);
        // console.log("disconnect", data);
        if (data === userStates.NOT_CONNECTED) {
          console.log("TEB9 POSLALI NAHUI");
          this.setState({
            conn: undefined,
            connState: userStates.NOT_CONNECTED,
            rname: "",
          });
        } else if (data === userStates.TYPING) {
          this.setState({
            typing: true,
          });
        } else if (data.id === userStates.USERNAME) {
          // console.log("dated");
          this.setState({
            rname: data.name,
          });
        } else {
          this.setState({ typing: false });
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
        }
      });
    } else {
      await delay(1000);
      this.join();
    }
  }

  connect() {
    this.setState({ connState: userStates.CONNECTING });
    this.join();
  }

  handleCustomChange(e) {
    this.setState({ customTheme: e.target.value });
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
      this.setState({ message: "" });
      this.setState({ typing: false });
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
    this.setState({
      conn: undefined,
      connState: userStates.NOT_CONNECTED,
      rname: "",
    });
  }

  handleMessage(value) {
    if (this.state.conn) {
      this.state.conn.send(userStates.TYPING);
    } else {
      console.log("no con?");
    }
    this.setState({ message: value });
  }

  async getTheme() {
    let theme = await makeRequest();
    this.setState({
      theme: theme,
    });
  }

  componentWillUnmount() {
    if (this.state.conn) {
      this.state.conn.send(userStates.NOT_CONNECTED);
      console.log("sended je");
    } else {
      console.log("no con?");
    }
    if (this.state.lconn) {
      this.state.lconn.close();
    }

    this.setState = (state, callback) => {
      return;
    };
  }

  render() {
    return (
      <div id="search_room">
        <div id="name">
          <p>{this.props.name}</p>
        </div>
        <div id="search_status">
          <CircularProgress color="secondary" size={20} />
          <p id="search_p">You are in search </p>
        </div>
        <div id="theme">
          <p>You can set random theme (by default) or type it by yourself</p>
          <div id="theme_input">
            <TextField
              id="outlined-basic"
              label="Your theme"
              variant="outlined"
              color="secondary"
              value={this.state.customTheme}
              onChange={this.handleCustomChange}
              InputLabelProps={{
                style: { color: "#ADD8E6" },
              }}
              InputProps={{
                style: { color: "#ADD8E6" },
              }}
            />
          </div>
        </div>
        {/* <div>in lobby now</div>
        {this.state.inlobby.map((item, i) => (
          <li key={i}>{item}</li>
        ))} */}

        {/* {this.state.connState === userStates.NOT_CONNECTED && (
          <button onClick={this.connect}>Connect</button>
        )} */}

        {/* {this.state.connState === userStates.CONNECTING && (
          <div>CONNECT LOADER</div>
        )} */}

        {/* {this.state.connState === userStates.CONNECTED && (
          <button onClick={this.disconnect}>Disconnect</button>
        )} */}

        <br />
        {/* <div>
          <h1>this is my peer {this.state.peer.id}</h1>
        </div>
        <div>
          <h1>this is name {this.state.myname}</h1>
        </div>
        <div>
          <h1>this is rname {this.state.rname}</h1>
        </div>
        <div>
          <button onClick={this.getTheme}>WIKI</button>
        </div>
        <div>
          <h1>theme is: {this.state.theme}</h1>
        </div> */}
        {this.state.inChat && (
          <div id="chat_room">
            <div>
              {this.state.conn ? (
                <Status
                  status="available"
                  size="xs"
                  name="Connected"
                  style={{
                    marginBottom: "0.5em",
                  }}
                />
              ) : (
                <Status
                  status="unavailable"
                  size="xs"
                  name="Disconnected"
                  style={{
                    marginBottom: "0.5em",
                  }}
                />
              )}
            </div>
            <div style={{ position: "relative", height: "500px" }}>
              <MainContainer>
                <ChatContainer>
                  <MessageList autoScrollToBottom={true}>
                    {this.state.messages.map((item, index) => (
                      <Message model={item} key={index} />
                    ))}
                    {this.state.typing && (
                      <TypingIndicator
                        content={`${this.state.rname} is typing`}
                      />
                    )}
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
        )}
      </div>
    );
  }
}

class Main extends React.Component<MainProps, MainState> {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
    };
  }

  async getName() {
    if (this.props.name === "") {
      console.log("in if");
      this.setState({ name: await getRandomName() });
    } else {
      this.setState({ name: this.props.name });
    }
  }

  componentDidMount() {
    console.log("trying to create lobby");

    this.getName();
    let peers = {};

    const lobby = new Peer(LOBBY_NAME);
    lobby.on("open", (id) => {
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
      for (let k in peers) {
        let now = new Date().getTime();
        if (now - peers[k] > 1500) {
          delete peers[k];
        }
      }
      window.setTimeout(expire, 100);
    }
    expire();
  }

  render() {
    return <ChatRoom name={this.state.name} />;
  }
}

export default Main;
