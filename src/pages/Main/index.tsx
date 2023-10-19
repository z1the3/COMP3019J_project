import { Divider, Link, Message, Table, TableColumnProps } from "@arco-design/web-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { DatePicker } from '@arco-design/web-react';
import { getAllReservation } from "../../service/api";
import { ColumnProps } from "@arco-design/web-react/es/Table/interface";
const { RangePicker } = DatePicker;

export const Main = () => {
    const state: Record<string, string | number> = useLocation().state || {}
    const [isGuest, setIsGuest] = useState<boolean>(false)
    const [isUser, setIsUser] = useState<boolean>(false)
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const [allReservationData, setAllReservationData] = useState([])

    const navigator = useNavigate()
    useEffect(() => {
        if (state.auth === 1) {
            setIsAdmin(true)
        } else if (state.auth === 0) {
            setIsUser(true)
        } else if (state.auth === -1) {
            setIsGuest(true)
        }

        if (!state.userId && state.auth !== -1) {
            navigator("/")
        }

        getAllReservationReq()

    }, [])

    const getAllReservationReq = async () => {
        const res = await getAllReservation()
        if (res.status === 201) {
            console.log(res)

        } else {
            Message.error(res.statusText)
        }

    }
    const columns: ColumnProps<unknown>[] = [
        {
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
        },
    ];


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
        // dataIndex: 'operation',
        render: () => (
            <div className="flex">
                <Link>details</Link>
                <Link>booking</Link>
            </div>)

    },]



    return <>
        <div className={'container w-screen h-screen flex flex-col'}>
            <div className={'w-screen h-16 bg-white flex'}>
                <div className={'w-screen text-center font-bold text-4xl leading-[4rem]'}>Event Reservation Center</div>
                <div className={'absolute right-8 top-4 text-xl'}>{isGuest && 'guest'}{(isAdmin || isUser) && state.name}</div>
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
                        <Table scroll={{ y: true }} columns={columns} data={allReservationData} pagination={false} />
                    </div>
                </div>}

                {/* user table */}
                {isUser && (
                    <div className={'w-screen h-5/6 flex justify-around'}>
                        <div className={'w-[50rem] h-5/6 bg-white flex flex-col rounded-3xl'}>
                            <div className={'w-full h-24 bg-red flex flex-col pt-3'}>
                                <div className={'w-full text-center font-bold text-2xl leading-[2rem]'}>My Reservation</div>
                                <div className={'w-1/6 mx-auto -my-3'} >
                                    <Divider />
                                </div>
                            </div>
                            <div className={'h-full p-8'}>
                                <RangePicker className={"mb-4"}
                                    format='YYYY-MM-DD'
                                    placeholder={['start date', 'end date']}
                                />
                                <Table scroll={{ y: true }} columns={userColumns} data={allReservationData} pagination={false} />
                            </div>
                        </div>
                        <div className={'w-[50rem] h-5/6 bg-white flex flex-col rounded-3xl'}>
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
                                <Table scroll={{ y: true }} columns={userColumns} data={allReservationData} pagination={false} />
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
                                    <Table scroll={{ y: true }} columns={userColumns} data={allReservationData} pagination={false} />
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

        </div >

    </>
}