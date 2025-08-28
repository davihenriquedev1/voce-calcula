export const Brand = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center shadow-md rounded-lg">
            <div className="flex flex-col w-full justify-center items-center gap-3">
                <img src="/images/logo-empresa-dev.png" alt="Logo da Empresa" className="w-16 rounded-full"/>
                <p className="text-xl font-semibold text-primary">D... Systems</p>
            </div>
            <div className="mt-4 text-gray-600 text-center">
                &copy; 2024 Todos os direitos reservados.
            </div>
        </div>
    );
};