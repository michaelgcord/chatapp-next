import { useEffect, useState } from 'react'
import io from '../node_modules/socket.io-client';
let socket:any;

type msgObj = {
  username: string;
  type: string;
  message: string;
}

const Home = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<msgObj[]>([]);

  // Initialize websocket and its events
  useEffect(() => {
    socketInitializer()
  }, [])

  const socketInitializer = async () => {
    await fetch('/api/socket');
    socket = io()

    socket.on('connect', () => {
      console.log('connected');
    })

    socket.on('input-receive', (msg:msgObj) => {
      storeMessage(msg);
    })    
  }

  const handleChange = (e:any) => {
    setInput(e.target.value);
  }

  const storeMessage = (message:msgObj) => {
    setMessages(prevMessages => [...prevMessages, message])
  }

  const handleClick = () => {
    console.log(messages);
  }

  const handleEnter = (e:any) => {
    if (e.key == 'Enter') {
      e.preventDefault();
      storeMessage({ username: 'name', type: 'self', message: e.target.value });
      socket.emit('input-sent', {username: 'name', type: 'other', message: e.target.value});
    }
  }

  return (
    <div>
      <input
        placeholder="Type something"
        value={input}
        onChange={handleChange}
        onKeyDown={handleEnter}
      />
      <button onClick={handleClick}>click me</button>
      {messages.map((element:msgObj, index) => {
        return (
          <div key={index}>
            <div style={{
              color: element.type === 'self' ? 'red' : 'blue'
            }}>
              {element.message}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Home;