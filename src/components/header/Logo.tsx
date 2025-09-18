import { useRouter } from "next/navigation";

const Logo = () => {
    const router = useRouter()
    return (
        <div className="pl-1 uppercase font-bold cursor-pointer" title="Home" onClick={()=> router.push('/')}>
            <img src="/images/logo-nobackground.png" alt="" className="w-14"/>
        </div>
    )
}
    
export default Logo;