"use client";
import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";

export default function TypeMeter() {
  const [quote, setQuote] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [wrongPercent, setWrongPercent] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("dark"); // dark or light
  const [fontSize, setFontSize] = useState("text-lg"); // Tailwind font size

  const inputRef = useRef(null);
  const intervalRef = useRef(null);

  // Fetch random quote
  const fetchQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.quotable.io/random");
      const data = await res.json();
      setQuote(data.content);
    } catch (err) {
      console.error("Error fetching quote:", err);
      setQuote("Error fetching quote. Please try again.");
    }
    setLoading(false);
  };

  // Initialize test on mount
  useEffect(() => {
    resetTest();
    return () => clearInterval(intervalRef.current);
  }, []);

  // Update WPM/Accuracy/Wrong % live
  useEffect(() => {
    if (!startTime && input.length > 0) {
      setStartTime(Date.now());
      intervalRef.current = setInterval(() => {
        updateWpmAndAccuracy();
      }, 300);
    }

    updateWpmAndAccuracy();

    if (input === quote && quote.length > 0) {
      setIsFinished(true);
      clearInterval(intervalRef.current);
      updateWpmAndAccuracy(true);
    }
  }, [input]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        resetTest();
      }
      if (e.key === "Enter") {
        resetTest();
      }
      if (e.key === "+") {
        setFontSize("text-xl");
      }
      if (e.key === "-") {
        setFontSize("text-lg");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const correctCharsCount = (text, target) => {
    let count = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === target[i]) count++;
    }
    return count;
  };

  const updateWpmAndAccuracy = (forceFinalize = false) => {
    if (!startTime) return;
    const now = Date.now();
    const minutes = Math.max((now - startTime) / 1000 / 60, 1 / 60);

    const charsTyped = input.length;
    const wpmCalc = Math.round(charsTyped / 5 / minutes);
    setWpm(isFinite(wpmCalc) ? Math.max(0, wpmCalc) : 0);

    const correct = correctCharsCount(input, quote);
    const accuracyCalc =
      charsTyped === 0 ? 100 : Math.round((correct / charsTyped) * 100);
    setAccuracy(Math.max(0, Math.min(100, accuracyCalc)));

    const wrongCalc =
      charsTyped === 0
        ? 0
        : Math.round(((charsTyped - correct) / charsTyped) * 100);
    setWrongPercent(Math.max(0, Math.min(100, wrongCalc)));
  };

  const handleChange = (e) => {
    if (isFinished) return;
    setInput(e.target.value);
  };

  const resetTest = async () => {
    clearInterval(intervalRef.current);
    await fetchQuote();
    setInput("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setWrongPercent(0);
    setIsFinished(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Render quote with coloring for correct/wrong characters
  const renderedQuote = () =>
    quote.split("").map((ch, i) => {
      const typedChar = input[i];
      let className = "text-gray-400";
      if (typedChar !== undefined) {
        className =
          typedChar === ch ? theme === "dark"? "text-green-400":"text-blue-400" : "text-red-400 line-through";
      }
      return (
        <span key={i} className={`whitespace-pre-wrap ${className}`}>
          {ch}
        </span>
      );
    });

  return (
    <>
      <Head>
        <title>TypeMeter</title>
        <meta property="og:title" content="TypeMeter" key="title" />
      </Head>
      <div
      suppressHydrationWarning
        className={`min-h-screen flex items-center justify-center p-6 ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <div
          className={`w-full max-w-2xl ${
            theme === "dark" ? "bg-gray-800/60 border-gray-700" : "bg-white/80 border-gray-300"
          } backdrop-blur-sm border rounded-2xl p-6 shadow-lg`}
        >
          <h1 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            TypeMeter ⌨️
          </h1>

          {/* Theme + Font Controls */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
              className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
            </button>
            <button
              onClick={() =>
                setFontSize(fontSize === "text-lg" ? "text-xl" : "text-lg")
              }
              className="px-3 py-1 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
            >
              Font Size: {fontSize === "text-lg" ? "Small" : "Large"}
            </button>
          </div>

          {/* Quote Box */}
          <div className="mb-4 p-4 rounded-lg border min-h-[100px] w-full"
            style={{
              backgroundColor: theme === "dark" ? "#1f2937" : "#f3f4f6",
              borderColor: theme === "dark" ? "#374151" : "#d1d5db"
            }}
          >
            {loading ? (
              <div className="text-indigo-400 animate-pulse text-center">
                ⏳ Loading quote...
              </div>
            ) : (
              <p className={`${fontSize} leading-relaxed whitespace-pre-wrap break-words ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                {renderedQuote()}
              </p>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleChange}
            disabled={isFinished || loading}
            placeholder="Start typing here..."
            className={`w-full min-h-[120px] p-4 rounded-lg border focus:outline-none focus:ring-2 ${
              theme === "dark"
                ? "bg-gray-800 text-white placeholder-gray-400 border-gray-700 focus:ring-indigo-500"
                : "bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:ring-indigo-500"
            }`}
          />

          {/* Stats */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-6 items-center">
              <div className="text-sm">
                <div className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>WPM</div>
                <div className={`text-2xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{wpm}</div>
              </div>
              <div className="text-sm">
                <div className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>Accuracy</div>
                <div className={`text-2xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{accuracy}%</div>
              </div>
              <div className="text-sm">
                <div className={`text-red-400`}>Wrong %</div>
                <div className="text-2xl font-semibold text-red-400">{wrongPercent}%</div>
              </div>
              <div className="text-sm">
                <div className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>Typed</div>
                <div className={`text-lg font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{input.length} chars</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={resetTest}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow"
              >
                🔄 Reset
              </button>
              <button
                onClick={() => {
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

          {/* Completion */}
          {isFinished && !loading && (
            <div className="mt-4 p-4 rounded-lg border text-green-200" style={{ backgroundColor: theme === "dark" ? "rgba(22,163,74,0.2)" : "rgba(0, 0, 0, 0.3)", borderColor: theme === "dark" ? "#16a34a" : "#000000ff", color: theme === "dark" ? "#16a34a" : "#000000ff" }}>
              <strong>Test Complete</strong>
              <div className="mt-2">Final WPM: <span className="font-semibold">{wpm}</span></div>
              <div>Final Accuracy: <span className="font-semibold">{accuracy}%</span></div>
              <div>Final Wrong %: <span className="font-semibold text-red-400">{wrongPercent}%</span></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
