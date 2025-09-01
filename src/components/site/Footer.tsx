import Link from "next/link";

/**
 * Site Footer
 *
 * Footer profissional com informações da empresa e links úteis
 */
export function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="border-t border-neutral-200 bg-neutral-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Branding */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-neutral-900 rounded-md flex items-center justify-center">
                                <span className="text-white text-sm font-bold">PC</span>
                            </div>
                            <span className="font-bold text-lg text-neutral-900">Calculos Solares</span>
                        </div>
                        <p className="text-sm text-neutral-600 max-w-xs">
                            Ferramentas profissionais para engenharia elétrica e sistemas fotovoltaicos.
                        </p>
                        <p className="text-xs text-neutral-500">
                            © {year} Circuitos Energy Solutions, Lda.<br />
                            Todos os direitos reservados.
                        </p>
                    </div>

                    {/* Ferramentas */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-neutral-900">Ferramentas</h3>
                        <nav className="space-y-2">
                            <Link
                                href="/dimensionamento-cabos"
                                className="block text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                            >
                                📊 Dimensionamento de Cabos
                            </Link>
                            <Link
                                href="/calculos-sombras"
                                className="block text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                            >
                                🌤️ Cálculos de Sombras
                            </Link>
                        </nav>
                    </div>

                    {/* Recursos */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-neutral-900">Recursos</h3>
                        <nav className="space-y-2">
                            <a
                                href="https://files.diariodarepublica.pt/1s/2006/09/17501/00020191.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                            >
                                📋 RTIEBT (Portaria 949-A/2006)
                            </a>
                            <Link
                                href="mailto:info@circuitosenergy.pt"
                                className="block text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                            >
                                Suporte Técnico
                            </Link>
                        </nav>
                        <div className="pt-2">
                            <p className="text-xs text-neutral-500">
                                Desenvolvido com precisão e conformidade técnica.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-8 pt-8 border-t border-neutral-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <p className="text-xs text-neutral-500">
                            As ferramentas seguem normas técnicas aplicáveis. Validação profissional recomendada.
                        </p>
                        <div className="flex gap-4 text-xs text-neutral-500">
                            <span>Versão 1.0</span>
                            <span>Portugal</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;


