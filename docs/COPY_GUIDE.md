# Guia de copy · BORA Growth

Vale para todo texto visível da apresentação: manchetes, ledes, rótulos, tags, tooltips, células de tabela, notas, `alt` e `aria-label`.

## Nome e enquadramento

- A apresentação é **BORA Growth · Pack de Ações e Projetos**. Nunca escreva "BORA Network".
- O conceito de rede de comunidades é **Rede BORA** (como na North Star "Rede BORA ativa").
- O pack é uma **proposta**: as ações de growth que o Alex faria de dentro da BORA, se aprovado. **Nada está rodando hoje** ("tudo está congelado, só estou apresentando a ideia que tivemos"). Nenhum texto pode parecer projeto em andamento.
- Cada ação tem uma fase, que é ordem proposta, não execução:
  - **Fase 1**: primeiros 30 dias, se a proposta for aprovada.
  - **Fase 2**: de 31 a 90 dias, depois da base pronta.
  - **Ideia**: só vira projeto se um teste pequeno bater a meta.
- Fase de cada ação (fonte única: `stage` em `src/content/projects.ts`, chaves `agora` / `depois` / `ideia`):
  - Fase 1: BORA ID, CRM + tracking, BORA OPEN, Programa de indicação, Landing por cidade, Conteúdo por intenção, Mídia paga, Preço único, Pré-cadastro com plano, Brasília Lab.
  - Fase 2: BORA OS, BORA CAPTAINS, Programa de influenciadores, BORA POWERED, BORA HOUSE, BORA CHALLENGES, BORA ENTERPRISE.
  - Ideia: BORA PASS, BORA BOOST, BORA LEAGUE, Playbook de cidade, Pipeline de expansão.
- Tom de proposta: "a proposta é", "se aprovado", "faríamos", "o primeiro passo seria". Proibido: "rodando", "em execução", "em andamento", "estamos fazendo", "começamos", "lançamos", "já temos" para ações do pack.
- Fatos reais da BORA de hoje continuam, separados da proposta: o Coaching que ela vende, os números do site com fonte, o modelo atual de crescimento.
- Para mostrar a fase, use o componente `StageTag` (`<StageTag of="open" />`), não `Tag kind="proposed"`.

## Sem travessões

- **Proibido** o travessão (—) e o meio-traço com espaços ( – ) em qualquer texto visível.
- Troque por: ponto final (duas frases), vírgula, dois-pontos, parênteses ou "e".
  - "Não é coaching grátis — é comunidade." vira "Não é coaching grátis. É comunidade."
  - "Mídia — amplifica, não sustenta" vira "Mídia: amplifica, não sustenta"
- Em rótulos compostos, use o ponto médio: "Simulação · dados demo".
- Célula sem valor em tabela: use "·" ou "sem dado", nunca "—".
- Intervalos: em texto corrido, "0 a 30 dias"; em rótulos curtos, use `horizonLabel()` de `projects.ts`.
- Hífen em palavra composta continua certo: pré-cadastro, check-in, e-commerce.
- Comentários de código podem ter travessão; o que o público vê, não.

## Voz

- Português do Brasil natural, direto, para a diretoria da BORA: frases curtas, voz ativa, concreto.
- A voz da BORA no site é curta e afirmativa ("Não é sobre ser rápido. É sobre começar."). Use o contraste "Não é X. É Y." com parcimônia: no máximo em algumas manchetes, não em todo slide.
- Evite jargão quando houver palavra simples: "alavancar", "sinergia", "potencializar", "robusto", "disruptivo", "jornada" (use "caminho" ou "percurso" quando der), "no fim do dia".
- Sem ponto de exclamação. Sem emojis.
- Títulos e frases em caixa normal (maiúsculas só via CSS em rótulos).
- Nomes de produto em maiúsculas: BORA OPEN, BORA POWERED, BORA PASS… Na frase, pode abreviar: "o Open", "o PASS".
- Glossário: BORA ID · Coaching (o produto) · assessoria (o negócio) · corredor (pessoa que corre) · atleta (quem treina com a BORA) · check-in · pré-cadastro.

## Honestidade (do brief, inegociável)

- Nunca apresentar hipótese como dado real.
- Nunca inventar clientes, receita, CAC ou parceiros.
- Exemplos, simulações e números ilustrativos sempre marcados (Exemplo, Exemplo fictício, Ilustrativo, Simulação, Dados demo, Hipótese, Conceito).
- Fatos da BORA só com fonte (ex.: "Números declarados pela BORA em boraassessoria.com").

## Ficha da ação (`plain`, `why`, `howTo`)

- `plain`: o que é, numa frase em português simples, sem jargão ("Treinos abertos e gratuitos, toda semana, com check-in.").
- `why`: por que importa, sem prometer resultado ("Traz corredores novos sem anúncio, e cada um vira uma relação.").
- `howTo`: três passos concretos, no infinitivo. Para ideias, são passos de validação ("Convidar 50 corredores para testar por dois meses."). Plano, nunca resultado.
- Notas de fase: sempre proposta ("Proposta para os primeiros 30 dias: começaria com ficha, meta e dono."). Nunca "em execução", "funcionou" ou "deu certo".

## Restrições de layout (não quebre o slide)

- Cada item de `headline` (SplitHeadline) precisa caber em **uma** linha visual a 1440×900. Ao reescrever, mantenha o mesmo tamanho ou menor e confira com print.
- Não aumente textos de células, pills e rótulos curtos; prefira encurtar.
- Depois de mexer na copy, capture o slide (1440×900 e 1920×1080) e confira quebras.
