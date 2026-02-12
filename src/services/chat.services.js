// chat.services.js
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  where,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Create a new conversation or get existing one
export const createOrGetConversation = async (participantId, participantName = '', participantImage = '') => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // First check if the participant user exists in the users collection
  const userRef = doc(db, 'users', participantId);
  const userDoc = await getDoc(userRef);

  // If user doesn't exist, create them
  if (!userDoc.exists()) {
    // Create user in the users collection
    await setDoc(userRef, {
      id: participantId,
      name: participantName,
      profileImage: participantImage,
      lastActiveAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }

  // Also ensure current user exists in users collection
  const currentUserRef = doc(db, 'users', currentUser.uid);
  const currentUserDoc = await getDoc(currentUserRef);

  if (!currentUserDoc.exists()) {
    // Get supplier info from local storage
    let supplierName = '';
    let profileImage = '';
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedData = JSON.parse(userData);
        
        // Get supplier business name and logo
        if (parsedData.supplier && parsedData.supplier.businessName) {
          supplierName = parsedData.supplier.businessName;
          profileImage = '';
        } 
        // Fallback to user name if supplier info isn't available
        else if (parsedData.user && parsedData.user.name) {
          supplierName = parsedData.user.name;
        }
      }
    } catch (error) {
      console.error('Error getting user data from localStorage:', error);
    }

    // Create current user in the users collection
    await setDoc(currentUserRef, {
      id: currentUser.uid,
      name: supplierName || currentUser.displayName || '',
      profileImage: '',
      lastActiveAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }

  // Check if conversation already exists
  const conversationsRef = collection(db, 'conversations');

  // Get all conversations and check manually
  const querySnapshot = await getDocs(conversationsRef);
  let existingConversation = null;

  querySnapshot.forEach((doc) => {
    const conversation = doc.data();

    // Check if both users are participants in this conversation
    if (conversation.participantData) {
      // New structure with participantData
      const participants = Object.keys(conversation.participantData);
      if (
        participants.includes(currentUser.uid) &&
        participants.includes(participantId)
      ) {
        existingConversation = { id: doc.id, ...conversation };
      }
    } else if (conversation.participants) {
      // Old structure with participants array
      if (
        conversation.participants.includes(currentUser.uid) &&
        conversation.participants.includes(participantId)
      ) {
        existingConversation = { id: doc.id, ...conversation };
      }
    }
  });

  if (existingConversation) {
    return existingConversation;
  }

  // Create new conversation with the structure shown in the screenshots
  const newConversation = {
    createdAt: serverTimestamp(),
    isGroupChat: false,
    isReported: false,
    lastMessage: null,
    participantIds: [currentUser.uid, participantId],
    participantData: {
      [currentUser.uid]: {
        userId: currentUser.uid,
        role: 'member',
        lastSeenAt: serverTimestamp(),
        typingStatus: false,
        unreadCount: 0,
        blockedUsers: [],
      },
      [participantId]: {
        userId: participantId,
        role: 'member',
        lastSeenAt: serverTimestamp(),
        typingStatus: false,
        unreadCount: 0,
        blockedUsers: [],
      },
    },
  };

  const docRef = await addDoc(conversationsRef, newConversation);
  return { id: docRef.id, ...newConversation };
};

// Check if a user has blocked another user or vice versa
export const checkUserBlockStatus = async (conversationId, senderId, receiverId) => {
  if (!senderId || !receiverId) {
    return { isBlocked: false };
  }

  try {
    // Get the conversation document
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
      return { isBlocked: false };
    }

    const conversationData = conversationSnap.data();
    console.log(conversationData);
    
    // Check if the conversation has participantData
    if (conversationData.participantData) {
      // Check if receiver has blocked sender
      if (conversationData.participantData[receiverId] && 
          conversationData.participantData[receiverId].blockedUsers && 
          conversationData.participantData[receiverId].blockedUsers.includes(senderId)) {
        return { 
          isBlocked: true, 
          message: 'You have been blocked by the other user' 
        };
      }
      
      // Check if sender has blocked receiver
      if (conversationData.participantData[senderId] && 
          conversationData.participantData[senderId].blockedUsers && 
          conversationData.participantData[senderId].blockedUsers.includes(receiverId)) {
        return { 
          isBlocked: true, 
          message: 'You have blocked this user' 
        };
      }
    }
    
    return { isBlocked: false };
  } catch (error) {
    console.error('Error checking block status:', error);
    return { isBlocked: false };
  }
};

// Send a message
export const sendMessage = async (conversationId, text) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Get the conversation document to check its structure
  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationSnap = await getDoc(conversationRef);

  if (!conversationSnap.exists()) {
    throw new Error('Conversation not found');
  }

  const conversationData = conversationSnap.data();

  // Find the opposite participant's userId
  const participantIds = Object.keys(conversationData.participantData || {});
  const oppositeUserId = participantIds.find((id) => id !== currentUser.uid);

  // Check if either user has blocked the other
  if (oppositeUserId) {
    const blockStatus = await checkUserBlockStatus(
      conversationId, 
      currentUser.uid, 
      oppositeUserId
    );
    
    if (blockStatus.isBlocked) {
      throw new Error(blockStatus.message);
    }
  }

  // Create message data with the format matching what you receive
  const messageData = {
    content: text,
    type: 'text',
    senderId: currentUser.uid,
    timestamp: serverTimestamp(),
    conversationId: conversationId, // Add conversation ID to the message data
    readStatus: {
      [currentUser.uid]: Date.now() // Mark as read by sender immediately
    },
    isDeleted: false,
    isEdited: false,
    editedAt: null,
    metadata: null,
    mentionedUserIds: null,
    reactions: null
  };

  // Add the message to the messages subcollection
  const messagesRef = collection(
    db,
    'conversations',
    conversationId,
    'messages'
  );
  const messageDocRef = await addDoc(messagesRef, messageData);

  // Update the conversation document with the last message
  const updateData = {
    lastMessage: {
      content: text,
      type: 'text',
      senderId: currentUser.uid,
      timestamp: serverTimestamp(),
      messageId: messageDocRef.id,
      conversationId: conversationId, // Add conversation ID to the last message data
    },
  };

  // If using the new structure with participantData
  if (conversationData.participantData) {
    // Update typing status and last seen for current user
    updateData[`participantData.${currentUser.uid}.typingStatus`] = false;
    updateData[`participantData.${currentUser.uid}.lastSeenAt`] =
      serverTimestamp();
      
    // Increment unread count for all participants except the sender
    Object.keys(conversationData.participantData).forEach(participantId => {
      if (participantId !== currentUser.uid) {
        updateData[`participantData.${participantId}.unreadCount`] = 
          (conversationData.participantData[participantId]?.unreadCount || 0) + 1;
      }
    });
  }

  // Find the opposite participant's userId
  const participantIds2 = Object.keys(conversationData.participantData);
  const oppositeUserId2 = participantIds2.find((id) => id !== currentUser.uid);

  if (oppositeUserId2) {
    // Get the current unreadCount for the opposite user
    const currentUnreadCount =
      conversationData.participantData[oppositeUserId2].unreadCount || 0;

    // Add to updateData: increment unreadCount for the opposite user
    updateData[`participantData.${oppositeUserId2}.unreadCount`] = currentUnreadCount + 1;
  }

  await updateDoc(conversationRef, updateData);

  return { id: messageDocRef.id, ...messageData };
};

// Get all conversations for current user
export const getUserConversations = (callback) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Create a query to find conversations where the current user is a participant
  // This uses the new structure with participantData
  const participantDataPath = `participantData.${currentUser.uid}`;
  const participantDataQuery = query(
    collection(db, 'conversations'),
    where(participantDataPath, '!=', null)
  );

  // Listen for conversations with the new structure
  return onSnapshot(participantDataQuery, (snapshot) => {
    const conversations = [];

    snapshot.forEach((doc) => {
      const conversationData = doc.data();
      conversations.push({ id: doc.id, ...conversationData });
    });

    callback(conversations);
  });
};

// Get messages for a specific conversation
export const getConversationMessages = (conversationId, callback) => {
  // First check if the conversation has a messages subcollection
  const messagesRef = collection(
    db,
    'conversations',
    conversationId,
    'messages'
  );

  return onSnapshot(messagesRef, (snapshot) => {
    const messages = [];

    if (snapshot.size > 0) {
      // If there are messages in the subcollection, use them
      snapshot.forEach((doc) => {
        const messageData = doc.data();
        messages.push({ id: doc.id, ...messageData });
      });
    } else {
      // If no messages in subcollection, check if messages are stored in the conversation document
      const conversationRef = doc(db, 'conversations', conversationId);
      getDoc(conversationRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const conversationData = docSnap.data();
            if (conversationData.messages) {
              // If messages are stored in the conversation document
              Object.keys(conversationData.messages).forEach((messageId) => {
                messages.push({
                  id: messageId,
                  ...conversationData.messages[messageId],
                });
              });
            }
            callback(messages);
          }
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Error getting conversation document:', error);
        });
    }

    // Only call the callback if we found messages in the subcollection
    if (snapshot.size > 0) {
      callback(messages);
    }
  });
};

// Get user details
export const getUserDetails = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }

  return null;
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId, userId) => {
  const messagesRef = collection(
    db,
    'conversations',
    conversationId,
    'messages'
  );
  
  // Get all messages in the conversation that weren't sent by the current user
  const q = query(
    messagesRef,
    where('senderId', '!=', userId)
  );

  const querySnapshot = await getDocs(q);

  const batch = [];
  querySnapshot.forEach((document) => {
    const messageData = document.data();
    
    // Only update messages that haven't been read by this user
    // Check if readStatus exists and if the user's ID is not in it
    const readStatus = messageData.readStatus || {};
    if (!readStatus[userId]) {
      const messageRef = doc(
        db,
        'conversations',
        conversationId,
        'messages',
        document.id
      );
      
      // Update the readStatus field
      readStatus[userId] = Date.now();
      batch.push(updateDoc(messageRef, { readStatus }));
    }
  });

  // Only reset unread count if there were unread messages
  if (batch.length > 0) {
    // Reset unread count for this user in the conversation
    const conversationRef = doc(db, 'conversations', conversationId);
    batch.push(updateDoc(conversationRef, {
      [`participantData.${userId}.unreadCount`]: 0,
      [`participantData.${userId}.lastSeenAt`]: serverTimestamp()
    }));
  }

  await Promise.all(batch);
};

// Start a conversation with a user and send the first message
export const startConversationWithMessage = async (
  participantId,
  participantName = '',
  participantImage = '',
  firstMessage = ''
) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  try {
    // First check if users exist and create them if needed
    // First check if the participant user exists in the users collection
    const userRef = doc(db, 'users', participantId);
    const userDoc = await getDoc(userRef);

    // If user doesn't exist, create them
    if (!userDoc.exists()) {
      // Create user in the users collection
      await setDoc(userRef, {
        id: participantId,
        name: participantName,
        profileImage: participantImage,
        lastActiveAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    }

    // Also ensure current user exists in users collection
    const currentUserRef = doc(db, 'users', currentUser.uid);
    const currentUserDoc = await getDoc(currentUserRef);

    if (!currentUserDoc.exists()) {
      // Get supplier info from local storage
      let supplierName = '';
      let profileImage = '';
      try {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedData = JSON.parse(userData);
          
          // Get supplier business name and logo
          if (parsedData.supplier && parsedData.supplier.businessName) {
            supplierName = parsedData.supplier.businessName;
            profileImage = '';
          } 
          // Fallback to user name if supplier info isn't available
          else if (parsedData.user && parsedData.user.name) {
            supplierName = parsedData.user.name;
          }
        }
      } catch (error) {
        console.error('Error getting user data from localStorage:', error);
      }

      // Create current user in the users collection
      await setDoc(currentUserRef, {
        id: currentUser.uid,
        name: supplierName || currentUser.displayName || '',
        profileImage: '',
        lastActiveAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    }

    // Check if conversation already exists
    const conversationsRef = collection(db, 'conversations');

    // Get all conversations and check manually
    const querySnapshot = await getDocs(conversationsRef);
    let existingConversation = null;

    querySnapshot.forEach((doc) => {
      const conversation = doc.data();

      // Check if both users are participants in this conversation
      if (conversation.participantData) {
        // New structure with participantData
        const participants = Object.keys(conversation.participantData);
        if (
          participants.includes(currentUser.uid) &&
          participants.includes(participantId)
        ) {
          existingConversation = { id: doc.id, ...conversation };
        }
      } else if (conversation.participants) {
        // Old structure with participants array
        if (
          conversation.participants.includes(currentUser.uid) &&
          conversation.participants.includes(participantId)
        ) {
          existingConversation = { id: doc.id, ...conversation };
        }
      }
    });

    let conversation;
    
    if (existingConversation) {
      conversation = existingConversation;
      
      // Check if either user has blocked the other
      const blockStatus = await checkUserBlockStatus(
        conversation.id, 
        currentUser.uid, 
        participantId
      );
      
      if (blockStatus.isBlocked) {
        throw new Error(blockStatus.message);
      }
    } else {
      // Create new conversation with the structure shown in the screenshots
      const newConversation = {
        createdAt: serverTimestamp(),
        isGroupChat: false,
        isReported: false,
        lastMessage: null,
        participantIds: [currentUser.uid, participantId],
        participantData: {
          [currentUser.uid]: {
            userId: currentUser.uid,
            role: 'member',
            lastSeenAt: serverTimestamp(),
            typingStatus: false,
            unreadCount: 0,
            blockedUsers: [],
          },
          [participantId]: {
            userId: participantId,
            role: 'member',
            lastSeenAt: serverTimestamp(),
            typingStatus: false,
            unreadCount: 0,
            blockedUsers: [],
          },
        },
        blockedUsers: {}, // Initialize blockedUsers field
      };

      const docRef = await addDoc(conversationsRef, newConversation);
      conversation = { id: docRef.id, ...newConversation };
    }

    // Send the first message if provided
    if (firstMessage && firstMessage.trim() !== '') {
      await sendMessage(conversation.id, firstMessage);
    }

    return conversation;
  } catch (error) {
    console.error('Error starting conversation:', error);
    throw error;
  }
};
