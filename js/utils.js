/* ===========================
   Utility Functions
   =========================== */

// DOM Helper Functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const createElement = (tag, className = '', innerHTML = '') => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
};

// Event Helper Functions
const on = (element, event, handler) => {
  if (typeof element === 'string') element = $(element);
  element.addEventListener(event, handler);
};

const off = (element, event, handler) => {
  if (typeof element === 'string') element = $(element);
  element.removeEventListener(event, handler);
};

const emit = (element, eventName, data = {}) => {
  if (typeof element === 'string') element = $(element);
  const event = new CustomEvent(eventName, { detail: data });
  element.dispatchEvent(event);
};

// Animation Helper Functions
const animate = (element, keyframes, options = {}) => {
  if (typeof element === 'string') element = $(element);
  const defaultOptions = {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards'
  };
  return element.animate(keyframes, { ...defaultOptions, ...options });
};

const fadeIn = (element, duration = 300) => {
  return animate(element, [
    { opacity: 0, transform: 'translateY(10px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ], { duration });
};

const fadeOut = (element, duration = 300) => {
  return animate(element, [
    { opacity: 1, transform: 'translateY(0)' },
    { opacity: 0, transform: 'translateY(-10px)' }
  ], { duration });
};

const slideUp = (element, duration = 300) => {
  return animate(element, [
    { opacity: 0, transform: 'translateY(20px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ], { duration });
};

const scaleIn = (element, duration = 300) => {
  return animate(element, [
    { opacity: 0, transform: 'scale(0.8)' },
    { opacity: 1, transform: 'scale(1)' }
  ], { duration });
};

// Local Storage Helper Functions
const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('Failed to get from localStorage:', e);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('Failed to remove from localStorage:', e);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
      return false;
    }
  }
};

// Time Formatting Functions
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000);
  return formatTime(seconds);
};

// Number Formatting Functions
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};

const formatPercentage = (value, total) => {
  if (total === 0) return '0%';
  return Math.round((value / total) * 100) + '%';
};

// Validation Functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidNumber = (value, min = null, max = null) => {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

// Array Helper Functions
const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const unique = (array) => [...new Set(array)];

const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

// Math Helper Functions
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const lerp = (start, end, factor) => start + (end - start) * factor;

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const randomInt = (min, max) => Math.floor(randomBetween(min, max + 1));

// String Helper Functions
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const camelCase = (str) => {
  return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
};

const kebabCase = (str) => {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

// Color Helper Functions
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Device Detection Functions
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

const getViewportSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

// Performance Helper Functions
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Request Animation Frame Helpers
const raf = (callback) => {
  return requestAnimationFrame(callback);
};

const rafLoop = (callback) => {
  const loop = (timestamp) => {
    callback(timestamp);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};

// Error Handling Functions
const safeExecute = (fn, fallback = () => {}) => {
  try {
    return fn();
  } catch (error) {
    console.warn('Safe execution failed:', error);
    return fallback();
  }
};

const retry = async (fn, attempts = 3, delay = 1000) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// URL and Navigation Functions
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

const setUrlParam = (key, value) => {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.replaceState({}, '', url);
};

const removeUrlParam = (key) => {
  const url = new URL(window.location);
  url.searchParams.delete(key);
  window.history.replaceState({}, '', url);
};

// Audio Helper Functions (for future sound integration)
const playSound = (url, volume = 1) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.onended = resolve;
    audio.onerror = reject;
    audio.play().catch(reject);
  });
};

// Touch and Gesture Helpers
const getTouchPosition = (event) => {
  const touch = event.touches?.[0] || event.changedTouches?.[0] || event;
  return {
    x: touch.clientX,
    y: touch.clientY
  };
};

const getDistance = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Game-specific Utilities
const generateGameId = () => {
  return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const calculateScore = (moves, time, optimalMoves) => {
  const moveEfficiency = Math.max(0, (optimalMoves / moves) * 100);
  const timeBonus = Math.max(0, 100 - (time / 1000)); // Bonus for faster completion
  return Math.round(moveEfficiency + timeBonus);
};

const getDifficultyLevel = (moves, optimalMoves) => {
  const efficiency = moves / optimalMoves;
  if (efficiency <= 1.2) return 'Expert';
  if (efficiency <= 1.5) return 'Advanced';
  if (efficiency <= 2.0) return 'Intermediate';
  return 'Beginner';
};

// Statistics Helper Functions
const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

const calculateMedian = (numbers) => {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

const calculatePercentile = (numbers, percentile) => {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
};

// Export utilities for use in other modules
window.Utils = {
  // DOM
  $, $$, createElement, on, off, emit,
  
  // Animation
  animate, fadeIn, fadeOut, slideUp, scaleIn,
  
  // Storage
  storage,
  
  // Formatting
  formatTime, formatDuration, formatNumber, formatPercentage,
  
  // Validation
  isValidEmail, isValidNumber,
  
  // Arrays
  shuffle, unique, groupBy,
  
  // Math
  clamp, lerp, randomBetween, randomInt,
  
  // Strings
  capitalize, camelCase, kebabCase,
  
  // Colors
  hexToRgb, rgbToHex,
  
  // Device
  isMobile, isTouchDevice, getViewportSize,
  
  // Performance
  debounce, throttle, raf, rafLoop,
  
  // Error Handling
  safeExecute, retry,
  
  // URL
  getUrlParams, setUrlParam, removeUrlParam,
  
  // Audio
  playSound,
  
  // Touch
  getTouchPosition, getDistance,
  
  // Game
  generateGameId, calculateScore, getDifficultyLevel,
  
  // Statistics
  calculateAverage, calculateMedian, calculatePercentile
};

// Log utilities loaded
console.log('🛠 Utilities loaded successfully');