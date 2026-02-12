import { CheckCheck } from 'lucide-react';
import PropTypes from 'prop-types';
import { memo } from 'react';

// Define prop types for the component
const messagePropTypes = {
  sender: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  isUser: PropTypes.bool.isRequired,
  reciver: PropTypes.string.isRequired,
  senderPhoto: PropTypes.string,
  receiverPhoto: PropTypes.string,
};

// Create the base component
const ChatMessageComponent = ({
  sender,
  message,
  time,
  isUser,
  reciver,
  senderPhoto,
  receiverPhoto,
}) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="flex items-end gap-2">
        {/* Avatar - only show for non-user messages on the left */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 mb-1 flex items-center justify-center overflow-hidden">
            {receiverPhoto ? (
              <img
                src={receiverPhoto}
                alt={sender}
                className="w-full h-full object-cover"
              />
            ) : senderPhoto ? (
              <img
                src={senderPhoto}
                alt={sender}
                className="w-full h-full object-cover"
              />
            ) : (
              /* Display first letter of sender's name if no photo */
              <span className="text-white text-sm font-medium">
                {sender && typeof sender === 'string'
                  ? sender.charAt(0).toUpperCase()
                  : 'U'}
              </span>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`max-w-xs px-3 py-1.5 rounded-lg ${
            isUser
              ? 'bg-primary-light text-white'
              : 'bg-chat-bg text-text-primary'
          }`}
        >
          <p className="break-words">{message}</p>
          <div className="flex gap-1">
            <span className="text-xs inline-block mt-1 opacity-75">{time}</span>
            {isUser && (
              <span className="text-xs inline-block mt-1 opacity-75">
                <CheckCheck size={15} />
              </span>
            )}
          </div>
        </div>

        {/* Avatar - only show for user messages on the right */}
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-primary-light flex-shrink-0 mb-1 flex items-center justify-center overflow-hidden">
            {senderPhoto ? (
              <img
                src={senderPhoto}
                alt={sender}
                className="w-full h-full object-cover"
              />
            ) : (
              /* Display first letter of user's name if no photo */
              <span className="text-white text-sm font-medium">
                {sender && typeof sender === 'string'
                  ? sender.charAt(0).toUpperCase()
                  : reciver.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
const ChatMessage = memo(ChatMessageComponent);

// Set display name for React DevTools
ChatMessage.displayName = 'ChatMessage';

// Assign the prop types to both components
ChatMessageComponent.propTypes = messagePropTypes;
ChatMessage.propTypes = messagePropTypes;

export default ChatMessage;
