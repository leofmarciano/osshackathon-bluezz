-- Manifesto versions table
CREATE TABLE manifesto_versions (
    id BIGSERIAL PRIMARY KEY,
    version_number INT NOT NULL,
    content TEXT NOT NULL, -- Markdown content
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN DEFAULT FALSE,
    proposal_id BIGINT -- Reference to the proposal that created this version
);

-- Manifesto proposals table
CREATE TABLE manifesto_proposals (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    new_content TEXT NOT NULL, -- Proposed new markdown content
    previous_version_id BIGINT REFERENCES manifesto_versions(id),
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'voting', -- voting, approved, rejected, expired
    votes_yes INT DEFAULT 0,
    votes_no INT DEFAULT 0,
    votes_abstain INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 60 days from creation
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE
);

-- Votes table
CREATE TABLE manifesto_votes (
    id BIGSERIAL PRIMARY KEY,
    proposal_id BIGINT REFERENCES manifesto_proposals(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    vote_type VARCHAR(10) NOT NULL, -- yes, no, abstain
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proposal_id, user_id)
);

-- Indexes
CREATE INDEX idx_manifesto_versions_current ON manifesto_versions(is_current) WHERE is_current = true;
CREATE INDEX idx_manifesto_versions_created ON manifesto_versions(created_at DESC);
CREATE INDEX idx_manifesto_proposals_status ON manifesto_proposals(status);
CREATE INDEX idx_manifesto_proposals_expires ON manifesto_proposals(expires_at);
CREATE INDEX idx_manifesto_votes_proposal ON manifesto_votes(proposal_id);
CREATE INDEX idx_manifesto_votes_user ON manifesto_votes(user_id);

-- Insert initial manifesto version
INSERT INTO manifesto_versions (
    version_number, 
    content, 
    author_id, 
    author_name, 
    is_current
) VALUES (
    1,
    '# Manifesto Bluezz

## Nossa Missão

Mobilizar a comunidade global para limpar e proteger os oceanos através de transparência radical, tecnologia e ação coletiva.

## Nossos Valores

### 1. Transparência Total
Cada centavo doado é rastreável. Cada decisão é pública. Cada resultado é auditável.

### 2. Governança Democrática
A comunidade decide. Não há hierarquia. Cada voz tem o mesmo peso.

### 3. Baseado em Ciência
Nossas ações são guiadas por evidências científicas e dados reais, não por opiniões.

### 4. Inclusão e Diversidade
Oceanos não têm fronteiras. Nossa comunidade também não.

### 5. Ação Direta
Menos burocracia, mais resultados. Identificamos, votamos e agimos.

## Nossos Compromissos

### Com os Doadores
- 100% de transparência financeira
- Direito a voto em todas as decisões
- Relatórios detalhados de impacto
- Acesso total aos dados

### Com os Oceanos
- Priorizar ações de alto impacto
- Medir e reportar resultados reais
- Usar tecnologia para maximizar eficiência
- Colaborar com comunidades locais

### Com as ONGs Parceiras
- Processo justo e transparente de seleção
- Pagamento rápido após aprovação
- Suporte além do financeiro
- Reconhecimento público do trabalho

## Metas 2024

1. **Remover 1000 toneladas de plástico dos oceanos**
2. **Engajar 100.000 pessoas na governança**
3. **Estabelecer 50 parcerias com ONGs locais**
4. **Desenvolver IA para detecção de poluição em tempo real**
5. **Criar fundo de emergência para desastres marinhos**

## Como Participar

1. **Vote** nas propostas ativas
2. **Proponha** mudanças e melhorias
3. **Doe** para projetos aprovados
4. **Compartilhe** nossa missão
5. **Contribua** com código, design ou ideias

## Transparência Financeira

Todos os nossos dados financeiros são públicos e auditáveis:
- Contratos com ONGs
- Custos operacionais
- Resultados de limpeza
- Métricas de impacto

## Tecnologia Open Source

Todo nosso código é aberto:
- GitHub: [github.com/bluezz](https://github.com/bluezz)
- Licença: MIT
- Contribuições são bem-vindas

---

*Este manifesto é um documento vivo. Pode ser alterado através de votação comunitária.*

*Última atualização: Janeiro 2024*',
    'system',
    'Sistema Bluezz',
    true
);