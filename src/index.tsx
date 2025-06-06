import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { Provider } from 'jotai'
import { Provider as ReduxProvider } from 'react-redux'
import reportWebVitals from './reportWebVitals'
import { ThemeProvider } from './context/ThemeContext'
import { store } from './state/store'
import './polyfills'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <ThemeProvider>
        <Provider>
          <App />
        </Provider>
      </ThemeProvider>
    </ReduxProvider>
  </React.StrictMode>
)

reportWebVitals()
