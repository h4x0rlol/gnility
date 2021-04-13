import React from "react";
import Peer from "peerjs";

type MyProps = {
  // using `interface` is also ok
  message: string;
};
type MyState = {
  peer: Peer;
  peer_id: any;
  conn: any;
  connState: any;
};

class Home extends React.Component<MyProps, MyState> {
  state: MyState = {
    peer: new Peer(),
    peer_id: null,
    conn: null,
    connState: "not connected",
  };

  constructor(props) {
    super(props);
    this.state.peer.on("open", async (id) => {
      this.setState({ peer_id: id });
    });
  }
  render() {
    return <div>{this.state.peer_id}</div>;
  }
}

export default Home;
