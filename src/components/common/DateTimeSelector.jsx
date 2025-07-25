import React, { useState, useRef, useEffect, useCallback } from 'react';

const DateTimeSelector = ({
  value,
  onChange,
  placeholder = '選擇日期時間',
  disabled = false,
  className = '',
  position = 'center',
  offsetX = 0,
  offsetY = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState({
    hour: 1,
    minute: 0,
    period: 'AM'
  });
  const [displayValue, setDisplayValue] = useState('');
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState(new Date().getMonth());

  const textFieldRef = useRef(null);
  const overlayRef = useRef(null);

  // 計算 dialog 位置的函數
  const getDialogPosition = useCallback(() => {
    if (!textFieldRef.current || position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999
      };
    }

    const rect = textFieldRef.current.getBoundingClientRect();
    const dialogWidth = 320;
    const dialogHeight = 400;

    let style = {
      position: 'fixed',
      zIndex: 9999
    };

    switch (position) {
      case 'top-left':
        style.bottom = `${window.innerHeight - rect.top + 10}px`;
        style.right = `${window.innerWidth - rect.left}px`;
        style.transform = 'translate(0, 0)';
        break;

      case 'top-center':
        style.bottom = `${window.innerHeight - rect.top + 10}px`;
        style.left = `${rect.left + rect.width / 2}px`;
        style.transform = 'translateX(-50%)';
        break;

      case 'top-right':
        style.bottom = `${window.innerHeight - rect.top + 10}px`;
        style.left = `${rect.right}px`;
        style.transform = 'translate(0, 0)';
        break;

      case 'left':
        style.top = `${rect.top}px`;
        style.right = `${window.innerWidth - rect.left + 10}px`;
        style.transform = 'translate(0, 0)';
        break;

      case 'right':
        style.top = `${rect.top}px`;
        style.left = `${rect.right + 10}px`;
        style.transform = 'translate(0, 0)';
        break;

      case 'bottom-left':
        style.top = `${rect.bottom + 10}px`;
        style.right = `${window.innerWidth - rect.left}px`;
        style.transform = 'translate(0, 0)';
        break;

      case 'bottom-center':
        style.top = `${rect.bottom + 10}px`;
        style.left = `${rect.left + rect.width / 2}px`;
        style.transform = 'translateX(-50%)';
        break;

      case 'bottom-right':
      default:
        style.top = `150px`;
        style.left = `150px`;
        style.transform = 'translate(0, 0)';
        break;
    }

    if (offsetX !== 0) {
      if (style.left) {
        style.left = `${parseInt(style.left) + offsetX}px`;
      } else if (style.right) {
        style.right = `${parseInt(style.right) - offsetX}px`;
      }
    }

    if (offsetY !== 0) {
      if (style.top) {
        style.top = `${parseInt(style.top) + offsetY}px`;
      } else if (style.bottom) {
        style.bottom = `${parseInt(style.bottom) - offsetY}px`;
      }
    }

    const maxLeft = window.innerWidth - dialogWidth - 20;
    const maxTop = window.innerHeight - dialogHeight - 20;

    if (style.left && parseInt(style.left) > maxLeft) {
      style.left = `${maxLeft}px`;
    }
    if (style.left && parseInt(style.left) < 20) {
      style.left = '20px';
    }
    if (style.top && parseInt(style.top) > maxTop) {
      style.top = `${maxTop}px`;
    }
    if (style.top && parseInt(style.top) < 20) {
      style.top = '20px';
    }

    return style;
  }, [position, offsetX, offsetY]);

  // 格式化顯示日期時間
  const formatDisplayValue = useCallback((date, time) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(time.hour).padStart(2, '0');
    const minute = String(time.minute).padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute} ${time.period}`;
  }, []);

  // 轉換為 timestamp
  const convertToTimestamp = useCallback((date, time) => {
    const newDate = new Date(date);
    let hour24 = time.hour;

    if (time.period === 'PM' && time.hour !== 12) {
      hour24 += 12;
    } else if (time.period === 'AM' && time.hour === 12) {
      hour24 = 0;
    }

    newDate.setHours(hour24, time.minute, 0, 0);
    return newDate.getTime();
  }, []);

  // 初始化當前日期時間
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setCurrentMonth(date);
      setTempYear(date.getFullYear());
      setTempMonth(date.getMonth());

      let hour = date.getHours();
      const period = hour >= 12 ? 'PM' : 'AM';
      if (hour === 0) hour = 12;
      else if (hour > 12) hour -= 12;

      setSelectedTime({
        hour,
        minute: date.getMinutes(),
        period
      });

      setDisplayValue(
        formatDisplayValue(date, {
          hour,
          minute: date.getMinutes(),
          period
        })
      );
    } else {
      const now = new Date();
      setSelectedDate(now);
      setCurrentMonth(now);
      setTempYear(now.getFullYear());
      setTempMonth(now.getMonth());

      let hour = now.getHours();
      const period = hour >= 12 ? 'PM' : 'AM';
      if (hour === 0) hour = 12;
      else if (hour > 12) hour -= 12;

      setSelectedTime({
        hour,
        minute: now.getMinutes(),
        period
      });
    }
  }, [value, formatDisplayValue]);

  // 處理點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target) &&
        textFieldRef.current &&
        !textFieldRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setShowYearMonthPicker(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowYearMonthPicker(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  // 獲取月份資訊
  const getMonthInfo = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { year, month, daysInMonth, startDayOfWeek };
  };

  // 處理日期點擊（包括上個月和下個月的日期）
  const handleDateClick = (year, month, day) => {
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);
    // 如果點擊的是不同月份的日期，也要更新當前顯示的月份
    if (
      month !== currentMonth.getMonth() ||
      year !== currentMonth.getFullYear()
    ) {
      setCurrentMonth(new Date(year, month, 1));
    }
  };

  // 渲染日期網格
  const renderCalendar = () => {
    const { year, month, daysInMonth, startDayOfWeek } =
      getMonthInfo(currentMonth);
    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === year && today.getMonth() === month;
    const todayDate = today.getDate();

    const days = [];
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // 週標題
    weekDays.forEach((day) => {
      days.push(
        <div
          key={day}
          className='text-center text-xs text-gray-500 py-2 font-medium'>
          {day}
        </div>
      );
    });

    // 上個月的日期（修復：正確計算上個月的天數）
    const prevMonth = new Date(year, month - 1, 1);
    const prevMonthYear = prevMonth.getFullYear();
    const prevMonthIndex = prevMonth.getMonth();
    const prevMonthLastDay = new Date(
      prevMonthYear,
      prevMonthIndex + 1,
      0
    ).getDate();

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      days.push(
        <div
          key={`prev-${day}`}
          className='text-center py-2 text-gray-300 text-sm cursor-pointer hover:bg-gray-50 transition-colors'
          onClick={() => handleDateClick(prevMonthYear, prevMonthIndex, day)}>
          {day}
        </div>
      );
    }

    // 當月日期
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month &&
        selectedDate.getDate() === day;
      const isToday = isCurrentMonth && day === todayDate;

      days.push(
        <div
          key={day}
          style={{
            borderRadius: '50%'
          }}
          className={`text-center py-2 text-sm cursor-pointer transition-colors
            ${
              isSelected
                ? 'bg-cyan-500 text-white font-medium '
                : isToday
                ? 'bg-cyan-100 text-cyan-600 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          onClick={() => handleDateClick(year, month, day)}>
          {day}
        </div>
      );
    }

    // 下個月的日期（修復：點擊可選擇下個月日期）
    const nextMonth = new Date(year, month + 1, 1);
    const nextMonthYear = nextMonth.getFullYear();
    const nextMonthIndex = nextMonth.getMonth();
    const remainingCells = 42 - days.length + 7; // 7 是週標題

    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div
          key={`next-${day}`}
          className='text-center py-2 text-gray-300 text-sm cursor-pointer hover:bg-gray-50 transition-colors'
          onClick={() => handleDateClick(nextMonthYear, nextMonthIndex, day)}>
          {day}
        </div>
      );
    }

    return days;
  };

  // 處理月份變更
  const changeMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  // 開啟年月選擇器
  const openYearMonthPicker = () => {
    setTempYear(currentMonth.getFullYear());
    setTempMonth(currentMonth.getMonth());
    setShowYearMonthPicker(true);
  };

  // 確認年月選擇
  const confirmYearMonth = () => {
    const newDate = new Date(tempYear, tempMonth, 1);
    setCurrentMonth(newDate);
    setShowYearMonthPicker(false);
  };

  // 取消年月選擇
  const cancelYearMonth = () => {
    setShowYearMonthPicker(false);
  };

  // 生成年份選項
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  // 月份名稱
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  // 處理時間選擇變更
  const handleTimeChange = (type, value) => {
    if (type === 'hour') {
      setSelectedTime((prev) => ({ ...prev, hour: parseInt(value) }));
    } else if (type === 'minute') {
      setSelectedTime((prev) => ({ ...prev, minute: parseInt(value) }));
    } else if (type === 'period') {
      setSelectedTime((prev) => ({ ...prev, period: value }));
    }
  };

  // 生成時間選項
  const generateTimeOptions = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    const periods = ['AM', 'PM'];
    return { hours, minutes, periods };
  };

  const { hours, minutes, periods } = generateTimeOptions();

  // 處理打開日期選擇器
  const handleOpenDatePicker = () => {
    if (disabled) return;

    if (displayValue) {
      const dateTimeMatch = displayValue.match(
        /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}) (AM|PM)/
      );
      if (dateTimeMatch) {
        const [, year, month, day, hour, minute, period] = dateTimeMatch;
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );

        setSelectedDate(date);
        setCurrentMonth(date);
        setTempYear(date.getFullYear());
        setTempMonth(date.getMonth());
        setSelectedTime({
          hour: parseInt(hour),
          minute: parseInt(minute),
          period: period
        });
      }
    } else {
      const now = new Date();
      setSelectedDate(now);
      setCurrentMonth(now);
      setTempYear(now.getFullYear());
      setTempMonth(now.getMonth());

      let hour = now.getHours();
      const period = hour >= 12 ? 'PM' : 'AM';
      if (hour === 0) hour = 12;
      else if (hour > 12) hour -= 12;

      setSelectedTime({
        hour,
        minute: now.getMinutes(),
        period
      });
    }
    setIsOpen(!isOpen);
  };

  // 處理設定按鈕
  const handleConfirm = () => {
    const formattedValue = formatDisplayValue(selectedDate, selectedTime);
    const timestamp = convertToTimestamp(selectedDate, selectedTime);

    setDisplayValue(formattedValue);
    setIsOpen(false);
    setShowYearMonthPicker(false);

    if (onChange) {
      onChange({
        displayValue: formattedValue,
        timestamp: timestamp,
        date: selectedDate,
        time: selectedTime
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Text Field */}
      <div className='relative'>
        <input
          ref={textFieldRef}
          type='text'
          value={displayValue}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          className={`w-full border border-gray-300 rounded p-2 text-sm pr-10 cursor-pointer
            ${
              disabled
                ? 'bg-gray-100 cursor-not-allowed'
                : 'bg-white hover:border-gray-400'
            }
            focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
          onClick={handleOpenDatePicker}
        />

        {/* Calendar Icon */}
        <div className='absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none'>
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='text-gray-400'>
            <rect
              x='3'
              y='4'
              width='18'
              height='18'
              rx='2'
              ry='2'></rect>
            <line
              x1='16'
              y1='2'
              x2='16'
              y2='6'></line>
            <line
              x1='8'
              y1='2'
              x2='8'
              y2='6'></line>
            <line
              x1='3'
              y1='10'
              x2='21'
              y2='10'></line>
          </svg>
        </div>
      </div>

      {/* Date Time Picker Overlay */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          {position === 'center' && (
            <div
              className='fixed inset-0 bg-black bg-opacity-30 z-[9998]'
              onClick={() => {
                setIsOpen(false);
                setShowYearMonthPicker(false);
              }}
            />
          )}

          {/* 日期選擇器 */}
          <div
            ref={overlayRef}
            className='bg-white rounded-lg shadow-lg border border-gray-200 p-4 pointer-events-auto'
            style={{
              ...getDialogPosition(),
              minWidth: '320px',
              width: '320px'
            }}
            onClick={(e) => e.stopPropagation()}>
            {/* 標題 */}
            <div className='text-sm font-medium text-gray-700 mb-4'>
              指定時間
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowYearMonthPicker(false);
                }}
                className='absolute right-3 hover:bg-gray-100 rounded'>
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'>
                  <line
                    x1='18'
                    y1='6'
                    x2='6'
                    y2='18'></line>
                  <line
                    x1='6'
                    y1='6'
                    x2='18'
                    y2='18'></line>
                </svg>
              </button>
            </div>

            {/* 月份導航 */}
            <div className='flex items-center justify-between mb-4'>
              <button
                onClick={() => changeMonth(-1)}
                className='p-1 hover:bg-gray-100 rounded'
                disabled={showYearMonthPicker}>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'>
                  <polyline points='15,18 9,12 15,6'></polyline>
                </svg>
              </button>

              <button
                onClick={openYearMonthPicker}
                className='font-medium text-gray-700 hover:text-cyan-600 hover:bg-gray-50 px-3 py-1 rounded transition-colors'
                disabled={showYearMonthPicker}>
                {currentMonth.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long'
                })}
              </button>

              <button
                onClick={() => changeMonth(1)}
                className='p-1 hover:bg-gray-100 rounded'
                disabled={showYearMonthPicker}>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'>
                  <polyline points='9,18 15,12 9,6'></polyline>
                </svg>
              </button>
            </div>

            {/* 年月選擇器覆蓋層 */}
            {showYearMonthPicker && (
              <div className='absolute h-[450px] inset-0 bg-white rounded-lg z-10 p-4 border border-gray-200 shadow-lg'>
                <div className='text-sm font-medium text-gray-700 mb-4'>
                  選擇年月
                </div>

                <div className='mb-4 bg-white'>
                  <label className='block text-xs text-gray-600 mb-2'>
                    年份
                  </label>
                  <select
                    value={tempYear}
                    onChange={(e) => setTempYear(parseInt(e.target.value))}
                    className='w-full border border-gray-300 rounded p-2 text-sm bg-white'>
                    {generateYears().map((year) => (
                      <option
                        key={year}
                        value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <div className='mb-6 mt-4'>
                    <label className='block text-xs text-gray-600 mb-2'>
                      月份
                    </label>
                    <div className='bg-white p-3 rounded border border-gray-100'>
                      <div className='grid grid-cols-3 gap-2'>
                        {monthNames.map((month, index) => (
                          <button
                            key={month}
                            onClick={() => setTempMonth(index)}
                            className={`p-2 text-sm rounded transition-colors
                            ${
                              tempMonth === index
                                ? 'bg-cyan-500 text-white'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                            {month.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='flex space-x-2 bg-white pt-2'>
                    <button
                      onClick={cancelYearMonth}
                      className='flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded transition-colors border border-gray-300'>
                      取消
                    </button>
                    <button
                      onClick={confirmYearMonth}
                      className='flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded transition-colors'>
                      確定
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 日期網格 */}
            {!showYearMonthPicker && (
              <div className='grid grid-cols-7 gap-1 mb-4'>
                {renderCalendar()}
              </div>
            )}

            {/* 時間選擇 */}
            {!showYearMonthPicker && (
              <div className='flex items-center space-x-2 mb-4'>
                {/* 小時 */}
                <div className='flex-1'>
                  <select
                    value={selectedTime.hour}
                    onChange={(e) => handleTimeChange('hour', e.target.value)}
                    className='w-full border border-gray-300 rounded p-2 text-sm appearance-none bg-white'>
                    {hours.map((hour) => (
                      <option
                        key={hour}
                        value={hour}>
                        {String(hour).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <span className='text-gray-500'>:</span>

                {/* 分鐘 */}
                <div className='flex-1'>
                  <select
                    value={selectedTime.minute}
                    onChange={(e) => handleTimeChange('minute', e.target.value)}
                    className='w-full border border-gray-300 rounded p-2 text-sm appearance-none bg-white'>
                    {minutes.map((minute) => (
                      <option
                        key={minute}
                        value={minute}>
                        {String(minute).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AM/PM */}
                <div className='flex-1'>
                  <select
                    value={selectedTime.period}
                    onChange={(e) => handleTimeChange('period', e.target.value)}
                    className='w-full border border-gray-300 rounded p-2 text-sm appearance-none bg-white'>
                    {periods.map((period) => (
                      <option
                        key={period}
                        value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 設定按鈕 */}
            {!showYearMonthPicker && (
              <button
                onClick={handleConfirm}
                className='w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded transition-colors'>
                設定
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DateTimeSelector;
