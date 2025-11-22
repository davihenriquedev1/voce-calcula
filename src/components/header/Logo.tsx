import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
    const router = useRouter()
    return (
        <div className="pl-1 uppercase font-bold cursor-pointer" title="Home" onClick={()=> router.push('/')}>
            <Image width={54} height={54} src="/images/logo-nobackground.png" alt="" className=""/>
        </div>
    )
}
    
export default Logo;