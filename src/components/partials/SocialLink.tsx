import Link from "next/link"

type Props = {
    name:string;
    route:string;
    image: string;
}

export const SocialLink = ({name, image, route}:Props) => {

    return (
        <Link href={route}>
            <img src={image} alt={name} className="w-8 dark:brightness-105"/>
        </Link>
    )
}