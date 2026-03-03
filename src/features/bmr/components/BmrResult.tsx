export const BmrResult = ({result}: {result:number}) => {
    return (
        <div className="w-full max-w-md mx-auto rounded-2xl border bg-contrastgray p-6 shadow-sm">
            <div className="flex flex-col items-center text-center gap-3">

                <span className="text-sm font-medium text-muted-foreground">
                    Taxa Metabólica Basal
                </span>

                <div className="text-4xl font-bold tracking-tight text-foreground">
                    {result}
                    <span className="text-base font-medium text-muted-foreground ml-2">
                        kcal/dia
                    </span>
                </div>

                <p className="text-sm text-muted-foreground max-w-xs">
                    Esse é o gasto calórico estimado do seu corpo em repouso.
                </p>

            </div>
        </div>
    )
}
