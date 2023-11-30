import { Button, Divider, Link } from "@arco-design/web-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export const ReservationDetail = () => {
    // Status brought over from the previous page
    const state: Record<string, string | number | string[]> = useLocation().state || {}
    console.log(state)
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

    return <div className={'container w-screen h-screen flex flex-col'}>
        {/* Translate CSS code into a class name system through tailwind CSS implementation (such as flex, justify content: center required for flex layout) */}
        <div className={'w-screen h-16 bg-white flex'}>
            {/* title */}
            <div className={'w-screen text-center font-bold text-4xl leading-[4rem]'}>Event Reservation Center</div>
            {/* identity */}
            <div className={'absolute right-8 top-4 text-xl'}>{isGuest && 'guest'}{(isAdmin || isUser) && state.userName}</div>
            {/* log out button */}
            <Link onClick={() => navigator('/')} className={'absolute right-48 top-4 text-xl'}>log out </Link>
        </div>
        <div className={'w-screen flex-1 flex justify-center items-center'}>
            <div className={'w-screen h-full flex '}>
                <div className={'w-full h-full p-8'}>
                    <div className={'w-full h-5/6 bg-white flex flex-col rounded-2xl'}>
                        <div className={'w-full h-24 bg-red flex flex-col pt-3 p-8'}>
                            <div className={'w-full text-left text-2xl leading-[2rem] mt-3'}>{state.name}</div>
                            <Divider />
                        </div>
                        <div className={'h-full w-full p-6 justify-center'}>
                            <div className={'w-full flex'}>
                                <div className={'w-1/3'}>活动承办方：</div>
                                <div className={'w-1/3'}>活动日期：{Array.isArray(state.dates) && state.dates.map((item) => <div>{item}</div>)}</div>
                                <div>已预约人数：</div>
                            </div>
                            <div className={'w-full flex mt-3'}>
                                <div className={'w-1/3'}>活动开始时间：{state.startTimeLimit}</div>
                                <div className={'w-1/3'}>活动结束时间：{state.endTimeLimit}</div>
                            </div>
                            <div className={'w-full flex mt-3 '}>
                                <div>活动介绍：{state.detail.slice(0, 2000)}</div>
                            </div>
                            <div className={'w-full flex mt-3 justify-center'}>
                                <Button className={'mr-32'} onClick={() => navigator('/main', { state })}>返回</Button>
                                <Button type="primary">预约</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div >
}