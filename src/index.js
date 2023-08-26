import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import StarRating from './StarRating';

// function MovieStarTest() {
//   const [movieRating, setMovieRating] = useState(0);
//   return (
//     <div>
//       <h1>Star Rating</h1>
//       <StarRating maxRating={5} messages={['Terrible', 'Bad', 'Okay', 'Good', 'Great']} color='green' onSetRating={(rating) => setMovieRating(rating)} />
//       <span>This movie has {movieRating} star</span>
//     </div>
//   )
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating maxRating={5} messages={['Terrible', 'Bad', 'Okay', 'Good', 'Great']} />
    <StarRating maxRating={10} color='red' size={70} className={"testClass"} defaultRating={2} />
    <MovieStarTest /> */}
  </React.StrictMode>
);

