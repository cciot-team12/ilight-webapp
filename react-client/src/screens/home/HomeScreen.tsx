import { Button } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const serverPort = import.meta.env.VITE_SERVER_PORT || 3001;
const serverUrl = import.meta.env.VITE_SERVER_URL || "localhost";

console.log("connecting to " + serverUrl + ":" + serverPort);

const socket = io(serverUrl + ":" + serverPort);

const HomeScreen = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });
    socket.on("disconnect", () => {
      setIsConnected(false);
    });
    socket.on("message", (data) => {
      setLastMessage(data);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    socket.emit("hello!");
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <header className="">
        <p>Connected: {"" + isConnected}</p>
        <p>Last message: {lastMessage || "-"}</p>
      </header>
      {/* <button onClick={sendMessage}>Say hello!</button> */}
      <TimePicker label="Enter Alarm Time" />
      <Button
        className="justify-center"
        variant="contained"
        onClick={sendMessage}
      >
        Say hello!
      </Button>
    </div>
  );
};

export default HomeScreen;
