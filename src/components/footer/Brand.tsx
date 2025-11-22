
export const Brand = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center ">
            <div className="flex flex-col w-full justify-center items-center gap-1">
                <p className="italic text-[9px] opacity-50">Desenvolvido por</p>
                <p className="text-xs text-muted opacity-80">DH Serviços e Produtos Digitais</p>
            </div>
            <div className="mt-4 text-gray-600 opacity-60 text-center text-sm">
                &copy; {new Date().getFullYear()} Todos os direitos reservados.
            </div>
        </div>
    );
};