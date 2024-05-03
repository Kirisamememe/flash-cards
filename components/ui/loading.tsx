export default function Loading({className = "bg-primary/10 w-full h-full", size = 48}: {className?: string, size?: number}) {

    return (
        <div className={`${className} stroke-primary justify-center items-center rounded-lg`}>
            <svg className={"animate-spin h-16 w-16"} width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className={"stroke-primary"} cx="24" cy="24" r="15.5" stroke="#264AF4" strokeOpacity="0.2" strokeWidth="5"/>
                <path
                    d="M9.24925 19.2392C10.3836 15.7245 12.7357 12.7303 15.8818 10.796C19.028 8.86168 22.7614 8.11429 26.4097 8.68846C30.058 9.26262 33.3814 11.1206 35.7814 13.9278C38.1813 16.7349 39.5 20.3068 39.5 24"
                    strokeOpacity="0.8" strokeWidth="5"/>
            </svg>
        </div>
    )
}