/**
 * CareBridge — Isolated Tailwind CSS Demonstration Component
 * File: src/components/TailwindExample.jsx
 * Reference: PDF Page 16 (Task 07 Styling Showcase)
 */

import React, { useState } from 'react';

export default function TailwindExample() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-blue-500 mb-2">Tailwind Example</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Isolated utility-first CSS demonstration for developer comparison.
      </p>
      <button
        onClick={() => setClicked(!clicked)}
        className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors focus:ring-2 focus:ring-green-400"
      >
        {clicked ? 'Clicked! ✓' : 'Click Me'}
      </button>
    </div>
  );
}

export { TailwindExample };
