import { useEffect, useState } from "react";
import socket from "./socket";

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [users, setUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", (user) => {
      setTypingUser(user);
      setTimeout(() => setTypingUser(""), 2000);
    });

    socket.on("userList", setUsers);

    socket.on("notification", (text) => {
      setNotification(text);
      setTimeout(() => setNotification(""), 3000);
    });

    return () => {
      socket.off();
    };
  }, []);

  const joinChat = () => {
    if (username.trim()) {
      socket.emit("join", username);
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chatMessage", { username, message });
      setMessage("");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", username);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      {!joined ? (
        <div>
          <h2>Join Chat</h2>
          <input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={joinChat}>Join</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {username}!</h2>
          <div style={{ marginBottom: 10 }}>
            Online Users: {users.join(", ")}
          </div>
          {notification && <p style={{ color: "green" }}>{notification}</p>}
          <div
            style={{
              border: "1px solid #ccc",
              height: 300,
              overflowY: "scroll",
              padding: 10,
              marginBottom: 10,
            }}
          >
            {messages.map((msg, idx) => (
              <div key={idx}>
                <strong>{msg.username}</strong> [{msg.timestamp}]: {msg.message}
              </div>
            ))}
          </div>
          {typingUser && <p>{typingUser} is typing...</p>}
          <input
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleTyping}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
