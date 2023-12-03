import { Switch } from "@arco-design/web-react"

export const DarkModeSwitch = (params: { mode: string, setCurrentMode: any }) => {
    const { mode, setCurrentMode } = params
    return <>
        <div>
            <span style={{ 'color': mode === 'light' ? 'black' : 'white' }}>Dark Mode</span>
            <Switch
                defaultChecked={!(mode === 'light')}
                onChange={(val) => {
                    setCurrentMode(!!val ? 'dark' : 'light')
                }}

                style={{ 'background': 'gray', marginLeft: 5 }
                }></Switch >
        </div>


    </>

}