import React from 'react';

const Notification = ({ message, error }) => {
  if (message) {
    return <div className="success">{message}</div>;
  } else if (error) {
    return <div className="error">{error}</div>;
  } else return null;
};

export default Notification;
