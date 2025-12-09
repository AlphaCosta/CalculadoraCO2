// Lógica básica para toggle de distância, cálculo aproximado via lookup + Haversine
(function(){
  // `app.js` agora delega totalmente ao RoutesDB para estimativas de distância.

  const manualCheckbox = document.getElementById('manualDistance');
  const distanceInput = document.getElementById('distance');
  const originInput = document.getElementById('origin');
  const destInput = document.getElementById('destination');
  const transportSelect = document.getElementById('transport');
  const resultBox = document.getElementById('result');
  const calcBtn = document.getElementById('calculateBtn');

  manualCheckbox.addEventListener('change', function(){
    if(this.checked){
      distanceInput.removeAttribute('readonly');
      distanceInput.focus();
      distanceInput.placeholder = 'Insira a distância em km';
    } else {
      distanceInput.setAttribute('readonly','');
      distanceInput.value = '';
      distanceInput.placeholder = 'Será calculada automaticamente';
    }
  });

  // Atualiza distância automaticamente quando origem/destino mudam (se não estiver em modo manual)
  function updateAutoDistance(){
    if(manualCheckbox.checked) return; // não sobrescrever entrada manual
    var origin = originInput.value.trim();
    var dest = destInput.value.trim();
    distanceInput.value = '';
    window.__distanceEstimation = null;
    if(!origin || !dest) return;

    // usar apenas RoutesDB.estimateRoadDistance
    if(typeof RoutesDB !== 'undefined' && RoutesDB && typeof RoutesDB.estimateRoadDistance === 'function'){
      try{
        var est = RoutesDB.estimateRoadDistance(origin, dest);
        if(est && est.distance !== null){
          distanceInput.value = est.distance;
          window.__distanceEstimation = est.method || 'estimate';
          return;
        }
      }catch(e){ console.warn('RoutesDB.estimateRoadDistance error', e); }
    }
    // sem dados, manter vazio — o cálculo tentará novamente no clique
  }

  originInput.addEventListener('change', updateAutoDistance);
  destInput.addEventListener('change', updateAutoDistance);



  function formatKg(n){
    if(n === null || n === undefined) return '—';
    return Number(n).toLocaleString('pt-BR', {maximumFractionDigits:2, minimumFractionDigits:2});
  }

  function formatCurrency(n){
    return Number(n).toLocaleString('pt-BR', {style:'currency', currency:'BRL', minimumFractionDigits:2});
  }

  calcBtn.addEventListener('click', function(){
    resultBox.style.display = 'none';
    const origin = originInput.value.trim();
    const dest = destInput.value.trim();
    let distance = null;

    if(manualCheckbox.checked){
      const v = parseFloat(distanceInput.value);
      if(isNaN(v) || v <= 0){
        resultBox.style.display = '';
        resultBox.innerHTML = '<strong>Informe uma distância válida (km).</strong>';
        return;
      }
      distance = v;
    } else {
      // obter distância apenas via RoutesDB.estimateRoadDistance
      if(typeof RoutesDB !== 'undefined' && RoutesDB && typeof RoutesDB.estimateRoadDistance === 'function'){
        try{
          var est = RoutesDB.estimateRoadDistance(origin, dest);
          if(est && est.distance !== null){
            distance = est.distance;
            distanceInput.value = distance; // mostrar estimada
            window.__distanceEstimation = est.method || 'estimate';
          }
        }catch(e){ console.warn('RoutesDB.estimateRoadDistance error', e); }
      }

      if(distance === null || distance === undefined){
        resultBox.style.display = '';
        resultBox.innerHTML = '<strong>Não foi possível calcular automaticamente a distância entre as cidades informadas.</strong><br/>Por favor, marque "Inserir distância manualmente" e insira a distância em km.';
        return;
      }
    }

    // modo selecionado compatível com CONFIG keys
    const transport = transportSelect.value;

    // calcular emissão principal
    var mainEmission = null;
    if(typeof Calculator !== 'undefined'){
      mainEmission = Calculator.calculateEmission(distance, transport);
    } else {
      // fallback simples: tentar usar CONFIG factor
      var factor = (typeof CONFIG !== 'undefined' && CONFIG.EMISSION_FACTORS && CONFIG.EMISSION_FACTORS[transport]) ? CONFIG.EMISSION_FACTORS[transport] : 0;
      mainEmission = +(distance * factor).toFixed(2);
    }

    // calcular emissões por modo
    var allModes = [];
    if(typeof Calculator !== 'undefined'){
      allModes = Calculator.calculateAllModes(distance);
    } else if(typeof CONFIG !== 'undefined'){
      var keys = Object.keys(CONFIG.EMISSION_FACTORS || {});
      allModes = keys.map(function(k){ return { mode:k, emission: +( (CONFIG.EMISSION_FACTORS[k]||0) * distance ).toFixed(2), percentageVsCar:null }; });
    }

    // obter emissão do carro como baseline
    var carEmission = null;
    if(allModes && allModes.length){
      for(var i=0;i<allModes.length;i++){ if(allModes[i].mode === 'car'){ carEmission = allModes[i].emission; break; } }
    }

    // calcular economia vs carro
    var savings = null;
    if(typeof Calculator !== 'undefined'){
      savings = Calculator.calculateSavings(mainEmission, carEmission);
    } else if(carEmission !== null){
      var saved = +(carEmission - mainEmission).toFixed(2);
      var pct = carEmission === 0 ? null : +((saved / carEmission) * 100).toFixed(2);
      savings = { savedKg: saved, percentage: pct };
    }

    // créditos e preço estimado
    var credits = (typeof Calculator !== 'undefined') ? Calculator.calculateCarbonCredits(mainEmission) : ( (typeof CONFIG !== 'undefined') ? +(mainEmission / CONFIG.CARBON_CREDIT.KG_PER_CREDIT).toFixed(4) : null );
    var priceEstimate = (typeof Calculator !== 'undefined') ? Calculator.estimateCreditPrice(credits) : null;

    // preparar objeto de dados para renderização via UI
    var resultData = {
      origin: origin || '—',
      destination: dest || '—',
      distance: distance,
      transport: transport,
      mainEmission: mainEmission,
      allModes: allModes,
      savings: savings,
      credits: credits,
      priceEstimate: priceEstimate,
      estimatedMethod: window.__distanceEstimation || null
    };

    resultBox.style.display = '';
    // usar UI.renderResult se disponível, senão fallback para HTML simples
    if(typeof UI !== 'undefined' && UI && typeof UI.renderResult === 'function'){
      UI.renderResult(resultBox, resultData);
    } else {
      // fallback — simples apresentação
      var html = '';
      html += `<strong>Origem:</strong> ${resultData.origin || '—'}<br/>`;
      html += `<strong>Destino:</strong> ${resultData.destination || '—'}<br/>`;
      html += `<strong>Distância:</strong> ${resultData.distance} km<br/>`;
      html += `<strong>Meio selecionado:</strong> ${resultData.transport}<br/>`;
      html += `<hr/>`;
      html += `<strong>Emissão estimada:</strong> ${formatKg(resultData.mainEmission)} kg CO₂<br/>`;
      resultBox.innerHTML = html;
    }
  });

  // Inicialização primária é feita em index.html; app.js não precisa de DOMContentLoaded aqui.

})();
