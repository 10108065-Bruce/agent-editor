// 獲取節點標籤顏色
export const getNodeTagColor = (nodeName) => {
  // 轉換為小寫、移除前後空格、將底線替換為空格
  // 處理駝峰命名、底線、轉小寫
  // 處理駝峰命名、底線、轉小寫
  const lowerNodeName = nodeName
    .trim()
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // 處理連續大寫+小寫: "HTTPRequest" → "HTTP Request"
    .replace(/([a-z\d])([A-Z])/g, '$1 $2') // 處理小寫+大寫: "myName" → "my Name"
    .replace(/_/g, ' ') // 底線轉空格
    .toLowerCase()
    .replace(/\s+/g, ' ') // 多個空格合併為一個
    .trim(); // 移除首尾空格

  // 按優先級排序的顏色映射
  const colorMap = [
    { keyword: 'browser extension input', color: '#D5F2D8' },
    { keyword: 'line webhook input', color: '#06C755' },
    { keyword: 'webhook input', color: '#FC6165' },
    { keyword: 'webhook output', color: '#FC6165' },
    { keyword: 'extract data', color: '#FFAA1E' },
    { keyword: 'http request', color: '#FF6D01' },
    { keyword: 'combine text', color: '#4E7ECF' },
    { keyword: 'router switch', color: '#00ced1' },
    { keyword: 'schedule', color: '#7C3AED' },
    { keyword: 'knowledge retrieval', color: '#87CEEB' },
    { keyword: 'qoca aim', color: '#098D7F' },
    { keyword: 'input', color: '#0075FF' },
    { keyword: 'ai', color: '#FFAA1E' },
    { keyword: 'speech to text', color: '#BB4DAA' }
  ];

  // 遍歷顏色映射
  for (const { keyword, color } of colorMap) {
    if (lowerNodeName.includes(keyword)) {
      return color;
    }
  }

  return '#6b7280';
};
