// components/Alert.tsx
import React, { useEffect } from 'react';


type AlertProps = {
  message: string;
  showAlert: boolean;
};

export const Alert: React.FC<AlertProps> = ({ message, showAlert }) => {
  useEffect(() => {
    if (showAlert) {
      console.log("Alert shown:", message);
    } else {
      console.log("Alert hidden");
    }
  }, [showAlert, message]);

  if (!showAlert) return null;  


  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded transition-opacity duration-300"
    >
      {message}
    </div>
  );
};
