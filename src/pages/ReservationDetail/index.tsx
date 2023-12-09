import { Button, Divider, Link, Message } from "@arco-design/web-react"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { postRegisterReservation } from "../../service/api"
import { useModeSwitch } from "../../hooks/useModeSwitch"
import { DarkModeSwitch } from "../../components/DarkModeSwitch"
export const ReservationDetail = () => {
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

    // 用户注册预约
    const postRegisterReservationReq = async () => {
        const raw = await postRegisterReservation({ userId: `${state.userId}`, reservationId: `${state.id}` })
        if (raw.status === 200) {
            const res = await raw.json()
            if (res.code === 0) {
                Message.success("booking successful")
                navigator('/main', { state: state })
            } else {
                Message.error(res.message)
            }
        } else {
            // request failure
            Message.error(raw.statusText)
        }
    }
    return <>
        <div style={{ backgroundColor: bgColor }}>
            <div className={'container w-screen h-screen flex flex-col'}>
                {/* Translate CSS code into a class name system through tailwind CSS implementation (such as flex, justify content: center required for flex layout) */}
                <div className={`w-screen h-16 ${backgroundColor} flex`}>
                    {/* title */}
                    <div className={`w-screen text-center font-bold text-4xl leading-[4rem] ${textColor}`}>Event Reservation Center</div>
                    {/* identity */}
                    <div className={`absolute right-8 top-4 text-xl ${textColor}`}>{isGuest && 'guest'}{(isAdmin || isUser) && state.userName}</div>
                    {/* log out button */}
                    <Link onClick={() => navigator('/')} className={`absolute right-24 top-4 text-xl`}>log out </Link>
                    <div className={'absolute left-5 top-6'}>
                        <DarkModeSwitch mode={mode} setCurrentMode={setCurrentMode} />
                    </div>
                </div>
                <div className={'w-screen flex-1 flex justify-center items-center'}>
                    <div className={'w-screen flex'}>
                        <div className={'w-full h-full p-8'}>
                            <div className={`w-full h-5/6 ${backgroundColor} flex flex-col rounded-2xl`}>
                                <div className={'w-full h-24 flex flex-col pt-3 p-8'}>
                                    <div className={`w-full text-left text-2xl leading-[2rem] mt-3 ${textColor}`}>{state.name}</div>
                                    <Divider />
                                </div>
                                {/* 预约详细内容 */}
                                <div className={'h-full w-full p-6 justify-center'}>
                                    <div className={`w-full flex ${textColor}`}>
                                        <div className={'w-1/3'}>Provider:{state.provider}</div>
                                        <div className={'w-1/3'}>Reservation Date:{(Array.isArray(state.dates) && state.dates.map((item) => <div>{item}</div>)) ||
                                            (Array.isArray(state.date) && state.date.map((item) => <div>{item}</div>))}</div>
                                        {isAdmin &&
                                            <div>Members:  {Array.isArray(state.userNames) && state.userNames.map((item) => <div>{item}</div>)}
                                            </div>}
                                    </div>

                                    <div className={`w-full flex mt-3 ${textColor}`}>
                                        <div className={'w-1/3'}>Start Time：{state.startTimeLimit}</div>
                                        <div className={'w-1/3'}>End Time：{state.endTimeLimit}</div>
                                    </div>
                                    <div className={`w-full flex mt-3 ${textColor}`}>
                                        <div>Description：{typeof state.detail === 'string' && state.detail.slice(0, 2000)}</div>
                                    </div>
                                    <div className={`w-full flex mt-3 justify-center ${textColor}`}>
                                        <Button className={'mr-32'} onClick={() => navigator('/main', { state })}>Back to menu</Button>
                                        {state.current || isAdmin ? <></> : <Button type="primary" onClick={() => postRegisterReservationReq()}>Booking</Button>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div ></>
}