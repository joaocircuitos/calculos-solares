"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import RTIEBTTables from "@/components/tables/RTIEBTTables";

/**
 * RTIEBTCableSizingForm
 *
 * Formulário para dimensionamento de cabos conforme RTIEBT (Portugal).
 * Considera:
 * - Secção mínima por corrente admissível
 * - Queda de tensão máxima (3% para iluminação, 5% para outros usos)
 * - Métodos de instalação conforme norma
 * - Proteção contra sobrecargas
 * - Temperatura ambiente e agrupamento
 */

const schema = z.object({
    corrente: z.number().positive("Corrente deve ser positiva"),
    tensao: z.number().positive("Tensão deve ser positiva"),
    fases: z.enum(["mono", "tri"] as const),
    comprimento: z.number().positive("Comprimento deve ser positivo"),
    tipoUso: z.enum(["iluminacao", "tomadas", "motores", "outros"] as const),
    metodoInstalacao: z.enum([
        "A1", "A2", "B1", "B2", "C", "D", "E", "F", "G"
    ] as const),
    material: z.enum(["cobre", "aluminio"] as const),
    temperaturaAmbiente: z.number().min(-10).max(60),
    numeroCondutores: z.number().int().min(1).max(20),
    isolamento: z.enum(["PVC", "XLPE", "EPR"] as const),
});

type FormValues = z.infer<typeof schema>;

// Tabelas RTIEBT simplificadas - Capacidade de condução (A) para cobre PVC
const CAPACIDADE_CONDUCAO: Record<number, Record<string, number>> = {
    1.5: { A1: 15.5, A2: 13.5, B1: 17.5, B2: 16, C: 20, D: 18 },
    2.5: { A1: 21, A2: 18.5, B1: 24, B2: 22, C: 27, D: 24 },
    4: { A1: 28, A2: 25, B1: 32, B2: 30, C: 37, D: 32 },
    6: { A1: 36, A2: 32, B1: 41, B2: 38, C: 47, D: 41 },
    10: { A1: 50, A2: 43, B1: 57, B2: 52, C: 64, D: 57 },
    16: { A1: 68, A2: 57, B1: 76, B2: 69, C: 85, D: 76 },
    25: { A1: 89, A2: 75, B1: 101, B2: 90, C: 112, D: 96 },
    35: { A1: 110, A2: 92, B1: 125, B2: 111, C: 138, D: 119 },
    50: { A1: 134, A2: 110, B1: 151, B2: 133, C: 168, D: 144 },
    70: { A1: 171, A2: 139, B1: 192, B2: 168, C: 213, D: 184 },
    95: { A1: 207, A2: 167, B1: 232, B2: 201, C: 258, D: 223 },
    120: { A1: 239, A2: 192, B1: 269, B2: 232, C: 299, D: 259 },
    150: { A1: 271, A2: 216, B1: 305, B2: 262, C: 340, D: 295 },
    185: { A1: 311, A2: 245, B1: 350, B2: 298, C: 390, D: 341 },
    240: { A1: 361, A2: 281, B1: 407, B2: 344, C: 454, D: 397 },
};

// Secções padronizadas (mm²)
const SECCOES_PADRAO = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630];

// Resistividades a 20°C (Ω·mm²/m)
const RESISTIVIDADE = { cobre: 0.0175, aluminio: 0.0285 };

// Fatores de correção para temperatura
const FATOR_TEMPERATURA: Record<string, Record<number, number>> = {
    PVC: { 30: 1.22, 35: 1.17, 40: 1.12, 45: 1.06, 50: 1.0, 55: 0.94, 60: 0.87 },
    XLPE: { 30: 1.15, 35: 1.12, 40: 1.08, 45: 1.04, 50: 1.0, 55: 0.96, 60: 0.91 },
};

// Fatores de agrupamento
const FATOR_AGRUPAMENTO: Record<number, number> = {
    1: 1.0, 2: 0.8, 3: 0.7, 4: 0.65, 5: 0.6, 6: 0.57, 7: 0.54, 8: 0.52, 9: 0.5
};

export default function RTIEBTCableSizingForm() {
    const [result, setResult] = useState<null | {
        seccaoCalculada: number;
        seccaoPadrao: number;
        quedaTensao: number;
        quedaPercentual: number;
        capacidadeAdmissivel: number;
        correnteCorrigida: number;
        protecaoRecomendada: number;
        observacoes: string[];
    }>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            corrente: 20,
            tensao: 230,
            fases: "mono",
            comprimento: 25,
            tipoUso: "tomadas",
            metodoInstalacao: "B1",
            material: "cobre",
            temperaturaAmbiente: 30,
            numeroCondutores: 2,
            isolamento: "PVC",
        },
    });

    // Observador para alterar tensão automaticamente conforme o sistema
    const watchFases = form.watch("fases");
    React.useEffect(() => {
        if (watchFases === "mono") {
            form.setValue("tensao", 230);
        } else if (watchFases === "tri") {
            form.setValue("tensao", 400);
        }
    }, [watchFases, form]);

    function calcularDimensionamento(values: FormValues) {
        const observacoes: string[] = [];

        // 1. Queda de tensão admissível conforme RTIEBT
        const quedaMaxima = values.tipoUso === "iluminacao" ? 3 : 5; // %
        const deltaVMax = (quedaMaxima / 100) * values.tensao;

        // 2. Fator K para cálculo de queda de tensão
        const k = values.fases === "mono" ? 2 : Math.sqrt(3);

        // 3. Resistividade do material
        const rho = RESISTIVIDADE[values.material];

        // 4. Secção mínima por queda de tensão
        const seccaoQueda = (k * values.comprimento * values.corrente * rho) / deltaVMax;

        // 5. Fatores de correção
        const fatorTemp = FATOR_TEMPERATURA[values.isolamento]?.[values.temperaturaAmbiente] || 1.0;
        const fatorAgrup = FATOR_AGRUPAMENTO[Math.min(values.numeroCondutores, 9)] || 0.5;

        // 6. Corrente corrigida necessária
        const correnteCorrigida = values.corrente / (fatorTemp * fatorAgrup);

        // 7. Encontrar secção mínima por capacidade de condução
        let seccaoCapacidade = 1.5;
        for (const seccao of SECCOES_PADRAO) {
            const capacidade = CAPACIDADE_CONDUCAO[seccao]?.[values.metodoInstalacao];
            if (capacidade && capacidade >= correnteCorrigida) {
                seccaoCapacidade = seccao;
                break;
            }
        }

        // 8. Secção final = maior entre queda de tensão e capacidade
        const seccaoCalculada = Math.max(seccaoQueda, seccaoCapacidade);
        const seccaoPadrao = SECCOES_PADRAO.find(s => s >= seccaoCalculada) || SECCOES_PADRAO[SECCOES_PADRAO.length - 1];

        // 9. Verificação da queda de tensão real
        const quedaTensao = (k * values.comprimento * values.corrente * rho) / seccaoPadrao;
        const quedaPercentual = (quedaTensao / values.tensao) * 100;

        // 10. Capacidade admissível final
        const capacidadeAdmissivel = (CAPACIDADE_CONDUCAO[seccaoPadrao]?.[values.metodoInstalacao] || 0) * fatorTemp * fatorAgrup;

        // 11. Proteção recomendada (ligeiramente superior à corrente)
        const protecoes = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];
        const protecaoRecomendada = protecoes.find(p => p >= values.corrente) || protecoes[protecoes.length - 1];

        // 12. Observações e alertas
        let isValid = true;

        if (quedaPercentual > quedaMaxima) {
            observacoes.push(`❌ FALHA: Queda de tensão (${quedaPercentual.toFixed(2)}%) excede o limite RTIEBT (${quedaMaxima}%)`);
            isValid = false;
        } else {
            observacoes.push(`✅ OK: Queda de tensão (${quedaPercentual.toFixed(2)}%) dentro do limite RTIEBT (≤${quedaMaxima}%)`);
        }

        if (values.material === "aluminio" && seccaoPadrao < 16) {
            observacoes.push("❌ FALHA: RTIEBT exige secção mínima de 16mm² para alumínio");
            isValid = false;
        }

        if (capacidadeAdmissivel < values.corrente) {
            observacoes.push(`❌ FALHA: Capacidade corrigida (${capacidadeAdmissivel.toFixed(1)}A) < Corrente projeto (${values.corrente}A)`);
            isValid = false;
        } else {
            observacoes.push(`✅ OK: Capacidade corrigida (${capacidadeAdmissivel.toFixed(1)}A) ≥ Corrente projeto (${values.corrente}A)`);
        }

        if (protecaoRecomendada >= values.corrente) {
            observacoes.push(`✅ OK: Proteção recomendada (${protecaoRecomendada}A) ≥ Corrente projeto (${values.corrente}A)`);
        }

        if (values.temperaturaAmbiente !== 30) {
            observacoes.push(`ℹ️ Aplicado fator de correção por temperatura: ${fatorTemp.toFixed(2)}`);
        }

        if (values.numeroCondutores > 1) {
            observacoes.push(`ℹ️ Aplicado fator de agrupamento: ${fatorAgrup.toFixed(2)}`);
        }

        if (isValid) {
            observacoes.unshift("🎉 DIMENSIONAMENTO VÁLIDO conforme RTIEBT");
        } else {
            observacoes.unshift("⚠️ DIMENSIONAMENTO NÃO CONFORME - Revisar parâmetros");
        }

        return {
            seccaoCalculada,
            seccaoPadrao,
            quedaTensao,
            quedaPercentual,
            capacidadeAdmissivel,
            correnteCorrigida,
            protecaoRecomendada,
            observacoes,
        };
    }

    function onSubmit(values: FormValues) {
        const resultado = calcularDimensionamento(values);
        setResult(resultado);
    }

    return (
        <div className="space-y-6">
            {/* Seção de Condições e Fórmulas */}
            <Accordion type="single" collapsible defaultValue="formulas">
                <AccordionItem value="formulas">
                    <AccordionTrigger>📋 Condições de Validação e Fórmulas de Cálculo</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-6 text-sm">

                            {/* Condições de Validação */}
                            <div>
                                <h4 className="font-semibold mb-3 text-neutral-900">Condições de Validação RTIEBT:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-600 font-mono">✓</span>
                                            <span>Queda de tensão ≤ 3% (iluminação) ou ≤ 5% (outros usos)</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-600 font-mono">✓</span>
                                            <span>Corrente ≤ Capacidade admissível corrigida</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-600 font-mono">✓</span>
                                            <span>Secção mínima: 1,5mm² (cobre) / 16mm² (alumínio)</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-600 font-mono">✓</span>
                                            <span>Proteção adequada: In ≥ Ib (corrente de projeto)</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-600 font-mono">✓</span>
                                            <span>Temperatura ambiente considerada nos fatores</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-600 font-mono">✓</span>
                                            <span>Agrupamento de condutores aplicado</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Fórmulas */}
                            <div>
                                <h4 className="font-semibold mb-3 text-neutral-900">Fórmulas de Cálculo:</h4>
                                <div className="space-y-4">

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h5 className="font-medium text-blue-900 mb-2">1. Queda de Tensão</h5>
                                        <div className="font-mono text-sm text-blue-800 mb-1">
                                            ΔV = (k × L × Ib × ρ) / S
                                        </div>
                                        <div className="text-xs text-blue-700 space-y-1">
                                            <div><strong>k:</strong> 2 (monofásico) | √3 (trifásico)</div>
                                            <div><strong>L:</strong> Comprimento do circuito (m)</div>
                                            <div><strong>Ib:</strong> Corrente de projeto (A)</div>
                                            <div><strong>ρ:</strong> Resistividade (Ω·mm²/m): Cu=0,0175 | Al=0,0285</div>
                                            <div><strong>S:</strong> Secção do condutor (mm²)</div>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <h5 className="font-medium text-green-900 mb-2">2. Capacidade Corrigida</h5>
                                        <div className="font-mono text-sm text-green-800 mb-1">
                                            Iz_corrigida = Iz_tabela × f_temp × f_agrup
                                        </div>
                                        <div className="text-xs text-green-700 space-y-1">
                                            <div><strong>Iz_tabela:</strong> Capacidade da tabela RTIEBT</div>
                                            <div><strong>f_temp:</strong> Fator de correção por temperatura</div>
                                            <div><strong>f_agrup:</strong> Fator de correção por agrupamento</div>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 p-4 rounded-lg">
                                        <h5 className="font-medium text-amber-900 mb-2">3. Secção Final</h5>
                                        <div className="font-mono text-sm text-amber-800 mb-1">
                                            S_final = max(S_queda, S_capacidade)
                                        </div>
                                        <div className="text-xs text-amber-700">
                                            A secção final é o maior valor entre o critério de queda de tensão e capacidade de condução.
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <Separator />

                            {/* Referências às Tabelas */}
                            <div>
                                <h4 className="font-semibold mb-3 text-neutral-900">Referências RTIEBT:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">

                                    <div className="bg-neutral-50 p-3 rounded">
                                        <h5 className="font-medium mb-2">📊 Tabelas de Capacidade</h5>
                                        <div className="space-y-1">
                                            <div><strong>Tabela VII:</strong> Condutores isolados em eletrodutos (A1/A2)</div>
                                            <div><strong>Tabela VIII:</strong> Cabos em eletroduto em parede (B1/B2)</div>
                                            <div><strong>Tabela IX:</strong> Cabos enterrados (C/D)</div>
                                            <div><strong>Tabela X:</strong> Cabos ao ar livre (E/F/G)</div>
                                        </div>
                                    </div>

                                    <div className="bg-neutral-50 p-3 rounded">
                                        <h5 className="font-medium mb-2">🌡️ Fatores de Correção</h5>
                                        <div className="space-y-1">
                                            <div><strong>Tabela XI:</strong> Temperatura ambiente</div>
                                            <div><strong>Tabela XII:</strong> Agrupamento de condutores</div>
                                            <div><strong>Secção 523:</strong> Secções mínimas</div>
                                            <div><strong>Secção 525:</strong> Queda de tensão</div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="bg-neutral-100 p-3 rounded text-xs">
                                <strong>⚠️ Importante:</strong> Esta ferramenta implementa as disposições das RTIEBT para dimensionamento básico.
                                Para instalações complexas ou especiais, consulte sempre um técnico qualificado e as tabelas completas do regulamento.
                            </div>

                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <Card>
                <CardHeader>
                    <CardTitle>⚙️ Parâmetros de Entrada</CardTitle>
                    <p className="text-sm text-neutral-600 mt-2">
                        Configure os parâmetros do circuito para dimensionamento automático conforme RTIEBT
                    </p>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* Seção 1: Características Elétricas */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-neutral-900 border-b border-neutral-200 pb-2">
                                    ⚡ Características Elétricas
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                    {/* Corrente */}
                                    <FormField
                                        control={form.control}
                                        name="corrente"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-neutral-700">
                                                    Corrente de Projeto (A)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                        className="h-10"
                                                        placeholder="Ex: 25.0"
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs text-neutral-500">
                                                    Corrente máxima prevista no circuito
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Tipo de Sistema */}
                                    <FormField
                                        control={form.control}
                                        name="fases"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-neutral-700">
                                                    Sistema Elétrico
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10">
                                                            <SelectValue placeholder="Selecione o sistema" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="mono">⚡ Monofásico (230V)</SelectItem>
                                                        <SelectItem value="tri">⚡⚡⚡ Trifásico (400V)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription className="text-xs text-neutral-500">
                                                    Tensão ajustada automaticamente
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Tensão */}
                                    <FormField
                                        control={form.control}
                                        name="tensao"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-neutral-700">
                                                    Tensão Nominal (V)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                        className="h-10 bg-neutral-50 text-neutral-600"
                                                        readOnly
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs text-neutral-500">
                                                    {watchFases === "mono" ? "🔒 Automático: 230V (monofásico)" : "🔒 Automático: 400V (trifásico)"}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Seção 2: Características Físicas */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-neutral-900 border-b border-neutral-200 pb-2">
                                    📏 Características Físicas
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Comprimento */}
                                    <FormField
                                        control={form.control}
                                        name="comprimento"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-neutral-700">
                                                    Comprimento do Circuito (m)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                        className="h-10"
                                                        placeholder="Ex: 25.0"
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs text-neutral-500">
                                                    Distância da proteção ao ponto mais afastado
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Tipo de Uso */}
                                    <FormField
                                        control={form.control}
                                        name="tipoUso"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-neutral-700">
                                                    Tipo de Utilização
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10">
                                                            <SelectValue placeholder="Selecione o tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="iluminacao">💡 Iluminação (queda máx. 3%)</SelectItem>
                                                        <SelectItem value="tomadas">🔌 Tomadas (queda máx. 5%)</SelectItem>
                                                        <SelectItem value="motores">⚙️ Motores (queda máx. 5%)</SelectItem>
                                                        <SelectItem value="outros">📦 Outros (queda máx. 5%)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription className="text-xs text-neutral-500">
                                                    Define o limite de queda de tensão
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Seção 3: Instalação e Material */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-neutral-900 border-b border-neutral-200 pb-2">
                                    🔧 Instalação e Material
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Método de Instalação */}
                                    <FormField
                                        control={form.control}
                                        name="metodoInstalacao"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-neutral-700">
                                                    Método de Instalação
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10">
                                                            <SelectValue placeholder="Selecione o método" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="A1">🔌 A1 - Condutores isolados em eletroduto</SelectItem>
                                                        <SelectItem value="A2">🔌 A2 - Cabo multicondutores em eletroduto</SelectItem>
                                                        <SelectItem value="B1">🏠 B1 - Condutores isolados em eletroduto na parede</SelectItem>
                                                        <SelectItem value="B2">🏠 B2 - Cabo multicondutores em eletroduto na parede</SelectItem>
                                                        <SelectItem value="C">🌍 C - Cabos diretamente enterrados</SelectItem>
                                                        <SelectItem value="D">🌍 D - Cabos em eletroduto enterrado</SelectItem>
                                                        <SelectItem value="E">⭐ E - Cabos ao ar livre (MAIS USADO)</SelectItem>
                                                        <SelectItem value="F">⭐ F - Cabos em esteira perfurada (MAIS USADO)</SelectItem>
                                                        <SelectItem value="G">📦 G - Cabos em esteira não perfurada</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription className="text-xs text-neutral-500">
                                                    Métodos E e F são os mais utilizados (Quadro 52-C11)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Material */}
                                    <FormField
                                        control={form.control}
                                        name="material"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-neutral-700">
                                                    Material do Condutor
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10">
                                                            <SelectValue placeholder="Selecione o material" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="cobre">🥉 Cobre (recomendado)</SelectItem>
                                                        <SelectItem value="aluminio">⚪ Alumínio (≥16mm² apenas)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription className="text-xs text-neutral-500">
                                                    Cobre é mais comum para instalações domésticas
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Seção 4: Condições Ambientais */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-neutral-900 border-b border-neutral-200 pb-2">
                                    🌡️ Condições Ambientais e Agrupamento
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                    {/* Temperatura Ambiente */}
                                    <FormField
                                        control={form.control}
                                        name="temperaturaAmbiente"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-neutral-700">
                                                    Temperatura Ambiente (°C)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                        className="h-10"
                                                        placeholder="Ex: 30"
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs text-neutral-500">
                                                    Referência RTIEBT: 30°C (XLPE/EPR)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Número de Condutores */}
                                    <FormField
                                        control={form.control}
                                        name="numeroCondutores"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-neutral-700">
                                                    Condutores Agrupados
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="20"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                        className="h-10"
                                                        placeholder="Ex: 1"
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs text-neutral-500">
                                                    Número de condutores no mesmo eletroduto/esteira
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Tipo de Isolamento */}
                                    <FormField
                                        control={form.control}
                                        name="isolamento"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-neutral-700">
                                                    Tipo de Isolamento
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10">
                                                            <SelectValue placeholder="Selecione o isolamento" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="PVC">🔴 PVC (70°C) - Básico</SelectItem>
                                                        <SelectItem value="XLPE">🟢 XLPE (90°C) - Recomendado</SelectItem>
                                                        <SelectItem value="EPR">🟡 EPR (90°C) - Industrial</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription className="text-xs text-neutral-500">
                                                    XLPE/EPR permitem maior capacidade de condução
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Botão de Cálculo */}
                            <div className="flex justify-center pt-8">
                                <Button type="submit" size="lg" className="w-full max-w-md h-12 text-base font-medium">
                                    🔍 Calcular Dimensionamento RTIEBT
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Resultados */}
            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Resultados do Dimensionamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-emerald-50 p-4 rounded-lg">
                                <div className="text-sm text-emerald-600 font-medium">Secção Recomendada</div>
                                <div className="text-2xl font-bold text-emerald-900">{result.seccaoPadrao} mm²</div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-blue-600 font-medium">Queda de Tensão</div>
                                <div className="text-2xl font-bold text-blue-900">{result.quedaPercentual.toFixed(2)}%</div>
                                <div className="text-xs text-blue-600">({result.quedaTensao.toFixed(2)}V)</div>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-lg">
                                <div className="text-sm text-amber-600 font-medium">Capacidade Admissível</div>
                                <div className="text-2xl font-bold text-amber-900">{result.capacidadeAdmissivel.toFixed(1)} A</div>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="text-sm text-purple-600 font-medium">Proteção Recomendada</div>
                                <div className="text-2xl font-bold text-purple-900">{result.protecaoRecomendada} A</div>
                            </div>
                        </div>

                        {result.observacoes.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-medium">Observações e Alertas</h3>
                                <div className="space-y-1">
                                    {result.observacoes.map((obs, index) => (
                                        <div key={index} className="text-sm p-2 bg-neutral-50 rounded border-l-4 border-neutral-300">
                                            {obs}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Separator />

                        <div className="text-xs text-neutral-500 space-y-1">
                            <p><strong>Aviso:</strong> Este cálculo é uma estimativa baseada nas RTIEBT. Para projetos reais, consulte sempre um técnico qualificado.</p>
                            <p><strong>Referência:</strong> Regulamento Técnico das Instalações Elétricas de Baixa Tensão (RTIEBT) - Portugal</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tabelas RTIEBT para Consulta */}
            <RTIEBTTables />
        </div>
    );
}
