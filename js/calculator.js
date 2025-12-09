/*
  calculator.js

  Define um único objeto global `Calculator` com funções para calcular emissões,
  comparar modos, estimar economia e créditos de carbono com base em `CONFIG`.

  Métodos:
  - calculateEmission(distanceKm, transportMode)
  - calculateAllModes(distanceKm)
  - calculateSavings(emission, baselineEmission)
  - calculateCarbonCredits(emissionKg)
  - estimateCreditPrice(credits)

  Observações:
  - Este arquivo assume que existe um objeto global `CONFIG` com as propriedades
    `EMISSION_FACTORS` e `CARBON_CREDIT` (ver `js/config.js`).
*/

var Calculator = (function(){
  'use strict';

  function safeNumber(v){
    var n = Number(v);
    return isNaN(n) ? 0 : n;
  }

  function round(value, decimals){
    decimals = typeof decimals === 'number' ? decimals : 2;
    var pow = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * pow) / pow;
  }

  /*
    Calcula a emissão (kg CO2) dada a distância em km e o modo de transporte.
    - Pega o fator em CONFIG.EMISSION_FACTORS[transportMode]
    - Calcula distanceKm * factor
    - Retorna número arredondado a 2 casas (ou null se o modo não existir)
  */
  function calculateEmission(distanceKm, transportMode){
    if(typeof CONFIG === 'undefined' || !CONFIG.EMISSION_FACTORS) return null;
    var factor = CONFIG.EMISSION_FACTORS[transportMode];
    if(factor === undefined) return null;
    var d = safeNumber(distanceKm);
    var emission = d * Number(factor);
    return round(emission, 2);
  }

  /*
    Calcula emissões para todos os modos definidos em CONFIG.EMISSION_FACTORS.
    - Retorna array de objetos: { mode, emission, percentageVsCar }
    - percentageVsCar = (emission / carEmission) * 100; carEmission usado como baseline
    - Se carEmission for zero, percentage será null para evitar divisão por zero
    - Array ordenado por `emission` (menor primeiro)
  */
  function calculateAllModes(distanceKm){
    if(typeof CONFIG === 'undefined' || !CONFIG.EMISSION_FACTORS) return [];
    var modes = Object.keys(CONFIG.EMISSION_FACTORS || {});
    var results = [];
    var carEmission = null;
    // calcular emissões
    modes.forEach(function(mode){
      var emission = calculateEmission(distanceKm, mode);
      if(mode === 'car') carEmission = emission;
      results.push({ mode: mode, emission: emission });
    });

    // calcular percentuais vs carro
    results = results.map(function(r){
      var pct = null;
      if(carEmission !== null && carEmission !== 0 && r.emission !== null){
        pct = round((r.emission / carEmission) * 100, 2);
      } else if(carEmission === 0 && r.emission !== null){
        pct = (r.emission === 0) ? 100 : null; // se ambos zero, 100%, senão indefinido
      }
      return { mode: r.mode, emission: r.emission, percentageVsCar: pct };
    });

    // ordenar por emissão (ascendente), tratando nulls como grandes valores
    results.sort(function(a,b){
      var va = (a.emission === null) ? Number.POSITIVE_INFINITY : a.emission;
      var vb = (b.emission === null) ? Number.POSITIVE_INFINITY : b.emission;
      return va - vb;
    });

    return results;
  }

  /*
    Calcula economia entre uma emissão e uma baseline (kg CO2)
    - savedKg = baselineEmission - emission
    - percentage = (savedKg / baselineEmission) * 100
    - Retorna { savedKg, percentage } com valores arredondados a 2 casas
    - Se baselineEmission for 0, percentage é null
  */
  function calculateSavings(emission, baselineEmission){
    var e = safeNumber(emission);
    var b = safeNumber(baselineEmission);
    var saved = b - e;
    var pct = null;
    if(b !== 0){
      pct = round((saved / b) * 100, 2);
    }
    return { savedKg: round(saved, 2), percentage: pct };
  }

  /*
    Converte emissão (kg) em créditos de carbono segundo CONFIG.CARBON_CREDIT.KG_PER_CREDIT
    - Retorna número com 4 casas decimais
    - Se CONFIG ou valor não estiverem definidos, retorna null
  */
  function calculateCarbonCredits(emissionKg){
    if(typeof CONFIG === 'undefined' || !CONFIG.CARBON_CREDIT) return null;
    var kgPer = safeNumber(CONFIG.CARBON_CREDIT.KG_PER_CREDIT);
    if(kgPer === 0) return null;
    var e = safeNumber(emissionKg);
    var credits = e / kgPer;
    return round(credits, 4);
  }

  /*
    Estima o preço dos créditos:
    - min = credits * PRICE_MIN_BRL
    - max = credits * PRICE_MAX_BRL
    - average = (min + max) / 2
    - Retorna números arredondados a 2 casas
  */
  function estimateCreditPrice(credits){
    if(typeof CONFIG === 'undefined' || !CONFIG.CARBON_CREDIT) return null;
    var c = safeNumber(credits);
    var minP = safeNumber(CONFIG.CARBON_CREDIT.PRICE_MIN_BRL);
    var maxP = safeNumber(CONFIG.CARBON_CREDIT.PRICE_MAX_BRL);
    var min = c * minP;
    var max = c * maxP;
    var avg = (min + max) / 2;
    return { min: round(min,2), max: round(max,2), average: round(avg,2) };
  }

  // API pública
  return {
    calculateEmission: calculateEmission,
    calculateAllModes: calculateAllModes,
    calculateSavings: calculateSavings,
    calculateCarbonCredits: calculateCarbonCredits,
    estimateCreditPrice: estimateCreditPrice
  };

})();
