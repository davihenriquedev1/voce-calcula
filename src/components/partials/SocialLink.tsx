import Link from "next/link"

type Props = {
    name:string;
    route:string;
}

export const SocialLink = ({name, route}:Props) => {

    return (
        <Link href={route}>
            <img src={`/images/${name}.png`} alt={name} className="w-8 dark:brightness-150"/>
        </Link>
    )
}