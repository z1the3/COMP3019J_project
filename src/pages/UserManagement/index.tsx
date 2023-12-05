import { Form, Input, Link, Message, Modal, Popconfirm, Select, Table } from "@arco-design/web-react"
import { useLocation, useNavigate } from "react-router-dom"
import "@arco-design/web-react/dist/css/arco.css";
import { useEffect, useMemo, useRef, useState } from "react";
import enUS from '@arco-design/web-react/es/locale/en-US';
import { deleteAccount, editUser, getAllUser } from "../../service/api";
import { useModeSwitch } from "../../hooks/useModeSwitch";
import { DarkModeSwitch } from "../../components/DarkModeSwitch";
import { ColumnProps } from "@arco-design/web-react/es/Table";

const FormItem = Form.Item;
export const UserManagement = () => {
    // Hooks for route jumps
    const navigator = useNavigate()
    // Status brought over from the previous page
    const state: Record<string, string | number> = useLocation().state || {}
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    const [allUserData, setAllUserData] = useState<Record<string, string | string[] | number>[]>([])
    // 黑夜模式
    const { mode, setCurrentMode } = useModeSwitch()
    const [item, setItem] = useState({
        name: '',
        state: '',
        userId: ''
      });
    

    const backgroundColor = useMemo(() => mode === 'light' ? 'bg-white' : 'bg-black', [mode])
    const columnColor = useMemo(() => mode === 'light' ? '#E8EEFC' : '#5D616A', [mode])
    const textColor = useMemo(() => mode === 'light' ? 'text-black' : 'text-white', [mode])

    useEffect(() => {
        getAllUserReq()
        // setAllReservationData(mockData)
    }, [])


    const userColumns: ColumnProps<unknown>[] = [{
        title: 'Name',
        dataIndex: 'name',
        headerCellStyle: {
            backgroundColor: columnColor,
        },
    },
    {
        title: 'State',
        dataIndex: 'state',
        headerCellStyle: {
            backgroundColor: columnColor,
        },
    },
    {
        title: 'User ID',
        dataIndex: 'userId',
        headerCellStyle: {
            backgroundColor: columnColor,
        },
    },
    {
        title: 'Operation',
        fixed: 'right',
        headerCellStyle: {
            backgroundColor: columnColor,
        },
        width: 180,
        render: (col, item: any) => {
            return (
                <div className="flex">
                    <Link onClick={() => {setVisible(true)
                    console.log(item as Record<string, string>)
                    setItem(item)}}>edit</Link>
                    <Popconfirm
                        focusLock
                        title='Confirm'
                        content='Are you sure you want to delete?'
                        onOk={() => {
                            deleteAccountReq(item.userId)
                        }}
                        onCancel={() => {
                        }}
                        okText='Delete'
                        cancelText='Cancel'
                    >
                        <Link className="text-red-500">delete</Link>
                    </Popconfirm>
                </div>)
        }
    }]

    const formItemLayout = {
        labelCol: {
          span: 4,
        },
        wrapperCol: {
          span: 20,
        },
    };

    const deleteAccountReq = async (userId: string) => {
        const raw = await deleteAccount({ userId: `${userId}` })
        if (raw.status === 200) {
            const res = await raw.json()
            if (res.code === 0) {
                Message.success("delete successful")
                getAllUserReq()
                setAllUserData([...allUserData])
            } else {
                Message.error(res.message)
            }
        } else {
            // request failure
            Message.error(raw.statusText)
        }
    }

    const editUserReq = async(userId:any, name:any, state:any) => {
        const raw = await editUser({ userId: `${userId}`, name: `${name}`, state: `${state}` })
        if (raw.status === 200) {
            const res = await raw.json()
            if (res.code === 0) {
                Message.success("edit successful")
                getAllUserReq()
                setAllUserData([...allUserData])
                setVisible(false)
            } else {
                Message.error(res.message)
            }
        } else {
            // request failure
            Message.error(raw.statusText)
        }
    }

    const getAllUserReq = async () => {
        const raw = await getAllUser()
        if (raw.status === 200){
            const res = await raw.json() as Record<string, Record<string, string | number>[]>
            res.users.map((item) => ({ ...item, key: item.id, state: getState(item.state) }))
            setAllUserData(res.users)
            console.log(res.users)
        } else {
            Message.error(raw.statusText)
        }
    }

    function getState(state: string | number) {
        // 根据 state 的值定义真实状态
        switch (state) {
          case 1:
            return "Active";
          case 2:
            return "Inactive";
          // 可以根据需要添加更多的状态
          default:
            return "Unknown";
        }
      }
    return <>
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
                    <div className={'w-1/6 h-full bg-blue-400 flex flex-col'}>
                        <Link className={' h-12 text-center font-bold text-2xl leading-[2rem] text-black'} onClick={() => navigator('/main', {
                            state: { userId: state.userId, auth: state.auth, userName: state.userName }
                        })}>+ Activity List</Link>
                        <Link className={'h-12 text-center font-bold text-2xl leading-[2rem] text-black'} onClick={() => navigator('/createActivity', {
                            state: { userId: state.userId, auth: state.auth, userName: state.userName }
                        })}>+ Create Activity</Link>
                        <Link className={'h-12 text-center font-bold text-2xl leading-[2rem] text-black'} onClick={() => navigator('/userManagement', {
                                state: { userId: state.userId, auth: state.auth, userName: state.userName }
                        })}>+ User Management</Link>
                    </div>
                    <div className={'w-full p-5'}>
                        <div className={'h-full w-full p-8 justify-center '}>
                            <Table scroll={{ y: 230 }} noDataElement={'no data'} virtualized={true} columns={userColumns} data={allUserData} pagination={false} />
                        </div>
                    </div>
                </div>
            </div >
            <Modal
                title='Modal Title'
                visible={visible}
                onOk={() => {editUserReq(item.userId, form.getFieldsValue().name, form.getFieldsValue().state)
                console.log(form.getFieldsValue().name+" "+form.getFieldsValue().state)}}
                onCancel={() => setVisible(false)}
            >
               <Form
                    form={form}
                    labelCol={{
                        style: { flexBasis: 90 },
                    }}
                    wrapperCol={{
                        style: { flexBasis: 'calc(100% - 90px)' },
                    }}>
                    <FormItem label='Name' field='name' rules={[{ required: true }]}>
                        <Input placeholder='' />
                    </FormItem>
                    <FormItem label='State' required field='state' rules={[{ required: true }]}>
                        <Select options={['Normal', 'Ban']} />
                    </FormItem>
                </Form>
            </Modal>
        </div ></>
}