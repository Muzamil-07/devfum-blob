import { useState } from 'react';
import './PatternButtons.css';

export const PatternButtons = ({ onPatternChange }) => {
  const [activePattern, setActivePattern] = useState(0);

  const handlePatternClick = (pattern) => {
    setActivePattern(pattern);
    onPatternChange(pattern);
  };

  return (
    <div className="pattern-buttons-container">
      <button
        className={`pattern-button ${activePattern === 0 ? 'active' : ''}`}
        onClick={() => handlePatternClick(0)}
      >
        Pattern 1
      </button>
      <button
        className={`pattern-button ${activePattern === 1 ? 'active' : ''}`}
        onClick={() => handlePatternClick(1)}
      >
        Pattern 2
      </button>
    </div>
  );
};
