"use client";
import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";

const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Typing fast requires both accuracy and speed.",
  "React makes building user interfaces simple and fun.",
  "Practice daily to improve your typing skills.",
  "Consistency and focus lead to real progress."
];

export default function TypeMeter() {
  const [quote, setQuote] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // pick a random quote on mount
    resetTest();
    // cleanup interval on unmount
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    // Recompute live stats when input changes
    if (!startTime && input.length > 0) {
      setStartTime(Date.now());
      // start interval to update WPM every 300ms
      intervalRef.current = setInterval(() => {
        updateWpmAndAccuracy();
      }, 300);
    }

    updateWpmAndAccuracy();

    // If user finished typing exactly the quote
    if (input === quote && quote.length > 0) {
      setIsFinished(true);
      clearInterval(intervalRef.current);
      updateWpmAndAccuracy(true);
    }
  }, [input]);

  const correctCharsCount = (text, target) => {
    let count = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === target[i]) count++;
    }
    return count;
  };

  const updateWpmAndAccuracy = (forceFinalize = false) => {
    if (!startTime) return;
    const now = forceFinalize ? Date.now() : Date.now();
    const minutes = Math.max((now - startTime) / 1000 / 60, 1 / 60); // avoid div by zero (min 1s)

    // WPM: (chars / 5) / minutes
    const charsTyped = input.length;
    const wpmCalc = Math.round((charsTyped / 5) / minutes);
    setWpm(isFinite(wpmCalc) ? Math.max(0, wpmCalc) : 0);

    // Accuracy: correctChars / typedChars
    const correct = correctCharsCount(input, quote);
    const accuracyCalc = charsTyped === 0 ? 100 : Math.round((correct / charsTyped) * 100);
    setAccuracy(Math.max(0, Math.min(100, accuracyCalc)));
  };

  const handleChange = (e) => {
    if (isFinished) return;
    setInput(e.target.value);
  };

  const resetTest = () => {
    clearInterval(intervalRef.current);
    const next = sentences[Math.floor(Math.random() * sentences.length)];
    setQuote(next);
    setInput("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    // tiny delay to ensure textarea exists and then focus
    setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
  };

  // Render quote with per-character coloring
  const renderedQuote = () => {
    return quote.split("").map((ch, i) => {
      const typedChar = input[i];
      let className = "text-gray-300";
      if (typeof typedChar !== "undefined") {
        className = typedChar === ch ? "text-green-400" : "text-red-400 line-through";
      }
     return (
  <span key={i} className={`inline-block ${className}`}>
    {ch === " " ? "\u00A0" : ch}
  </span>
); 
    });
  };

  return (
    <>
    <Head>
            <title>TypeMeter</title>
             <meta property="og:title" content="My page title" key="title" />
          </Head>
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-2xl bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">TypeMeter ⌨️ (Dark)</h1>

        <div className="mb-4 p-4 rounded-lg bg-gray-900 border border-gray-700">
          <p className="text-lg leading-relaxed">{renderedQuote()}</p>
        </div>

        <textarea
          ref={inputRef}
          value={input}
          onChange={handleChange}
          disabled={isFinished}
          placeholder="Start typing here..."
          className="w-full min-h-[120px] p-4 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-6 items-center">
            <div className="text-sm text-gray-300">
              <div>WPM</div>
              <div className="text-2xl font-semibold text-white">{wpm}</div>
            </div>

            <div className="text-sm text-gray-300">
              <div>Accuracy</div>
              <div className="text-2xl font-semibold text-white">{accuracy}%</div>
            </div>

            <div className="text-sm text-gray-300">
              <div>Typed</div>
              <div className="text-lg font-medium text-white">{input.length} chars</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetTest}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow"
            >
              🔄 Reset
            </button>

            <button
              onClick={() => {
                // force finish (useful for testing)
                setIsFinished(true);
                clearInterval(intervalRef.current);
                updateWpmAndAccuracy(true);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg shadow"
            >
              ⏹️ Finish
            </button>
          </div>
        </div>

        {isFinished && (
          <div className="mt-4 p-4 rounded-lg bg-green-900/20 border border-green-700 text-green-200">
            <strong>Test Complete</strong>
            <div className="mt-2">Final WPM: <span className="font-semibold">{wpm}</span></div>
            <div>Final Accuracy: <span className="font-semibold">{accuracy}%</span></div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
