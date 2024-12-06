import { FC } from 'react'

const SOSButton: FC = () => {
    return <button className='h-8 w-8 rounded-full bg-red-600 flex items-center justify-center'>
        <span className="px-1 text-white font-bold text-xs leading-snug tracking-tighter flex justify-center items-center">
            SOS
        </span>
    </button>
}

export default SOSButton