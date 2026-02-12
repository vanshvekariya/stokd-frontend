// ChatSidebar.jsx
import { useState } from 'react';
import Input from '../../components/Input';
import { Search } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { format } from 'date-fns';
import chat from '../../assets/chatIcon.svg';
import { auth } from '../../config/firebase';

const ChatSidebar = () => {
  const {
    conversations,
    currentConversation,
    selectConversation,
    conversationsLoading, // Use the dedicated loading state for conversations
    userDetails,
  } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  // User names are now fetched in the ChatContext

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return '';
    return format(timestamp.toDate(), 'h:mm a');
  };



  const renderEmptyState = () => (
    <div className="p-6 text-center">
      {searchTerm ? (
        <>
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">
            No results found
          </h4>
          <p className="text-gray-500">
            We couldn&apos;t find any conversations matching &quot;
            {searchTerm}&quot;
          </p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-primary-light rounded-full mx-auto mb-4 flex items-center justify-center">
            <img src={chat} alt="chat" className="h-full w-full" />
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">
            No conversations yet
          </h4>
          <p className="text-gray-500 mb-4">
            Your conversations will appear here
          </p>
          <div className="max-w-xs mx-auto"></div>
        </>
      )}
    </div>
  );

  const renderConversations = () =>
    conversations.map((chat) => {
      // Get unread count for current user
      const currentUserId = auth.currentUser?.uid;
      const unreadCount = chat.participantData?.[currentUserId]?.unreadCount || 0;

      return (
        <div
          key={chat.id}
          className={`p-3 rounded-lg cursor-pointer border border-border flex items-start gap-3 transition ${
            currentConversation && currentConversation.id === chat.id
              ? 'bg-border'
              : 'hover:bg-gray-200'
          }`}
          onClick={() => selectConversation(chat)}
        >
          <div className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center">
            <span className="text-primary-light font-bold">
              {(() => {
                // Get other participant ID (not current user)
                const currentUserId = auth.currentUser?.uid;
                let otherParticipantId = '';

                if (chat.participantIds && Array.isArray(chat.participantIds)) {
                  otherParticipantId =
                    chat.participantIds.find((id) => id !== currentUserId) || '';
                } else if (chat.participantData) {
                  otherParticipantId =
                    Object.keys(chat.participantData).find(
                      (id) => id !== currentUserId
                    ) || '';
                }

                // Get first letter of name or ID
                if (userDetails[otherParticipantId]?.name) {
                  return userDetails[otherParticipantId].name
                    .charAt(0)
                    .toUpperCase();
                } else if (otherParticipantId) {
                  return otherParticipantId.charAt(0).toUpperCase();
                } else {
                  return 'U';
                }
              })()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-text-primary">
                {(() => {
                  // Get other participant ID (not current user)
                  const currentUserId = auth.currentUser?.uid;
                  let otherParticipantIds = [];

                  if (chat.participantIds && Array.isArray(chat.participantIds)) {
                    otherParticipantIds = chat.participantIds.filter(
                      (id) => id !== currentUserId
                    );
                  } else if (chat.participantData) {
                    otherParticipantIds = Object.keys(
                      chat.participantData
                    ).filter((id) => id !== currentUserId);
                  }

                  // Display names if available, otherwise IDs
                  if (otherParticipantIds.length > 0) {
                    return otherParticipantIds
                      .map((id) => userDetails[id]?.name || id.substring(0, 8))
                      .join(' & ');
                  } else {
                    return 'Chat';
                  }
                })()}
              </h4>
              <span className="text-xs text-gray-500">
                {chat.lastMessage?.timestamp
                  ? formatTimestamp(chat.lastMessage.timestamp)
                  : ''}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 truncate">
                {(() => {
                  if (chat.lastMessage) {
                    if (chat.lastMessage.content) {
                      return chat.lastMessage.content.substring(0, 30) + '...';
                    } else if (chat.lastMessage.text) {
                      return chat.lastMessage.text.substring(0, 30) + '...';
                    }
                  }
                  return 'No messages yet';
                })()}
              </p>
              {unreadCount > 0 && (
                <div className="bg-primary-light text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                  {unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });

  return (
    <div className="w-1/3 flex flex-col gap-4 h-full">
      <div className="flex flex-col w-full gap-3 mt-[1px] ml-0.5">
        <div className="flex gap-3">
          <Input
            name="search"
            variant="search"
            placeholder="Search Restaurant"
            onChange={handleSearch}
            value={searchTerm}
            icon={<Search color="#64748B" className="w-5 h-5" />}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {conversationsLoading ? (
            <div className="animate-pulse">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="p-3 rounded-lg border border-border mb-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="h-3 w-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            renderEmptyState()
          ) : (
            renderConversations()
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
