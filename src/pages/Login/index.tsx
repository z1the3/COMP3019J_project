import { Button, Divider, Form, Input, Link, Message, Space, Switch } from "@arco-design/web-react"
import "@arco-design/web-react/dist/css/arco.css";
import { useNavigate } from "react-router-dom";
import { useContext, useMemo, useState } from "react";
import { postUserLogin } from "../../service/api";
const FormItem = Form.Item;
import backgroundImage from "../../assets/background.png"
import { useModeSwitch } from "../../hooks/useModeSwitch";
import { DarkModeSwitch } from "../../components/DarkModeSwitch";
import { ModeContext } from "../../App";

export const Login = () => {
    // Regarding the status of the input user ID and password
    const identities = ['User', 'Administor']
    const [identity, setIdentity] = useState<string>('User')
    const [userId, setUserID] = useState<string>('')
    const [password, setPassword] = useState<string>('')


    const { mode, setCurrentMode } = useModeSwitch()
    // Hooks for route jumps
    const navigator = useNavigate()
    // Maintained Forms
    const [form] = Form.useForm();
    // background style
    const background = useMemo(() => mode === 'light' ? {backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover'} : { backgroundColor: '#434343'}, [mode])


    const handleInput = (v: Record<string, string>) => {
        if (v.userId) {
            setUserID(v.userId)
        }
        if (v.password) {
            setPassword(v.password)
        }
    }

    // login request
    const postUserLoginReq = async () => {
        const params = {
            userId,
            password,
            auth: identity === 'User' ? '0' : '1'
        } as {
            userId: string,
            password: string,
            auth: '0' | '1'
        }

        const raw = await postUserLogin(params)
        if (raw.status === 200) {
            const res = await raw.json()
            // If the request is successful, go to the homepage and carry the user information
            navigator('/main', { state: { auth: res.auth, userId: res.userId, userName: res.name, } })
        } else {
            // Otherwise, an error will pop up
            Message.error(raw.statusText)
        }


    }

    // The dynamic HTML structure is organized in the form of jsx/tsx because we use React.js
    return <>
        <div style={background}>
            {/* Translate CSS code into a class name system through tailwind CSS implementation (such as flex, justify content: center required for flex layout) */}
            {/* Login Card */}
            <div className={'container flex mx-auto w-2/6 h-screen justify-center items-center'}>
                <div className={`flex p-[50px] mx-auto h-300 flex-col flex-1 justify-start items-center rounded-3xl ${mode === 'light' ? 'bg-white' : 'bg-black'}`}>
                    {/* Title/Website Name */}
                    <div className={`text-4xl ${mode === 'light' ? 'text-black' : 'text-white'}`}>Event Reservation Center</div>
                    <Divider />
                    {/* Switch between user login or administrator login based on different identities */}
                    <div className={`text-base mb-4  ${mode === 'light' ? 'text-black' : 'text-white'}`}>{`${identity} Login`}</div>
                    {/* The form used for login, including some rules (required) */}
                    <Form form={form} onChange={(v) => handleInput(v)} autoComplete='off' className={'w-5/6 flex justify-start'} >
                        <FormItem field='userId' className={'flex justify-center'} rules={[{
                            validator(value, cb) {
                                if (!value) {
                                    return cb('The userId is required');
                                }
                                return cb();
                            },
                        }]}>
                            <Input placeholder='Please enter user id' />
                        </FormItem>
                        <FormItem field='password' className={'flex justify-center'} rules={[{
                            validator(value, cb) {
                                if (!value) {
                                    return cb('The password is required');
                                }

                                return cb();
                            },
                        }]}>
                            <Input.Password placeholder='Please enter password' />
                        </FormItem>
                        {/* Normal login button and tourist login button */}
                        <div className={'flex justify-around mb-3'}>
                            <Button
                                className={'w-32'} onClick={() => {
                                    form.validate();
                                    if (userId && password) {
                                        postUserLoginReq()
                                    }
                                }} type='primary' >Login</Button>
                            <Button className={'w-32'} onClick={() => {
                                navigator('/main', { state: { auth: -1 } })
                            }} type='primary' >Guest Login</Button>
                        </div>

                        {/* Jump to the registration page and switch current identity */}
                        <div className={'flex justify-between items-center'}>
                            <Link onClick={() => navigator('/register')}>Register</Link>
                            <Link style={{ color: '#FF7D00' }} onClick={() => setIdentity((cur) => identities.filter((i) => i !== cur)[0])}>Switch User/Administor</Link>
                        </div>
                        <div className={'flex justify-center items-center m-5'}>
                            <DarkModeSwitch mode={mode} setCurrentMode={setCurrentMode} />
                        </div>
                    </Form>
                </div>
            </div >
        </div>
    </>
}