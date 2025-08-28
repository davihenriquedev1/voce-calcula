import Link from "next/link"

export type Props = {
    route:string;
    text:string;
}

export const NavLink = ({route, text}: Props) => {
    return (
        <li>
            <Link href={route} legacyBehavior passHref>
                <p className="text-sm font-medium hover:underline hover:underline-offset-2 cursor-pointer transition-all delay-75 md:text-end">{text}</p>
            </Link>
        </li>
    )
}