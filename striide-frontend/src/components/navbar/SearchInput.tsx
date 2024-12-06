import { FC } from 'react'
import { Search, Mic } from 'lucide-react'

interface SearchInputProps {
    setValue: React.Dispatch<React.SetStateAction<string | undefined>>
}

// todo: give some wiggle room for the length of diff size phone screens
const SearchInput: FC<SearchInputProps> = ({ setValue }) => {
    return (
        <div className="w-fit flex justify-center items-center relative">
            <Search className='absolute left-4 h-4 w-4' />
            <input 
                className='h-8 w-72 text-base focus:outline-none focus:border-2 active:border-2 border border-black rounded-full focus:outline-0 appearance-none px-9 placeholder:text-black placeholder:italic' 
                placeholder='Search' 
                onChange={(event) => setValue(event.target.value)} />
            <Mic className='absolute right-4 h-4 w-4 hover:cursor-pointer' />
        </div>
    )
}

export default SearchInput