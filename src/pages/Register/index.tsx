import { useNavigate } from "react-router-dom"
import { postUserRegister } from "../../service/api"
import { Button, Divider, Form, Input, Link, Message, Space } from "@arco-design/web-react"
import { useState } from "react"
import styled from "./index.module.css"
const FormItem = Form.Item;
export const Register = () => {
    const identities = ['User', 'Administor']
    const navigator = useNavigate()
    const [identity, setIdentity] = useState<string>('User')
    const [userId, setUserID] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [form] = Form.useForm();

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
        navigator('/')

        const res = await postUserRegister(params)
        if (res.code === '0') {
            Message.error('Register failed')
        } else if (res.code === '1') {
            navigator('/', { state: { token: userId, userId } })
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

    return <>
        <div className={styled.container}>
            <div className={styled.card}>
                <div className={styled.title}>Event Reservation Center</div>
                <Divider />
                <div className={styled.subTitle}>{`${identity} Register`}</div>
                <Form form={form} onChange={(v) => handleInput(v)} autoComplete='off' style={{ justifyContent: 'center' }} >
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
                                return cb('The userId is required');
                            }

                            return cb();
                        },
                    }]}>
                        <Input placeholder='Please enter Email' />
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
                    <FormItem style={{ justifyContent: 'center' }} >
                        <Button onClick={() => {
                            form.validate();
                            if (userId && password && name) {
                                postUserRegisterReq()
                            }
                        }} type='primary' style={{ width: 300, marginLeft: 50 }}>Register</Button>
                    </FormItem>
                    <Space style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: 300, display: 'flex', justifyContent: 'center' }}>
                            <Link onClick={() => setIdentity((cur) => identities.filter((i) => i !== cur)[0])}>Switch User/Administor</Link>
                        </div>
                    </Space>
                </Form>
            </div>
        </div >
    </>
}