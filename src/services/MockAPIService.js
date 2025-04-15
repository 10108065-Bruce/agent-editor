// src/services/MockApiService.js

/**
 * Mock API service for saving flow data
 * In a real application, this would make actual HTTP requests to your backend
 */
export default class MockApiService {
  /**
   * Save flow data to the mock API
   * @param {Object} flowData - The flow data to save
   * @returns {Promise} - Resolves with success response or rejects with error
   */
  static saveFlow(flowData) {
    console.log('MockApiService: Saving flow data...', flowData);

    // Simulate API call with 50% chance of success, 50% chance of failure
    return new Promise((resolve, reject) => {
      // Simulate network latency
      setTimeout(() => {
        // Randomly succeed or fail to demonstrate both scenarios
        const isSuccess = Math.random() > 0.8;

        if (isSuccess) {
          const response = {
            success: true,
            message: 'Flow saved successfully',
            flowId: 'flow_' + Date.now(),
            timestamp: new Date().toISOString()
          };
          console.log('MockApiService: Save successful', response);
          resolve(response);
        } else {
          const error = {
            success: false,
            message: 'Failed to save flow',
            errorCode: 'ERR_SERVER',
            details: 'Mock server error'
          };
          console.error('MockApiService: Save failed', error);
          reject(error);
        }
      }, 1500); // 1.5 second delay to simulate network
    });
  }

  /**
   * Load flow data from the mock API
   * @param {string} flowId - The ID of the flow to load
   * @returns {Promise} - Resolves with the flow data or rejects with error
   */
  static loadFlow(flowId) {
    console.log('MockApiService: Loading flow data for ID:', flowId);

    return new Promise((resolve, reject) => {
      // Try to get data from localStorage first
      const savedData = localStorage.getItem('flowEditorData');

      setTimeout(() => {
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            console.log('MockApiService: Load successful', parsedData);
            resolve({
              success: true,
              data: parsedData,
              message: 'Flow loaded successfully'
            });
          } catch (error) {
            reject({
              success: false,
              message: 'Failed to parse flow data',
              errorCode: 'ERR_PARSE'
            });
          }
        } else {
          reject({
            success: false,
            message: 'No flow data found',
            errorCode: 'ERR_NOT_FOUND'
          });
        }
      }, 1000); // 1 second delay
    });
  }
}
