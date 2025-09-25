"use client";
import React, { useState, useEffect, useRef } from "react";

const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Typing fast requires both accuracy and speed.",
  "React makes building user interfaces simple and fun.",
  "Practice daily to improve your typing skills."
];

export default function TypingTest() {
  const [quote, setQuote] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef(null);

  // Pick random sentence on load
  useEffect(() => {
    setQuote(sentences[Math.floor(Math.random() * sentences.length)]);
  }, []);

  // Handle typing
  const handleChange = (e) => {
    if (!startTime) setStartTime(Date.now()); // start timer at first key
    const value = e.target.value;
    setInput(value);

    // Check if completed
    if (value === quote) {
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000 / 60; // minutes
      const words = quote.split(" ").length;
      const wpmCalc = Math.round(words / timeTaken);

      const correctChars = [...quote].filter(
        (char, i) => char === value[i]
      ).length;
      const accuracyCalc = Math.round((correctChars / value.length) * 100);

      setWpm(wpmCalc);
      setAccuracy(accuracyCalc);
      setIsFinished(true);
    }
  };

  const resetTest = () => {
    setQuote(sentences[Math.floor(Math.random() * sentences.length)]);
    setInput("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    inputRef.current.focus();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">⚡ Typing Speed Test</h1>
      
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-2xl w-full">
        <p className="text-lg mb-4 text-gray-700">{quote}</p>
        
        <textarea
          ref={inputRef}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
          value={input}
          onChange={handleChange}
          disabled={isFinished}
          placeholder="Start typing here..."
        />
        
        {isFinished && (
          <div className="mt-4 text-center">
            <p className="text-xl font-semibold text-green-600">
              🎉 WPM: {wpm}
            </p>
            <p className="text-lg text-gray-700">✅ Accuracy: {accuracy}%</p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={resetTest}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
}
