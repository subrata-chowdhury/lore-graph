import React from 'react'

type Props = {
    title: string | React.ReactNode,
    children: React.ReactNode,
    className?: string,
    containerClassName?: string,
    width?: number,
    onClick?: () => void
}

const Title: React.FC<Props> = ({ title, className = '', containerClassName = "", onClick = () => { }, children }) => {
    return (
        <div className='relative group flex flex-col items-center'>
            <div className={'absolute hidden text-nowrap group-hover:block -top-2 -translate-y-full p-2 px-3 rounded text-xs z-10 bg-gray-200 w-fit ' + className}>
                {title}
                <div className='absolute -bottom-1.25 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-slate-200'></div>
            </div>
            <div className={'cursor-pointer ' + containerClassName} onClick={onClick}>
                {children}
            </div>
        </div>
    )
}

export default Title