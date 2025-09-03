import { api } from "encore.dev/api";
import { announcementsDB } from "./db";

interface SeedResponse {
  success: boolean;
  count: number;
}

// Seeds the database with sample announcements and translations (restricted endpoint).
export const seed = api<void, SeedResponse>(
  { expose: true, method: "POST", path: "/announcements/seed" },
  async () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const sampleAnnouncements = [
      {
        slug: "limpeza-oleo-nordeste",
        title: "Limpeza da Mancha de Óleo - Nordeste",
        description: "Projeto emergencial para remoção de óleo que atingiu as praias do Nordeste brasileiro, focando na recuperação da vida marinha local",
        content: `# Projeto de Limpeza de Óleo no Nordeste

## Situação Atual

As praias do Nordeste brasileiro foram severamente afetadas por manchas de óleo que comprometem todo o ecossistema marinho local. Este projeto visa a remoção completa do óleo e a recuperação da vida marinha.

## Objetivos

- Remoção de 95% do óleo das praias afetadas
- Recuperação da fauna marinha local
- Implementação de medidas preventivas

## Metodologia

Utilizaremos tecnologia de ponta para:
1. Identificação precisa das áreas afetadas
2. Remoção segura do óleo
3. Tratamento da fauna afetada
4. Monitoramento contínuo

## Impacto Esperado

Com este projeto, esperamos restaurar completamente o ecossistema marinho da região em um prazo de 6 meses.`,
        category: "oil",
        location: "Bahia, Brasil",
        organizationName: "ONG Mar Limpo",
        organizationDescription: "Organização dedicada à preservação dos oceanos com mais de 15 anos de experiência em limpeza marinha.",
        goalAmount: 150000,
        raisedAmount: 89000,
        backersCount: 234,
        imageUrl: "/images/oil-cleanup.jpg",
        translations: {
          en: {
            title: "Oil Spill Cleanup - Northeast Brazil",
            description: "Emergency project to remove oil that has affected Northeast Brazilian beaches, focusing on local marine life recovery",
            content: `# Northeast Oil Cleanup Project

## Current Situation

Northeast Brazilian beaches have been severely affected by oil spills that compromise the entire local marine ecosystem. This project aims for complete oil removal and marine life recovery.

## Objectives

- Remove 95% of oil from affected beaches
- Recover local marine fauna
- Implement preventive measures

## Methodology

We will use cutting-edge technology to:
1. Precisely identify affected areas
2. Safely remove oil
3. Treat affected fauna
4. Continuous monitoring

## Expected Impact

With this project, we expect to completely restore the region's marine ecosystem within 6 months.`
          }
        }
      },
      {
        slug: "coleta-plastico-atlantico",
        title: "Coleta de Plástico no Oceano Atlântico",
        description: "Iniciativa inovadora para coleta e reciclagem de plástico acumulado no oceano usando embarcações especializadas",
        content: `# Coleta de Plástico no Oceano Atlântico

## O Problema

Milhões de toneladas de plástico são despejadas no oceano anualmente, criando ilhas de lixo que prejudicam a vida marinha.

## Nossa Solução

### Tecnologia Avançada
- Embarcações especializadas com redes de coleta
- Sistema de separação automática de resíduos
- Reciclagem imediata a bordo

### Processo de Coleta
1. **Identificação**: Uso de satélites para localizar concentrações de plástico
2. **Coleta**: Embarcações coletam o material sem prejudicar a vida marinha
3. **Processamento**: Separação e processamento para reciclagem
4. **Destinação**: Transformação em novos produtos

## Resultados Esperados

- Coleta de 500 toneladas de plástico
- Reciclagem de 90% do material coletado
- Proteção de milhares de animais marinhos`,
        category: "plastic",
        location: "Rio de Janeiro, Brasil",
        organizationName: "Instituto Oceano Azul",
        organizationDescription: "Instituto focado em tecnologia marinha sustentável e inovação em limpeza oceânica.",
        goalAmount: 200000,
        raisedAmount: 145000,
        backersCount: 567,
        imageUrl: "/images/plastic-cleanup.jpg",
        translations: {
          en: {
            title: "Atlantic Ocean Plastic Collection",
            description: "Innovative initiative for collecting and recycling plastic accumulated in the ocean using specialized vessels",
            content: `# Atlantic Ocean Plastic Collection

## The Problem

Millions of tons of plastic are dumped into the ocean annually, creating garbage islands that harm marine life.

## Our Solution

### Advanced Technology
- Specialized vessels with collection nets
- Automatic waste separation system
- Immediate onboard recycling

### Collection Process
1. **Identification**: Use of satellites to locate plastic concentrations
2. **Collection**: Vessels collect material without harming marine life
3. **Processing**: Separation and processing for recycling
4. **Destination**: Transformation into new products

## Expected Results

- Collection of 500 tons of plastic
- Recycling of 90% of collected material
- Protection of thousands of marine animals`
          }
        }
      },
      {
        slug: "barreira-anti-poluicao",
        title: "Barreira Anti-Poluição Marinha",
        description: "Instalação de barreiras flutuantes para impedir que resíduos urbanos cheguem ao mar através dos rios",
        content: `# Barreira Anti-Poluição Marinha

## Prevenção é a Chave

Ao invés de apenas limpar a poluição existente, este projeto foca na prevenção, instalando barreiras que impedem que novos resíduos cheguem ao oceano.

## Como Funciona

### Sistema de Barreiras
- Barreiras flutuantes nos principais rios
- Coleta automática de resíduos
- Manutenção regular e monitoramento

### Benefícios
- **Prevenção**: Impede que 80% dos resíduos cheguem ao mar
- **Sustentabilidade**: Solução de longo prazo
- **Custo-efetividade**: Mais barato que limpeza oceânica

## Localizações

As barreiras serão instaladas em:
- Rio Tietê (São Paulo)
- Rio Guandu (Rio de Janeiro)
- Rio Capibaribe (Pernambuco)

## Monitoramento

Sistema de IoT para monitoramento em tempo real da eficácia das barreiras.`,
        category: "prevention",
        location: "São Paulo, Brasil",
        organizationName: "Fundação Águas Limpas",
        organizationDescription: "Fundação especializada em soluções preventivas para poluição aquática.",
        goalAmount: 75000,
        raisedAmount: 32000,
        backersCount: 128,
        imageUrl: "/images/barrier.jpg",
        translations: {
          en: {
            title: "Marine Anti-Pollution Barrier",
            description: "Installation of floating barriers to prevent urban waste from reaching the sea through rivers",
            content: `# Marine Anti-Pollution Barrier

## Prevention is Key

Instead of just cleaning existing pollution, this project focuses on prevention, installing barriers that prevent new waste from reaching the ocean.

## How It Works

### Barrier System
- Floating barriers in main rivers
- Automatic waste collection
- Regular maintenance and monitoring

### Benefits
- **Prevention**: Prevents 80% of waste from reaching the sea
- **Sustainability**: Long-term solution
- **Cost-effectiveness**: Cheaper than ocean cleanup

## Locations

Barriers will be installed in:
- Tietê River (São Paulo)
- Guandu River (Rio de Janeiro)
- Capibaribe River (Pernambuco)

## Monitoring

IoT system for real-time monitoring of barrier effectiveness.`
          }
        }
      },
      {
        slug: "recuperacao-corais-noronha",
        title: "Recuperação de Corais - Fernando de Noronha",
        description: "Projeto de reflorestamento marinho e recuperação de recifes de corais degradados pela poluição",
        content: `# Recuperação de Corais em Fernando de Noronha

## A Importância dos Corais

Os recifes de coral são fundamentais para a biodiversidade marinha, abrigando 25% de todas as espécies marinhas.

## Estado Atual

Os recifes de Fernando de Noronha sofreram branqueamento devido ao aquecimento global e poluição, perdendo 40% de sua cobertura.

## Plano de Recuperação

### Fase 1: Diagnóstico
- Mapeamento completo dos recifes
- Análise da qualidade da água
- Identificação das espécies afetadas

### Fase 2: Cultivo
- Cultivo de corais em laboratório
- Seleção de espécies resistentes
- Testes de adaptação

### Fase 3: Transplante
- Transplante gradual de corais jovens
- Monitoramento constante
- Ajustes conforme necessário

## Impacto

- Recuperação de 10 hectares de recife
- Restauração de 50 espécies de coral
- Proteção de centenas de espécies marinhas`,
        category: "restoration",
        location: "Pernambuco, Brasil",
        organizationName: "Centro de Pesquisa Marinha",
        organizationDescription: "Centro de excelência em pesquisa e conservação marinha, com foco em ecossistemas de recife.",
        goalAmount: 300000,
        raisedAmount: 180000,
        backersCount: 445,
        imageUrl: "/images/coral-restoration.jpg",
        translations: {
          en: {
            title: "Coral Recovery - Fernando de Noronha",
            description: "Marine reforestation project and recovery of coral reefs degraded by pollution",
            content: `# Coral Recovery in Fernando de Noronha

## The Importance of Corals

Coral reefs are fundamental to marine biodiversity, hosting 25% of all marine species.

## Current State

Fernando de Noronha reefs have suffered bleaching due to global warming and pollution, losing 40% of their coverage.

## Recovery Plan

### Phase 1: Diagnosis
- Complete reef mapping
- Water quality analysis
- Identification of affected species

### Phase 2: Cultivation
- Laboratory coral cultivation
- Selection of resistant species
- Adaptation tests

### Phase 3: Transplantation
- Gradual transplantation of young corals
- Constant monitoring
- Adjustments as needed

## Impact

- Recovery of 10 hectares of reef
- Restoration of 50 coral species
- Protection of hundreds of marine species`
          }
        }
      },
      {
        slug: "microplasticos-lagoa-patos",
        title: "Limpeza de Microplásticos - Lagoa dos Patos",
        description: "Tecnologia avançada para remoção de microplásticos em ecossistemas lagunares do sul do Brasil",
        content: `# Remoção de Microplásticos na Lagoa dos Patos

## O Desafio dos Microplásticos

Microplásticos são uma ameaça invisível que contamina toda a cadeia alimentar marinha.

## Tecnologia Inovadora

### Sistema de Filtração
- Filtros ultrafinos capazes de capturar partículas menores que 1mm
- Processamento contínuo da água
- Separação por densidade e tamanho

### Características do Sistema
- **Capacidade**: 10.000 litros/hora
- **Eficiência**: 99.5% de remoção
- **Impacto mínimo**: Não afeta microorganismos benéficos

## Área de Atuação

A Lagoa dos Patos é o segundo maior complexo lagunar do mundo e fundamental para:
- Pesca local
- Turismo
- Biodiversidade

## Resultados Esperados

- Remoção de 95% dos microplásticos
- Melhoria da qualidade da água
- Proteção da fauna aquática local
- Desenvolvimento de protocolo replicável`,
        category: "plastic",
        location: "Rio Grande do Sul, Brasil",
        organizationName: "EcoTech Solutions",
        organizationDescription: "Empresa de tecnologia ambiental especializada em soluções inovadoras para poluição aquática.",
        goalAmount: 120000,
        raisedAmount: 45000,
        backersCount: 89,
        imageUrl: "/images/microplastics.jpg",
        translations: {
          en: {
            title: "Microplastics Cleanup - Lagoa dos Patos",
            description: "Advanced technology for removing microplastics in lagoon ecosystems of southern Brazil",
            content: `# Microplastics Removal in Lagoa dos Patos

## The Microplastics Challenge

Microplastics are an invisible threat that contaminates the entire marine food chain.

## Innovative Technology

### Filtration System
- Ultra-fine filters capable of capturing particles smaller than 1mm
- Continuous water processing
- Separation by density and size

### System Characteristics
- **Capacity**: 10,000 liters/hour
- **Efficiency**: 99.5% removal
- **Minimal impact**: Does not affect beneficial microorganisms

## Area of Operation

Lagoa dos Patos is the world's second largest lagoon complex and fundamental for:
- Local fishing
- Tourism
- Biodiversity

## Expected Results

- Removal of 95% of microplastics
- Improvement of water quality
- Protection of local aquatic fauna
- Development of replicable protocol`
          }
        }
      }
    ];

    let insertedCount = 0;

    for (const announcement of sampleAnnouncements) {
      try {
        // Insert the main announcement
        const announcementRow = await announcementsDB.queryRow<{ id: number }>`
          INSERT INTO announcements (
            slug,
            title,
            description,
            content,
            category,
            location,
            organization_name,
            organization_description,
            goal_amount,
            raised_amount,
            backers_count,
            image_url,
            published,
            created_at,
            updated_at,
            campaign_end_date,
            default_language
          ) VALUES (
            ${announcement.slug},
            ${announcement.title},
            ${announcement.description},
            ${announcement.content},
            ${announcement.category},
            ${announcement.location},
            ${announcement.organizationName},
            ${announcement.organizationDescription},
            ${announcement.goalAmount},
            ${announcement.raisedAmount},
            ${announcement.backersCount},
            ${announcement.imageUrl},
            true,
            ${now},
            ${now},
            ${futureDate},
            'pt'
          )
          ON CONFLICT (slug) DO UPDATE SET
            raised_amount = EXCLUDED.raised_amount,
            backers_count = EXCLUDED.backers_count
          RETURNING id
        `;

        if (announcementRow) {
          // Insert Portuguese translation (default)
          await announcementsDB.exec`
            INSERT INTO announcement_translations (
              announcement_id,
              language,
              title,
              description,
              content,
              created_at,
              updated_at
            ) VALUES (
              ${announcementRow.id},
              'pt',
              ${announcement.title},
              ${announcement.description},
              ${announcement.content},
              ${now},
              ${now}
            )
            ON CONFLICT (announcement_id, language) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              content = EXCLUDED.content,
              updated_at = EXCLUDED.updated_at
          `;

          // Insert English translations if available
          if (announcement.translations?.en) {
            await announcementsDB.exec`
              INSERT INTO announcement_translations (
                announcement_id,
                language,
                title,
                description,
                content,
                created_at,
                updated_at
              ) VALUES (
                ${announcementRow.id},
                'en',
                ${announcement.translations.en.title},
                ${announcement.translations.en.description},
                ${announcement.translations.en.content},
                ${now},
                ${now}
              )
              ON CONFLICT (announcement_id, language) DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                content = EXCLUDED.content,
                updated_at = EXCLUDED.updated_at
            `;
          }

          insertedCount++;
        }
      } catch (error) {
        console.error(`Failed to insert announcement ${announcement.slug}:`, error);
      }
    }

    return {
      success: true,
      count: insertedCount,
    };
  }
);
