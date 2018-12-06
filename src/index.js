import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
import AppRouter from './appRouter';
window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;
function App() {
  return (
    <div className="App">
      <AppRouter />
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
