import { UsefulLinks } from "@/components/footer/UsefulLinks";
import { Brand } from "./Brand";
import { ConectUs } from "@/components/footer/ConectUs";

export const Footer = () => {
    return (
        <footer className="flex flex-col xs:grid xs:grid-cols-2 gap-10 items-center xs:items-start md:flex md:flex-row bg-color-palette4/20 bottom-0 p-6 md:p-14 ">
            <ConectUs/>
            <Brand/>
            <UsefulLinks/>
        </footer>
    )
}