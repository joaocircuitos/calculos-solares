/**
 * Página: Dimensionamento de Cabos
 *
 * Objetivo
 * - Ferramenta de cálculo de secções de cabos conforme RTIEBT (Portugal).
 * - Considera queda de tensão, capacidade de condução, temperatura e agrupamento.
 *
 * Arquitetura
 * - Formulário completo com validação e cálculos automáticos
 * - Resultados detalhados com observações técnicas
 * - Conformidade com regulamentação portuguesa
 */
import { Metadata } from "next";
import DynamicCableTable from "@/features/cabos/DynamicCableTable";
import RTIEBTTables from "@/components/tables/RTIEBTTables";

export const metadata: Metadata = {
    title: "Dimensionamento de Cabos Elétricos - RTIEBT | Calculos Solares",
    description: "Ferramenta profissional para dimensionamento de cabos elétricos conforme regulamentação RTIEBT. Calcule automaticamente secções, quedas de tensão e valide condições de segurança.",
    keywords: [
        "dimensionamento de cabos",
        "RTIEBT",
        "cabos elétricos",
        "secção de cabos",
        "queda de tensão",
        "corrente admissível",
        "proteção elétrica",
        "Quadro 52-C11",
        "Quadro 52-C12",
        "cobre",
        "alumínio"
    ],
    openGraph: {
        title: "Dimensionamento de Cabos Elétricos - RTIEBT",
        description: "Ferramenta profissional para dimensionamento de cabos elétricos conforme RTIEBT",
    },
};
export default function DimensionamentoCabosPage() {
    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Título e introdução */}
            <header className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Dimensionamento de Cabos</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    Ferramenta de cálculo conforme as RTIEBT (Regulamento Técnico das Instalações Elétricas de Baixa Tensão) de Portugal.
                </p>
                <div className="mt-3 text-xs text-neutral-500">
                    <span className="font-medium">Considera:</span> Secção mínima, queda de tensão, capacidade de condução, temperatura ambiente e agrupamento de condutores.
                </div>
            </header>

            {/* Tabela Dinâmica Excel */}
            <section className="mb-8">
                <DynamicCableTable />
            </section>

            {/* Tabelas RTIEBT de Referência */}
            <section className="mb-8">
                <RTIEBTTables />
            </section>
        </div>
    );
}


