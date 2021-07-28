// inspired by https://github.com/geohot/twitchtactoe

import React from "react";
import Peer from "peerjs";
import "../assets/styles/styles.min.css";
import "../assets/styles/custom.css";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
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

class ChatRoom extends React.Component<ChatProps, ChatState> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleThemeChange = this.handleThemeChange.bind(this);
    this.getBack = this.getBack.bind(this);
    this.sendSwitchRequest = this.sendSwitchRequest.bind(this);

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
      search: false,
      awaiting: false,
    };

    this.state.peer.on("open", async (id) => {
      this.setState({ peer_id: id });
      const lconn = await this.state.peer.connect(LOBBY_NAME);
      this.setState({ lconn: lconn });
      if (this.state.lconn) {
        await this.state.lconn.on("open", async () => {
          const lobby_query = async () => {
            await this.state.lconn.send("QUERY");
            if (this.state.connState === userStates.NOT_CONNECTED) {
              await this.state.lconn.send("READY");
            }
            setTimeout(lobby_query, 100);
          };
          await lobby_query();
        });
        await this.state.lconn.on("data", async (data) => {
          this.setState({ inlobby: data });
        });
      }
    });

    this.state.peer.on("connection", async (conn) => {
      if (this.state.conn == null) {
        this.setState({
          conn: conn,
          connState: userStates.CONNECTED,
          search: false,
          inChat: true,
          messages: [],
        });
        conn.on("open", async () => {
          await conn.send({
            id: userStates.USERNAME,
            name: this.props.name,
          });
        });
        conn.on("data", async (data) => {
          if (data === userStates.NOT_CONNECTED) {
            this.setState({
              conn: undefined,
              connState: userStates.AWAITING,
              rname: "",
              awaiting: true,
              typing: false,
            });
          } else if (data === userStates.TYPING) {
            this.setState({
              typing: true,
            });
          } else if (data.id === userStates.USERNAME) {
            this.setState({
              rname: data.name,
              theme: data.theme,
            });
          } else if (data.id === userStates.SWITCH) {
            this.setState({
              theme: data.theme,
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
        await conn.close();
      }
    });
    window.addEventListener("beforeunload", async (ev) => {
      ev.preventDefault();
      await this.disconnect();
    });
  }

  async join() {
    const rp =
      this.state.inlobby[Math.floor(Math.random() * this.state.inlobby.length)];
    if (this.state.theme === "") {
      let theme = await makeRequest();
      this.setState({ theme: theme });
    }
    if (rp && rp != this.state.peer_id) {
      const conn = await this.state.peer.connect(rp);
      conn.on("open", async () => {
        this.setState({
          conn: conn,
          connState: userStates.CONNECTED,
          search: false,
          inChat: true,
        });
        await conn.send({
          id: userStates.USERNAME,
          name: this.props.name,
          theme: this.state.theme,
        });
      });
      conn.on("data", async (data) => {
        if (data === userStates.NOT_CONNECTED) {
          this.setState({
            conn: undefined,
            connState: userStates.AWAITING,
            rname: "",
            awaiting: true,
            typing: false,
          });
        } else if (data === userStates.TYPING) {
          this.setState({
            typing: true,
          });
        } else if (data.id === userStates.USERNAME) {
          this.setState({
            rname: data.name,
          });
        } else if (data.id === userStates.SWITCH) {
          this.setState({
            theme: data.theme,
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
      await this.join();
    }
  }

  async connect() {
    this.setState({
      connState: userStates.CONNECTING,
      search: true,
      messages: [],
    });
    await this.join();
  }

  async getBack() {
    this.setState({
      awaiting: false,
      connState: userStates.NOT_CONNECTED,
      inChat: false,
      theme: "",
      message: "",
    });
  }

  async handleThemeChange(e) {
    this.setState({ theme: e.target.value });
  }

  async handleChange(event) {
    this.setState({
      rpeer: event.target.value,
    });
  }

  async sendSwitchRequest() {
    if (this.state.conn) {
      let theme = await makeRequest();
      this.setState({ theme: theme });
      this.state.conn.send({
        id: userStates.SWITCH,
        theme: this.state.theme,
      });
    }
  }

  async sendMessage() {
    if (this.state.conn) {
      await this.state.conn.send(this.state.message);
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
    }
  }

  async disconnect() {
    if (this.state.conn) {
      await this.state.conn.send(userStates.NOT_CONNECTED);
    }
    this.setState({
      conn: undefined,
      connState: userStates.NOT_CONNECTED,
      rname: "",
      inChat: false,
      theme: "",
      message: "",
    });
  }

  async handleMessage(value) {
    if (this.state.conn) {
      await this.state.conn.send(userStates.TYPING);
    }
    this.setState({ message: value });
  }

  async componentWillUnmount() {
    if (this.state.conn) {
      await this.state.conn.send(userStates.NOT_CONNECTED);
    }
    if (this.state.lconn) {
      await this.state.lconn.close();
    }

    this.setState = (state, callback) => {
      return;
    };
  }

  render() {
    return (
      <div>
        {!this.state.search &&
          !this.state.awaiting &&
          this.state.connState != userStates.CONNECTED && (
            <div id="search_room">
              <div id="name">
                <p>{this.props.name}</p>
              </div>
              <div id="search_status">
                <CircularProgress color="secondary" size={20} />
                <p id="search_p">You are in search </p>
              </div>
              <div id="theme">
                <p>
                  You can set random theme (by default) or type it by yourself
                </p>
                <div id="theme_input">
                  <TextField
                    id="outlined-basic"
                    label="Your theme"
                    variant="outlined"
                    color="secondary"
                    value={this.state.theme}
                    onChange={this.handleThemeChange}
                    InputLabelProps={{
                      style: { color: "#ADD8E6" },
                    }}
                    InputProps={{
                      style: { color: "#ADD8E6" },
                    }}
                  />
                </div>
                <div id="button">
                  <Button variant="contained" onClick={this.connect}>
                    Search manually
                  </Button>
                </div>
              </div>
            </div>
          )}

        {this.state.search && (
          <div id="search_loader">
            <p>Searching for interlocutor</p>
            <div className="loader">
              <CircularProgress color="secondary" size={50} />
            </div>
          </div>
        )}

        {this.state.inChat && (
          <div id="chat_room">
            <div id="chat_info">
              <p>{this.props.name}</p>
              <p>You chatting with: {this.state.rname}</p>
              <div id="chat_theme">
                <p>Theme is {this.state.theme}</p>
                <div id="theme_button">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={this.sendSwitchRequest}
                  >
                    switch
                  </Button>
                </div>
                {!this.state.awaiting ? (
                  <div id="theme_button">
                    <Button
                      variant="contained"
                      onClick={this.disconnect}
                      size="small"
                    >
                      disconnect
                    </Button>
                  </div>
                ) : (
                  <div id="theme_button">
                    <Button
                      variant="contained"
                      onClick={this.getBack}
                      size="small"
                    >
                      Back to lobby
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div id="chat_indicators">
              <div id="connect_status">
                {this.state.conn ? (
                  <Status status="available" size="lg">
                    <div
                      style={{
                        color: "lightblue",
                      }}
                    >
                      Connected
                    </div>
                  </Status>
                ) : (
                  <Status status="unavailable" size="lg">
                    <div
                      style={{
                        color: "lightblue",
                      }}
                    >
                      Disconnected
                    </div>
                  </Status>
                )}
              </div>
              {this.state.typing && (
                <div id="typing_status">
                  <TypingIndicator content={`${this.state.rname} is typing`} />
                </div>
              )}
            </div>
            <div id="chat_container">
              <MainContainer className="dark">
                <ChatContainer
                  style={{
                    backgroundColor: "#2b2b2b",
                  }}
                >
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
                    autoFocus={true}
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
      this.setState({ name: await getRandomName() });
    } else {
      this.setState({ name: this.props.name });
    }
  }

  async componentDidMount() {
    this.getName();
    let peers = {};

    const lobby = new Peer(LOBBY_NAME);
    lobby.on("open", async (id) => {});

    lobby.on("connection", async (conn) => {
      conn.on("data", async (data) => {
        if (data === "READY") {
          peers[conn.peer] = new Date().getTime();
        }
        if (data === "QUERY") {
          conn.send(Object.keys(peers));
        }
      });
    });

    const expire = async () => {
      for (let k in peers) {
        let now = new Date().getTime();
        if (now - peers[k] > 1500) {
          delete peers[k];
        }
      }
      setTimeout(expire, 100);
    };
    await expire();
  }

  render() {
    return <ChatRoom name={this.state.name} />;
  }
}

export default Main;
