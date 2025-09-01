"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import base Swiper styles (required for proper rendering)
import "swiper/css";
import "swiper/css/pagination";

/**
 * HeroSlider
 *
 * Componente de cabeçalho com slider semelhante ao impacto visual do site de referência.
 * - Usa Swiper para criar slides com texto e CTA.
 * - Autoplay + paginação clicável para melhor UX.
 */
export function HeroSlider() {
    // Lista de slides: conteúdo e estilos de fundo
    const slides: Array<{
        title: string;
        description: string;
        ctaLabel: string;
        ctaHref: string;
        bgClassName: string;
    }> = [
            {
                title: "Pronto para descarbonizar?",
                description:
                    "Ferramentas para dimensionamento e análise com foco na eficiência e na transição energética.",
                ctaLabel: "Dimensionamento de Cabos",
                ctaHref: "/dimensionamento-cabos",
                bgClassName:
                    "bg-gradient-to-br from-emerald-50 via-white to-emerald-100",
            },
            {
                title: "Simule o sombreamento",
                description:
                    "Avalie o impacto de sombras e otimize a produção em sistemas fotovoltaicos.",
                ctaLabel: "Cálculos de Sombras",
                ctaHref: "/calculos-sombras",
                bgClassName:
                    "bg-gradient-to-br from-sky-50 via-white to-sky-100",
            },
        ];

    return (
        <section aria-label="Hero com slides" className="relative">
            {/* Wrapper com altura responsiva inspirada no hero do site de referência */}
            <div className="relative h-[52svh] min-h-[420px] w-full overflow-hidden">
                {/* Slider principal */}
                <Swiper
                    modules={[Autoplay, Pagination]}
                    // Autoplay suave que pausa na interação
                    autoplay={{ delay: 4500, disableOnInteraction: true }}
                    loop
                    pagination={{ clickable: true }}
                    className="h-full"
                >
                    {/* Renderização dos slides */}
                    {slides.map((slide) => (
                        <SwiperSlide key={slide.title}>
                            {/* Fundo do slide com gradiente, pode ser substituído por imagem no futuro */}
                            <div className={`h-full w-full ${slide.bgClassName}`}>
                                {/* Camada de conteúdo centralizado e legível */}
                                <div className="mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                                    <div className="max-w-2xl">
                                        {/* Título do slide */}
                                        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
                                            {slide.title}
                                        </h1>
                                        {/* Descrição do slide */}
                                        <p className="mt-3 text-sm sm:text-base text-neutral-700">
                                            {slide.description}
                                        </p>
                                        {/* Botão/Link de ação para navegar até à ferramenta */}
                                        <div className="mt-6">
                                            <Link
                                                href={slide.ctaHref}
                                                className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-white text-sm font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                                            >
                                                {slide.ctaLabel}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}

export default HeroSlider;



