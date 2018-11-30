
import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
import AppRouter from './appRouter';

function App() {
  return (
    <div className="App">
      <AppRouter />
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);