"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * ShadeExcelForm
 *
 * Formulário inspirado no layout do Excel fornecido, com campos editáveis:
 * - Latitude (graus, minutos, segundos)
 * - b, Beta, alfa (editáveis)
 * - h, gama (calculados automaticamente)
 *
 * Saídas calculadas automaticamente:
 * - d1 = h / tan(γ - α)
 * - d  = b * cos(β) + d1
 *
 * Notas:
 * - As unidades são: metros para b, h, d1, d; graus para ângulos.
 * - O cálculo é geométrico simplificado e pode ser ajustado conforme o seu Excel.
 */
const schema = z.object({
    latDeg: z.number().int().min(-90).max(90),
    latMin: z.number().int().min(0).max(59),
    latSec: z.number().int().min(0).max(59),
    b: z.number().positive(),
    beta: z.number().min(0).max(90),
    alfa: z.number().min(-90).max(90),
});

type FormValues = z.infer<typeof schema>;

function toRadians(deg: number) {
    return (deg * Math.PI) / 180;
}

export default function ShadeExcelForm({ onResult }: { onResult?: (result: { d1: number; d: number }) => void }) {
    const [coordinateString, setCoordinateString] = useState("");
    const [convertedCoords, setConvertedCoords] = useState<{
        lat: { deg: number; min: number; sec: number };
        lon: { deg: number; min: number; sec: number };
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            latDeg: 0,
            latMin: 0,
            latSec: 0,
            b: 0,
            beta: 0,
            alfa: 0,
        },
        mode: "onChange",
    });



    // Função para aplicar a latitude convertida ao formulário
    const applyToForm = (latDMS: { deg: number; min: number; sec: number }) => {
        form.setValue("latDeg", latDMS.deg);
        form.setValue("latMin", latDMS.min);
        form.setValue("latSec", latDMS.sec);
    };

    // Função para processar coordenadas coladas diretamente
    const processCoordinateString = () => {
        const trimmed = coordinateString.trim();
        const match = trimmed.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);

        if (match) {
            const lat = parseFloat(match[1]);
            const lon = parseFloat(match[2]);

            // Converter automaticamente
            if (!isNaN(lat) && !isNaN(lon)) {
                if (lat < -90 || lat > 90) {
                    alert("Latitude deve estar entre -90 e 90 graus");
                    return;
                }
                if (lon < -180 || lon > 180) {
                    alert("Longitude deve estar entre -180 e 180 graus");
                    return;
                }

                const convertDecimalToDMS = (decimal: number) => {
                    const absDecimal = Math.abs(decimal);
                    const deg = Math.floor(absDecimal);
                    const minDecimal = (absDecimal - deg) * 60;
                    const min = Math.floor(minDecimal);
                    const sec = Math.round((minDecimal - min) * 60);

                    return { deg: decimal < 0 ? -deg : deg, min, sec };
                };

                const latDMS = convertDecimalToDMS(lat);
                const lonDMS = convertDecimalToDMS(lon);

                setConvertedCoords({ lat: latDMS, lon: lonDMS });
            }
        } else {
            alert("Formato inválido. Use: latitude, longitude (ex: 41.216016576977566, -8.386656780738283)");
        }
    };

    const values = form.watch();

    // Cálculos automáticos (em tempo real) apenas para h e gama
    const { gama, h } = useMemo(() => {
        const latDeg = values.latDeg ?? 0;
        const latMin = values.latMin ?? 0;
        const latSec = values.latSec ?? 0;
        const sign = Math.sign(latDeg || 0) || 1;
        const absLat = Math.abs(latDeg) + latMin / 60 + latSec / 3600;
        const latitudeDeg = sign < 0 ? -absLat : absLat;

        // Solstício de inverno ao meio‑dia: γ ≈ 90 − |latitude − (−23.44)|
        const declinationWinter = -23.44;
        const gama = Math.max(0, 90 - Math.abs(latitudeDeg - declinationWinter));

        const b = values.b ?? 0;
        const beta = values.beta ?? 0;

        // Altura do painel em função de b e β
        const h = b * Math.sin(toRadians(beta));
        return { gama, h };
    }, [values]);

    function onSubmit(v: FormValues) {
        console.log("Form submitted with values:", v);

        const alfa = v.alfa ?? 0;
        const beta = v.beta ?? 0;
        const b = v.b ?? 0;

        console.log("Calculated values:", { alfa, beta, b, gama, h });

        // Fórmulas fornecidas
        const spacingOffset = 0.2;
        const denom = Math.tan(toRadians(gama - alfa));
        const core = Number.isFinite(denom) && Math.abs(denom) > 1e-6 ? h / denom : NaN;
        const d1 = Number.isFinite(core) ? core + spacingOffset : NaN;
        const d = d1 + Math.cos(toRadians(beta)) * b;

        const calcResult = { d1, d };
        console.log("Calculation result:", calcResult);

        onResult?.(calcResult);
    }

    const fmt = (n: number) => (Number.isFinite(n) ? n.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "–");

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Entrada de Parâmetros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 flex flex-col items-center">
                    {/* Conversor de Coordenadas */}
                    <div className="w-full max-w-md rounded-md overflow-hidden border border-neutral-300 shadow-sm">
                        <div className="bg-blue-900 text-white text-sm font-semibold px-3 py-2 flex items-center gap-2">
                            <span>🌍</span>
                            Conversor de Coordenadas
                        </div>
                        <div className="p-4 space-y-4">
                            {/* Método 1: Colar coordenadas diretamente */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Colar Coordenadas
                                </label>
                                <div className="text-xs text-neutral-500 mb-2">
                                    Cole as coordenadas no formato: latitude, longitude
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="41.216016576977566, -8.386656780738283"
                                        value={coordinateString}
                                        onChange={(e) => setCoordinateString(e.target.value)}
                                        className="text-sm flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={processCoordinateString}
                                        size="sm"
                                        className="whitespace-nowrap"
                                    >
                                        Processar
                                    </Button>
                                </div>
                            </div>



                            {convertedCoords && (
                                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                    <div className="text-sm font-medium text-green-800 mb-3 flex items-center gap-1">
                                        <span>✅</span>
                                        Latitude Convertida
                                    </div>
                                    <div className="text-xs text-green-700">
                                        <div className="bg-white p-2 rounded border border-green-200">
                                            <div className="font-medium">Latitude:</div>
                                            <div className="font-mono">{convertedCoords.lat.deg}° {convertedCoords.lat.min}&apos; {convertedCoords.lat.sec}&quot;</div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => applyToForm(convertedCoords.lat)}
                                        className="mt-3 w-full"
                                        size="sm"
                                        variant="outline"
                                    >
                                        📍 Aplicar Latitude ao Formulário
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Latitude */}
                    <div className="w-full max-w-md rounded-md overflow-hidden border border-neutral-300 shadow-sm">
                        <div className="bg-neutral-900 text-white text-sm font-semibold px-3 py-2">Latitude</div>
                        <div className="grid grid-cols-3">
                            <div className="flex items-center justify-center bg-neutral-100 text-sm py-2 border-r border-neutral-200">o</div>
                            <div className="flex items-center justify-center bg-neutral-100 text-sm py-2 border-r border-neutral-200">&apos;</div>
                            <div className="flex items-center justify-center bg-neutral-100 text-sm py-2">&apos;&apos;</div>
                        </div>
                        <div className="grid grid-cols-3 divide-x divide-neutral-200">
                            {/* Graus */}
                            <div className="p-2 bg-white">
                                <Input
                                    type="number"
                                    {...form.register("latDeg", { valueAsNumber: true })}
                                    className="h-10 text-center border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                />
                            </div>
                            {/* Minutos */}
                            <div className="p-2 bg-white">
                                <Input
                                    type="number"
                                    {...form.register("latMin", { valueAsNumber: true })}
                                    className="h-10 text-center border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                />
                            </div>
                            {/* Segundos */}
                            <div className="p-2 bg-white">
                                <Input
                                    type="number"
                                    {...form.register("latSec", { valueAsNumber: true })}
                                    className="h-10 text-center border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Parâmetros */}
                    <div className="w-full max-w-md rounded-md overflow-hidden border border-neutral-300 shadow-sm">
                        <div className="grid grid-cols-[90px_1fr_50px]">
                            {/* b (editável) */}
                            <div className="bg-neutral-200 text-neutral-900 px-3 py-3 text-sm font-semibold border-b border-neutral-200 flex items-center">b</div>
                            <div className="bg-white hover:bg-neutral-50 px-3 py-2 border-b border-neutral-200 border-r border-neutral-200 flex items-center">
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...form.register("b", { valueAsNumber: true })}
                                    className="h-10 text-center border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent font-medium"
                                />
                            </div>
                            <div className="bg-neutral-50 px-3 py-3 text-sm text-neutral-600 flex items-center justify-center border-b border-neutral-200 font-medium">m</div>

                            {/* Beta (editável) */}
                            <div className="bg-neutral-200 text-neutral-900 px-3 py-3 text-sm font-semibold border-b border-neutral-200 flex items-center">Beta</div>
                            <div className="bg-white hover:bg-neutral-50 px-3 py-2 border-b border-neutral-200 border-r border-neutral-200 flex items-center">
                                <Input
                                    type="number"
                                    {...form.register("beta", { valueAsNumber: true })}
                                    className="h-10 text-center border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent font-medium"
                                />
                            </div>
                            <div className="bg-neutral-50 px-3 py-3 text-sm text-neutral-600 flex items-center justify-center border-b border-neutral-200 font-medium">°</div>

                            {/* h (calculado) */}
                            <div className="bg-neutral-200 text-neutral-900 px-3 py-3 text-sm font-semibold border-b border-neutral-200 flex items-center">h</div>
                            <div className="bg-neutral-100 px-3 py-3 border-b border-neutral-200 border-r border-neutral-200 text-center text-sm font-semibold text-neutral-800 flex items-center justify-center">
                                {fmt(h)}
                            </div>
                            <div className="bg-neutral-50 px-3 py-3 text-sm text-neutral-600 flex items-center justify-center border-b border-neutral-200 font-medium">m</div>

                            {/* alfa (editável) */}
                            <div className="bg-neutral-200 text-neutral-900 px-3 py-3 text-sm font-semibold border-b border-neutral-200 flex items-center">alfa</div>
                            <div className="bg-white hover:bg-neutral-50 px-3 py-2 border-b border-neutral-200 border-r border-neutral-200 flex items-center">
                                <Input
                                    type="number"
                                    {...form.register("alfa", { valueAsNumber: true })}
                                    className="h-10 text-center border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent font-medium"
                                />
                            </div>
                            <div className="bg-neutral-50 px-3 py-3 text-sm text-neutral-600 flex items-center justify-center border-b border-neutral-200 font-medium">°</div>

                            {/* gama (calculado) */}
                            <div className="bg-neutral-200 text-neutral-900 px-3 py-3 text-sm font-semibold flex items-center">gama</div>
                            <div className="bg-neutral-100 px-3 py-3 text-center text-sm font-semibold text-neutral-800 border-r border-neutral-200 flex items-center justify-center">
                                {fmt(gama)}
                            </div>
                            <div className="bg-neutral-50 px-3 py-3 text-sm text-neutral-600 flex items-center justify-center font-medium">°</div>


                        </div>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Button type="submit">Calcular</Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}

// Componente separado para os resultados (para ser usado na página principal)
export function ResultsDisplay({ result }: { result: { d1: number; d: number } }) {
    const fmt = (n: number) => (Number.isFinite(n) ? n.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "–");

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* d1 */}
                    <div className="rounded-md overflow-hidden border border-neutral-300">
                        <div className="bg-neutral-200 text-neutral-900 px-3 py-2 text-center font-semibold">d1</div>
                        <div className="bg-emerald-50 text-emerald-800 px-3 py-4 text-center">
                            <div className="text-2xl font-semibold">{fmt(result.d1)}</div>
                            <div className="text-xs text-neutral-600 mt-1">metros</div>
                        </div>
                    </div>

                    {/* d */}
                    <div className="rounded-md overflow-hidden border border-neutral-300">
                        <div className="bg-neutral-200 text-neutral-900 px-3 py-2 text-center font-semibold">d</div>
                        <div className="bg-emerald-50 text-emerald-800 px-3 py-4 text-center">
                            <div className="text-2xl font-semibold">{fmt(result.d)}</div>
                            <div className="text-xs text-neutral-600 mt-1">metros</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
