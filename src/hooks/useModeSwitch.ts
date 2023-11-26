import React, { Context, useContext, useEffect } from "react"
import { useState } from "react"
import { ModeContext } from "../App"


export const useModeSwitch = () => {
    // 从context中拿到当前开启的mode:light/dark
    const { mode: ctxMode, setCurrentMode } = useContext(ModeContext)

    useEffect(() => {
        // mode切换时也应该改变组件库的配色方案
        if (ctxMode === 'light') {
            document.body.removeAttribute('arco-theme');
        } else if (ctxMode === 'dark') {
            document.body.setAttribute('arco-theme', 'dark');
        }
    }, [ctxMode])

    return { mode: ctxMode, setCurrentMode }
}