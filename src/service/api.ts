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

export const getAllUser = async (): Promise<Response> => {
    const res = await fetch('api/user/all', {
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
        },
        body: JSON.stringify(params)
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

// 取消预约
export const postCancelReservation = async (params: { userId: string, reservationId: string }): Promise<Response> => {
    const res = await fetch(`api/reservation/cancel`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    })
    return res
}

// 管理员删除预约
export const postAdminCancelReservation = async (params: { reservationId: string }): Promise<Response> => {
    const res = await fetch(`api/reservation/admin/cancel`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    })
    return res
}


// 销号
export const deleteAccount = async (params: { userId: string }) => {
    const res = await fetch(`api/user/delete`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    })
    return res
}

// 编辑用户
export const editUser = async (params: { userId: string, name: string, state: string }) => {
    const res = await fetch(`api/user/edit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    })
    return res
}

// 用户注册预约
export const postRegisterReservation = async (params: {
    reservationId: string,
    userId: string
}) => {
    const res = await fetch(`api/reservation/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    })
    return res
}

// 用户注册预约
export const getLog = async () => {
    const res = await fetch(`api/log`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
    return res
}