'use client'

import { useEffect, useState } from "react";

function LoaderWrapper({ children }:{children:React.ReactNode}) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 1500);  
    }, []);
    return (
        <div>
            {
                loading && <div className="fixed inset-0 flex items-center justify-center bg-red-300/30 backdrop-blur-sm z-50">
                    <div className="loader"></div>
                </div>
            }
            {children}
        </div>
    )
}

export default LoaderWrapper
