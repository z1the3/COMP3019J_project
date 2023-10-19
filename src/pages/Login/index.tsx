import { Button, Divider, Form, Input, Link, Message, Space } from "@arco-design/web-react"
import "@arco-design/web-react/dist/css/arco.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { postUserLogin } from "../../service/api";
const FormItem = Form.Item;
export const Login = () => {
    const identities = ['User', 'Administor']
    const navigator = useNavigate()
    const [identity, setIdentity] = useState<string>('User')
    const [userId, setUserID] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [form] = Form.useForm();

    const handleInput = (v: Record<string, string>) => {
        if (v.userId) {
            setUserID(v.userId)
        }
        if (v.password) {
            setPassword(v.password)
        }
    }

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
        navigator('/main')

        const raw = await postUserLogin(params)
        if (raw.status === 201) {
            const res = await raw.json()
            navigator('/main', { state: { auth: res.auth, userId: res.userId, name: res.name, } })
        } else {
            Message.error(raw.statusText)
        }


    }


    return <>
        <div className={'container flex mx-auto w-2/6  h-screen justify-center items-center'}>
            <div className={'flex p-[50px] mx-auto h-300 flex-col flex-1 justify-start items-center bg-white rounded-3xl'}>
                <div className={'text-4xl '}>Event Reservation Center</div>
                <Divider />
                <div className={'text-base mb-4'}>{`${identity} Login`}</div>
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


                    <div className={'flex justify-between items-center'}>
                        <Link onClick={() => navigator('/register')}>Register</Link>
                        <Link onClick={() => setIdentity((cur) => identities.filter((i) => i !== cur)[0])}>Switch User/Administor</Link>
                    </div>
                </Form>
            </div>
        </div >
    </>
}