import React, { memo, useCallback } from 'react';
import NodeWrapper from './NodeWrapper';

// Higher-order component to add selection capabilities to any node component
const withNodeSelection = (WrappedComponent) => {
  // Create a new component with selection functionality
  const WithNodeSelection = (props) => {
    const { selected, data } = props;

    // Memoize the click handler to prevent unnecessary renders
    const handleNodeClick = useCallback(
      (e) => {
        e.stopPropagation();

        if (data && typeof data.onSelect === 'function') {
          data.onSelect();
        }
      },
      [data]
    );

    // Render the wrapped component inside our NodeWrapper
    return (
      <NodeWrapper
        selected={selected}
        onClick={handleNodeClick}>
        <WrappedComponent {...props} />
      </NodeWrapper>
    );
  };

  // Set display name for debugging
  WithNodeSelection.displayName = `withNodeSelection(${getDisplayName(
    WrappedComponent
  )})`;

  // Memoize the component to prevent unnecessary re-renders
  return memo(WithNodeSelection);
};

// Helper function to get display name of component
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withNodeSelection;
