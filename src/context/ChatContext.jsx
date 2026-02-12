import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  getUserConversations,
  getConversationMessages,
  sendMessage as sendMessageService,
  markMessagesAsRead,
  getUserDetails,
} from '../services/chat.services';
import { getAuth } from 'firebase/auth';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true); // Loading state for sidebar
  const [messagesLoading, setMessagesLoading] = useState(false); // Loading state for chat window
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track if this is the initial load
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState({}); // Store user details including name and image
  const auth = getAuth();

  // Load user conversations and fetch participant names
  useEffect(() => {
    let unsubscribe = () => {};

    const loadConversations = async () => {
      // Only show loading state on initial load or when auth changes
      if (isInitialLoad) {
        setConversationsLoading(true);
      }
      try {
        if (auth.currentUser) {
          unsubscribe = getUserConversations(async (conversationsData) => {
            // Extract all participant IDs from conversations
            const participantIds = new Set();

            conversationsData.forEach((conversation) => {
              // Add ALL participants to the set, including current user
              if (
                conversation.participantIds &&
                Array.isArray(conversation.participantIds)
              ) {
                conversation.participantIds.forEach((id) => {
                  participantIds.add(id); // Add all participants, including current user
                });
              } else if (conversation.participantData) {
                Object.keys(conversation.participantData).forEach((id) => {
                  participantIds.add(id); // Add all participants, including current user
                });
              }
            });

            // Fetch user details in parallel
            const details = { ...userDetails };

            // We'll fetch all participants including current user from the database
            // This ensures we have complete and consistent data for everyone

            if (participantIds.size > 0) {
              const fetchPromises = Array.from(participantIds).map((userId) =>
                getUserDetails(userId)
                  .then((userData) => {
                    if (userData) {
                      // Store all available user data
                      return {
                        userId,
                        details: {
                          ...userData, // Include all user data from the database
                          name: userData.name || 'User',
                          buisnessName:
                            userData.buisnessName ||
                            userData.name ||
                            'Business',
                          photoURL: userData.profileImage || null,
                          uid: userId,
                        },
                      };
                    }
                    return {
                      userId,
                      details: {
                        name: userId === auth.currentUser?.uid ? 'You' : 'User',
                        buisnessName:
                          userId === auth.currentUser?.uid
                            ? 'Your Business'
                            : 'Business',
                        photoURL: null,
                        uid: userId,
                      },
                    };
                  })
                  .catch(() => ({
                    userId,
                    details: {
                      name: userId === auth.currentUser?.uid ? 'You' : 'User',
                      buisnessName:
                        userId === auth.currentUser?.uid
                          ? 'Your Business'
                          : 'Business',
                      photoURL: null,
                      uid: userId,
                    },
                  }))
              );

              const results = await Promise.allSettled(fetchPromises);
              results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                  details[result.value.userId] = result.value.details;
                }
              });

              setUserDetails(details);
            }

            // Make sure we have valid conversations before proceeding
            if (Array.isArray(conversationsData)) {
              setConversations(conversationsData);
              // No automatic selection of first conversation - user will select
            } else {
              // If no conversations, set empty array
              setConversations([]);
            }

            // Only set loading to false if we have actual conversations or after a delay
            if (conversationsData.length > 0) {
              setConversationsLoading(false);
              setIsInitialLoad(false);
            } else {
              // If no conversations, keep loading state for a short time to prevent flashing
              setTimeout(() => {
                setConversationsLoading(false);
                setIsInitialLoad(false);
              }, 1000); // 1 second delay to prevent UI flashing
            }
          });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error loading conversations:', err);
        setError('Failed to load conversations');
        setConversationsLoading(false);
      }
    };

    loadConversations();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [auth.currentUser]);
  // Load messages for current conversation and fetch any new sender names
  useEffect(() => {
    let unsubscribe = () => {};

    const loadMessages = async () => {
      if (currentConversation) {
        // Show message loading only when a conversation is selected
        setMessagesLoading(true);
        try {
          unsubscribe = getConversationMessages(
            currentConversation.id,
            async (messagesData) => {
              // Check for message senders not in userNames
              const newSenderIds = new Set();
              messagesData.forEach((msg) => {
                if (
                  msg.senderId &&
                  !userDetails[msg.senderId] &&
                  msg.senderId !== auth.currentUser?.uid
                ) {
                  newSenderIds.add(msg.senderId);
                }
              });

              // Fetch any new sender details in parallel
              if (newSenderIds.size > 0) {
                const details = { ...userDetails };
                const fetchPromises = Array.from(newSenderIds).map((userId) =>
                  getUserDetails(userId)
                    .then((userData) => {
                      if (userData) {
                        return {
                          userId,
                          details: {
                            ...userData, // Include all user data from the database
                            name: userData.name || 'User',
                            buisnessName:
                              userData.buisnessName ||
                              userData.name ||
                              'Business',
                            photoURL: userData.profileImage || null,
                            uid: userId,
                          },
                        };
                      }
                      return {
                        userId,
                        details: {
                          name:
                            userId === auth.currentUser?.uid ? 'You' : 'User',
                          buisnessName:
                            userId === auth.currentUser?.uid
                              ? 'Your Business'
                              : 'Business',
                          photoURL: null,
                          uid: userId,
                        },
                      };
                    })
                    .catch(() => ({
                      userId,
                      details: {
                        name: userId === auth.currentUser?.uid ? 'You' : 'User',
                        buisnessName:
                          userId === auth.currentUser?.uid
                            ? 'Your Business'
                            : 'Business',
                        photoURL: null,
                        uid: userId,
                      },
                    }))
                );

                const results = await Promise.allSettled(fetchPromises);
                let hasNewDetails = false;
                results.forEach((result) => {
                  if (result.status === 'fulfilled' && result.value) {
                    details[result.value.userId] = result.value.details;
                    hasNewDetails = true;
                  }
                });

                if (hasNewDetails) {
                  setUserDetails(details);
                }
              }

              // Check if we should ignore this update to prevent flickering
              if (window._ignoreNextMessageUpdate) {
                // Skip this update entirely
                return;
              }

              // Preserve optimistic messages that haven't been replaced by real ones yet
              setMessages((prevMessages) => {
                // If there are no optimistic messages, just use the new data
                const hasOptimisticMessages = prevMessages.some(
                  (msg) =>
                    msg._isOptimistic ||
                    (msg.id && msg.id.toString().startsWith('temp-'))
                );

                if (!hasOptimisticMessages) {
                  return messagesData;
                }

                // Find any optimistic messages (they have temp- prefix in their ID)
                const optimisticMessages = prevMessages.filter(
                  (msg) =>
                    (msg._isOptimistic ||
                      (msg.id && msg.id.toString().startsWith('temp-'))) &&
                    // Only keep optimistic messages that don't have a corresponding real message
                    !messagesData.some(
                      (realMsg) =>
                        realMsg.content === msg.content &&
                        realMsg.senderId === msg.senderId &&
                        Math.abs(
                          realMsg.timestamp?.seconds * 1000 -
                            msg.timestamp?.seconds * 1000
                        ) < 5000
                    )
                );

                // Combine server messages with any remaining optimistic messages
                return [...messagesData, ...optimisticMessages];
              });

              // Mark messages as read
              if (auth.currentUser) {
                markMessagesAsRead(
                  currentConversation.id,
                  auth.currentUser.uid
                ).catch(() => setError('Error marking messages as read'));
              }
            }
          );
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error loading messages:', err);
          setError('Failed to load messages');
        } finally {
          setMessagesLoading(false); // Use messagesLoading instead of loading
        }
      } else {
        setMessages([]);
        setMessagesLoading(false); // Use messagesLoading instead of loading
      }
    };

    loadMessages();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentConversation, auth.currentUser, userDetails]);

  // Send a message
  const sendMessage = async (text) => {
    if (!currentConversation || !text.trim()) return;

    try {
      // Add optimistic message to local state immediately
      const now = new Date();
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content: text,
        senderId: auth.currentUser?.uid,
        // Create a timestamp object that mimics Firestore's timestamp format
        timestamp: {
          toDate: () => now,
          seconds: Math.floor(now.getTime() / 1000),
          nanoseconds: now.getMilliseconds() * 1000000,
        },
        read: false,
        conversationId: currentConversation.id,
        type: 'text',
        _isOptimistic: true, // Flag to identify this is an optimistic message
      };

      // Update messages state with the new message at the end
      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

      // Temporarily disable real-time updates to prevent flickering
      // We'll set a flag to ignore the next update from Firestore
      window._ignoreNextMessageUpdate = true;

      // Send the actual message to the server
      await sendMessageService(currentConversation.id, text);

      // After a short delay, allow updates again
      // This gives Firestore time to process the message
      setTimeout(() => {
        window._ignoreNextMessageUpdate = false;
      }, 1500); // 1.5 second delay should be enough for Firestore to process
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error sending message:', err);
      setError('Failed to send message');
      // Reset the ignore flag in case of error
      window._ignoreNextMessageUpdate = false;
    }
  };

  // Select a conversation
  const selectConversation = (conversation) => {
    setCurrentConversation(conversation);
    
    // Mark messages as read when selecting a conversation
    if (conversation && auth.currentUser) {
      markMessagesAsRead(conversation.id, auth.currentUser.uid)
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Error marking messages as read:', err);
          setError('Failed to mark messages as read');
        });
    }
  };

  // Get total unread count across all conversations
  const getTotalUnreadCount = () => {
    if (!conversations || conversations.length === 0) return 0;
    
    return conversations.reduce((total, conversation) => {
      const currentUserData = conversation.participantData?.[auth.currentUser?.uid];
      return total + (currentUserData?.unreadCount || 0);
    }, 0);
  };

  const value = {
    conversations,
    currentConversation,
    messages,
    loading: conversationsLoading, // Keep the name as 'loading' for backward compatibility
    conversationsLoading, // Also expose the new name
    messagesLoading,
    error,
    userDetails,
    sendMessage,
    selectConversation,
    getTotalUnreadCount,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { ChatContext };
