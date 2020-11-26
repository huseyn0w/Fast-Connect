import React from 'react';

interface MessageInterface {
    data: {
        sender:string,
        receivedMessage: string
    },
}

const Message:React.FC<MessageInterface> = ({data: {sender, receivedMessage}}) => {

  return (
    <div className="message-item">
        <p><strong>{sender}:</strong> {receivedMessage}</p>
    </div>
  );
}

export default Message
