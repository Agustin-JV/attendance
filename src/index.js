import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
import AppRouter from './appRouter';
import configureStore from './store/configureStore';
import * as Redux from 'redux';
import { Provider } from 'react-redux';
window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;
const store = configureStore();
function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <AppRouter />
      </Provider>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
