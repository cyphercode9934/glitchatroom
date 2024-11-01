import React, { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import './index.css';
import amogus from './amogus.png'

let popup;
const createErrorPopup = () => {
  if (popup) return popup;

  popup = document.createElement('div');
  popup.id = 'error-popup';
  popup.className = 'popup hidden';
  popup.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#c42b2b" class="errorImg"><path d="M479.86-264.17q21.17 0 35.2-13.7 14.03-13.7 14.03-34.87 0-21.17-13.89-35.48-13.89-14.32-35.06-14.32t-35.2 14.3q-14.03 14.3-14.03 35.47 0 21.17 13.89 34.88 13.89 13.72 35.06 13.72Zm-41.93-170.41h88.14v-259.41h-88.14v259.41Zm42.3 370.41q-86.64 0-162.31-32.59-75.66-32.58-132.12-89.04-56.46-56.46-89.04-132.12-32.59-75.66-32.59-162.36 0-86.7 32.59-162.41 32.58-75.72 88.98-131.86 56.4-56.15 132.09-88.9 75.69-32.75 162.42-32.75 86.73 0 162.49 32.72t131.87 88.82q56.12 56.1 88.86 131.93 32.73 75.83 32.73 162.55 0 86.7-32.75 162.35-32.75 75.66-88.9 131.95-56.14 56.29-131.91 89T480.23-64.17Zm.1-88.15q136.74 0 232.05-95.4 95.3-95.4 95.3-232.61 0-136.74-95.18-232.05-95.18-95.3-232.69-95.3-136.59 0-232.04 95.18-95.45 95.18-95.45 232.69 0 136.59 95.4 232.04 95.4 95.45 232.61 95.45ZM480-480Z"/></svg>
  <p>&nbsp;</p>`;

  const messageElement = document.createElement('p');
  messageElement.id = 'error-message';
  popup.appendChild(messageElement);

  document.body.appendChild(popup);

  return popup;
};

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [isChatroomVisible, setChatroomVisible] = useState(false);

  const messagesRef = collection(db, "messages");
  const messagesEndRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.classList.add('reveal');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const messagesQuery = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(newMessages);
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleGlitch = (input) => {
    let characters = input.split('');
    for (let i = characters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [characters[i], characters[j]] = [characters[j], characters[i]];
    }
    setDisplayedMessage(characters.join(''));
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    handleGlitch(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message) {
      await addDoc(messagesRef, {
        text: displayedMessage,
        username: username,
        timestamp: new Date()
      });
      setMessage("");
      setDisplayedMessage("");
    }
    else{
      showError("Please enter a message");
    }
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (!username) {
      showError("Please enter a username");
      document.getElementById('usernameInput').value = '';
    } else {
      setChatroomVisible(true);
    }
  };

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageWidth = 40;
  const imageHeight = 850;

  const handleMouseMove = (event) => {
    const x = event.clientX;
    const y = event.clientY;

    const constrainedX = Math.min(window.innerWidth - imageWidth, Math.max(0, x));
    const constrainedY = Math.min(window.innerWidth - imageHeight, Math.max(0, y));

    setMousePosition({ x: constrainedX, y: constrainedY });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    createErrorPopup();
  }, []);
  
  const showError = (message) => {
    const messageElement = document.getElementById('error-message');
    
    messageElement.textContent = message;
    popup.classList.remove('hidden');
    popup.classList.add('visible');

    setTimeout(() => {
    opaquePopup();
    }, 3000);

    setTimeout(() => {
    closePopup();
    }, 3300);
  }

  const opaquePopup = () => {
    popup.classList.remove('visible');
    popup.classList.add('opaque');
  }

  const closePopup = () => {
    popup.classList.remove('opaque');
    popup.classList.add('hidden');
  }

  const handlePaste = (e) => {
    e.preventDefault();
    showError("Pasting text is not allowed lol");
  };

  return (
    <div className="chatContainer">
      <img
        src={amogus}
        alt="Cursor Follower"
        className="amogus"
        style={{
          position: 'absolute',
          left: mousePosition.x - 490,
          top: mousePosition.y - 110,
          pointerEvents: 'none',
          width: `${imageWidth}px`,
          height: 'auto + `${imageHeight}px`',
          transition: 'transform 0.1s ease',
          animation: 'rotate 2s linear infinite',
          zIndex: 100,
        }}
      />
      {!isChatroomVisible ? (
        <div>
          <h1 className="titleUser">GLITCH@ROOM
          </h1>
          <form onSubmit={handleUsernameSubmit}>
          <input
              id="usernameInput"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
          />
          <button type="submit" id="enterChat">ENTER CHAT</button>
          </form>
        </div>
      ) : (
        <div>
          <h1 className="titleChat">GLITCH@ROOM
          </h1>
          <form onSubmit={handleSubmit}>
          <div className="messages">
            <div className="scroll">
              {messages.map(msg => (
              <div key={msg.id} className={"chatdiv " + (msg.username === username ? "right" : " ")}>
                {msg.username === username ? (
                  <div>
                    <p className="chatMessage">{msg.text}</p>
                  </div>
                ) : (
                  <div>
                    <p className="chatUser">{msg.username}:</p>
                    <p>&nbsp;</p>
                    <p className="chatMessage">{msg.text}</p>
                  </div>
                )}
              </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <input
              className="inputSpace"
              type="text"
              placeholder="Type a message"
              value={displayedMessage}
              onChange={handleMessageChange}
              onPaste={handlePaste}
          />
          <button type="submit" id="sendButton">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;