import React, { useEffect } from 'react';
import PageHeader from '../../components/Heading';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { ChatProvider } from '../../context/ChatContext';
import { useLocation } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';

const ChatContent = () => {
  const location = useLocation();
  const { conversations, selectConversation } = useChat();
  
  // Handle selecting a conversation from navigation state
  useEffect(() => {
    const selectedConversationId = location.state?.selectedConversationId;
    
    if (selectedConversationId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv.id === selectedConversationId);
      if (conversation) {
        selectConversation(conversation);
      }
    }
  }, [location.state, conversations, selectConversation]);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Adjust height based on header */}
      <PageHeader
        title="Chat with Restaurants"
        showSearch={false}
        buttonText=""
      />
      <div className="flex gap-5 flex-1 overflow-hidden">
        <ChatSidebar />
        <ChatWindow />
      </div>
    </div>
  );
};

const Chat = () => {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
};

export default Chat;
