import { useNavigate } from "react-router-dom"
import { postUserRegister } from "../../service/api"
import { Button, Divider, Form, Input, Link, Message, Space } from "@arco-design/web-react"
import { useMemo, useState } from "react"
import styled from "./index.module.css"
const FormItem = Form.Item;
import backgroundImage from "../../assets/background.png"
import { DarkModeSwitch } from "../../components/DarkModeSwitch"
import { useModeSwitch } from "../../hooks/useModeSwitch"

export const Register = () => {
    // Regarding the status of the input user ID and password
    const identities = ['User', 'Administor']

     // Hooks for route jumps
    const navigator = useNavigate()
    const [identity, setIdentity] = useState<string>('User')
    const [userId, setUserID] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [name, setName] = useState<string>('')
    const { mode, setCurrentMode } = useModeSwitch()

    const backgroundColor = useMemo(() => mode === 'light' ? 'bg-white' : 'bg-gray-800', [mode])
    const textColor = useMemo(() => mode === 'light' ? 'text-black' : 'text-white', [mode])

    // Maintained Forms
    const [form] = Form.useForm();

    // background style
    const background = useMemo(() => mode === 'light' ? {backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover'} : { backgroundColor: '#434343'}, [mode])

    // register request
    const postUserRegisterReq = async () => {
        const params = {
            userId,
            password,
            name,
            auth: identity === 'User' ? '0' : '1'
        } as {
            userId: string,
            password: string,
            name: string,
            auth: '0' | '1'
        }

        const raw = await postUserRegister(params)
        if (raw.status === 201) {
            navigator('/')
            Message.success('register success')
        } else {
            const res = await raw.json()
            Message.error(res.message)
        }
    }

    const handleInput = (v: Record<string, string>) => {
        if (v.userId) {
            setUserID(v.userId)
        }
        if (v.password) {
            setPassword(v.password)
        }
        if (v.name) {
            setName(v.name)
        }
    }

        // The dynamic HTML structure is organized in the form of jsx/tsx because we use React.js
    return <>
        <div style={background}>
            {/* Translate CSS code into a class name system through tailwind CSS implementation (such as flex, justify content: center required for flex layout) */}
            {/* Register Card */}
            <div className={'container flex mx-auto w-2/6  h-screen justify-center items-center'}>
                <div className={`flex p-[50px] mx-auto h-300 flex-col flex-1 justify-start items-center ${backgroundColor} rounded-3xl`}>
                    {/* Title/Website Name */}
                    <div className={`text-4xl text-center ${textColor}`}>Event Reservation Center</div>
                    <Divider />
                    {/* Switch between user register or administrator register based on different identities */}
                    <div className={`text-2xl mb-4 text-center ${textColor}`}>{`${identity} Register`}</div>
                    {/* The form used for register, including some rules (required) */}
                    <Form form={form} onChange={(v) => handleInput(v)} autoComplete='off' style={{ width: 400, justifyContent: 'center' }} >
                        <FormItem field='name' style={{ justifyContent: 'center' }} rules={[{
                            validator(value, cb) {
                                if (!value) {
                                    return cb('The name is required');
                                }

                                return cb();
                            },
                        }]}>
                            <Input placeholder='Please enter name' />
                        </FormItem>
                        <FormItem field='userId' style={{ justifyContent: 'center' }} rules={[{
                            validator(value, cb) {
                                if (!value) {
                                    return cb('The user Id is required');
                                }
                                return cb();
                            },
                        }]}>
                            <Input placeholder='Please enter user Id' />
                        </FormItem>
                        <FormItem field='password' style={{ justifyContent: 'center' }} rules={[{
                            validator(value, cb) {
                                if (!value) {
                                    return cb('The password is required');
                                }
                                return cb();
                            },
                        }]}>
                            <Input.Password placeholder='Please enter password' />
                        </FormItem>
                        {/* Normal register button */}
                        <FormItem style={{ justifyContent: 'center' }} >
                            <Button onClick={() => {
                                form.validate();
                                if (userId && password && name) {
                                    postUserRegisterReq()
                                }
                            }} type='primary' long>Register</Button>
                        </FormItem>
                        {/* Jump to the login page and post the register message */}
                        <Space style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ width: 300, display: 'flex', justifyContent: 'space-between'}}>
                                <Link onClick={() => navigator('/')}>Login</Link>
                                <Link style={{ color: '#FF7D00' }} onClick={() => setIdentity((cur) => identities.filter((i) => i !== cur)[0])}>Switch User/Administor</Link>
                            </div>
                        </Space>
                        <div className={'flex justify-center items-center m-5'}>
                            <DarkModeSwitch mode={mode} setCurrentMode={setCurrentMode} />
                        </div>
                    </Form>
                </div>
            </div >
        </div>
    </>
}