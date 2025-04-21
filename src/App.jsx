// src/App.js
import React, { useEffect, useState } from 'react';
import FlowEditor from './views/FlowEditor';
import IFrameFlowEditor from './views/IFrameFlowEditor';

function App() {
  // Determine if we're running inside an iframe
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Check if we're in an iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      // If accessing window.top throws an error due to same-origin policy,
      // we're definitely in an iframe
      setIsInIframe(true);
    }
  }, []);

  return (
    <div className='App'>
      {isInIframe ? (
        // If we're in an iframe, use the IFrameFlowEditor which has
        // the iframe communication functionality
        <IFrameFlowEditor />
      ) : (
        // Otherwise, use the regular FlowEditor for standalone mode
        <FlowEditor />
      )}
    </div>
  );
}

export default App;
