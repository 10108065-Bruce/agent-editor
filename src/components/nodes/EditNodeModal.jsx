// src/components/EditNodeModal.js
import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export default function EditNodeModal({
  isOpen,
  value,
  onClose,
  onSave,
  onChange,
  onDelete
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className='bg-white rounded-xl shadow-xl p-6 w-80 mx-auto mt-40 outline-none'
      overlayClassName='fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50'>
      <h2 className='text-xl font-semibold mb-4'>編輯節點名稱</h2>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full border border-gray-300 rounded-md px-3 py-2 mb-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
        placeholder='請輸入節點名稱'
      />

      <div className='flex justify-between items-center mt-4'>
        <button
          onClick={onDelete}
          className='text-red-600 text-sm hover:underline'>
          刪除節點
        </button>

        <div className='space-x-3'>
          <button
            onClick={onClose}
            className='text-gray-600 text-sm hover:underline'>
            取消
          </button>
          <button
            onClick={onSave}
            className='bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md shadow'>
            儲存
          </button>
        </div>
      </div>
    </Modal>
  );
}
