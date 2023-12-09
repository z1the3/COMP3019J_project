

import { Button, Divider, Input, Link, Message, Modal, Select, Table } from "@arco-design/web-react"
import { useEffect, useMemo, useState } from "react"
import { Form, useLocation, useNavigate } from "react-router-dom"
import { postRegisterReservation } from "../../service/api"
import { useModeSwitch } from "../../hooks/useModeSwitch"
import { DarkModeSwitch } from "../../components/DarkModeSwitch"
import item from "@arco-design/web-react/es/Breadcrumb/item"
import form from "@arco-design/web-react/es/Form/form"
import FormItem from "@arco-design/web-react/es/Form/form-item"
export const Log = () => {
    // Status brought over from the previous page
    const state: Record<string, string | number | string[]> = useLocation().state || {}
    // 黑夜模式
    const { mode, setCurrentMode } = useModeSwitch()

    const bgColor = useMemo(() => mode === 'light' ? '#DCECFB' : '#000000', [mode])
    const backgroundColor = useMemo(() => mode === 'light' ? 'bg-white' : 'bg-gray-800', [mode])
    const textColor = useMemo(() => mode === 'light' ? 'text-black' : 'text-white', [mode])
    // Hooks for route jumps
    const navigator = useNavigate()
    // Status of user identity
    const [isGuest, setIsGuest] = useState<boolean>(false)
    const [isUser, setIsUser] = useState<boolean>(false)
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    // Status brought back from the previous page
    useEffect(() => {
        if (state.auth === 1) {
            setIsAdmin(true)
        } else if (state.auth === 0) {
            setIsUser(true)
        } else if (state.auth === -1) {
            setIsGuest(true)
        }

        // If it is not a tourist login and did not enter through the login button, block login
        if (!state.userId && state.auth !== -1) {
            navigator("/")
            return
        }

        // setAllReservationData(mockData)
    }, [])


    return <>
        <div style={{ backgroundColor: bgColor }}>
            <div className={'container w-screen h-screen flex flex-col'}>
                {/* Translate CSS code into a class name system through tailwind CSS implementation (such as flex, justify content: center required for flex layout) */}
                <div className={`w-screen h-16 ${backgroundColor} flex`}>
                    {/* title */}
                    <div className={`w-screen text-center font-bold text-4xl leading-[4rem] ${textColor}`}>Event Reservation Center</div>
                    {/* identity */}
                    <div className={`absolute right-8 top-4 text-xl ${textColor}`}>{state.userName}</div>
                    {/* log out button */}
                    <Link onClick={() => navigator('/')} className={'absolute right-24 top-4 text-xl'}>log out </Link>
                    <div className={'absolute left-5 top-6'}>
                        <DarkModeSwitch mode={mode} setCurrentMode={setCurrentMode} />
                    </div>
                </div>

                <div className={'w-screen flex-1 flex justify-center items-center'}>
                    <div className={'w-screen h-full flex '}>
                        {/* 侧边栏 */}
                        <div className={'w-2/6 h-full bg-indigo-800 flex flex-col'}>
                            <Link className={' h-20 flex items-center text-center font-bold text-2xl leading-[2rem] text-white'} onClick={() => navigator('/main', {
                                state: { userId: state.userId, auth: state.auth, userName: state.userName }
                            })}>
                                <div className="flex items-center">
                                    <img src="/src/assets/menu.png" alt="Icon" className="mr-2" />
                                    Activity List
                                </div>
                            </Link>
                            <Link className={'h-20 flex items-center text-center font-bold text-2xl leading-[2rem] text-white'} onClick={() => navigator('/createActivity', {
                                state: { userId: state.userId, auth: state.auth, userName: state.userName }
                            })}>
                                <div className="flex items-center">
                                    <img src="/src/assets/plus-circle.png" alt="Icon" className="mr-2" />
                                    Create Activity
                                </div>
                            </Link>
                            <Link className={'h-20 flex items-center text-center font-bold text-2xl leading-[2rem] text-white'} onClick={() => navigator('/userManagement', {
                                state: { userId: state.userId, auth: state.auth, userName: state.userName }
                            })}>
                                <div className="flex items-center">
                                    <img src="/src/assets/user.png" alt="Icon" className="mr-2" />
                                    User Management
                                </div>
                            </Link>
                            <Link className={'h-20 flex items-center text-center font-bold text-2xl leading-[2rem] text-white'} onClick={() => navigator('/log', {
                                state: { userId: state.userId, auth: state.auth, userName: state.userName }
                            })}>
                                <div className="flex items-center">
                                    <img src="/src/assets/log.png" alt="Icon" className="mr-2" />
                                    Log File
                                </div>
                            </Link>
                        </div>

                    </div>
                </div >
            </div >
        </div></>
}