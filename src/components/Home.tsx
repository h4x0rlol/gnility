import React from "react";
import Peer from "peerjs";
import { ThumbUpSharp } from "@material-ui/icons";

type MyProps = {
  // using `interface` is also ok
  message: string;
};
type MyState = {
  peer: Peer;
  peer_id: any;
  conn: any;
  connState: any;
  rpeer: any;
};

class Home extends React.Component<MyProps, MyState> {
  state: MyState = {
    peer: new Peer(),
    peer_id: null,
    conn: null,
    connState: "not connected",
    rpeer: null,
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.connect = this.connect.bind(this);
    this.state.peer.on("open", async (id) => {
      this.setState({ peer_id: id });
    });
    this.state.peer.on("connection", (conn) => {
      console.log("got connection from", conn.peer);
      if (this.state.conn == null) {
        this.setState({ conn: conn, connState: "connected" });
        conn.on("data", (data) => {
          console.log("Received", data);
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
        console.log("Received back", data);
      });
    }
  }

  render() {
    return (
      <div>
        My peer:{this.state.peer_id}
        <input
          type="text"
          value={this.state.rpeer}
          onChange={this.handleChange}
        />
        <button onClick={this.connect}>less go</button>
      </div>
    );
  }
}

export default Home;
