import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [storyId, setStoryId] = useState('')
  const [storyIdList, setStoryList] = useState([])
  const [storyLength, setStoryLength] = useState(0)
  const [suggestStoryLength, setSuggestStoryLength] = useState(0)

  useEffect(async () => {
    const result = await axios('');

    setStoryList(result.data)
  })

  return (
    <div className="App">
      <div>
        Test
      </div>
    </div>
  );
}

export default App;
