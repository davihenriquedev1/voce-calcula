import { UsefulLinks } from "@/components/footer/UsefulLinks";
import { Brand } from "./Brand";
import { ConectUs } from "@/components/footer/ConectUs";

export const Footer = () => {
    return (
        <footer className="p-3 md:p-8">
            <div className="flex flex-col-reverse xs:grid xs:grid-cols-2 gap-10 items-center xs:items-start md:flex md:flex-row py-8 border-t border-t-gray-500/40">
                <ConectUs/>
                <Brand/>
                <UsefulLinks/>
            </div>
        </footer>
    )
}