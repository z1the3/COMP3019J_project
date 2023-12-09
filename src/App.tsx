import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Main } from './pages/Main'
import React, { useState } from 'react';
import { useModeSwitch } from './hooks/useModeSwitch';
import { CreateActivity } from './pages/CreateActivity';
import { ReservationDetail } from './pages/ReservationDetail';
import { UserManagement } from './pages/UserManagement';
import { Log } from './pages/Log';


export const ModeContext = React.createContext<{ mode: string, setCurrentMode: any }>
  ({
    mode: 'light',
    setCurrentMode: () => { }
  });

function App() {

  // 黑夜模式初始值
  const [initMode, setInitMode] = useState('light')

  return (
    // 导入到context中
    <ModeContext.Provider value={{ mode: initMode, setCurrentMode: setInitMode }}>
      {/* 所有用到的前端路由 */}
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={Login} />
          <Route path="/createActivity" Component={CreateActivity} />
          <Route path="/register" Component={Register} />
          <Route path="/main" Component={Main} />
          <Route path="/reservationDetail" Component={ReservationDetail} />
          <Route path="/userManagement" Component={UserManagement} />
          <Route path="/log" Component={Log} />

        </Routes>
      </BrowserRouter>
    </ModeContext.Provider>
  )
}

export default App
