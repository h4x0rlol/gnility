import React from "react";
import Peer from "peerjs";
import "../assets/styles/main.css";
import { Input } from "react-chat-elements";
import { Button } from "react-chat-elements";
import { MessageList } from "react-chat-elements";

type MyProps = {};

type MyState = {
  peer: Peer;
  peer_id: string;
  conn: Peer.DataConnection;
  rpeer: string;
  message: string;
  rmessage: string;
  messages: any;
  onSite: string[];
};

class ChatRoom extends React.Component<MyProps, MyState> {
  state: MyState = {
    peer: new Peer(),
    peer_id: "",
    conn: undefined,
    rpeer: "",
    message: "",
    rmessage: "",
    messages: [],
    onSite: [],
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.connect = this.connect.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);

    this.state.peer.on("open", (id) => {
      this.setState({ peer_id: id });
    });

    this.state.peer.on("connection", (conn) => {
      console.log("got connection from", conn.peer);
      if (this.state.conn == null) {
        this.setState({ conn: conn });
        conn.on("data", (data) => {
          this.setState((prevState) => ({
            messages: [
              ...prevState.messages,
              {
                position: "left",
                type: "text",
                text: data,
              },
            ],
          }));
          console.log("Received", this.state.messages);
        });
      } else {
        console.log("already connected");
      }
    });
  }

  handleChange(event) {
    this.setState({ rpeer: event.target.value });
    console.log(event.target.value);
  }

  handleMessage(event) {
    this.setState({ message: event.target.value });
    console.log(event.target.value);
  }

  connect() {
    if (!this.state.rpeer) {
      console.log("undf peer");
    } else {
      let conn = this.state.peer.connect(this.state.rpeer);
      conn.on("open", () => {
        console.log("connection open");
        this.setState({ conn: conn });
      });
      conn.on("data", (data) => {
        this.setState((prevState) => ({
          messages: [
            ...prevState.messages,
            {
              position: "left",
              type: "text",
              text: data,
            },
          ],
        }));
        console.log("Received back", this.state.messages);
      });
    }
  }

  sendMessage() {
    if (this.state.conn) {
      this.state.conn.send(this.state.message);
      this.setState((prevState) => ({
        messages: [
          ...prevState.messages,
          {
            position: "right",
            type: "text",
            text: this.state.message,
          },
        ],
      }));
      console.log("sended", this.state.messages);
    } else {
      console.log("no con?");
    }
  }

  render() {
    return (
      <div>
        <div>
          My peer:{this.state.peer_id}
          <input
            type="text"
            value={this.state.rpeer}
            onChange={this.handleChange}
          />
          <br />
          <button onClick={this.connect}>less go</button>
          <br />
        </div>
        <div className="chatbox">
          <MessageList
            className="message-list"
            lockable={true}
            toBottomHeight={"100%"}
            dataSource={this.state.messages}
          />

          <Input
            placeholder="Type here..."
            multiline={true}
            defaultValue={this.state.message}
            onChange={this.handleMessage}
            rightButtons={
              <Button
                color="white"
                backgroundColor="black"
                text="Send"
                onClick={this.sendMessage}
              />
            }
          />
        </div>
      </div>
    );
  }
}

export default ChatRoom;
