import React from "react";
import Peer from "peerjs";
import { ThumbUpSharp } from "@material-ui/icons";
// RCE CSS
import "../assets/styles/main.css";
// MessageBox component
import { MessageBox } from "react-chat-elements";
import { Input } from "react-chat-elements";
import { Button } from "react-chat-elements";
import { MessageList } from "react-chat-elements";

type MyProps = {
  message: string;
};
type MyState = {
  peer: Peer;
  peer_id: any;
  conn: any;
  connState: any;
  rpeer: any;
  message: string;
  rmessage: string;
  messages: string[];
  rmessages: string[];
  arr1: any;
};

class Home extends React.Component<MyProps, MyState> {
  state: MyState = {
    peer: new Peer(),
    peer_id: null,
    conn: null,
    connState: "not connected",
    rpeer: null,
    message: null,
    rmessage: null,
    messages: [],
    rmessages: [],
    arr1: [],
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.connect = this.connect.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.fullArr = this.fullArr.bind(this);

    this.state.peer.on("open", async (id) => {
      this.setState({ peer_id: id });
    });
    this.state.peer.on("connection", (conn) => {
      console.log("got connection from", conn.peer);
      if (this.state.conn == null) {
        this.setState({ conn: conn, connState: "connected" });
        conn.on("data", (data) => {
          this.setState((prevState) => ({
            rmessages: [...prevState.rmessages, data],
          }));
          console.log("Received", this.state.rmessages);
        });
      } else {
        console.log("already connected");
        conn.close();
      }
    });
    // const newConn = this.state.peer.connect("room1");
    // newConn.on('open', () => {
    //   console.log("connected to lobby");
    // }
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
        this.setState({ conn: conn, connState: "connected" });
      });
      conn.on("data", (data) => {
        this.setState((prevState) => ({
          rmessages: [...prevState.rmessages, data],
        }));
        console.log("Received back", this.state.messages);
      });
    }
  }

  // Добавлять в массив сообщение сразу при отправке
  fullArr() {
    this.state.messages.map((item, i) =>
      this.setState((prevState) => ({
        arr1: [
          ...prevState.arr1,
          {
            position: "right",
            type: "text",
            text: item,
          },
        ],
      }))
    );
    console.log(this.state.arr1);
    // this.setState({
    //   messages: [],
    // });
  }

  sendMessage() {
    if (this.state.conn) {
      this.state.conn.send(this.state.message);
      this.setState((prevState) => ({
        messages: [...prevState.messages, this.state.message],
      }));
      this.fullArr();
      console.log("sended", this.state.message);
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
          {/* <input
            type="text"
            value={this.state.message}
            onChange={this.handleMessage}
          />
          <button onClick={this.sendMessage}>less go</button> */}
        </div>

        <div className="chatbox">
          {/* {this.state.messages.map((item, i) => (
            <MessageBox
              position={"right"}
              type={"text"}
              text={item}
              // data={this.state.message}
            />
          ))}  */}

          {/* {this.state.rmessages.map((item, i) => (
            <MessageBox
              position={"left"}
              type={"text"}
              text={item}
              // data={this.state.message}
            />
          ))} */}

          <MessageList
            className="message-list"
            lockable={true}
            toBottomHeight={"100%"}
            dataSource={this.state.arr1}
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

export default Home;
