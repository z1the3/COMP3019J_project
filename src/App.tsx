import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Main } from './pages/Main'
import React, { useState } from 'react';
import { useModeSwitch } from './hooks/useModeSwitch';


export const ModeContext = React.createContext<{ mode: string, setCurrentMode: any }>
  ({
    mode: 'light',
    setCurrentMode: () => { }
  });

function App() {

  const [initMode, setInitMode] = useState('light')

  return (
    <ModeContext.Provider value={{ mode: initMode, setCurrentMode: setInitMode }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={Login} />
          <Route path="/register" Component={Register} />
          <Route path="/main" Component={Main} />

        </Routes>
      </BrowserRouter>
    </ModeContext.Provider>
  )
}

export default App
