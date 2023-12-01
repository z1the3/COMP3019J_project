import { Divider, Link, Message, Modal, Table, TimePicker } from "@arco-design/web-react"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { DatePicker } from '@arco-design/web-react';
import { getAllReservation, getUserRegisterReservation } from "../../service/api";
import { ColumnProps } from "@arco-design/web-react/es/Table/interface";
import { columns } from "./utils";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;

export const Main = () => {
    // Status brought over from the previous page
    const state: Record<string, string | number> = useLocation().state || {}
    // Status of user identity
    const [isGuest, setIsGuest] = useState<boolean>(false)
    const [isUser, setIsUser] = useState<boolean>(false)
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    // All reservations currently requested
    const [allReservationData, setAllReservationData] = useState<Record<string, string | string[] | number>[]>([])
    // 当前用户已注册的预约
    const [userReservationData, setUserReservationData] = useState<Record<string, string | number>[]>([])

    const [timeRange, setTimeRange] = useState<string[]>([])

    // 根据所有预约与用户已注册预约，计算出用户未注册预约, 同时根据日期过滤
    const notBookingReservationData = useMemo(() => {
        const notBookingReservations: Record<string, string | number | string[]>[] = []
        const currentIDs = [...userReservationData].map((item) => item.id)
        allReservationData.forEach((allR) => {
            // 把所有预约的所在时间按从前到后排序
            const dates = Array.isArray(allR.dates) ? allR.dates.sort((a, b) => {
                return dayjs(a).isAfter(b) ? 1 : -1
            }) : []
            const startDate = dates[0]
            const endDate = dates[dates.length - 1]
            if (!startDate || !endDate) {
                return
            }
            // 如果筛选的时间范围不完全包括预约所在时间，则认为用户已经错过
            if (timeRange[0] && timeRange[1] && (dayjs(timeRange[0]).isAfter(startDate) ||
                dayjs(timeRange[1]).isBefore(endDate))) {
                return
            }
            if (currentIDs.indexOf(allR.id as number) === -1) {
                notBookingReservations.push(allR)
            }
        })
        return notBookingReservations
    }, [allReservationData, userReservationData, timeRange])
    // Hooks for route jumps
    const navigator = useNavigate()
    // Status brought back from the previous page
    useEffect(() => {
        if (state.auth === 1) {
            setIsAdmin(true)
        } else if (state.auth === 0) {
            setIsUser(true)
            getUserRegisterReservationReq()
        } else if (state.auth === -1) {
            setIsGuest(true)
        }
        console.log(state)
        // If it is not a tourist login and did not enter through the login button, block login
        if (!state.userId && state.auth !== -1) {
            navigator("/")
            return
        }

        getAllReservationReq()
        // setAllReservationData(mockData)
    }, [])
    // Initiate a request to obtain all appointment data
    const getAllReservationReq = async () => {
        const raw = await getAllReservation()
        if (raw.status === 200) {
            const res = await raw.json() as Record<string, Record<string, string | number>[]>
            res.reservations.map((item) => ({ ...item, key: item.id }))
            setAllReservationData(res.reservations)

        } else {
            // request failure
            Message.error(raw.statusText)
        }

    }

    // 请求该用户注册的所有预约
    const getUserRegisterReservationReq = async () => {
        const raw = await getUserRegisterReservation({ userId: `${state.userId}` })
        if (raw.status === 200) {
            const res = await raw.json() as Record<string, Record<string, string | number>[]>
            res.reservations.map((item) => ({ ...item, key: item.id }))
            setUserReservationData(res.reservations)

        } else {
            // request failure
            Message.error(raw.statusText)
        }
    }

    // for user
    const userColumns: ColumnProps<unknown>[] = [{
        title: 'Name',
        dataIndex: 'name',
    },
    {
        title: 'Service Providers',
        dataIndex: 'userId',
    },
    {
        title: 'Start Time',
        dataIndex: 'startTimeLimit',
    },
    {
        title: 'End Time',
        dataIndex: 'endTimeLimit',
    }, {
        title: 'Operation',
        fixed: 'right',
        width: 180,
        render: (col, item) => {
            return (
                <div className="flex">
                    <Link onClick={() => {
                        navigator('/reservationDetail', {
                            state: Object.assign(item as Record<string, string>, { userId: state.userId, auth: state.auth, userName: state.userName })
                        })
                    }}>details</Link>
                    <Link
                    >booking</Link>
                </div>)
        }

    }]
    // The dynamic HTML structure is organized in the form of jsx/tsx because we use React.js
    return <>
        <div className={'container w-screen h-screen flex flex-col'}>
            {/* Translate CSS code into a class name system through tailwind CSS implementation (such as flex, justify content: center required for flex layout) */}
            <div className={'w-screen h-16 bg-white flex'}>
                {/* title */}
                <div className={'w-screen text-center font-bold text-4xl leading-[4rem]'}>Event Reservation Center</div>
                {/* identity */}
                <div className={'absolute right-8 top-4 text-xl'}>{isGuest && 'guest'}{(isAdmin || isUser) && state.userName}</div>
                {/* log out button */}
                <Link onClick={() => navigator('/')} className={'absolute right-24 top-4 text-xl'}>log out </Link>
            </div>
            <div className={'w-screen flex-1 flex justify-center items-center'}>
                {/* guest table */}
                {isGuest && <div className={'w-5/6 h-5/6 bg-white flex flex-col rounded-3xl'}>
                    <div className={'w-full h-24 bg-red flex flex-col pt-3'}>
                        <div className={'w-full text-center font-bold text-2xl leading-[2rem]'}>All Reservation</div>
                        <div className={'w-1/6 mx-auto -my-3'} >
                            <Divider />
                        </div>
                    </div>
                    <div className={'h-full p-8'}>
                        <RangePicker className={"mb-4"}
                            format='YYYY-MM-DD'
                            placeholder={['start date', 'end date']}
                        />
                        <Table scroll={{ y: 300 }} columns={columns} data={allReservationData} pagination={false} />
                    </div>
                </div>}

                {/* user table */}
                {isUser && (
                    <div className={'w-screen h-5/6 flex justify-around space-x-3'}>
                        <div className={'w-[50rem] h-5/6 bg-white flex flex-col rounded-3xl'}>
                            <div className={'w-full h-24 bg-red flex flex-col pt-3'}>
                                <div className={'w-full text-center font-bold text-2xl leading-[2rem]'}>My Reservation</div>
                                <div className={'w-1/6 mx-auto -my-3'} >
                                    <Divider />
                                </div>
                            </div>
                            <div className={' p-8'}>
                                <Table rowKey={'id'} scroll={{ y: 300 }} virtualized={true} columns={userColumns} data={userReservationData} pagination={false} />
                            </div>
                        </div>
                        <div className={'w-[50rem] h-5/6 bg-white flex flex-col rounded-3xl'}>
                            <div className={'w-full h-24 bg-red flex flex-col pt-3'}>
                                <div className={'w-full text-center font-bold text-2xl leading-[2rem]'}>Not Booking Reservation</div>
                                <div className={'w-1/6 mx-auto -my-3'} >
                                    <Divider />
                                </div>
                            </div>
                            <div className={' p-8'}>
                                <RangePicker className={"mb-4"}
                                    format='YYYY-MM-DD'
                                    placeholder={['start date', 'end date']}
                                    onSelect={(vs) => {
                                        setTimeRange(vs)
                                    }}
                                />
                                <Table rowKey={'id'} scroll={{ y: 300 }} virtualized={true} columns={userColumns} data={notBookingReservationData} pagination={false} />
                            </div>
                        </div>
                    </div>
                )}
                {/* admin table */}
                {isAdmin && (
                    <div className={'w-screen h-full flex '}>
                        <div className={'w-1/6 h-full bg-blue-700 flex flex-col'}>
                            <div className={'h-16'}>activity list</div>
                            <div className={'h-16'}>create activity</div>
                        </div>
                        <div className={'w-full p-24'}>
                            <div className={'w-full h-5/6 bg-white flex flex-col rounded-3xl'}>
                                <div className={'w-full h-24 bg-red flex flex-col pt-3'}>
                                    <div className={'w-full text-center font-bold text-2xl leading-[2rem]'}>All Reservation</div>
                                    <div className={'w-1/6 mx-auto -my-3'} >
                                        <Divider />
                                    </div>
                                </div>
                                <div className={'h-full w-full p-8 justify-center '}>
                                    <RangePicker className={"mb-4"}
                                        format='YYYY-MM-DD'
                                        placeholder={['start date', 'end date']}
                                    />
                                    <Table scroll={{ y: 300 }} virtualized={true} columns={userColumns} data={allReservationData} pagination={false} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div >
    </>
}