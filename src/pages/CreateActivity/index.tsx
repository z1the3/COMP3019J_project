import { Button, Calendar, Checkbox, ConfigProvider, DatePicker, Divider, Form, Input, Link, Message, Table, TimePicker } from "@arco-design/web-react"
import { useLocation, useNavigate } from "react-router-dom"
import "@arco-design/web-react/dist/css/arco.css";
import { useMemo, useRef, useState } from "react";
import enUS from '@arco-design/web-react/es/locale/en-US';
import { postCreateReservation } from "../../service/api";
import { useModeSwitch } from "../../hooks/useModeSwitch";
import { DarkModeSwitch } from "../../components/DarkModeSwitch";

const FormItem = Form.Item;
const TextArea = Input.TextArea;
export const CreateActivity = () => {
    // Hooks for route jumps
    const navigator = useNavigate()
    // Status brought over from the previous page
    const state: Record<string, string | number> = useLocation().state || {}
    const [form] = Form.useForm();
    const [calenderVisible, setCalendervibible] = useState<boolean>(false)
    const [pickDates, setPickDates] = useState<string[]>([])
    // 黑夜模式
    const { mode, setCurrentMode } = useModeSwitch()

    const bgColor = useMemo(() => mode === 'light' ? '#DCECFB' : '#000000', [mode])
    const backgroundColor = useMemo(() => mode === 'light' ? 'bg-white' : 'bg-gray-800', [mode])
    const textColor = useMemo(() => mode === 'light' ? 'text-black' : 'text-white', [mode])


    const postCreateReservationReq = async () => {
        const param = form.getFields()
        param.date = pickDates
        param.date = param.date.map((item: any) => item.split('/').join('-'))
        param.userId = state.userId
        param.detail = param.description
        const raw = await postCreateReservation(param as any)
        if (raw.status === 200) {
            const res = await raw.json()
            if (res.code === 0) {
                Message.success("create successful")
                navigator('/main', { state: { userId: state.userId, auth: state.auth, userName: state.userName } })
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
                    </div>
                    <div className={'w-full h-full p-8'}>
                        <div className={`w-full h-5/6 ${backgroundColor} flex flex-col rounded-2xl`}>
                            <div className={'w-full h-24 flex flex-col pt-3 p-8'}>
                                <div className={`w-full text-left text-2xl leading-[2rem] mt-3 ${textColor}`}>Create Reservation</div>
                                <Divider />
                            </div>
                            <div className={'h-full w-full p-8 justify-center'}>
                                <Form layout="inline" form={form}>
                                    <div className={'flex mb-[48px] w-full'}>
                                        <FormItem className={'w-1/3'} label='Name' requiredSymbol={false} field='name' rules={[{
                                            validator(value, cb) {
                                                if (!value) {
                                                    return cb('This field is required');
                                                }
                                                return cb();
                                            },
                                        }]}>
                                            <Input style={{ width: 350 }} placeholder='please enter the name of the activity' />
                                        </FormItem>

                                        <FormItem className={'w-full ml-[64px]'}
                                            label='Date' field='date' requiredSymbol={false} rules={[{
                                                validator(value, cb) {
                                                    if (!pickDates.length) {
                                                        return cb('This field is required');
                                                    }
                                                    return cb();
                                                },
                                            }]}>
                                            <Button onClick={() => setCalendervibible(true)} >select date</Button>
                                            <div style={{
                                                width: 800, position: 'absolute',
                                                background: mode === 'light' ? 'white' : 'black', left: calenderVisible ? -100 : -10000, top: -240, zIndex: 10000
                                            }}>
                                                <Button className={'mt-3'} onClick={() => setCalendervibible(false)}>Complete</Button>
                                                <ConfigProvider locale={enUS}>
                                                    <Calendar
                                                        headerType='button'
                                                        panelTodayBtn={false}
                                                        dateRender={(current) => {
                                                            return (
                                                                <div>
                                                                    <Checkbox style={{ display: 'absolute', zIndex: 10000 }} onChange={(v) => {
                                                                        const selectedDate = current.format('YYYY/MM/DD')
                                                                        if (v) {
                                                                            setPickDates([...pickDates, selectedDate])
                                                                        } else {
                                                                            setPickDates([...(pickDates.filter(d => d !== selectedDate))])
                                                                        }

                                                                    }}>
                                                                        {current.date()}
                                                                    </Checkbox>
                                                                </div>
                                                            );
                                                        }} />
                                                </ConfigProvider>
                                            </div>

                                        </FormItem>
                                    </div>
                                    <ConfigProvider locale={enUS}>

                                        <div className={'flex justify-between mb-[48px] w-full'}>
                                            <FormItem className={'w-1/3'} label='Start time' requiredSymbol={false} field='startTimeLimit' rules={[{
                                                validator(value, cb) {
                                                    if (!value) {
                                                        return cb('This field is required');
                                                    }
                                                    return cb();
                                                },
                                            }]}>
                                                <TimePicker format='HH:mm' style={{ width: 325 }} placeholder={"please pick time"} />
                                            </FormItem>
                                            <FormItem className={'w-1/3'} label='End time' requiredSymbol={false} field='endTimeLimit' rules={[{
                                                validator(value, cb) {
                                                    if (!value) {
                                                        return cb('This field is required');
                                                    }
                                                    return cb();
                                                },
                                            }]}>
                                                <TimePicker format='HH:mm' style={{ width: 350 }} placeholder={"please pick time"} />
                                            </FormItem>
                                        </div>
                                    </ConfigProvider>

                                    <div className={'flex justify-between w-1/3'}>
                                        <FormItem className={'w-1/3'} label='Description' requiredSymbol={false} field='description' rules={[{
                                            validator(value, cb) {
                                                if (!value) {
                                                    return cb('This field is required');
                                                }
                                                return cb();
                                            },
                                        }]}>
                                            <TextArea placeholder='Please enter the description' style={{ width: 850, height: 150 }} />
                                        </FormItem>
                                    </div>
                                    <div className={'flex justify-between mt-[178px] w-1/3'}>
                                        <Button onClick={() => navigator('/main', { state: { userId: state.userId, auth: state.auth, userName: state.userName } })}>Back to menu</Button>
                                        <Button type='primary' onClick={async () => {
                                            try {
                                                await form.validate();
                                                postCreateReservationReq()

                                            } catch (e) {
                                                Message.error('Some infomation is required');
                                            }
                                        }}>Create</Button>

                                    </div>
                                </Form>

                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
        </div></>
}