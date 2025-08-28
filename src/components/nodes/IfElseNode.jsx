import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import IconBase from '../icons/IconBase';
import { formatNodeTitle } from '../../utils/nodeUtils';

const IfElseNode = ({ data, isConnectable, id }) => {
  // Condition operators
  const operators = [
    { value: 'equals', label: '[Text] Equals' },
    { value: 'contains', label: '[Text] Contains' },
    { value: 'startsWith', label: '[Text] Starts With' },
    { value: 'endsWith', label: '[Text] Ends With' },
    { value: 'greaterThan', label: '[Number] Greater Than' },
    { value: 'lessThan', label: '[Number] Less Than' }
  ];

  const handleFieldChange = (field, value) => {
    if (data.updateNodeData) {
      data.updateNodeData(field, value);
    }
  };

  return (
    <div className='rounded-lg shadow-md overflow-hidden w-64'>
      {/* Header section with icon and title */}
      <div className='bg-purple-100 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 rounded-md bg-purple-500 flex items-center justify-center text-white mr-2'>
            <IconBase />
          </div>
          <span className='font-medium'>
            {formatNodeTitle('IF / ELSE', id)}
          </span>
        </div>
      </div>

      {/* Separator line */}
      <div className='border-t border-gray-200'></div>

      {/* Content area */}
      <div className='bg-white p-4'>
        <div className='mb-3'>
          <label className='block text-sm text-gray-700 mb-1'>If</label>
          <input
            type='text'
            className='w-full border border-gray-300 rounded p-2 text-sm'
            placeholder='formate_value'
            value={data.variableName || ''}
            onChange={(e) => handleFieldChange('variableName', e.target.value)}
          />
        </div>

        <div className='mb-3'>
          <select
            className='w-full border border-gray-300 rounded p-2 text-sm'
            value={data.operator || 'equals'}
            onChange={(e) => handleFieldChange('operator', e.target.value)}>
            {operators.map((op) => (
              <option
                key={op.value}
                value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        <div className='mb-3'>
          <input
            type='text'
            className='w-full border border-gray-300 rounded p-2 text-sm'
            placeholder='Value to compare'
            value={data.compareValue || ''}
            onChange={(e) => handleFieldChange('compareValue', e.target.value)}
          />
        </div>
      </div>

      {/* Input handle */}
      <Handle
        type='target'
        position={Position.Left}
        id='input'
        style={{
          background: '#555',
          width: '8px',
          height: '8px',
          left: '-4px'
        }}
        isConnectable={isConnectable}
      />

      {/* True output handle */}
      <Handle
        type='source'
        position={Position.Right}
        id='true'
        style={{
          background: '#10B981', // green color for "true"
          width: '8px',
          height: '8px',
          right: '-4px',
          top: '35%'
        }}
        isConnectable={isConnectable}
      />

      {/* False output handle */}
      <Handle
        type='source'
        position={Position.Right}
        id='false'
        style={{
          background: '#EF4444', // red color for "false"
          width: '8px',
          height: '8px',
          right: '-4px',
          top: '65%'
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(IfElseNode);
