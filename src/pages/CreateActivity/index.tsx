import { Button, Calendar, Checkbox, DatePicker, Divider, Form, Input, Link, Table, TimePicker } from "@arco-design/web-react"
import { useLocation, useNavigate } from "react-router-dom"
import "@arco-design/web-react/dist/css/arco.css";
import { useRef, useState } from "react";
import * as dayjs from 'dayjs'

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
    return <>
        <div className={'container w-screen h-screen flex flex-col'}>
            {/* Translate CSS code into a class name system through tailwind CSS implementation (such as flex, justify content: center required for flex layout) */}
            <div className={'w-screen h-16 bg-white flex'}>
                {/* title */}
                <div className={'w-screen text-center font-bold text-4xl leading-[4rem]'}>Event Reservation Center</div>
                {/* identity */}
                <div className={'absolute right-8 top-4 text-xl'}>{state.name}</div>
                {/* log out button */}
                <Link onClick={() => navigator('/')} className={'absolute right-24 top-4 text-xl'}>log out </Link>
            </div>
            <div className={'w-screen flex-1 flex justify-center items-center'}>
                (
                <div className={'w-screen h-full flex '}>
                    {/* 侧边栏 */}
                    <div className={'w-1/6 h-full bg-blue-700 flex flex-col'}>
                        <div className={'h-16'}>activity list</div>
                        <div className={'h-16'}>create activity</div>
                    </div>
                    <div className={'w-full h-full p-8'}>
                        <div className={'w-full h-5/6 bg-white flex flex-col rounded-2xl'}>
                            <div className={'w-full h-24 bg-red flex flex-col pt-3 p-8'}>
                                <div className={'w-full text-left text-2xl leading-[2rem] mt-3'}>Create Reservation</div>
                                {/* <div className={'mx-auto -my-3'} > */}
                                <Divider />
                                {/* </div> */}
                            </div>
                            <div className={'h-full w-full p-16 justify-center'}>
                                <Form layout="inline" form={form}
                                    onValuesChange={(v, vs) => {
                                        console.log(v, vs);
                                    }}>
                                    <div className={'flex mb-[48px] w-full'}>
                                        <FormItem className={'w-1/3'} label='Name' requiredSymbol={false} field='name' rules={[{ required: true }]}>
                                            <Input style={{ width: 350 }} placeholder='please enter the name of the activity' />
                                        </FormItem>

                                        <FormItem className={'w-full ml-[64px]'} onChange={(value) => console.log(value)}
                                            triggerPropName='checked' label='Date' field='date' requiredSymbol={false} rules={[{ required: true }]}>
                                            <Button onClick={() => setCalendervibible(true)} >pick date</Button>
                                            <Calendar
                                                headerRender={(props) => {
                                                    return <>
                                                        <Button className={'mt-3'} onClick={() => setCalendervibible(false)}>Complete</Button>
                                                    </>
                                                }}
                                                style={{
                                                    width: 400, position: 'absolute',
                                                    background: 'white', left: calenderVisible ? -100 : -10000, top: -200, zIndex: 10000
                                                }}
                                                headerType="button"
                                                dateRender={(current) => {
                                                    return (
                                                        <div>
                                                            <Checkbox style={{ display: 'absolute', zIndex: 10000 }} onChange={(v) => {
                                                                const selectedDate = current.date().toString()
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
                                        </FormItem>
                                    </div>
                                    <div className={'flex justify-between mb-[48px] w-full'}>
                                        <FormItem className={'w-1/3'} label='Start time' requiredSymbol={false} field='startTimeLimit' rules={[{ required: true }]}>
                                            <TimePicker format='HH:mm' style={{ width: 325 }} placeholder={"please pick time"} />
                                        </FormItem>
                                        <FormItem className={'w-1/3'} label='End time' requiredSymbol={false} field='endTimeLimit' rules={[{ required: true }]}>
                                            <TimePicker format='HH:mm' style={{ width: 350 }} placeholder={"please pick time"} />
                                        </FormItem>
                                    </div>
                                    <div className={'flex justify-between w-1/3'}>
                                        <FormItem className={'w-1/3'} label='Description' requiredSymbol={false} field='description' rules={[{ required: true }]}>
                                            <TextArea placeholder='Please enter the description' style={{ width: 850, height: 150 }} />
                                        </FormItem>
                                    </div>
                                    <div className={'flex justify-between mt-[178px] w-1/3'}>
                                        <Button>Back to menu</Button>
                                        <Button type='primary' onClick={() => {
                                            console.log(form.getFields())
                                            console.log(dayjs().month())
                                            console.log(pickDates)
                                        }}>Create</Button>

                                    </div>
                                </Form>

                            </div>
                        </div>
                    </div>
                </div>
                )
            </div>

        </div ></>
}