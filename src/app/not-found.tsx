/**
 * Rota: not-found
 *
 * Exibida quando uma página não é encontrada.
 * Mantida simples para não interferir com a navegação global.
 */
export default function NotFound() {
    return (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 text-center">
            {/* Título do estado de erro 404 */}
            <h1 className="text-3xl font-semibold tracking-tight">Página não encontrada</h1>
            {/* Mensagem breve com orientação ao utilizador */}
            <p className="mt-2 text-sm text-neutral-600">
                Lamentamos, mas a página que procura não existe ou foi movida.
            </p>
        </div>
    );
}



