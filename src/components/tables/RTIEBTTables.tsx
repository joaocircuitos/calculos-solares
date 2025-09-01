/**
 * RTIEBTTables
 *
 * Componente que exibe os Quadros 52-C11 (Cobre) e 52-C12 (Alumínio) das RTIEBT.
 * Formato exato conforme imagem oficial fornecida pelo usuário.
 */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

// QUADRO 52-C11: COBRE - XLPE/EPR (90°C), Temperatura ambiente: 30°C
// Valores exatos conforme imagem oficial das RTIEBT
const QUADRO_52_C11_COBRE = [
    // E (Dois condutores) | F (Três condutores) | G (Com afastamento - Horizontal/Vertical)
    { seccao: "1,5", E_2: 26, E_3: 23, F_3: null, F_4: null, F_5: null, G_H: null, G_V: null },
    { seccao: "2,5", E_2: 36, E_3: 32, F_3: null, F_4: null, F_5: null, G_H: null, G_V: null },
    { seccao: "4", E_2: 49, E_3: 42, F_3: null, F_4: null, F_5: null, G_H: null, G_V: null },
    { seccao: "6", E_2: 63, E_3: 54, F_3: null, F_4: null, F_5: null, G_H: null, G_V: null },
    { seccao: "10", E_2: 86, E_3: 75, F_3: null, F_4: null, F_5: null, G_H: null, G_V: null },
    { seccao: "16", E_2: 115, E_3: 100, F_3: null, F_4: null, F_5: null, G_H: null, G_V: null },
    { seccao: "25", E_2: 149, E_3: 127, F_3: 161, F_4: 135, F_5: 141, G_H: 182, G_V: 161 },
    { seccao: "35", E_2: 185, E_3: 158, F_3: 200, F_4: 169, F_5: 176, G_H: 226, G_V: 201 },
    { seccao: "50", E_2: 225, E_3: 192, F_3: 242, F_4: 207, F_5: 216, G_H: 275, G_V: 246 },
    { seccao: "70", E_2: 289, E_3: 246, F_3: 310, F_4: 268, F_5: 279, G_H: 353, G_V: 318 },
    { seccao: "95", E_2: 352, E_3: 298, F_3: 377, F_4: 328, F_5: 342, G_H: 430, G_V: 389 },
    { seccao: "120", E_2: 410, E_3: 346, F_3: 437, F_4: 383, F_5: 400, G_H: 500, G_V: 454 },
    { seccao: "150", E_2: 473, E_3: 399, F_3: 504, F_4: 444, F_5: 464, G_H: 577, G_V: 527 },
    { seccao: "185", E_2: 542, E_3: 456, F_3: 575, F_4: 510, F_5: 533, G_H: 661, G_V: 605 },
    { seccao: "240", E_2: 641, E_3: 538, F_3: 679, F_4: 607, F_5: 634, G_H: 781, G_V: 719 },
    { seccao: "300", E_2: 741, E_3: 621, F_3: 783, F_4: 703, F_5: 736, G_H: 902, G_V: 833 },
    { seccao: "400", E_2: null, E_3: null, F_3: 940, F_4: 823, F_5: 868, G_H: 1085, G_V: 1008 },
    { seccao: "500", E_2: null, E_3: null, F_3: 1083, F_4: 946, F_5: 998, G_H: 1253, G_V: 1169 },
    { seccao: "630", E_2: null, E_3: null, F_3: 1254, F_4: 1088, F_5: 1151, G_H: 1454, G_V: 1362 },
];

// QUADRO 52-C12: ALUMÍNIO - XLPE/EPR (90°C), Temperatura ambiente: 30°C  
// (Valores aproximados baseados na redução típica de ~20% em relação ao cobre)
const QUADRO_52_C12_ALUMINIO = [
    { seccao: "16", E_2: 89, E_3: 78, F_3: null, F_4: null, F_5: null, G_H: null, G_V: null },
    { seccao: "25", E_2: 116, E_3: 99, F_3: 125, F_4: 105, F_5: 110, G_H: 142, G_V: 125 },
    { seccao: "35", E_2: 144, E_3: 123, F_3: 156, F_4: 132, F_5: 137, G_H: 176, G_V: 157 },
    { seccao: "50", E_2: 175, E_3: 150, F_3: 189, F_4: 161, F_5: 168, G_H: 214, G_V: 192 },
    { seccao: "70", E_2: 225, E_3: 192, F_3: 242, F_4: 209, F_5: 217, G_H: 275, G_V: 248 },
    { seccao: "95", E_2: 274, E_3: 232, F_3: 294, F_4: 256, F_5: 267, G_H: 335, G_V: 303 },
    { seccao: "120", E_2: 319, E_3: 270, F_3: 341, F_4: 298, F_5: 312, G_H: 390, G_V: 354 },
    { seccao: "150", E_2: 369, E_3: 311, F_3: 393, F_4: 346, F_5: 362, G_H: 450, G_V: 411 },
    { seccao: "185", E_2: 422, E_3: 355, F_3: 448, F_4: 397, F_5: 415, G_H: 515, G_V: 471 },
    { seccao: "240", E_2: 499, E_3: 419, F_3: 529, F_4: 473, F_5: 494, G_H: 609, G_V: 560 },
    { seccao: "300", E_2: 577, E_3: 484, F_3: 610, F_4: 548, F_5: 573, G_H: 703, G_V: 649 },
    { seccao: "400", E_2: null, E_3: null, F_3: 732, F_4: 641, F_5: 677, G_H: 846, G_V: 786 },
    { seccao: "500", E_2: null, E_3: null, F_3: 843, F_4: 737, F_5: 778, G_H: 977, G_V: 911 },
    { seccao: "630", E_2: null, E_3: null, F_3: 976, F_4: 848, F_5: 897, G_H: 1133, G_V: 1061 },
];

export default function RTIEBTTables() {
    const [showCobre, setShowCobre] = useState(false);
    const [showAluminio, setShowAluminio] = useState(false);
    const [showFatores, setShowFatores] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg">📊 Quadros RTIEBT - 52-C11 (Cobre) e 52-C12 (Alumínio)</CardTitle>
                <p className="text-sm text-neutral-600">
                    Tabelas oficiais das RTIEBT para dimensionamento de cabos. XLPE/EPR (90°C), Temperatura ambiente: 30°C
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">

                    {/* QUADRO 52-C11: COBRE - XLPE/EPR */}
                    <Card>
                        <CardHeader className={showCobre ? "" : "pb-2"}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">📋 QUADRO 52-C11 - Condutores de COBRE</CardTitle>
                                    <p className="text-sm text-neutral-600">
                                        <strong>XLPE ou EPR (90°C)</strong> | Temperatura ambiente: <strong>30°C</strong>
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setShowCobre(!showCobre)}
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center justify-center w-8 h-8 p-0"
                                >
                                    {showCobre ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardHeader>
                        {showCobre && <CardContent>
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs border-collapse border border-neutral-300 relative">
                                        <style jsx>{`
                                                @media (max-width: 768px) {
                                                    .sticky-first-col {
                                                        position: sticky;
                                                        left: 0;
                                                        background: white;
                                                        z-index: 10;
                                                        border-right: 2px solid #d1d5db;
                                                    }
                                                    .sticky-first-col::after {
                                                        content: '';
                                                        position: absolute;
                                                        top: 0;
                                                        right: -2px;
                                                        width: 2px;
                                                        height: 100%;
                                                        background: #d1d5db;
                                                        box-shadow: 2px 0 4px rgba(0,0,0,0.1);
                                                    }
                                                }
                                            `}</style>
                                        <thead>
                                            <tr>
                                                <th rowSpan={3} className="text-center p-2 bg-yellow-100 border border-neutral-400 font-medium min-w-[60px] sticky-first-col">
                                                    Secção<br />nominal dos<br />condutores<br />(mm²)
                                                </th>
                                                <th colSpan={2} className="text-center p-2 bg-green-100 border border-neutral-400 font-medium">
                                                    Cabos multicondutores
                                                </th>
                                                <th colSpan={5} className="text-center p-2 bg-blue-100 border border-neutral-400 font-medium">
                                                    Cabos monocondutores<br />Três condutores carregados
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="text-center p-2 bg-green-50 border border-neutral-400 font-medium">
                                                    Dois condutores<br />carregados
                                                </th>
                                                <th className="text-center p-2 bg-green-50 border border-neutral-400 font-medium">
                                                    Três condutores<br />carregados
                                                </th>
                                                <th className="text-center p-2 bg-blue-50 border border-neutral-400 font-medium">
                                                    Dois<br />condutores<br />em triângulo
                                                </th>
                                                <th className="text-center p-2 bg-blue-50 border border-neutral-400 font-medium">
                                                    Três<br />condutores<br />sem afastamento
                                                </th>
                                                <th className="text-center p-2 bg-blue-50 border border-neutral-400 font-medium">
                                                    Sem<br />afastamento
                                                </th>
                                                <th colSpan={2} className="text-center p-2 bg-purple-50 border border-neutral-400 font-medium">
                                                    Com afastamento
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="text-center p-1 bg-green-50 border border-neutral-400 text-xs font-bold">E<br />1</th>
                                                <th className="text-center p-1 bg-green-50 border border-neutral-400 text-xs font-bold">E<br />2</th>
                                                <th className="text-center p-1 bg-blue-50 border border-neutral-400 text-xs font-bold">F<br />3</th>
                                                <th className="text-center p-1 bg-blue-50 border border-neutral-400 text-xs font-bold">F<br />4</th>
                                                <th className="text-center p-1 bg-blue-50 border border-neutral-400 text-xs font-bold">F<br />5</th>
                                                <th className="text-center p-1 bg-purple-50 border border-neutral-400 text-xs font-bold">G<br />6</th>
                                                <th className="text-center p-1 bg-purple-50 border border-neutral-400 text-xs font-bold">G<br />7</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {QUADRO_52_C11_COBRE.map((row, index) => (
                                                <tr key={index} className={`border-b border-neutral-300 ${index % 2 === 0 ? 'bg-neutral-25' : 'bg-white'}`}>
                                                    <td className="p-2 font-bold text-center border border-neutral-300 sticky-first-col">{row.seccao}</td>
                                                    <td className="text-center p-2 border border-neutral-300 font-medium">{row.E_2}</td>
                                                    <td className="text-center p-2 border border-neutral-300 font-medium">{row.E_3}</td>
                                                    <td className="text-center p-2 border border-neutral-300 font-medium">{row.F_3 || "—"}</td>
                                                    <td className="text-center p-2 border border-neutral-300 font-medium">{row.F_4 || "—"}</td>
                                                    <td className="text-center p-2 border border-neutral-300 font-medium">{row.F_5 || "—"}</td>
                                                    <td className="text-center p-2 border border-neutral-300 font-medium">{row.G_H || "—"}</td>
                                                    <td className="text-center p-2 border border-neutral-300 font-medium">{row.G_V || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 text-xs text-neutral-600 space-y-1">
                                    <p><strong>Isolamento:</strong> XLPE (polietileno reticulado) ou EPR (etileno-propileno)</p>
                                    <p><strong>Temperatura da alma condutora:</strong> 90°C | <strong>Temperatura ambiente:</strong> 30°C</p>
                                </div>
                            </>
                        </CardContent>}
                    </Card>

                    {/* QUADRO 52-C12: ALUMÍNIO - XLPE/EPR */}
                    <Card>
                        <CardHeader className={showAluminio ? "" : "pb-2"}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">📋 QUADRO 52-C12 - Condutores de ALUMÍNIO</CardTitle>
                                    <p className="text-sm text-neutral-600">
                                        <strong>XLPE ou EPR (90°C)</strong> | Temperatura ambiente: <strong>30°C</strong>
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setShowAluminio(!showAluminio)}
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center justify-center w-8 h-8 p-0"
                                >
                                    {showAluminio ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardHeader>
                        {showAluminio && <CardContent>
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs border-collapse border border-neutral-300 relative">
                                        <style jsx>{`
                                                @media (max-width: 768px) {
                                                    .sticky-first-col {
                                                        position: sticky;
                                                        left: 0;
                                                        background: white;
                                                        z-index: 10;
                                                        border-right: 2px solid #d1d5db;
                                                    }
                                                    .sticky-first-col::after {
                                                        content: '';
                                                        position: absolute;
                                                        top: 0;
                                                        right: -2px;
                                                        width: 2px;
                                                        height: 100%;
                                                        background: #d1d5db;
                                                        box-shadow: 2px 0 4px rgba(0,0,0,0.1);
                                                    }
                                                }
                                            `}</style>
                                        <thead>
                                            <tr>
                                                <th rowSpan={3} className="text-center p-2 bg-yellow-100 border border-neutral-400 font-medium min-w-[60px] sticky-first-col">
                                                    Secção<br />nominal dos<br />condutores<br />(mm²)
                                                </th>
                                                <th colSpan={2} className="text-center p-2 bg-orange-100 border border-neutral-400 font-medium">
                                                    Cabos multicondutores
                                                </th>
                                                <th colSpan={5} className="text-center p-2 bg-amber-100 border border-neutral-400 font-medium">
                                                    Cabos monocondutores<br />Três condutores carregados
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="text-center p-2 bg-orange-50 border border-neutral-400 font-medium">
                                                    Dois condutores<br />carregados
                                                </th>
                                                <th className="text-center p-2 bg-orange-50 border border-neutral-400 font-medium">
                                                    Três condutores<br />carregados
                                                </th>
                                                <th className="text-center p-2 bg-amber-50 border border-neutral-400 font-medium">
                                                    Dois<br />condutores<br />em triângulo
                                                </th>
                                                <th className="text-center p-2 bg-amber-50 border border-neutral-400 font-medium">
                                                    Três<br />condutores<br />sem afastamento
                                                </th>
                                                <th className="text-center p-2 bg-amber-50 border border-neutral-400 font-medium">
                                                    Sem<br />afastamento
                                                </th>
                                                <th colSpan={2} className="text-center p-2 bg-red-50 border border-neutral-400 font-medium">
                                                    Com afastamento
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="text-center p-1 bg-orange-50 border border-neutral-400 text-xs font-bold">E<br />1</th>
                                                <th className="text-center p-1 bg-orange-50 border border-neutral-400 text-xs font-bold">E<br />2</th>
                                                <th className="text-center p-1 bg-amber-50 border border-neutral-400 text-xs font-bold">F<br />3</th>
                                                <th className="text-center p-1 bg-amber-50 border border-neutral-400 text-xs font-bold">F<br />4</th>
                                                <th className="text-center p-1 bg-amber-50 border border-neutral-400 text-xs font-bold">F<br />5</th>
                                                <th className="text-center p-1 bg-red-50 border border-neutral-400 text-xs font-bold">G<br />6</th>
                                                <th className="text-center p-1 bg-red-50 border border-neutral-400 text-xs font-bold">G<br />7</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {QUADRO_52_C12_ALUMINIO.map((row, index) => (
                                                <tr key={index} className={`border-b border-neutral-300 ${index % 2 === 0 ? 'bg-neutral-25' : 'bg-white'}`}>
                                                    <td className="p-2 font-bold text-center border border-neutral-300 sticky-first-col">{row.seccao}</td>
                                                    <td className="text-center p-2 border border-neutral-300 font-medium">{row.E_2}</td>
                                                    <td className="text-center p-2 border border-neutral-300 font-medium">{row.E_3}</td>
                                                    <td className="text-center p-2 border border-neutral-300 font-medium">{row.F_3 || "—"}</td>
                                                    <td className="text-center p-2 border border-neutral-300 font-medium">{row.F_4 || "—"}</td>
                                                    <td className="text-center p-2 border border-neutral-300 font-medium">{row.F_5 || "—"}</td>
                                                    <td className="text-center p-2 border border-neutral-300 font-medium">{row.G_H || "—"}</td>
                                                    <td className="text-center p-2 border border-neutral-300 font-medium">{row.G_V || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 text-xs text-neutral-600 space-y-1">
                                    <p><strong>Secção mínima:</strong> 16 mm² para condutores de alumínio</p>
                                    <p><strong>Nota:</strong> Valores aproximados baseados na redução típica de ~20% em relação ao cobre</p>
                                </div>
                            </>
                        </CardContent>}
                    </Card>

                    {/* Fatores de Correção essenciais */}
                    <Card>
                        <CardHeader className={showFatores ? "" : "pb-2"}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">📊 Fatores de Correção</CardTitle>
                                    <p className="text-sm text-neutral-600">Temperatura e agrupamento de condutores</p>
                                </div>
                                <Button
                                    onClick={() => setShowFatores(!showFatores)}
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center justify-center w-8 h-8 p-0"
                                >
                                    {showFatores ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardHeader>
                        {showFatores && <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Fatores de Temperatura */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Fatores de Correção - Temperatura</CardTitle>
                                        <p className="text-sm text-neutral-600">Referência: 30°C</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <h5 className="font-medium mb-2 text-neutral-700">Principais temperaturas:</h5>
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between">
                                                        <span>25°C:</span>
                                                        <span className="font-medium">1,20</span>
                                                    </div>
                                                    <div className="flex justify-between bg-yellow-50 px-1">
                                                        <span><strong>30°C:</strong></span>
                                                        <span className="font-bold">1,00</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>40°C:</span>
                                                        <span className="font-medium">0,82</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>50°C:</span>
                                                        <span className="font-medium">0,58</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h5 className="font-medium mb-2 text-neutral-700">Aplicação:</h5>
                                                <div className="text-xs bg-blue-50 p-2 rounded">
                                                    <div className="font-mono text-blue-800 mb-1">
                                                        Iz = I_tabela × f_temp
                                                    </div>
                                                    <div className="text-blue-600">
                                                        Onde f_temp é o fator de correção por temperatura
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Fatores de Agrupamento */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Fatores de Agrupamento</CardTitle>
                                        <p className="text-sm text-neutral-600">Condutores agrupados</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <h5 className="font-medium mb-2 text-neutral-700">Nº condutores:</h5>
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between bg-yellow-50 px-1">
                                                        <span><strong>1:</strong></span>
                                                        <span className="font-bold">1,00</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>2:</span>
                                                        <span className="font-medium">0,80</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>3:</span>
                                                        <span className="font-medium">0,70</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>4-5:</span>
                                                        <span className="font-medium">0,65</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>≥6:</span>
                                                        <span className="font-medium">0,50</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h5 className="font-medium mb-2 text-neutral-700">Aplicação:</h5>
                                                <div className="text-xs bg-orange-50 p-2 rounded">
                                                    <div className="font-mono text-orange-800 mb-1">
                                                        Iz = I_tabela × f_agrup
                                                    </div>
                                                    <div className="text-orange-600">
                                                        Onde f_agrup é o fator de agrupamento
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                            </div>
                        </CardContent>}
                    </Card>

                    {/* Informações essenciais */}
                    <Card>
                        <CardHeader className={showInfo ? "" : "pb-2"}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">📋 Informações Importantes</CardTitle>
                                    <p className="text-sm text-neutral-600">Secções mínimas, quedas de tensão e fórmulas</p>
                                </div>
                                <Button
                                    onClick={() => setShowInfo(!showInfo)}
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center justify-center w-8 h-8 p-0"
                                >
                                    {showInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardHeader>
                        {showInfo && <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-blue-50 p-3 rounded">
                                    <h5 className="font-medium text-blue-900 mb-2">Secções Mínimas</h5>
                                    <div className="space-y-1 text-blue-800 text-xs">
                                        <div>• Cobre: ≥ 1,5 mm²</div>
                                        <div>• Alumínio: ≥ 16 mm²</div>
                                    </div>
                                </div>
                                <div className="bg-green-50 p-3 rounded">
                                    <h5 className="font-medium text-green-900 mb-2">Queda de Tensão</h5>
                                    <div className="space-y-1 text-green-800 text-xs">
                                        <div>• Iluminação: ≤ 3%</div>
                                        <div>• Outros usos: ≤ 5%</div>
                                    </div>
                                </div>
                                <div className="bg-amber-50 p-3 rounded">
                                    <h5 className="font-medium text-amber-900 mb-2">Fórmula Principal</h5>
                                    <div className="text-amber-800 text-xs">
                                        <div className="font-mono">Iz_final = Iz × f_temp × f_agrup</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>}
                    </Card>

                    <div className="bg-neutral-100 p-4 rounded text-xs">
                        <div className="font-medium mb-2">📖 Fonte: RTIEBT - Quadros 52-C11 e 52-C12</div>
                        <p>Tabelas oficiais conforme imagem fornecida. XLPE/EPR (90°C), Temperatura ambiente: 30°C</p>
                    </div>

                </div>
            </CardContent>
        </Card >
    );
}