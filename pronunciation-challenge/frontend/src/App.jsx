import React from 'react';
  import Recorder from './components/Recorder';

  export default function App() {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Korean Pronunciation Challenge</h1>
          <Recorder />
        </div>
      </div>
    );
  }