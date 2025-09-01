import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://projeto-circuitos.vercel.app'

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${baseUrl}/dimensionamento-cabos`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/calculos-sombras`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
    ]
}

