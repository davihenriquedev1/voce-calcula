import Image from "next/image";
import Link from "next/link"

type Props = {
    name:string;
    route:string;
    image: string;
}

export const SocialLink = ({name, image, route}:Props) => {

    return (
        <Link href={route}>
            <Image width={32} height={32} src={image} alt={name} className=" dark:brightness-105"/>
        </Link>
    )
}