import { FC } from 'react'
import { Settings } from 'lucide-react'
const SettingsButton: FC = () => {
    return <button className='h-8 w-8 rounded-full bg-white border border-black flex items-center justify-center active:scale-95 active:border-2'>
        <Settings className='w-5 h-5' />
    </button>
}

export default SettingsButton