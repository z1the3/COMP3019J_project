import { Button, ConfigProvider, Divider, Link, Message, Modal, Popconfirm, Table, TimePicker } from "@arco-design/web-react"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { DatePicker } from '@arco-design/web-react';
import { deleteAccount, getAllReservation, getUserRegisterReservation, postAdminCancelReservation, postCancelReservation, postRegisterReservation } from "../../service/api";
import { ColumnProps } from "@arco-design/web-react/es/Table/interface";
import dayjs from "dayjs";
import { useModeSwitch } from "../../hooks/useModeSwitch";
import { DarkModeSwitch } from "../../components/DarkModeSwitch";
import { columns } from "./utils";
import enUS from "@arco-design/web-react/es/locale/en-US";
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

    // 黑夜模式
    const { mode, setCurrentMode } = useModeSwitch()

    const bgColor = useMemo(() => mode === 'light' ? '#DCECFB' : '#000000', [mode])
    const backgroundColor = useMemo(() => mode === 'light' ? 'bg-white' : 'bg-gray-800', [mode])
    const textColor = useMemo(() => mode === 'light' ? 'text-black' : 'text-white', [mode])
    const columnColor = useMemo(() => mode === 'light' ? '#E8EEFC' : '#5D616A', [mode])
    const bookingColor = useMemo(() => mode === 'light' ? '#22CAB6' : '#7BFF98', [mode])

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
            setUserReservationData([])
        } else if (state.auth === 0) {
            setIsUser(true)
            getUserRegisterReservationReq()
        } else if (state.auth === -1) {
            setIsGuest(true)
        }
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

    // 取消预约
    const postCancelReservationReq = async (item: any) => {
        const raw = await postCancelReservation({ userId: `${state.userId}`, reservationId: `${item.id}` })
        if (raw.status === 200) {
            const res = await raw.json()
            if (res.code === 0) {
                Message.success("cancel successful")
                getAllReservationReq()
                getUserRegisterReservationReq()
                setAllReservationData([...allReservationData])
            } else {
                Message.error(res.message)
            }
        } else {
            // request failure
            Message.error(raw.statusText)
        }
    }

    // 管理员删除预约
    const postAdminCancelReservationReq = async (item: any) => {
        const raw = await postAdminCancelReservation({ reservationId: `${item.id}` })
        if (raw.status === 200) {
            const res = await raw.json()
            if (res.code === 0) {
                Message.success("cancel successful")
                getAllReservationReq()
                getUserRegisterReservationReq()
                setAllReservationData([...allReservationData])
            } else {
                Message.error(res.message)
            }
        } else {
            // request failure
            Message.error(raw.statusText)
        }
    }
    // 销号
    const deleteAccountReq = async () => {
        const raw = await deleteAccount({ userId: `${state.userId}` })
        if (raw.status === 200) {
            const res = await raw.json()
            if (res.code === 0) {
                Message.success("delete successful")
                navigator('/')
            } else {
                Message.error(res.message)
            }
        } else {
            // request failure
            Message.error(raw.statusText)
        }
    }

    // 用户注册预约
    const postRegisterReservationReq = async (item: any) => {
        const raw = await postRegisterReservation({ userId: `${state.userId}`, reservationId: `${item.id}` })
        if (raw.status === 200) {
            const res = await raw.json()
            if (res.code === 0) {
                Message.success("booking successful")
                navigator('/main', { state: state })
                getUserRegisterReservationReq()
                getAllReservationReq()
            } else {
                Message.error(res.message)
            }
        } else {
            // request failure
            Message.error(raw.statusText)
        }
    }
    // for user all reservation
    const userColumns: ColumnProps<unknown>[] = [{
        title: 'Name',
        dataIndex: 'name',
        headerCellStyle: {
            backgroundColor: columnColor,
        },
    },
    {
        title: 'Service Providers',
        dataIndex: 'provider',
        headerCellStyle: {
            backgroundColor: columnColor,
        },
    },
    {
        title: 'Start Time',
        dataIndex: 'startTimeLimit',
        headerCellStyle: {
            backgroundColor: columnColor,
        },
    },
    {
        title: 'End Time',
        dataIndex: 'endTimeLimit',
        headerCellStyle: {
            backgroundColor: columnColor,
        },
    }, {
        title: 'Operation',
        fixed: 'right',
        headerCellStyle: {
            backgroundColor: columnColor,
        },
        width: 180,
        render: (col, item: any) => {
            return (
                <div className="flex">
                    <Link onClick={() => {
                        navigator('/reservationDetail', {
                            state: Object.assign(item as Record<string, string>, { userId: state.userId, auth: state.auth, userName: state.userName, userNames: item.usernames })
                        })
                    }}>details</Link>
                    {isUser && <Link
                        onClick={() => postRegisterReservationReq(item)}
                        style={{ color: bookingColor }}
                    >booking</Link>}
                    {isAdmin && <Link
                        className="text-red-500"
                        onClick={
                            () => postAdminCancelReservationReq(item)
                        }>delete</Link>}

                </div>)
        }

    }]
    // for user current reservation
    const userCurrentColumns: ColumnProps<unknown>[] = [{
        title: 'Name',
        dataIndex: 'name',
        headerCellStyle: {
            backgroundColor: columnColor,
        },
    },
    {
        title: 'Service Providers',
        dataIndex: 'provider',
        headerCellStyle: {
            backgroundColor: columnColor,
        },
    },
    {
        title: 'Start Time',
        dataIndex: 'startTimeLimit',
        headerCellStyle: {
            backgroundColor: columnColor,
        },
    },
    {
        title: 'End Time',
        dataIndex: 'endTimeLimit',
        headerCellStyle: {
            backgroundColor: columnColor,
        },
    }, {
        title: 'Operation',
        fixed: 'right',
        headerCellStyle: {
            backgroundColor: columnColor,
        },
        width: 180,
        render: (col, item) => {
            return (
                <div className="flex">
                    <Link onClick={() => {
                        navigator('/reservationDetail', {
                            state: Object.assign(item as Record<string, string>, { userId: state.userId, auth: state.auth, userName: state.userName, current: true })
                        })
                    }}>details</Link>
                    {<Link className="text-red-500" onClick={
                        () => postCancelReservationReq(item)
                    }>cancel</Link>}
                </div>)
        }

    }]
    // The dynamic HTML structure is organized in the form of jsx/tsx because we use React.js
    return <>
        <ConfigProvider locale={enUS}>

            <div style={{ backgroundColor: bgColor }}>
                <div className={'container w-screen h-screen flex flex-col'}>
                    {/* Translate CSS code into a class name system through tailwind CSS implementation (such as flex, justify content: center required for flex layout) */}
                    <div className={`w-screen h-16 flex ${backgroundColor}`}>
                        {/* title */}
                        <div className={`w-screen text-center font-bold text-4xl leading-[4rem] ${textColor}`}>Event Reservation Center</div>
                        {/* identity */}
                        <div className={`absolute right-8 top-4 text-xl ${textColor}`}>{isGuest && 'guest'}{(isAdmin || isUser) && state.userName}</div>
                        {/* log out button */}
                        <Link onClick={() => navigator('/')} className={'absolute right-36 top-4 text-xl'}>log out </Link>
                        {/* delete account button */}
                        {
                            !isGuest &&
                            <div className={'absolute right-64 top-4 text-xl'}>
                                <Popconfirm
                                    focusLock
                                    title='Confirm'
                                    content='Are you sure you want to delete?'
                                    onOk={() => {
                                        deleteAccountReq()
                                    }}
                                    onCancel={() => {
                                    }}
                                    okText='Delete'
                                    cancelText='Cancel'

                                >
                                    <Button type='primary' status='danger'>Delete Account</Button>
                                </Popconfirm>
                            </div>

                        }
                        <div className={'absolute left-5 top-6'}>
                            <DarkModeSwitch mode={mode} setCurrentMode={setCurrentMode} />
                        </div>

                    </div>
                    <div className={'w-screen flex-1 flex justify-center items-center'}>
                        {/* guest table */}
                        {isGuest && <div className={`w-5/6 h-5/6 flex flex-col rounded-3xl ${backgroundColor}`}>
                            <div className={'w-full h-24 bg-red flex flex-col pt-3'}>
                                <div className={`w-full text-center font-bold text-2xl leading-[2rem] ${textColor}`}>All Reservation</div>
                                <div className={'w-1/6 mx-auto -my-3'} >
                                    <Divider />
                                </div>
                            </div>
                            <div className={'h-full p-8'}>
                                <RangePicker className={"mb-4"}
                                    format='YYYY-MM-DD'
                                    placeholder={['start date', 'end date']}
                                    onSelect={(vs) => {
                                        setTimeRange(vs)
                                    }}
                                    onClear={() => {
                                        setTimeRange([])
                                    }}
                                />
                                <Table scroll={{ y: 300 }} noDataElement={'no data'} columns={columns} data={notBookingReservationData} pagination={false} />
                            </div>
                        </div>}

                        {/* user table */}
                        {isUser && (
                            <div className={'w-screen h-5/6 flex justify-around space-x-3'}>
                                <div className={`w-[50rem] h-full ${backgroundColor} flex flex-col rounded-3xl`}>
                                    <div className={'w-full h-24 flex flex-col pt-3'}>
                                        <div className={`w-full text-center font-bold text-2xl leading-[2rem] ${textColor}`}>My Reservation</div>
                                        <div className={'w-1/6 mx-auto -my-3'} >
                                            <Divider />
                                        </div>
                                    </div>
                                    <div className={' p-8'}>
                                        <Table rowKey={'id'} noDataElement={'no data'} scroll={{ y: 280 }} virtualized={true} columns={userCurrentColumns} data={userReservationData} pagination={false} />
                                    </div>
                                </div>
                                <div className={`w-[50rem] h-full ${backgroundColor} flex flex-col rounded-3xl`}>
                                    <div className={'w-full h-24 flex flex-col pt-3'}>
                                        <div className={`w-full text-center font-bold text-2xl leading-[2rem] ${textColor}`}>Not Booking Reservation</div>
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
                                            onClear={() => {
                                                setTimeRange([])
                                            }}
                                        />
                                        <Table rowKey={'id'} noDataElement={'no data'} scroll={{ y: 280 }} virtualized={true} columns={userColumns} data={notBookingReservationData} pagination={false} />
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* admin table */}
                        {isAdmin && (
                            <div className={'w-screen h-full flex '}>
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
                                </div>
                                <div className={'w-full p-8'}>
                                    <div className={`w-full h-full flex flex-col rounded-3xl ${backgroundColor}`}>
                                        <div className={'w-full h-24 bg-red flex flex-col pt-3'}>
                                            <div className={`w-full text-center font-bold text-2xl leading-[2rem] ${textColor}`}>All Reservation</div>
                                            <div className={'w-1/6 mx-auto -my-3'} >
                                                <Divider />
                                            </div>
                                        </div>
                                        <div className={'h-full w-full p-8 justify-center '}>
                                            <RangePicker className={"mb-4"}
                                                format='YYYY-MM-DD'
                                                placeholder={['start date', 'end date']}
                                                onSelect={(vs) => {
                                                    setTimeRange(vs)
                                                }}
                                                onClear={() => {
                                                    setTimeRange([])
                                                }}
                                            />
                                            <Table scroll={{ y: 230 }} noDataElement={'no data'} virtualized={true} columns={userColumns} data={notBookingReservationData} pagination={false} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div >
            </div>
        </ConfigProvider >

    </>
}