import { Divider, Link, Table, TableColumnProps } from "@arco-design/web-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate, useNavigation } from "react-router-dom"
import { DatePicker } from '@arco-design/web-react';
const { RangePicker } = DatePicker;

export const Main = () => {
    const state: Record<string, string> = useLocation().state || {}
    const [isGuest, setIsGuest] = useState<boolean>(false)
    const [isUser, setIsUser] = useState<boolean>(false)
    const [isAdmin, setIsAdmin] = useState<boolean>(false)


    const navigator = useNavigate()
    useEffect(() => {
        if (state.auth === 'guest') {
            // setIsGuest(true)
            setIsGuest(false)
            // setIsUser(true)
            setIsAdmin(true)
            return
        }
        if (!state.userId) {
            navigator("/")
        }
    }, [])


    const columns: TableColumnProps[] = [
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: 'Service Providers',
            dataIndex: 'salary',
        },
        {
            title: 'Start Time',
            dataIndex: 'address',
        },
        {
            title: 'End Time',
            dataIndex: 'email',
        },
    ];


    const userColumns = [{
        title: 'Name',
        dataIndex: 'name',
    },
    {
        title: 'Service Providers',
        dataIndex: 'service',
    },
    {
        title: 'Start Time',
        dataIndex: 'startTime',
    },
    {
        title: 'End Time',
        dataIndex: 'endTime',
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
    const data = [
        {
            key: '1',
            name: 'aaa',
            startTime: '222',
            service: '111',
            endTime: '3333',
            operation: ''
        }
    ];


    return <>
        <div className={'container w-screen h-screen flex flex-col'}>
            <div className={'w-screen h-16 bg-white flex'}>
                <div className={'w-screen text-center font-bold text-4xl leading-[4rem]'}>Event Reservation Center</div>
                <div className={'absolute right-8 top-4 text-xl'}>{isGuest && 'guest'}</div>
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
                        <Table scroll={{ y: true }} columns={columns} data={data} pagination={false} />
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
                                <Table scroll={{ y: true }} columns={userColumns} data={data} pagination={false} />
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
                                <Table scroll={{ y: true }} columns={userColumns} data={data} pagination={false} />
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
                                    <Table scroll={{ y: true }} columns={userColumns} data={data} pagination={false} />
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

        </div >

    </>
}