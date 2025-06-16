import { useState } from 'react';

/**
 * 按鈕狀態管理 Hook
 */
export const useButtonState = (resetDelay = 2000) => {
  const [state, setState] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const setLoading = () => {
    setState('loading');
    setErrorMessage('');
  };

  const setSuccess = () => {
    setState('success');
    setTimeout(() => setState(''), resetDelay);
  };

  const setError = (message = '') => {
    setState('error');
    setErrorMessage(message);
    setTimeout(() => {
      setState('');
      setErrorMessage('');
    }, resetDelay);
  };

  const reset = () => {
    setState('');
    setErrorMessage('');
  };

  return {
    state,
    errorMessage,
    setLoading,
    setSuccess,
    setError,
    reset,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error'
  };
};
