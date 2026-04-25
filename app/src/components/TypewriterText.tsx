import React, { useState, useEffect } from 'react';
import { Text, TextStyle } from 'react-native';

interface TypewriterTextProps {
  text: string;
  style?: TextStyle;
  speed?: number;
  onComplete?: () => void;
  enabled?: boolean;
}

const TypewriterText = ({ 
  text, 
  style, 
  speed = 15, 
  onComplete,
  enabled = true 
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState(enabled ? "" : text);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text.charAt(currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return <Text style={style}>{displayedText}</Text>;
};

export default TypewriterText;
