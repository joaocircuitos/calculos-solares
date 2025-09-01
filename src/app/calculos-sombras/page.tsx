/**
 * Página: Cálculos de Sombras
 *
 * Objetivo
 * - Estrutura base para simulação de sombreamento em instalações solares.
 * - Preparada para integrar mapas, canvas 2D/3D ou gráficos.
 */
"use client";

import ShadeExcelForm from "@/features/sombras/ShadeExcelForm";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalculosSombrasPage() {
    const [result, setResult] = useState<null | { d1: number; d: number }>(null);

    const handleResult = (newResult: { d1: number; d: number }) => {
        console.log("Result received in page:", newResult);
        setResult(newResult);
    };

    const fmt = (n: number) => (Number.isFinite(n) ? n.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "–");
    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Título e introdução */}
            <header className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Cálculos de Sombras</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    Simule o impacto de sombras em painéis fotovoltaicos e avalie perdas de produção.
                </p>
            </header>

            {/* Seção superior: Parâmetros à esquerda, Imagem à direita */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Parâmetros de entrada - Lado esquerdo */}
                <div className="flex flex-col space-y-4">
                    {/* Formulário estilo Excel para entrada dos parâmetros */}
                    <ShadeExcelForm onResult={handleResult} />

                    {/* Notas do Excel */}
                    <Accordion type="single" collapsible>
                        <AccordionItem value="notes">
                            <AccordionTrigger>Notas</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 text-sm text-neutral-800">
                                    <p>
                                        Quando um terreno tem inclinação para sul (lado mais baixo para sul), considerar <b>alfa</b> com valor
                                        <b> negativo</b>.
                                    </p>
                                    <p>
                                        Quando consideramos águas orientadas a norte (lado mais baixo para norte), considerar <b>alfa</b> com
                                        valor <b>positivo</b>.
                                    </p>
                                    <p>
                                        Na fórmula o valor de <b>+0,2</b> é uma margem de segurança.
                                    </p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* Imagem explicativa - Lado direito */}
                <div className="flex flex-col justify-center items-center h-full">
                    <div className="rounded-lg border border-neutral-200 bg-white p-4 flex items-center justify-center w-full h-full">
                        <Image
                            src="/sombras.png"
                            alt="Esquema de sombreamento com variáveis b, β, h, d, d1, α e γ"
                            width={500}
                            height={400}
                            className="h-auto w-full max-w-lg object-contain"
                            priority
                        />
                    </div>
                </div>
            </section>

            {/* Seção de resultados em largura completa */}
            {result ? (
                <section className="w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resultados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* d1 */}
                                <div className="rounded-lg overflow-hidden border border-neutral-300 shadow-sm">
                                    <div className="bg-neutral-200 text-neutral-900 px-4 py-3 text-center font-semibold">d1</div>
                                    <div className="bg-emerald-50 text-emerald-800 px-4 py-6 text-center">
                                        <div className="text-3xl font-bold">{fmt(result.d1)}</div>
                                        <div className="text-sm text-neutral-600 mt-2">metros</div>
                                    </div>
                                </div>

                                {/* d */}
                                <div className="rounded-lg overflow-hidden border border-neutral-300 shadow-sm">
                                    <div className="bg-neutral-200 text-neutral-900 px-4 py-3 text-center font-semibold">d</div>
                                    <div className="bg-emerald-50 text-emerald-800 px-4 py-6 text-center">
                                        <div className="text-3xl font-bold">{fmt(result.d)}</div>
                                        <div className="text-sm text-neutral-600 mt-2">metros</div>
                                    </div>
                                </div>

                                {/* Espaços vazios para manter layout em 4 colunas em lg */}
                                <div className="hidden lg:block"></div>
                                <div className="hidden lg:block"></div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            ) : (
                <section className="w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resultados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* d1 placeholder */}
                                <div className="rounded-lg overflow-hidden border border-neutral-300">
                                    <div className="bg-neutral-200 text-neutral-900 px-4 py-3 text-center font-semibold">d1</div>
                                    <div className="bg-neutral-100 text-neutral-500 px-4 py-6 text-center">
                                        <div className="text-3xl font-bold">—</div>
                                        <div className="text-sm text-neutral-600 mt-2">metros</div>
                                    </div>
                                </div>

                                {/* d placeholder */}
                                <div className="rounded-lg overflow-hidden border border-neutral-300">
                                    <div className="bg-neutral-200 text-neutral-900 px-4 py-3 text-center font-semibold">d</div>
                                    <div className="bg-neutral-100 text-neutral-500 px-4 py-6 text-center">
                                        <div className="text-3xl font-bold">—</div>
                                        <div className="text-sm text-neutral-600 mt-2">metros</div>
                                    </div>
                                </div>

                                {/* Espaços vazios para manter layout em 4 colunas em lg */}
                                <div className="hidden lg:block"></div>
                                <div className="hidden lg:block"></div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            )}
        </div>
    );
}


