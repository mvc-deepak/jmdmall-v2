"use client";

import { useState, useEffect } from "react";

interface AnimatedSearchInputProps {
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const searchPlaceholders = [
  "Search products, groceries & more",
  "atta, maida, sugar",
  "basmati rice, sona rice, katarni rice",
  "sunflower oil, mustard oil, soyabean oil",
  "milk, paneer, butter, cheese",
  "onion, potato, tomato, ginger",
  "apple, banana, orange, mango",
  "tea, coffee, spices, masala",
  "bread, biscuits, cookies, snacks",
  "soap, shampoo, toothpaste, face wash",
  "dal, beans, chickpea, lentils",
  "pasta, noodles, rice, wheat",
  "chocolate, candy, ice cream, dessert",
  "yogurt, curd, lassi, beverages",
  "eggs, chicken, fish, meat",
];

export default function AnimatedSearchInput({
  onKeyDown,
  value = "",
  onChange,
}: AnimatedSearchInputProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState(
    searchPlaceholders[0]
  );
  const [isTyping, setIsTyping] = useState(false);
  const [deleteCount, setDeleteCount] = useState(0);

  useEffect(() => {
    // Only animate if search box is empty
    if (value.length > 0) {
      setIsTyping(false);
      return;
    }

    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 4000); // Change placeholder every 4 seconds

    return () => clearInterval(interval);
  }, [value]);

  useEffect(() => {
    const targetText = searchPlaceholders[placeholderIndex];
    let timeout: NodeJS.Timeout;

    if (displayedText !== targetText) {
      if (displayedText.length > targetText.length) {
        // Delete mode
        timeout = setTimeout(() => {
          setDisplayedText((prev) => prev.slice(0, -1));
          setDeleteCount((prev) => prev + 1);
        }, 30); // Fast deletion
      } else {
        // Type mode
        timeout = setTimeout(() => {
          setDisplayedText(
            targetText.slice(0, displayedText.length + 1)
          );
          setDeleteCount(0);
        }, 50); // Typing speed
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, placeholderIndex]);

  return (
    <input
      type="text"
      className="search-input"
      placeholder={displayedText}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      aria-label="Search products"
    />
  );
}
