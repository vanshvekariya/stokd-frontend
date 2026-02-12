import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

function ChatNotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    // Listen for conversations with unread messages
    const participantDataPath = `participantData.${currentUser.uid}`;
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where(participantDataPath, '!=', null)
    );

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      let totalUnread = 0;
      
      snapshot.forEach((doc) => {
        const conversation = doc.data();
        const userData = conversation.participantData?.[currentUser.uid];
        if (userData && userData.unreadCount) {
          totalUnread += userData.unreadCount;
        }
      });
      
      setUnreadCount(totalUnread);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return unreadCount > 0 ? (
    <div className="bg-primary-light text-white text-xs font-bold rounded-full min-h-5 min-w-5 flex items-center justify-center px-1.5 border border-white">
      {unreadCount}
    </div>
  ) : null;
}

export default ChatNotificationBadge;