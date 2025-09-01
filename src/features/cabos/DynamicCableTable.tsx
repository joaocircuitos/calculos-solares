/**
 * DynamicCableTable
 *
 * Tabela dinâmica para dimensionamento de cabos estilo Excel.
 * Permite adicionar/remover linhas e calcular múltiplos circuitos.
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";

// Tipo para uma linha da tabela
interface CableRow {
    id: string;
    canalizacoes: string;
    potencia: number;
    kva: "kW" | "kVA";
    cond: "cu" | "al";
    tipo: string;
    condParalelo: 1 | 2 | 3 | 4 | 5;
    seccao: number;
    comprimento: number;
    ib: number;
    in: number;
    iz: number;
    metodoRef: string;
    protectionType: "Fusivel" | "Disj. < 63A" | "Disj. > 63A";
    powerFactor: number;
    nominalVoltage: number;
    i2: number;
    factor1_45Iz: number;
    u: number;
    duPercent: number;
    duTotal: number;
    // Condições de validação
    condition1: boolean; // IB < In < Iz
    condition2: boolean; // I2 < 1.45 Iz
}

// Valores padrão para nova linha - Campos vazios para o usuário preencher
const defaultRow: Omit<CableRow, 'id'> = {
    canalizacoes: "",
    potencia: 0,
    kva: "kW",
    cond: "cu",
    tipo: "",
    condParalelo: 1,
    seccao: 0,
    comprimento: 0,
    ib: 0, // Será calculado
    in: 0,
    iz: 0,
    metodoRef: "",
    protectionType: "Disj. > 63A",
    powerFactor: 0.95,
    nominalVoltage: 400,
    i2: 0, // Será calculado
    factor1_45Iz: 0, // Será calculado
    u: 0, // Será calculado
    duPercent: 0, // Será calculado
    duTotal: 0, // Será calculado
    // Condições de validação (serão calculadas dinamicamente)
    condition1: false, // IB < In < Iz
    condition2: false, // I2 < 1.45 Iz
};

export default function DynamicCableTable() {
    const [showDUTotal, setShowDUTotal] = useState(true);
    const [showLegend, setShowLegend] = useState(false);
    const [showDefinitions, setShowDefinitions] = useState(false);
    const [showValidation, setShowValidation] = useState(false);

    // Calcular IB baseado na fórmula do Excel
    const calculateIB = (potencia: number, kva: "kW" | "kVA"): number => {
        let result = 0;
        if (kva === "kW") {
            result = potencia * 1.45;
        } else if (kva === "kVA") {
            result = (potencia * 1000) / (Math.sqrt(3) * 400);
        }
        return Math.round(result * 10) / 10;
    };

    // Calcular I2 baseado no tipo de proteção
    const calculateI2 = (inValue: number, protectionType: "Fusivel" | "Disj. < 63A" | "Disj. > 63A"): number => {
        let result = 0;
        switch (protectionType) {
            case "Fusivel":
                result = inValue * 1.6;
                break;
            case "Disj. < 63A":
                result = inValue * 1.45;
                break;
            case "Disj. > 63A":
                result = inValue * 1.3;
                break;
            default:
                result = inValue * 1.3;
        }
        return Math.round(result * 10) / 10;
    };

    // Calcular 1,45 Iz
    const calculate1_45Iz = (iz: number): number => {
        return Math.round((iz * 1.45) * 10) / 10;
    };

    // Calcular U (queda de tensão em volts) - Fórmula exata do Excel
    const calculateU = (ib: number, comprimento: number, seccao: number, cond: "cu" | "al", condParalelo: number): number => {
        const resistividade = cond === "cu" ? 0.0225 : 0.036;
        const result = (1 * (resistividade * comprimento / (seccao * condParalelo)) * ib);
        return Math.round(result * 100) / 100;
    };

    // Calcular DU% (queda de tensão em percentagem) - Fórmula corrigida conforme Excel
    const calculateDUPercent = (ib: number, comprimento: number, seccao: number, cond: "cu" | "al", condParalelo: number, nominalVoltage: number): number => {
        // Fórmula para circuitos trifásicos: DU% = (√3 × ρ × L × IB) / (S × n × Un) × 100
        const resistividade = cond === "cu" ? 0.0225 : 0.036;
        const result = (Math.sqrt(3) * resistividade * comprimento * ib) / (seccao * condParalelo * nominalVoltage) * 100;
        return Math.round(result * 100) / 100;
    };

    const [rows, setRows] = useState<CableRow[]>([]);

    // Calcular DU Total cumulativo
    const calculateDUTotal = (currentIndex: number, rowsList: CableRow[] = rows): number => {
        let total = 0;
        for (let i = 0; i <= currentIndex; i++) {
            total += rowsList[i]?.duPercent || 0;
        }
        return Math.round(total * 100) / 100;
    };

    // Calcular condições de validação
    const calculateConditions = (row: CableRow): { condition1: boolean; condition2: boolean } => {
        // Condição 1: IB < In < Iz
        const condition1 = row.ib < row.in && row.in < row.iz;

        // Condição 2: I2 < 1.45 Iz
        const condition2 = row.i2 < row.factor1_45Iz;

        return { condition1, condition2 };
    };

    // Adicionar nova linha
    const addRow = () => {
        const newId = (Math.max(...rows.map(r => parseInt(r.id))) + 1).toString();

        // Calcular todos os valores baseados nas fórmulas
        const ib = calculateIB(defaultRow.potencia, defaultRow.kva);
        const i2 = calculateI2(defaultRow.in, defaultRow.protectionType);
        const factor1_45Iz = calculate1_45Iz(defaultRow.iz);
        const u = calculateU(ib, defaultRow.comprimento, defaultRow.seccao, defaultRow.cond, defaultRow.condParalelo);
        const duPercent = calculateDUPercent(ib, defaultRow.comprimento, defaultRow.seccao, defaultRow.cond, defaultRow.condParalelo, defaultRow.nominalVoltage);

        const newRow = {
            id: newId,
            ...defaultRow,
            ib,
            i2,
            factor1_45Iz,
            u,
            duPercent,
            duTotal: 0, // Será calculado após adicionar à lista
            ...calculateConditions({
                id: newId,
                ...defaultRow,
                ib,
                i2,
                factor1_45Iz
            })
        };

        const updatedRows = [...rows, newRow];
        setRows(updatedRows.map((row, index) => ({
            ...row,
            duTotal: calculateDUTotal(index, updatedRows)
        })));
    };

    // Remover linha
    const removeRow = (id: string) => {
        if (rows.length > 1) {
            const updatedRows = rows.filter(row => row.id !== id);
            setRows(updatedRows.map((row, index) => ({
                ...row,
                duTotal: calculateDUTotal(index, updatedRows)
            })));
        }
    };

    // Atualizar valor de uma célula
    const updateCell = (id: string, field: keyof CableRow, value: string | number) => {
        setRows(rows.map(row => {
            if (row.id === id) {
                // Tratar campos numéricos vazios
                let processedValue = value;
                if (typeof value === 'string' && value === '') {
                    // Se o campo está vazio, definir como 0 para campos numéricos
                    if (['potencia', 'comprimento', 'seccao', 'in', 'iz'].includes(field)) {
                        processedValue = 0;
                    } else {
                        processedValue = '';
                    }
                }

                const updatedRow = { ...row, [field]: processedValue };

                // Auto-calcular IB quando potência ou kVA mudam
                if (field === 'potencia' || field === 'kva') {
                    const newPotencia = field === 'potencia' ? Number(value) : updatedRow.potencia;
                    const newKva = field === 'kva' ? value as ("kW" | "kVA") : updatedRow.kva;
                    updatedRow.ib = calculateIB(newPotencia, newKva);
                }

                // Auto-calcular I2 quando In ou tipo de proteção mudam
                if (field === 'in' || field === 'protectionType') {
                    const newIn = field === 'in' ? Number(value) : updatedRow.in;
                    const newProtectionType = field === 'protectionType' ? value as ("Fusivel" | "Disj. < 63A" | "Disj. > 63A") : updatedRow.protectionType;
                    updatedRow.i2 = calculateI2(newIn, newProtectionType);
                }

                // Auto-calcular 1,45 Iz quando Iz muda
                if (field === 'iz') {
                    updatedRow.factor1_45Iz = calculate1_45Iz(Number(value));
                }

                // Auto-calcular U quando IB, comprimento, secção, condutor ou condutores paralelos mudam
                if (field === 'ib' || field === 'comprimento' || field === 'seccao' || field === 'cond' || field === 'condParalelo') {
                    const newIb = field === 'ib' ? Number(value) : updatedRow.ib;
                    const newComprimento = field === 'comprimento' ? Number(value) : updatedRow.comprimento;
                    const newSeccao = field === 'seccao' ? Number(value) : updatedRow.seccao;
                    const newCond = field === 'cond' ? value as ("cu" | "al") : updatedRow.cond;
                    const newCondParalelo = field === 'condParalelo' ? Number(value) : updatedRow.condParalelo;
                    updatedRow.u = calculateU(newIb, newComprimento, newSeccao, newCond, newCondParalelo);
                }

                // Auto-calcular DU% quando qualquer parâmetro relacionado muda
                if (field === 'ib' || field === 'comprimento' || field === 'seccao' || field === 'cond' || field === 'condParalelo' || field === 'nominalVoltage' || field === 'potencia' || field === 'kva') {
                    const newIb = field === 'ib' ? Number(value) : updatedRow.ib;
                    const newComprimento = field === 'comprimento' ? Number(value) : updatedRow.comprimento;
                    const newSeccao = field === 'seccao' ? Number(value) : updatedRow.seccao;
                    const newCond = field === 'cond' ? value as ("cu" | "al") : updatedRow.cond;
                    const newCondParalelo = field === 'condParalelo' ? Number(value) : updatedRow.condParalelo;
                    const newNominalVoltage = field === 'nominalVoltage' ? Number(value) : updatedRow.nominalVoltage;
                    updatedRow.duPercent = calculateDUPercent(newIb, newComprimento, newSeccao, newCond, newCondParalelo, newNominalVoltage);
                }

                // Recalcular condições de validação
                const conditions = calculateConditions(updatedRow);
                updatedRow.condition1 = conditions.condition1;
                updatedRow.condition2 = conditions.condition2;

                return updatedRow;
            }
            return row;
        }));

        // Recalcular todos os DU Total após qualquer mudança
        setRows(currentRows => {
            return currentRows.map((row, index) => ({
                ...row,
                duTotal: calculateDUTotal(index, currentRows)
            }));
        });
    };



    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg">📊 Quadro de Dimensionamento - Circuitos Trifásicos</CardTitle>
                        <p className="text-sm text-neutral-600 mt-1">
                            Células <span className="bg-amber-200 px-1 rounded">amarelas</span> são editáveis
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        {/* Botão DU Total - apenas em desktop */}
                        <Button
                            onClick={() => setShowDUTotal(!showDUTotal)}
                            size="sm"
                            variant="outline"
                            className={`${showDUTotal ? "bg-orange-100" : ""} hidden sm:flex flex-1 sm:flex-none`}
                        >
                            {showDUTotal ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                            DU Total
                        </Button>
                        <Button onClick={addRow} size="sm" variant="outline" className="hidden sm:flex flex-1 sm:flex-none">
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar Linha
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Mobile Layout */}
                <div className="block md:hidden space-y-4">
                    {rows.map((row, index) => (
                        <div key={row.id} className="bg-white border border-neutral-300 rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-semibold text-neutral-800">Circuito {index + 1}</h3>
                                <div className="text-xs text-neutral-500">ID: {row.id}</div>
                            </div>

                            {/* Configuração Básica */}
                            <div className="space-y-3 mb-4">
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 shadow-sm">
                                    <h4 className="text-xs font-semibold text-blue-900 mb-2">📋 Configuração Básica</h4>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-xs text-blue-700 font-medium">Canalização:</label>
                                            <Input
                                                value={row.canalizacoes}
                                                onChange={(e) => updateCell(row.id, 'canalizacoes', e.target.value)}
                                                className="mt-1 h-9 text-sm border-blue-300 focus:ring-2 focus:ring-blue-500 bg-white"
                                                placeholder="Ex: Quadro Geral → Inversor 1"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-blue-700 font-medium">Potência:</label>
                                                <Input
                                                    type="number"
                                                    value={row.potencia}
                                                    onChange={(e) => updateCell(row.id, 'potencia', Number(e.target.value))}
                                                    className="mt-1 h-9 text-sm border-blue-300 focus:ring-2 focus:ring-blue-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-blue-700 font-medium">Tipo:</label>
                                                <Select
                                                    value={row.kva}
                                                    onValueChange={(value: "kW" | "kVA") => updateCell(row.id, 'kva', value)}
                                                >
                                                    <SelectTrigger className="mt-1 h-9 text-sm border-blue-300 focus:ring-2 focus:ring-blue-500 bg-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="kW">kW</SelectItem>
                                                        <SelectItem value="kVA">kVA</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-blue-700 font-medium">Comprimento (m):</label>
                                            <Input
                                                type="number"
                                                value={row.comprimento}
                                                onChange={(e) => updateCell(row.id, 'comprimento', Number(e.target.value))}
                                                className="mt-1 h-9 text-sm border-blue-300 focus:ring-2 focus:ring-blue-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                placeholder="metros"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Cabo e Condutor */}
                                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 shadow-sm">
                                    <h4 className="text-xs font-semibold text-emerald-900 mb-2">🔌 Cabo / Condutor</h4>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-emerald-700 font-medium">Material:</label>
                                                <Select
                                                    value={row.cond}
                                                    onValueChange={(value) => updateCell(row.id, 'cond', value)}
                                                >
                                                    <SelectTrigger className="mt-1 h-9 text-sm border-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-white">
                                                        <SelectValue>
                                                            {row.cond === 'cu' ? 'Cu' : 'Al'}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cu">Cu - Cobre</SelectItem>
                                                        <SelectItem value="al">Al - Alumínio</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-emerald-700 font-medium">Tipo:</label>
                                                <Select
                                                    value={row.tipo}
                                                    onValueChange={(value) => updateCell(row.id, 'tipo', value)}
                                                >
                                                    <SelectTrigger className="mt-1 h-9 text-sm border-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-white">
                                                        <SelectValue>
                                                            {row.tipo}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="RZ1-K">RZ1-K (XLPE)</SelectItem>
                                                        <SelectItem value="RZ1-AL">RZ1-AL (XLPE Al)</SelectItem>
                                                        <SelectItem value="XV">XV (PVC)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-emerald-700 font-medium">Condutores //:</label>
                                                <Select
                                                    value={row.condParalelo.toString()}
                                                    onValueChange={(value) => updateCell(row.id, 'condParalelo', Number(value) as 1 | 2 | 3 | 4 | 5)}
                                                >
                                                    <SelectTrigger className="mt-1 h-9 text-sm border-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-white">
                                                        <SelectValue>
                                                            {row.condParalelo}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">1</SelectItem>
                                                        <SelectItem value="2">2</SelectItem>
                                                        <SelectItem value="3">3</SelectItem>
                                                        <SelectItem value="4">4</SelectItem>
                                                        <SelectItem value="5">5</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-emerald-700 font-medium">Secção (mm²):</label>
                                                <Select
                                                    value={row.seccao.toString()}
                                                    onValueChange={(value) => updateCell(row.id, 'seccao', Number(value))}
                                                >
                                                    <SelectTrigger className="mt-1 h-9 text-sm border-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-white">
                                                        <SelectValue>
                                                            {row.seccao}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1.5">1,5</SelectItem>
                                                        <SelectItem value="2.5">2,5</SelectItem>
                                                        <SelectItem value="4">4</SelectItem>
                                                        <SelectItem value="6">6</SelectItem>
                                                        <SelectItem value="10">10</SelectItem>
                                                        <SelectItem value="16">16</SelectItem>
                                                        <SelectItem value="25">25</SelectItem>
                                                        <SelectItem value="35">35</SelectItem>
                                                        <SelectItem value="50">50</SelectItem>
                                                        <SelectItem value="70">70</SelectItem>
                                                        <SelectItem value="95">95</SelectItem>
                                                        <SelectItem value="120">120</SelectItem>
                                                        <SelectItem value="150">150</SelectItem>
                                                        <SelectItem value="185">185</SelectItem>
                                                        <SelectItem value="240">240</SelectItem>
                                                        <SelectItem value="300">300</SelectItem>
                                                        <SelectItem value="400">400</SelectItem>
                                                        <SelectItem value="500">500</SelectItem>
                                                        <SelectItem value="630">630</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Correntes e Proteção */}
                                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 shadow-sm">
                                    <h4 className="text-xs font-semibold text-amber-900 mb-2">⚡ Correntes e Proteção</h4>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-amber-700 font-medium">IB (A) - Calculado:</label>
                                                <div className="mt-1 h-9 bg-gray-100 border border-gray-300 rounded-md px-3 flex items-center">
                                                    <span className="text-sm font-semibold text-gray-700">{row.ib || '0'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-amber-700 font-medium">In (A):</label>
                                                <Select
                                                    value={row.in.toString()}
                                                    onValueChange={(value) => updateCell(row.id, 'in', Number(value))}
                                                >
                                                    <SelectTrigger className="mt-1 h-9 text-sm border-amber-300 focus:ring-2 focus:ring-amber-500 bg-white">
                                                        <SelectValue>
                                                            {row.in}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="6">6A</SelectItem>
                                                        <SelectItem value="10">10A</SelectItem>
                                                        <SelectItem value="13">13A</SelectItem>
                                                        <SelectItem value="16">16A</SelectItem>
                                                        <SelectItem value="20">20A</SelectItem>
                                                        <SelectItem value="25">25A</SelectItem>
                                                        <SelectItem value="32">32A</SelectItem>
                                                        <SelectItem value="40">40A</SelectItem>
                                                        <SelectItem value="50">50A</SelectItem>
                                                        <SelectItem value="63">63A</SelectItem>
                                                        <SelectItem value="80">80A</SelectItem>
                                                        <SelectItem value="100">100A</SelectItem>
                                                        <SelectItem value="125">125A</SelectItem>
                                                        <SelectItem value="160">160A</SelectItem>
                                                        <SelectItem value="200">200A</SelectItem>
                                                        <SelectItem value="250">250A</SelectItem>
                                                        <SelectItem value="315">315A</SelectItem>
                                                        <SelectItem value="400">400A</SelectItem>
                                                        <SelectItem value="500">500A</SelectItem>
                                                        <SelectItem value="630">630A</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-amber-700 font-medium">Iz (A):</label>
                                                <Input
                                                    type="number"
                                                    value={row.iz}
                                                    onChange={(e) => updateCell(row.id, 'iz', Number(e.target.value))}
                                                    className="mt-1 h-9 text-sm border-amber-300 focus:ring-2 focus:ring-amber-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    placeholder="A"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-amber-700 font-medium">Método:</label>
                                                <Select
                                                    value={row.metodoRef}
                                                    onValueChange={(value) => updateCell(row.id, 'metodoRef', value)}
                                                >
                                                    <SelectTrigger className="mt-1 h-9 text-sm border-amber-300 focus:ring-2 focus:ring-amber-500 bg-white">
                                                        <SelectValue>
                                                            {row.metodoRef}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="A1">A1 - Condutores isolados em eletroduto</SelectItem>
                                                        <SelectItem value="A2">A2 - Cabo multicondutores em eletroduto</SelectItem>
                                                        <SelectItem value="B1">B1 - Condutores isolados em eletroduto na parede</SelectItem>
                                                        <SelectItem value="B2">B2 - Cabo multicondutores em eletroduto na parede</SelectItem>
                                                        <SelectItem value="C">C - Cabos diretamente enterrados</SelectItem>
                                                        <SelectItem value="D">D - Cabos em eletroduto enterrado</SelectItem>
                                                        <SelectItem value="E">E - Cabos ao ar livre (MAIS USADO)</SelectItem>
                                                        <SelectItem value="F">F - Cabos em esteira perfurada (MAIS USADO)</SelectItem>
                                                        <SelectItem value="G">G - Cabos em esteira não perfurada</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Resultados */}
                                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 shadow-sm">
                                    <h4 className="text-xs font-semibold text-indigo-900 mb-2">📊 Resultados</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-2 rounded border border-green-300">
                                            <div className="text-xs text-green-700 font-medium">I2 (A)</div>
                                            <div className="text-sm font-semibold text-green-800">{row.i2}</div>
                                        </div>
                                        <div className="bg-white p-2 rounded border border-green-300">
                                            <div className="text-xs text-green-700 font-medium">1,45 Iz (A)</div>
                                            <div className="text-sm font-semibold text-green-800">{row.factor1_45Iz}</div>
                                        </div>
                                        <div className="bg-white p-2 rounded border border-green-300">
                                            <div className="text-xs text-green-700 font-medium">U (V)</div>
                                            <div className="text-sm font-semibold text-green-800">{row.u}</div>
                                        </div>
                                        <div className="bg-white p-2 rounded border border-green-300">
                                            <div className="text-xs text-green-700 font-medium">DU (%)</div>
                                            <div className="text-sm font-semibold text-green-800">{row.duPercent}%</div>
                                        </div>
                                        {showDUTotal && (
                                            <div className="bg-white p-2 rounded border border-orange-300 col-span-2">
                                                <div className="text-xs text-orange-700 font-medium">DU Total (%)</div>
                                                <div className="text-sm font-semibold text-orange-800">{row.duTotal}%</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Validação RTIEBT */}
                                <div className="bg-rose-50 p-3 rounded-lg border border-rose-200 shadow-sm">
                                    <h4 className="text-xs font-semibold text-rose-900 mb-2">✅ Validação RTIEBT</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className={`p-3 rounded-lg border text-center ${row.condition1 ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
                                            <div className="text-xs font-medium">IB &lt; In &lt; Iz</div>
                                            <div className={`text-lg font-bold ${row.condition1 ? 'text-green-700' : 'text-red-700'}`}>
                                                {row.condition1 ? '✓' : '✗'}
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-lg border text-center ${row.condition2 ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
                                            <div className="text-xs font-medium">I2 &lt; 1.45 Iz</div>
                                            <div className={`text-lg font-bold ${row.condition2 ? 'text-green-700' : 'text-red-700'}`}>
                                                {row.condition2 ? '✓' : '✗'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {rows.length > 1 && (
                                <div className="pt-4 border-t border-neutral-200 mt-4">
                                    <Button
                                        onClick={() => removeRow(row.id)}
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-10"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remover Circuito
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block border rounded-lg overflow-x-auto">
                    <table className="w-full text-[10px] border-collapse min-w-[1200px]">
                        <thead>
                            <tr>
                                <th rowSpan={2} className="bg-amber-100 border border-neutral-400 p-1 text-center font-medium w-[15%]">
                                    Canalizações
                                </th>
                                <th rowSpan={2} className="bg-amber-100 border border-neutral-400 p-1 text-center font-medium w-[5%]">
                                    Potência
                                </th>
                                <th rowSpan={2} className="bg-amber-100 border border-neutral-400 p-1 text-center font-medium w-[4%]">
                                    kW<br />kVA
                                </th>
                                <th colSpan={4} className="bg-slate-100 border border-neutral-400 p-2 text-center font-medium">
                                    CABO / CONDUTOR
                                </th>
                                <th rowSpan={2} className="bg-amber-100 border border-neutral-400 p-1 text-center font-medium w-[5%]">
                                    L<br />- m -
                                </th>
                                <th colSpan={3} className="bg-slate-100 border border-neutral-400 p-2 text-center font-medium">
                                    Correntes
                                </th>
                                <th rowSpan={2} className="bg-gray-100 border border-neutral-400 p-1 text-center font-medium w-[5%]">
                                    RTIEBT<br />Método
                                </th>
                                <th colSpan={2} className="bg-green-100 border border-neutral-400 p-2 text-center font-medium">
                                    Iz
                                </th>
                                <th colSpan={2} className="bg-yellow-100 border border-neutral-400 p-2 text-center font-medium">
                                    Validação<br />RTIEBT
                                </th>
                                <th colSpan={showDUTotal ? 3 : 2} className="bg-orange-100 border border-neutral-400 p-2 text-center font-medium">
                                    DU
                                </th>
                                <th rowSpan={2} className="bg-red-100 border border-neutral-400 p-1 text-center font-medium w-[4%]">
                                    Ações
                                </th>

                            </tr>
                            <tr>
                                <th className="bg-slate-100 border border-neutral-400 p-1 text-center text-[10px] font-medium w-[4%]">COND</th>
                                <th className="bg-slate-100 border border-neutral-400 p-1 text-center text-[10px] font-medium w-[5%]">TIPO</th>
                                <th className="bg-slate-100 border border-neutral-400 p-1 text-center text-[10px] font-medium w-[4%]">COND //</th>
                                <th className="bg-slate-100 border border-neutral-400 p-1 text-center text-[10px] font-medium w-[6%]">SECÇÃO<br />mm²</th>
                                <th className="bg-slate-100 border border-neutral-400 p-1 text-center text-[10px] font-medium w-[5%]">IB<br />A</th>
                                <th className="bg-slate-100 border border-neutral-400 p-1 text-center text-[10px] font-medium w-[5%]">In<br />A</th>
                                <th className="bg-slate-100 border border-neutral-400 p-1 text-center text-[10px] font-medium w-[5%]">Iz<br />A</th>
                                <th className="bg-green-100 border border-neutral-400 p-1 text-center text-[10px] font-medium w-[4%]">I2<br />A</th>
                                <th className="bg-green-100 border border-neutral-400 p-1 text-center text-[10px] font-medium w-[5%]">1,45 Iz<br />A</th>
                                <th className="bg-yellow-100 border border-neutral-400 p-1 text-center text-[10px] font-medium w-[4%]">IB&lt;In&lt;Iz</th>
                                <th className="bg-yellow-100 border border-neutral-400 p-1 text-center text-[10px] font-medium w-[4%]">I2&lt;1.45Iz</th>
                                <th className="bg-orange-100 border border-neutral-400 p-1 text-center text-[10px] font-medium w-[4%]">U<br />V</th>
                                <th className="bg-orange-100 border border-neutral-400 p-1 text-center text-[10px] font-medium w-[4%]">DU<br />%</th>
                                {showDUTotal && (
                                    <th className="bg-orange-100 border border-neutral-400 p-1 text-center text-[10px] font-medium w-[5%]">DU Total<br />%</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={row.id} className={`${index % 2 === 0 ? 'bg-neutral-25' : 'bg-white'}`}>
                                    <td className="border border-neutral-300 p-1 bg-amber-50">
                                        <Input
                                            value={row.canalizacoes}
                                            onChange={(e) => updateCell(row.id, 'canalizacoes', e.target.value)}
                                            className="h-8 text-left border-0 bg-transparent text-[10px] font-medium px-2 focus:ring-2 focus:ring-amber-400"
                                            placeholder="Ex: Quadro Geral → Inversor 1"
                                        />
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-amber-50">
                                        <Input
                                            type="number"
                                            value={row.potencia}
                                            onChange={(e) => updateCell(row.id, 'potencia', Number(e.target.value))}
                                            className="h-8 text-center border-0 bg-transparent text-[10px] font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-amber-400"
                                        />
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-amber-50">
                                        <Select
                                            value={row.kva}
                                            onValueChange={(value: "kW" | "kVA") => updateCell(row.id, 'kva', value)}
                                        >
                                            <SelectTrigger className="h-8 border-0 bg-transparent text-[10px] focus:ring-2 focus:ring-amber-400">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kW">kW</SelectItem>
                                                <SelectItem value="kVA">kVA</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-amber-50">
                                        <Select
                                            value={row.cond}
                                            onValueChange={(value) => updateCell(row.id, 'cond', value)}
                                        >
                                            <SelectTrigger className="h-8 border-0 bg-transparent text-[10px] focus:ring-2 focus:ring-amber-400">
                                                <SelectValue>
                                                    {row.cond === 'cu' ? 'Cu' : 'Al'}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cu">Cu - Cobre</SelectItem>
                                                <SelectItem value="al">Al - Alumínio</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-amber-50">
                                        <Select
                                            value={row.tipo}
                                            onValueChange={(value) => updateCell(row.id, 'tipo', value)}
                                        >
                                            <SelectTrigger className="h-8 border-0 bg-transparent text-[10px] focus:ring-2 focus:ring-amber-400">
                                                <SelectValue>
                                                    {row.tipo}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="RZ1-K">RZ1-K (XLPE)</SelectItem>
                                                <SelectItem value="RZ1-AL">RZ1-AL (XLPE Al)</SelectItem>
                                                <SelectItem value="XV">XV (PVC)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-amber-50">
                                        <Select
                                            value={row.condParalelo.toString()}
                                            onValueChange={(value) => updateCell(row.id, 'condParalelo', Number(value) as 1 | 2 | 3 | 4 | 5)}
                                        >
                                            <SelectTrigger className="h-8 border-0 bg-transparent text-[10px] focus:ring-2 focus:ring-amber-400">
                                                <SelectValue>
                                                    {row.condParalelo}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 Condutor</SelectItem>
                                                <SelectItem value="2">2 Condutores</SelectItem>
                                                <SelectItem value="3">3 Condutores</SelectItem>
                                                <SelectItem value="4">4 Condutores</SelectItem>
                                                <SelectItem value="5">5 Condutores</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-amber-50">
                                        <Select
                                            value={row.seccao.toString()}
                                            onValueChange={(value) => updateCell(row.id, 'seccao', Number(value))}
                                        >
                                            <SelectTrigger className="h-8 border-0 bg-transparent text-[10px] focus:ring-2 focus:ring-amber-400">
                                                <SelectValue>
                                                    {row.seccao}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1.5">1,5 mm²</SelectItem>
                                                <SelectItem value="2.5">2,5 mm²</SelectItem>
                                                <SelectItem value="4">4 mm²</SelectItem>
                                                <SelectItem value="6">6 mm²</SelectItem>
                                                <SelectItem value="10">10 mm²</SelectItem>
                                                <SelectItem value="16">16 mm²</SelectItem>
                                                <SelectItem value="25">25 mm²</SelectItem>
                                                <SelectItem value="35">35 mm²</SelectItem>
                                                <SelectItem value="50">50 mm²</SelectItem>
                                                <SelectItem value="70">70 mm²</SelectItem>
                                                <SelectItem value="95">95 mm²</SelectItem>
                                                <SelectItem value="120">120 mm²</SelectItem>
                                                <SelectItem value="150">150 mm²</SelectItem>
                                                <SelectItem value="185">185 mm²</SelectItem>
                                                <SelectItem value="240">240 mm²</SelectItem>
                                                <SelectItem value="300">300 mm²</SelectItem>
                                                <SelectItem value="400">400 mm²</SelectItem>
                                                <SelectItem value="500">500 mm²</SelectItem>
                                                <SelectItem value="630">630 mm²</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-amber-50">
                                        <Input
                                            type="number"
                                            value={row.comprimento}
                                            onChange={(e) => updateCell(row.id, 'comprimento', Number(e.target.value))}
                                            className="h-8 text-center border-0 bg-transparent text-[10px] font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-amber-400"
                                            placeholder="m"
                                        />
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-green-50">
                                        <div className="text-center text-[10px] font-semibold text-green-700">
                                            {row.ib}
                                        </div>
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-amber-50">
                                        <Select
                                            value={row.in.toString()}
                                            onValueChange={(value) => updateCell(row.id, 'in', Number(value))}
                                        >
                                            <SelectTrigger className="h-8 border-0 bg-transparent text-[10px] focus:ring-2 focus:ring-amber-400">
                                                <SelectValue>
                                                    {row.in}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="6">6A</SelectItem>
                                                <SelectItem value="10">10A</SelectItem>
                                                <SelectItem value="13">13A</SelectItem>
                                                <SelectItem value="16">16A</SelectItem>
                                                <SelectItem value="20">20A</SelectItem>
                                                <SelectItem value="25">25A</SelectItem>
                                                <SelectItem value="32">32A</SelectItem>
                                                <SelectItem value="40">40A</SelectItem>
                                                <SelectItem value="50">50A</SelectItem>
                                                <SelectItem value="63">63A</SelectItem>
                                                <SelectItem value="80">80A</SelectItem>
                                                <SelectItem value="100">100A</SelectItem>
                                                <SelectItem value="125">125A</SelectItem>
                                                <SelectItem value="160">160A</SelectItem>
                                                <SelectItem value="200">200A</SelectItem>
                                                <SelectItem value="250">250A</SelectItem>
                                                <SelectItem value="315">315A</SelectItem>
                                                <SelectItem value="400">400A</SelectItem>
                                                <SelectItem value="500">500A</SelectItem>
                                                <SelectItem value="630">630A</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-amber-50">
                                        <Input
                                            type="number"
                                            value={row.iz}
                                            onChange={(e) => updateCell(row.id, 'iz', Number(e.target.value))}
                                            className="h-8 text-center border-0 bg-transparent text-[10px] font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-amber-400"
                                            placeholder="A"
                                        />
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-amber-50">
                                        <Select
                                            value={row.metodoRef}
                                            onValueChange={(value) => updateCell(row.id, 'metodoRef', value)}
                                        >
                                            <SelectTrigger className="h-8 border-0 bg-transparent text-[10px] focus:ring-2 focus:ring-amber-400">
                                                <SelectValue>
                                                    {row.metodoRef}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A1">A1 - Condutores isolados em eletroduto</SelectItem>
                                                <SelectItem value="A2">A2 - Cabo multicondutores em eletroduto</SelectItem>
                                                <SelectItem value="B1">B1 - Condutores isolados em eletroduto na parede</SelectItem>
                                                <SelectItem value="B2">B2 - Cabo multicondutores em eletroduto na parede</SelectItem>
                                                <SelectItem value="C">C - Cabos diretamente enterrados</SelectItem>
                                                <SelectItem value="D">D - Cabos em eletroduto enterrado</SelectItem>
                                                <SelectItem value="E">E - Cabos ao ar livre (MAIS USADO)</SelectItem>
                                                <SelectItem value="F">F - Cabos em esteira perfurada (MAIS USADO)</SelectItem>
                                                <SelectItem value="G">G - Cabos em esteira não perfurada</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-green-50">
                                        <div className="text-center text-[10px] font-semibold text-green-700">
                                            {row.i2}
                                        </div>
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-green-50">
                                        <div className="text-center text-[10px] font-semibold text-green-700">
                                            {row.factor1_45Iz}
                                        </div>
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-yellow-50">
                                        <div className={`text-center text-[10px] font-semibold ${row.condition1 ? 'text-green-700' : 'text-red-700'}`}>
                                            {row.condition1 ? '✓' : '✗'}
                                        </div>
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-yellow-50">
                                        <div className={`text-center text-[10px] font-semibold ${row.condition2 ? 'text-green-700' : 'text-red-700'}`}>
                                            {row.condition2 ? '✓' : '✗'}
                                        </div>
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-green-50">
                                        <div className="text-center text-[10px] font-semibold text-green-700">
                                            {row.u}
                                        </div>
                                    </td>
                                    <td className="border border-neutral-300 p-1 bg-orange-50">
                                        <div className="text-center text-[10px] font-semibold text-orange-700">
                                            {row.duPercent}%
                                        </div>
                                    </td>
                                    {showDUTotal && (
                                        <td className="border border-neutral-300 p-1 bg-orange-50">
                                            <div className="text-center text-[10px] font-semibold text-orange-700">
                                                {row.duTotal}%
                                            </div>
                                        </td>
                                    )}
                                    <td className="border border-neutral-300 p-1 bg-red-50">
                                        {rows.length > 1 && (
                                            <Button
                                                onClick={() => removeRow(row.id)}
                                                size="sm"
                                                variant="outline"
                                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 border-red-200"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-neutral-200 gap-2">
                    <div className="text-xs text-neutral-500">
                        Total de circuitos: {rows.length}
                    </div>
                    <div className="hidden">
                        <Button onClick={addRow} size="sm" variant="outline" className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar Novo Circuito
                        </Button>
                    </div>
                </div>



                <div className="mt-6 space-y-6">
                    {/* Legenda das Cores */}
                    <div className="p-4 bg-neutral-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-neutral-800">🎨 Legenda das Cores</h4>
                            <Button
                                onClick={() => setShowLegend(!showLegend)}
                                size="sm"
                                variant="outline"
                                className="flex items-center justify-center w-8 h-8 p-0"
                            >
                                {showLegend ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </Button>
                        </div>
                        {showLegend && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-amber-100 border-2 border-amber-300 rounded"></div>
                                    <span className="font-medium">Editável</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-100 border-2 border-green-300 rounded"></div>
                                    <span className="font-medium">Calculado</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-blue-100 border-2 border-blue-300 rounded"></div>
                                    <span className="font-medium">Fixo</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-orange-100 border-2 border-orange-300 rounded"></div>
                                    <span className="font-medium">Queda Tensão</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                                    <span className="font-medium">Validação RTIEBT</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Definições dos Termos */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-blue-900">📖 Definições dos Termos</h4>
                            <Button
                                onClick={() => setShowDefinitions(!showDefinitions)}
                                size="sm"
                                variant="outline"
                                className="flex items-center justify-center w-8 h-8 p-0"
                            >
                                {showDefinitions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </Button>
                        </div>
                        {showDefinitions && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="bg-white p-3 rounded border border-blue-200">
                                    <div className="font-bold text-blue-800 mb-1">IB - Corrente de Projeto</div>
                                    <div className="text-blue-700">Corrente de serviço do circuito, calculada automaticamente a partir da potência e tipo (kW/kVA)</div>
                                </div>
                                <div className="bg-white p-3 rounded border border-blue-200">
                                    <div className="font-bold text-blue-800 mb-1">In - Corrente Nominal</div>
                                    <div className="text-blue-700">Corrente nominal da proteção (calibre do disjuntor/fusível)</div>
                                </div>
                                <div className="bg-white p-3 rounded border border-blue-200">
                                    <div className="font-bold text-blue-800 mb-1">Iz - Capacidade de Condução</div>
                                    <div className="text-blue-700">Corrente máxima admissível do cabo (consultar tabelas RTIEBT)</div>
                                </div>
                                <div className="bg-white p-3 rounded border border-blue-200">
                                    <div className="font-bold text-blue-800 mb-1">I2 - Corrente de Funcionamento</div>
                                    <div className="text-blue-700">Corrente que ativa a proteção (calculada automaticamente)</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Condições de Validação RTIEBT */}
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-yellow-900">✅ Validação RTIEBT</h4>
                            <Button
                                onClick={() => setShowValidation(!showValidation)}
                                size="sm"
                                variant="outline"
                                className="flex items-center justify-center w-8 h-8 p-0"
                            >
                                {showValidation ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </Button>
                        </div>
                        {showValidation && (
                            <>
                                <div className="text-xs space-y-3">
                                    <div className="bg-white p-3 rounded border border-yellow-200">
                                        <div className="font-bold text-yellow-800 mb-1">1ª Condição: IB &lt; In &lt; Iz</div>
                                        <div className="text-yellow-700">
                                            A corrente de projeto deve ser menor que a corrente nominal da proteção,
                                            que por sua vez deve ser menor que a capacidade de condução do cabo.
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-yellow-200">
                                        <div className="font-bold text-yellow-800 mb-1">2ª Condição: I2 &lt; 1.45 Iz</div>
                                        <div className="text-yellow-700">
                                            A corrente de funcionamento da proteção deve ser menor que 1.45 vezes
                                            a capacidade de condução do cabo para garantir a proteção adequada.
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 p-2 bg-yellow-100 rounded text-yellow-800 text-xs">
                                    <strong>Nota:</strong> Ambas as condições devem ser cumpridas para que o dimensionamento seja válido conforme as RTIEBT.
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
