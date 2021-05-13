import Peer from "peerjs";

// Lobby name
export const LOBBY_NAME = "gnility";

// Just random strings
export const userStates = {
  NOT_CONNECTED: "d342d515-db7f-483b-903b-e3a4158a503e",
  CONNECTING: "55f2b1a1-7542-4f54-b1b2-3321b189914b",
  CONNECTED: "217e6f00-baa4-429a-952f-2853a85a783a",
  AWAITING: "5a3320de-dbd7-4fb5-afb4-264828daa614",
  TYPING: "4b02ae8f-c2de-4251-8176-1f275db86ceb",
  USERNAME: "9f1b62a0-bb44-4ae1-b0d7-0c870020c03d",
  SWITCH: "484f05a0-7cee-41cf-bddb-acd830825a72",
};

// Props for component
export type ChatProps = {
  name: string;
};

// State for component
export type ChatState = {
  peer: Peer;
  peer_id: string;
  conn: Peer.DataConnection;
  connState: string;
  inlobby: string[];
  message: string;
  messages: any;
  rpeer: string;
  typing: boolean;
  rname: string;
  theme: string;
  lconn: Peer.DataConnection;
  inChat: boolean;
  customTheme: string;
  search: boolean;
  awaiting: boolean;
};

export type MainProps = {
  name: string;
};

export type MainState = {
  name: string;
};

// Delay function
export const delay = (ms) => new Promise((res) => setTimeout(res, ms));
