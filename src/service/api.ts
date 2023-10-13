export const postUserLogin = async (params: {
    userId: string;
    password: string;
    auth: '0' | '1';
}) => {
    // 接口前加个/api
    const res = await fetch('api/user/login', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    })
    return res.json()
}

export const postUserRegister = async (params:{
    userId: string;
    password: string;
    name: string;
    auth: '0' | '1'
}) => {
    const res = await fetch('api/user/register', {
        method: "POST",
        headers:{
            "Content-Type": "application/json",
        },
        body:JSON.stringify(params)
    })
    return res.json()
}