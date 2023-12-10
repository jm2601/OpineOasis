import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import MainContent from "../components/MainContent.jsx";
import {ThemeProvider} from "@mui/material";
import Theme from "../components/Theme.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <ThemeProvider theme={Theme}>
            <MainContent>
                <App />
            </MainContent>
      </ThemeProvider>
  </React.StrictMode>,
)
