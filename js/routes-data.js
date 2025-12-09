/*
  routes-data.js

  Define um único objeto global `RoutesDB` que contém:
  - `routes`: array de objetos { origin, destination, distanceInKm }
    (origin/destination são strings com cidade + estado, ex: "São Paulo, SP")
  - `getAllCities()`: retorna um array único e ordenado de nomes de cidades
  - `findDistance(origin, destination)`: procura a distância entre duas cidades

  Observações:
  - As distâncias são valores aproximados em quilômetros e destinam-se a fins demonstrativos.
  - A busca em `findDistance` normaliza entradas (trim + lowercase) e verifica as duas direções.
  - Este arquivo define exatamente uma variável global: `RoutesDB`.
*/

var RoutesDB = (function(){
  'use strict';

  // Lista de rotas (30-40 entradas populares/regionais entre cidades brasileiras)
  var routes = [
    { origin: 'São Paulo, SP', destination: 'Rio de Janeiro, RJ', distanceInKm: 430 },
    { origin: 'São Paulo, SP', destination: 'Brasília, DF', distanceInKm: 1016 },
    { origin: 'Rio de Janeiro, RJ', destination: 'Brasília, DF', distanceInKm: 1148 },
    { origin: 'São Paulo, SP', destination: 'Campinas, SP', distanceInKm: 95 },
    { origin: 'Rio de Janeiro, RJ', destination: 'Niterói, RJ', distanceInKm: 13 },
    { origin: 'Belo Horizonte, MG', destination: 'Ouro Preto, MG', distanceInKm: 100 },
    { origin: 'Salvador, BA', destination: 'Feira de Santana, BA', distanceInKm: 108 },
    { origin: 'Fortaleza, CE', destination: 'Sobral, CE', distanceInKm: 230 },
    { origin: 'Recife, PE', destination: 'Olinda, PE', distanceInKm: 10 },
    { origin: 'Natal, RN', destination: 'Mossoró, RN', distanceInKm: 280 },
    { origin: 'João Pessoa, PB', destination: 'Campina Grande, PB', distanceInKm: 120 },
    { origin: 'Maceió, AL', destination: 'Aracaju, SE', distanceInKm: 270 },
    { origin: 'Manaus, AM', destination: 'Belém, PA', distanceInKm: 1120 },
    { origin: 'Belém, PA', destination: 'Macapá, AP', distanceInKm: 520 },
    { origin: 'Curitiba, PR', destination: 'Florianópolis, SC', distanceInKm: 300 },
    { origin: 'Porto Alegre, RS', destination: 'Florianópolis, SC', distanceInKm: 470 },
    { origin: 'Vitória, ES', destination: 'Belo Horizonte, MG', distanceInKm: 520 },
    { origin: 'Goiânia, GO', destination: 'Brasília, DF', distanceInKm: 209 },
    { origin: 'Cuiabá, MT', destination: 'Campo Grande, MS', distanceInKm: 880 },
    { origin: 'Campinas, SP', destination: 'Santos, SP', distanceInKm: 143 },
    { origin: 'Santos, SP', destination: 'São Paulo, SP', distanceInKm: 72 },
    { origin: 'Ribeirão Preto, SP', destination: 'São Paulo, SP', distanceInKm: 313 },
    { origin: 'Uberlândia, MG', destination: 'Uberaba, MG', distanceInKm: 130 },
    { origin: 'Rio de Janeiro, RJ', destination: 'Belo Horizonte, MG', distanceInKm: 434 },
    { origin: 'Salvador, BA', destination: 'Recife, PE', distanceInKm: 800 },
    { origin: 'Recife, PE', destination: 'João Pessoa, PB', distanceInKm: 120 },
    { origin: 'Maceió, AL', destination: 'Recife, PE', distanceInKm: 250 },
    { origin: 'Aracaju, SE', destination: 'Salvador, BA', distanceInKm: 330 },
    { origin: 'Palmas, TO', destination: 'Brasília, DF', distanceInKm: 733 },
    { origin: 'Teresina, PI', destination: 'Fortaleza, CE', distanceInKm: 530 },
    { origin: 'São Luís, MA', destination: 'Teresina, PI', distanceInKm: 430 },
    { origin: 'Chapecó, SC', destination: 'Florianópolis, SC', distanceInKm: 640 },
    { origin: 'Porto Velho, RO', destination: 'Manaus, AM', distanceInKm: 1120 },
    { origin: 'Boa Vista, RR', destination: 'Macapá, AP', distanceInKm: 920 },
    { origin: 'Belém, PA', destination: 'Recife, PE', distanceInKm: 1200 }
  ];

  /*
    Retorna array de nomes de cidades (strings) extraídas de origin e destination,
    sem duplicatas e ordenadas alfabeticamente (pt-BR).
  */
  function getAllCities(){
    var set = new Set();
    routes.forEach(function(r){
      if(r.origin) set.add(r.origin);
      if(r.destination) set.add(r.destination);
    });
    var arr = Array.from(set);
    arr.sort(function(a,b){ return a.localeCompare(b, 'pt-BR'); });
    return arr;
  }

  /*
    Procura a distância entre duas cidades. Normaliza entradas (trim + lowercase)
    e busca rotas em ambas as direções. Retorna número (km) ou null.
  */
  function findDistance(origin, destination){
    if(!origin || !destination) return null;
    var o = origin.trim().toLowerCase();
    var d = destination.trim().toLowerCase();

    for(var i=0;i<routes.length;i++){
      var r = routes[i];
      var ro = (r.origin || '').trim().toLowerCase();
      var rd = (r.destination || '').trim().toLowerCase();
      if((ro === o && rd === d) || (ro === d && rd === o)){
        return r.distanceInKm;
      }
    }
    return null;
  }

  /*
    Coordenadas (lat, lon) para cidades conhecidas. Chaves normalizadas (trim + lowercase).
    Essa lista inclui capitais e grandes centros; pode ser expandida conforme necessário.
  */
  var cityCoords = (function(){
    var c = {
      'são paulo, sp': {lat:-23.55052, lon:-46.633308},
      'sao paulo, sp': {lat:-23.55052, lon:-46.633308},
      'rio de janeiro, rj': {lat:-22.906847, lon:-43.172896},
      'brasilia, df': {lat:-15.793889, lon:-47.882778},
      'salvador, ba': {lat:-12.977749, lon:-38.50163},
      'curitiba, pr': {lat:-25.428954, lon:-49.267137},
      'belo horizonte, mg': {lat:-19.916681, lon:-43.934493},
      'porto alegre, rs': {lat:-30.027708, lon:-51.228734},
      'recife, pe': {lat:-8.047562, lon:-34.877 },
      'fortaleza, ce': {lat:-3.71722, lon:-38.5434},
      'manaus, am': {lat:-3.119027, lon:-60.021731},
      'belem, pa': {lat:-1.455833, lon:-48.503887},
      'goiânia, go': {lat:-16.686891, lon:-49.2648},
      'campo grande, ms': {lat:-20.468684, lon:-54.620121},
      'cuiabá, mt': {lat:-15.601416, lon:-56.097892},
      'joão pessoa, pb': {lat:-7.119495, lon:-34.845011},
      'teresina, pi': {lat:-5.091944, lon:-42.803472},
      'maceió, al': {lat:-9.665992, lon:-35.735},
      'aracaju, se': {lat:-10.947246, lon:-37.073082},
      'palmas, to': {lat:-10.162038, lon:-48.331375},
      'campinas, sp': {lat: -22.90556, lon: -47.06083},
      'ribeirão preto, sp': {lat: -21.1775, lon: -47.8103},
      'uberlândia, mg': {lat:-18.9126, lon:-48.2754},
      'porto velho, ro': {lat:-8.76077, lon:-63.8999},
      'boa vista, rr': {lat:2.8196, lon:-60.6738},
      'macapá, ap': {lat:0.0354, lon:-51.0705},
      'niterói, rj': {lat:-22.8832, lon:-43.1037},
      'ouro preto, mg': {lat:-20.3856, lon:-43.5033},
      'feira de santana, ba': {lat:-12.2669, lon:-38.9667},
      'sobral, ce': {lat:-3.6869, lon:-40.3486},
      'olinda, pe': {lat:-8.0089, lon:-34.8550},
      'mossoró, rn': {lat:-5.187, lon:-37.344},
      'campina grande, pb': {lat:-7.2306, lon:-35.8819},
      'são luís, ma': {lat:-2.5307, lon:-44.3068}
    };
    return c;
  })();

  function getCoordsFromMap(name){
    if(!name) return null;
    var key = name.trim().toLowerCase();
    return cityCoords[key] || null;
  }

  /*
    Estima distância por estrada entre duas cidades usando heurística:
    - Se rota exata estiver em `routes`, retorna { distance, method: 'db' }
    - Senão, se existir coordenadas para ambas as cidades, calcula Haversine e aplica multiplicador
      baseado na distância e em heurísticas regionais.
    - Retorna objeto: { distance: Number (km), method: 'estimate'|'db'|'haversine' }
  */
  function estimateRoadDistance(origin, destination){
    // tentar rota cadastrada
    var d = findDistance(origin, destination);
    if(d !== null) return { distance: d, method: 'db' };

    var a = getCoordsFromMap(origin);
    var b = getCoordsFromMap(destination);
    if(a && b){
      // Haversine
      function toRad(deg){ return deg * Math.PI / 180; }
      function hav(a,b){
        var R = 6371;
        var dLat = toRad(b.lat - a.lat);
        var dLon = toRad(b.lon - a.lon);
        var lat1 = toRad(a.lat);
        var lat2 = toRad(b.lat);
        var sinDlat = Math.sin(dLat/2);
        var sinDlon = Math.sin(dLon/2);
        var h = sinDlat*sinDlat + Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon;
        return 2*R*Math.asin(Math.sqrt(h));
      }
      var straight = hav(a,b);

      // heurística para multiplicador de estrada
      var factor = 1.12; // default
      if(straight < 20) factor = 1.10;
      else if(straight < 50) factor = 1.12;
      else if(straight < 200) factor = 1.18;
      else if(straight < 800) factor = 1.12;
      else factor = 1.08;

      // regiões remotas (Norte) podem ter factor maior — checar aproximação simples por latitudes
      var northThreshold = -5; // lat > -5 is roughly north/northeast
      if(a.lat > northThreshold || b.lat > northThreshold){
        // aumentar o fator quando um dos pontos estiver em latitudes mais ao norte
        factor = Math.max(factor, 1.25);
      }

      var estimated = Math.round(straight * factor);
      return { distance: estimated, method: 'estimate' };
    }

    // sem dados suficientes, retornar null
    return { distance: null, method: 'unknown' };
  }

  // Expor API pública como propriedades do objeto global RoutesDB
  return {
    routes: routes,
    cityCoords: cityCoords,
    getAllCities: getAllCities,
    findDistance: findDistance,
    estimateRoadDistance: estimateRoadDistance
  };

})();
