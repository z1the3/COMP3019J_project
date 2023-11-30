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
    return res
}

export const postUserRegister = async (params: {
    userId: string;
    password: string;
    name: string;
    auth: '0' | '1'
}) => {
    const res = await fetch('api/user/register', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params)
    })
    return res
}

export const getAllReservation = async (): Promise<Response> => {
    const res = await fetch('api/reservation/all', {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
    return res
}

// 管理员创建预约
export const postCreateReservation = async (params: {
    date: string[];
    name: string;
    userId: string;
    startTimeLimit: string;
    endTimeLimit: string;
    description: string
}): Promise<Response> => {
    const res = await fetch('api/reservation/create', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            body: JSON.stringify(params)

        }
    })
    return res
}


// 请求自己注册过的预约
export const getUserRegisterReservation = async (params: { userId: string }): Promise<Response> => {
    const res = await fetch(`api/reservation/userRegister?userId=${params.userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
    return res
}