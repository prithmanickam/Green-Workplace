import React, { useState, useEffect, useRef } from 'react';
import SideNavbar from '../components/SideNavbar';
import {
  Box,
  Select,
  MenuItem,
  Stack,
  InputLabel,
  TextField,
  Button
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { toast } from "react-toastify";
import { useUser } from '../context/UserContext';
import { baseURL } from "../utils/constant";
import supabase from '../config/supabaseConfig';
import useAuth from '../hooks/useAuth';

const formatMessageDate = (dateString) => {
  const [datePart, timePart] = dateString.split(', ');
  const [day, month, year] = datePart.split('/');
  const [hour, minute] = timePart.split(':');

  const now = new Date();
  if (
    now.getDate() === parseInt(day) &&
    now.getMonth() + 1 === parseInt(month) &&
    now.getFullYear() === parseInt(year)
  ) {
    return `${hour}:${minute}`;
  } else {
    return `${day}/${month}, ${hour}:${minute}`;
  }
};

const messageContainerStyle = {
  width: '60%',
  margin: '8px',
};

const MyMessage = ({ message, userName, messageDate }) => (
  <div style={{ marginBottom: '8px', textAlign: 'right' }}>
    <div>{userName}</div>
    <div>{formatMessageDate(messageDate)}</div>
    <div
      style={{
        ...messageContainerStyle,
        background: 'lightgreen',
        padding: '8px',
        borderRadius: '10px',
        textAlign: 'left',
        marginLeft: '40%',
        color: 'black',
      }}
    >
      {message.message}
    </div>
  </div>
);

const TheirMessage = ({ message, userName, messageDate }) => (
  <div style={{ marginBottom: '8px' }}>
    <div>{userName}</div>
    <div>{formatMessageDate(messageDate)}</div>
    <div
      style={{
        ...messageContainerStyle,
        background: 'lightgrey',
        padding: '8px',
        borderRadius: '10px',
        textAlign: 'right',
        marginRight: '40%',
        color: 'black',
      }}
    >
      {message.message}
    </div>
  </div>
);

export default function TeamChat() {
  const { userData } = useUser();
  const messagesContainerRef = useRef(null);

  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [userTeams, setUserTeams] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const teamOptions = userTeams.map(team => ({
    team_id: team.team_id,
    team_name: team.Team.name,
  }));

  useAuth(["Employee"]);

  useEffect(() => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }

    }, 800);
  }, [messagesContainerRef]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('Message')
        .select(`
        date,
        message,
        user_id,
        User(firstname, lastname)
        `)
        .eq('team_id', selectedTeamId);

      if (error) {
        toast.error("Failed to fetch chat messages.");
        return;
      }
      setMessages(data);

      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    };
    if (userData) {
      fetch(`${baseURL}/getUserTeams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.id,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setUserTeams(data.user_teams);
            if (data.user_teams.length > 0 && selectedTeam === '') {
              setSelectedTeam(data.user_teams[0].Team.name);
              setSelectedTeamId(data.user_teams[0].team_id);
            }
          } else {
            toast.error("Failed to fetch user's teams.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching teams data.");
        });
    }

    if (!selectedTeamId) {
      return;
    }

    fetchMessages();

    const teamChannel = supabase.channel(`team-channel-${selectedTeamId}`);

    console.log(selectedTeamId)

    teamChannel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Message', filter: `team_id=eq.${selectedTeamId}` },
        (payload) => {
          console.log('Change received!', payload)
          setMessages((prevMessages) => [...prevMessages, payload.new]);
        }
      )
      .subscribe()

    return () => {
      teamChannel.unsubscribe();
    };

  }, [userData, selectedTeam, selectedTeamId]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const newMessageData = {
      message: newMessage,
      date: new Date().toISOString(),
      user_id: userData.id,
      team_id: selectedTeamId,
    };

    const { error } = await supabase.from('Message').upsert([newMessageData]);

    if (error) {
      toast.error("Failed to send the message.");
    }

    setNewMessage('');

    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }

    }, 100);
  };


  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 10,
          px: 5,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack direction="row" py={1} spacing={5} alignItems="center">
          <h1>Team Chat</h1>
          <InputLabel>You are viewing team:</InputLabel>
          <Select
            value={selectedTeamId}
            sx={{ width: 300 }}
            onChange={(e) => {
              const newSelectedTeamId = e.target.value;
              setSelectedTeamId(newSelectedTeamId);
              const selectedTeamObject = teamOptions.find(
                (option) => option.team_id === newSelectedTeamId
              );
              if (selectedTeamObject) {
                setSelectedTeam(selectedTeamObject.team_name);
                setTimeout(() => {
                  if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                  }

                }, 500);
              }
            }}
            style={{ marginBottom: '16px' }}
          >
            {teamOptions.map((option, index) => (
              <MenuItem key={option.team_id} value={option.team_id}>
                {option.team_name}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        {/* Chat messages container */}
        <div
          style={{
            flex: 1,
            maxHeight: 400,
            overflowY: 'auto',
            padding: '10px',
            marginBottom: '10px',
          }}
          ref={messagesContainerRef}
        >
          {messages.map((message, index) => {
            const isMyMessage = message.user_id === userData.id;
            const userName = isMyMessage
              ? 'You'
              : message.User
                ? `${message.User.firstname} ${message.User.lastname}`
                : 'Team Member';
            const messageDate = new Date(message.date).toLocaleString(); // Format the date

            return isMyMessage ? (
              <MyMessage
                key={index}
                message={message}
                userName={userName}
                messageDate={messageDate}
              />
            ) : (
              <TheirMessage
                key={index}
                message={message}
                userName={userName}
                messageDate={messageDate}
              />
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
          <TextField
            label="Type your message..."
            variant="outlined"
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={sendMessage}
            style={{ marginLeft: '10px' }}
          >
            Send
          </Button>
        </div>
      </Box>
    </Box>
  );
}