import { useEffect, useState, useRef } from 'react'
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SendIcon from '@mui/icons-material/Send';
import Backdrop from '@mui/material/Backdrop';
import io from '../node_modules/socket.io-client';
import styles from '../styles/Home.module.css';
let socket:any;

type msgObj = {
  username: string;
  type: string;
  message: string;
  id: number;
}

const Home = () => {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(true);
  const [username, setUsername] = useState('');
  const [id, setId] = useState(0);
  const [messages, setMessages] = useState<msgObj[]>([]);
  const messageEndRef = useRef<null | HTMLDivElement>(null);

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

  // Scrolls most recent message into view when content begins to overflow
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages])

  const handleChange = (e:any) => {
    setInput(e.target.value);
  }

  const storeMessage = (message:msgObj) => {
    setMessages(prevMessages => [...prevMessages, message])
  }

  /* 
    When client presses enter inside textfield, sends message to other clients via websocket,
    stores message into messages, and clears out the current message.
  */
  const handleEnter = (e:any) => {
    if (e.key == 'Enter') {
      e.preventDefault();
      if (e.target.value === '') return;
      storeMessage({ username: username, id: id, type: 'self', message: e.target.value});
      socket.emit('input-sent', {username: username, id: id, type: 'other', message: e.target.value});
      setInput('');
    }
  }

  /* 
    Sets the username and id of a client when prompted, then closes backdrop.
  */
  const handleUsernameSubmit = (e:any) => {
    if (e.key == 'Enter') {
      e.preventDefault();
      if (e.target.value === '') return;
      setUsername(e.target.value);
      setOpen(false);
      setId(Math.floor(Math.random() * 10000) + 1);
    }
  }

  const handleClose = () => {
    setOpen(true);
  }

  /* 
    Helper function to see if consecutive messages are from the same person.
    Used to determine if the username should be displayed above the text. Consecutive
    messages from the same person should only display their name once.
  */
  const isSamePerson = (message:msgObj, index:number) => {
    if (index === 0) return false;

    if (message.username === messages[index-1].username && message.id === messages[index-1].id) {
        return true;
    } else {
      return false;
    }
  }

  return (
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <div  className={styles.chat_container} style={{ 
      backgroundColor: '#36393f',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
     }}>
      <div style={{ fontSize: '32px', textAlign: 'center', color: 'white', padding: '20px'  }}>Chat App</div>
      <hr style={{ width: '100%' }}/>
      <div style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '10px' }}>
        <div style={{
          textAlign: 'center',
          color: 'white',
          padding: '8px',
          fontSize: '12px',
          opacity: '50%',
        }}>Be kind and respectful! Messages are not saved.</div>
        {messages.map((element, index) => {
          return (
            <div key={index}>
            {!isSamePerson(element, index) && 
            <div style={{
              color: 'white',
              width: 'fit-content',
              fontSize: '12px',
              padding: element.type === 'self' ? '12px 15px 2px 0' : '12px 0 2px 15px',
              marginLeft: element.type === 'self' ? 'auto' : '0',
            }}>
              {element.username}
            </div>
            }
            <div style={{
              width: '70%',
              padding: '0 10px 2px',
              marginLeft: element.type === 'self' ? 'auto' : 0,
            }}>
              <div style={{
                textAlign: 'left',
                maxWidth: 'fit-content',
                borderRadius: '10px',
                padding: '5px 10px',
                color: 'white',
                backgroundColor: element.type === 'self' ? '#0084ff' : '#606060',
                marginLeft: element.type === 'self' ? 'auto' : 0,
              }}>
                {element.message}
              </div>
            </div>
            </div>
          )
        })}
      <div ref={messageEndRef}/>
      </div>
      <hr style={{ width: '100%' }}/>
      <div style={{ padding: '14px 12px 13px' }}>
      <Paper component="form" elevation={0} sx={{
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '50px',
        backgroundColor: '#40444B',
      }}> 
          <InputBase
              placeholder="Send a message"
              value={input}
              onChange={handleChange}
              onKeyDown={handleEnter}
              sx={{
                marginLeft: '12px',
                color: '#d9d9d9',
                flex: 1,
              }}
          />
          <SendIcon sx={{ color: '#d9d9d9', marginRight: '6px' }}/>
      </Paper>
      </div>
      <Backdrop
        open={open}
        onClick={handleClose}
        invisible={true}
      >
        <div style={{
          backgroundColor: '#606060',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{color: 'white'}}>Enter a username</div>
          <Paper component="form" elevation={0} sx={{
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '40px',
            backgroundColor: '#ffffff',
          }}> 
              <InputBase
                  onKeyDown={handleUsernameSubmit}
                  sx={{
                    marginLeft: '12px',
                    flex: 1,
                  }}
              />
              <SendIcon sx={{ color: '#d9d9d9', marginRight: '6px' }}/>
          </Paper>          
        </div>
      </Backdrop>
    </div>
    </div>
  )
  }
  
  export default Home;