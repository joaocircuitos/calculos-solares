import Link from "next/link";
import { Metadata } from "next";
import HeroSlider from "@/components/home/HeroSlider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Projeto Circuitos - Ferramentas Profissionais de Engenharia Elétrica",
  description: "Plataforma profissional com ferramentas especializadas para dimensionamento de cabos elétricos conforme RTIEBT e cálculos precisos de sombras em sistemas fotovoltaicos.",
  openGraph: {
    title: "Projeto Circuitos - Ferramentas de Engenharia Elétrica",
    description: "Plataforma profissional com ferramentas especializadas para engenheiros eletrotécnicos",
  },
};

export default function Home() {
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Projeto Circuitos",
            "description": "Ferramentas profissionais para dimensionamento de cabos elétricos e cálculos de sombras",
            "url": "https://calculos-solares.vercel.app",
            "applicationCategory": "EngineeringApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            },
            "creator": {
              "@type": "Organization",
              "name": "Circuitos Energy Solutions"
            }
          })
        }}
      />

      <div className="flex flex-col">
        {/* Hero com Swiper para destaque das ferramentas principais */}
        <HeroSlider />

        {/* Seção introdutória com CTA para as duas páginas principais */}
        <section className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Ferramentas Profissionais de Engenharia Elétrica
            </h1>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Plataforma especializada com ferramentas avançadas para dimensionamento de cabos elétricos
              conforme RTIEBT e cálculos precisos de sombras em sistemas fotovoltaicos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card: Dimensionamento de Cabos */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <span className="text-2xl">📊</span>
                </div>
                <CardTitle className="text-xl">Dimensionamento de Cabos Elétricos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-6">
                  Ferramenta profissional para dimensionamento de cabos conforme regulamentação RTIEBT.
                  Calcule automaticamente secções, quedas de tensão e valide condições de segurança.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-neutral-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Conformidade com RTIEBT
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Quadros 52-C11 e 52-C12
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Cálculos automáticos
                  </div>
                </div>
                <Link
                  href="/dimensionamento-cabos"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Acessar Ferramenta
                  <span className="ml-2">→</span>
                </Link>
              </CardContent>
            </Card>

            {/* Card: Cálculos de Sombras */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-amber-200">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                  <span className="text-2xl">🌤️</span>
                </div>
                <CardTitle className="text-xl">Cálculos de Sombras Fotovoltaicas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-6">
                  Ferramenta especializada para análise de sombreamento em sistemas fotovoltaicos.
                  Determine distâncias ótimas entre fileiras e minimize perdas de produção.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-neutral-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Cálculos geométricos precisos
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Otimização de layout
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Interface intuitiva
                  </div>
                </div>
                <Link
                  href="/calculos-sombras"
                  className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Acessar Ferramenta
                  <span className="ml-2">→</span>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Seção sobre a empresa */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Sobre o Projeto Circuitos
            </h2>
            <p className="text-neutral-600 max-w-3xl mx-auto">
              Desenvolvido pela <strong>Circuitos Energy Solutions</strong>, esta plataforma oferece
              ferramentas especializadas para profissionais da área de engenharia elétrica e sistemas
              fotovoltaicos. Todas as calculadoras seguem normas técnicas rigorosas e são constantemente
              atualizadas para garantir precisão e conformidade.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
