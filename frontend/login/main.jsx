import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {ThemeProvider} from "@mui/material";
import Theme from "../components/Theme.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <ThemeProvider theme={Theme}>
          <App />
      </ThemeProvider>
  </React.StrictMode>,
)
