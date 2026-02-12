import { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useChat } from '../../hooks/useChat';
import { format } from 'date-fns';
import { auth } from '../../config/firebase';
import chat from '../../assets/chatIcon.svg';
import { m, AnimatePresence } from 'framer-motion';

const ChatWindow = () => {
  const {
    currentConversation,
    messages,
    sendMessage,
    userDetails,
    messagesLoading,
  } = useChat();
  const messagesEndRef = useRef(null);

  // Scroll to bottom of the chat container (normal chat flow)
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll when messages change or when conversation changes
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, currentConversation]);

  // Handle initial render
  useEffect(() => {
    scrollToBottom();
  }, []);

  // Send message and scroll to bottom after sending
  const handleSendMessage = (text) => {
    if (text.trim()) {
      sendMessage(text);
      // Small delay to ensure the message is added to the DOM
      setTimeout(scrollToBottom, 100);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      return format(new Date(), 'h:mm a');
    }

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'h:mm a');
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return format(new Date(), 'h:mm a');
    }
  };

  // Get the name of the receiver in a conversation
  const getReceiverDetails = (conversation) => {
    if (!conversation) return { name: 'User', photoURL: null };

    const currentUserId = auth.currentUser?.uid;
    let otherParticipantId = '';

    if (
      conversation.participantIds &&
      Array.isArray(conversation.participantIds)
    ) {
      otherParticipantId =
        conversation.participantIds.find((id) => id !== currentUserId) || '';
    } else if (conversation.participantData) {
      otherParticipantId =
        Object.keys(conversation.participantData).find(
          (id) => id !== currentUserId
        ) || '';
    }

    return userDetails[otherParticipantId] || { name: 'User', photoURL: null };
  };

  const formatDateLabel = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return '';
    const messageDate = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return format(messageDate, 'MMMM d, yyyy');
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    const messagesCopy = [...messages];

    messagesCopy.sort((a, b) => {
      const getTime = (msg) => {
        if (msg.timestamp && msg.timestamp.toDate) {
          return msg.timestamp.toDate().getTime();
        } else if (msg.timestamp && msg.timestamp.seconds) {
          return msg.timestamp.seconds * 1000;
        }
        return 0;
      };

      return getTime(a) - getTime(b);
    });

    messagesCopy.forEach((msg) => {
      let timestamp = null;
      if (msg.timestamp && msg.timestamp.toDate) {
        timestamp = msg.timestamp.toDate();
      } else if (msg.timestamp && msg.timestamp.seconds) {
        timestamp = new Date(msg.timestamp.seconds * 1000);
      }

      if (timestamp) {
        const dateStr = timestamp.toDateString();
        if (!groups[dateStr]) {
          groups[dateStr] = [];
        }
        groups[dateStr].push(msg);
      } else {
        const noDateGroup = 'no-date';
        if (!groups[noDateGroup]) {
          groups[noDateGroup] = [];
        }
        groups[noDateGroup].push(msg);
      }
    });

    return groups;
  };

  // Track if messages are loading for the current conversation
  const isChatLoading = messagesLoading && currentConversation;

  if (!currentConversation) {
    return (
      <div className="w-2/3 flex flex-col border border-border rounded-lg h-full mx-auto overflow-hidden items-center justify-center">
        <div className="text-center p-6">
          <div className="w-20 h-20 bg-primary-light rounded-full mx-auto mb-4 flex items-center justify-center">
            <img src={chat} alt="chat" className="h-full w-full" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Conversation Selected
          </h3>
          <p className="text-gray-500 mb-6">
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-2/3 flex flex-col border border-border rounded-lg h-full mx-auto overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center py-3 gap-2 border-b mx-3 border-border flex-shrink-0">
        {isChatLoading ? (
          <div className="flex items-center gap-2 w-full">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 bg-primary-light/20 rounded-full flex items-center justify-center">
              <span className="text-primary-light font-bold">
                {(() => {
                  const currentUserId = auth.currentUser?.uid;
                  let otherParticipantId = '';

                  if (
                    currentConversation.participantIds &&
                    Array.isArray(currentConversation.participantIds)
                  ) {
                    otherParticipantId =
                      currentConversation.participantIds.find(
                        (id) => id !== currentUserId
                      ) || '';
                  } else if (currentConversation.participantData) {
                    otherParticipantId =
                      Object.keys(currentConversation.participantData).find(
                        (id) => id !== currentUserId
                      ) || '';
                  }

                  if (userDetails[otherParticipantId]?.name) {
                    return userDetails[otherParticipantId].name
                      .charAt(0)
                      .toUpperCase();
                  } else if (otherParticipantId) {
                    return otherParticipantId.charAt(0).toUpperCase();
                  } else {
                    return 'C';
                  }
                })()}
              </span>
            </div>
            <div>
              <h4 className="font-bold text-text-primary">
                {(() => {
                  const currentUserId = auth.currentUser?.uid;
                  let otherParticipantIds = [];

                  if (
                    currentConversation.participantIds &&
                    Array.isArray(currentConversation.participantIds)
                  ) {
                    otherParticipantIds =
                      currentConversation.participantIds.filter(
                        (id) => id !== currentUserId
                      );
                  } else if (currentConversation.participantData) {
                    otherParticipantIds = Object.keys(
                      currentConversation.participantData
                    ).filter((id) => id !== currentUserId);
                  }

                  if (otherParticipantIds.length > 0) {
                    return otherParticipantIds
                      .map((id) => userDetails[id]?.name || id.substring(0, 8))
                      .join(' & ');
                  } else {
                    return 'Chat';
                  }
                })()}
              </h4>
            </div>
          </>
        )}
      </div>

      {/* Chat Messages (Scrollable) */}
      <div
        id="chat-container"
        className="flex-1 p-4 overflow-y-auto flex flex-col"
      >
        {isChatLoading ? (
          <div className="flex flex-col h-full w-full">
            {/* Chat message loading skeleton */}
            <div className="animate-pulse space-y-4 w-full mt-4">
              {/* Left message skeleton (other user) */}
              <div className="flex items-start gap-2 max-w-[75%]">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-16 bg-gray-200 rounded-lg w-64"></div>
                  <div className="h-2 bg-gray-200 rounded w-12 mt-1 ml-auto"></div>
                </div>
              </div>

              {/* Right message skeleton (current user) */}
              <div className="flex items-start gap-2 max-w-[75%] ml-auto">
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1 ml-auto"></div>
                  <div className="h-12 bg-gray-200 rounded-lg w-56"></div>
                  <div className="h-2 bg-gray-200 rounded w-12 mt-1"></div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>

              {/* Left message skeleton (other user) */}
              <div className="flex items-start gap-2 max-w-[75%]">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-48"></div>
                  <div className="h-2 bg-gray-200 rounded w-12 mt-1 ml-auto"></div>
                </div>
              </div>

              <div className="flex justify-center my-4">
                <div className="flex space-x-2 mb-3">
                  <div className="w-3 h-3 bg-primary-light rounded-full"></div>
                  <div className="w-3 h-3 bg-primary-light rounded-full animation-delay-200"></div>
                  <div className="w-3 h-3 bg-primary-light rounded-full animation-delay-400"></div>
                </div>
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10">
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              No messages yet
            </h4>
            <p className="text-gray-500 mb-4">
              Start the conversation by sending a message below!
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {Object.entries(groupMessagesByDate(messages)).map(
                ([dateStr, dateMessages]) => (
                  <div key={dateStr}>
                    {/* Date label */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                        {dateStr === 'no-date'
                          ? ''
                          : formatDateLabel(dateMessages[0].timestamp)}
                      </div>
                    </div>

                    {/* Messages for this date */}
                    {dateMessages.map((msg) => {
                      let messageText = '';
                      let senderId = '';
                      let timestamp = null;

                      if (typeof msg === 'object') {
                        if (msg.content && typeof msg.content === 'string') {
                          messageText = msg.content;
                          senderId = msg.senderId || '';
                          timestamp = msg.timestamp || null;
                        } else if (msg.text && typeof msg.text === 'string') {
                          messageText = msg.text;
                          senderId = msg.senderId || '';
                          timestamp = msg.timestamp || null;
                        } else {
                          if (msg.content && typeof msg.content === 'object') {
                            try {
                              messageText = JSON.stringify(msg.content);
                              // eslint-disable-next-line no-unused-vars
                            } catch (error) {
                              messageText = 'Complex message';
                            }
                          } else {
                            messageText = 'Message';
                          }
                          senderId = msg.senderId || '';
                          timestamp = msg.timestamp || null;
                        }
                      } else if (typeof msg === 'string') {
                        messageText = msg;
                      }

                      return (
                        <m.div
                          key={msg.messageId || msg.id || crypto.randomUUID()}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          style={{ willChange: 'opacity, transform' }}
                        >
                          <ChatMessage
                            sender={
                              senderId === auth.currentUser?.uid
                                ? userDetails[auth.currentUser?.uid]?.name ||
                                  'You'
                                : userDetails[senderId]?.name || 'User'
                            }
                            message={messageText}
                            time={formatTimestamp(timestamp)}
                            isUser={senderId === auth.currentUser?.uid}
                            reciver={
                              senderId === auth.currentUser?.uid
                                ? getReceiverDetails(currentConversation)
                                    .buisnessName
                                : userDetails[auth.currentUser?.uid]
                                    ?.buisnessName || 'You'
                            }
                            senderPhoto={
                              senderId === auth.currentUser?.uid
                                ? userDetails[auth.currentUser?.uid]?.photoURL
                                : userDetails[senderId]?.photoURL
                            }
                            receiverPhoto={
                              senderId === auth.currentUser?.uid
                                ? getReceiverDetails(currentConversation)
                                    .photoURL
                                : userDetails[auth.currentUser?.uid]?.photoURL
                            }
                          />
                        </m.div>
                      );
                    })}
                  </div>
                )
              )}
            </AnimatePresence>
            {/* Scroll anchor div at the bottom */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Fixed Chat Input */}
      <m.div
        className="rounded-b-lg bg-white border-t border-border flex-shrink-0"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ChatInput onSendMessage={handleSendMessage} />
      </m.div>
    </div>
  );
};

export default ChatWindow;
