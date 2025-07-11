import React from 'react';
import iconInputNode from '../../assets/icon-input-node.svg';
import iconAINode from '../../assets/icon-ai-node.svg';
import browserNode from '../../assets/icon-qoca-node.svg';
import knowledgeNode from '../../assets/icn-knowledge.svg';
import lineWebhookNode from '../../assets/icn-line-node.svg';
import aimNode from '../../assets/icon-aim-node.svg';
import httpNode from '../../assets/icon-http.svg';
import promptIcon from '../../assets/prompt-generator.svg';
// Map of icon types to their respective assets
const iconMap = {
  input: {
    src: iconInputNode,
    alt: 'Input Icon'
  },
  ai: {
    src: iconAINode,
    alt: 'AI Icon'
  },
  browser: {
    src: browserNode,
    alt: 'Browser Icon'
  },
  knowledge: {
    src: knowledgeNode,
    alt: 'Knowledge Icon'
  },
  line: {
    src: lineWebhookNode,
    alt: 'Line Icon'
  },
  aim: {
    src: aimNode,
    alt: 'QOCA aim Icon'
  },
  http: {
    src: httpNode,
    alt: 'HTTP Icon'
  },
  prompt: {
    src: promptIcon
  }
};

const IconBase = ({ type, className = '' }) => {
  if (!iconMap[type]) {
    console.warn(`Icon type "${type}" not found`);
    return null;
  }

  const { src, alt } = iconMap[type];

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      <img
        src={src}
        alt={alt}
        width={32}
        height={32}
        className='max-w-full max-h-full object-contain'
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

export default IconBase;
