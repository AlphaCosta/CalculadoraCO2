
# Calculadora de Emissão de Carbono

Projeto simples em HTML, CSS e JavaScript para estimar emissões de CO₂ de viagens. Este repositório foi atualizado com interface responsiva, tema claro-verde, scripts de cálculo e uma base de rotas (`RoutesDB`) com distâncias pré-definidas.

**Funcionalidade principal**
- Formulário para calcular emissões por viagem: origem, destino, distância (calculada automaticamente ou inserida manualmente) e meio de transporte.
- Cálculo da emissão em kg CO₂ usando fatores por km (valores aproximados).

**Principais arquivos e responsabilidades**
- `index.html`: interface do usuário — formulário, botão de cálculo e área de resultado.
- `css/style.css`: tema visual (fundo degradê verde-claro, texto em preto, botões pretos com texto branco, estilos responsivos).
- `js/app.js`: lógica do formulário — habilita/desabilita distância manual, calcula distância aproximada (quando possível) e exibe emissões.
- `js/routes-data.js`: define o objeto global `RoutesDB` com uma lista de rotas brasileiras (origin, destination, distanceInKm) e métodos:
  - `RoutesDB.getAllCities()` — retorna lista única e ordenada de todas as cidades presentes nas rotas.
  - `RoutesDB.findDistance(origin, destination)` — retorna distância (km) entre duas cidades, buscando em ambas direções (normaliza entradas).

**Como executar**

- Opção rápida (abrir localmente):
  - Abra `index.html` no navegador (duplo-clique).

- Opção recomendada (servidor local):
  - No PowerShell, execute:

```powershell
cd "d:\00 - Cursos de programação\DIO\Carbon-caculator"
python -m http.server 8000
```

  - Abra `http://localhost:8000` no navegador.

**Uso da aplicação**
- Preencha `Cidade de Origem` e `Cidade de Destino`.
- Por padrão, o app tenta calcular automaticamente a distância quando ambas as cidades existem no `RoutesDB` (lookup interno) ou em um conjunto limitado de cidades reconhecidas pelo `js/app.js`.
- Se a distância não puder ser determinada automaticamente, marque a checkbox `Inserir distância manualmente` e informe a distância em km.
- Selecione o `meio de transporte` e clique em `Calcular Emissão`.

**Exemplos**
- No console do navegador, você pode usar o `RoutesDB` diretamente:
  - `RoutesDB.getAllCities()` — lista as cidades conhecidas.
  - `RoutesDB.findDistance('São Paulo, SP', 'Rio de Janeiro, RJ')` // → 430

**Observações técnicas**
- As distâncias no `RoutesDB` são aproximadas e coletadas para demonstração (muitas vêm de referências comuns). Para distâncias precisas, integre uma API de geocodificação / roteamento (ex.: Nominatim, OpenRouteService, Google Maps).
- O cálculo automático adicional em `js/app.js` usa uma lista reduzida de coordenadas e Haversine para estimativas quando disponível.

- Para melhorar precisão sem APIs: o projeto agora inclui uma heurística local (em `RoutesDB.estimateRoadDistance`) que usa coordenadas de cidades conhecidas, calcula a distância em linha reta (Haversine) e aplica um multiplicador adaptativo para estimar distância por estrada. Isso reduz a dependência de APIs externas e fornece estimativas melhores para a maioria das rotas.

- A UI indica quando a distância exibida é uma "estimativa" (ao lado do valor). Para rotas exatas presentes em `RoutesDB.routes`, a origem é marcada como rota em banco de dados.

**Contribuição**
- Sugestões de melhoria:
  - Expandir `RoutesDB` com mais rotas e distâncias verificadas.
  - Integrar geocoding/route API para cálculo preciso de distância entre qualquer par de cidades.
  - Adicionar testes automatizados e validação de entrada no front-end.

Abra uma issue ou envie um PR com alterações e descrições claras.

**Licença**
- Adicione um arquivo `LICENSE` com a licença desejada (ex.: MIT) se quiser tornar o projeto reutilizável publicamente.

---

Se quiser, eu posso integrar `RoutesDB` ao `js/app.js` para que o cálculo automático use `RoutesDB.findDistance()` primeiro — deseja que eu faça essa integração agora?
