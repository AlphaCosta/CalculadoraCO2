/*
  config.js

  Define um único objeto global `CONFIG` que contém:
  - EMISSION_FACTORS: fatores de emissão (kg CO2 por km)
  - TRANSPORT_MODES: metadados para modos de transporte (label, icon, color)
  - CARBON_CREDIT: parâmetros de crédito de carbono
  - populateCitiesDatalist(): popula um <datalist id="cities-list"> com cidades de RoutesDB
  - setupDistanceAutofill(): adiciona listeners para preencher automaticamente a distância

  Observação: as funções verificam a existência de `RoutesDB` antes de usá-lo.
*/

var CONFIG = (function(){
  'use strict';

  var EMISSION_FACTORS = {
    bicycle: 0,
    car: 0.12,
    bus: 0.089,
    truck: 0.96
  };

  var TRANSPORT_MODES = {
    bicycle: { label: 'Bicicleta', icon: '🚴', color: '#2ECC71' },
    car:     { label: 'Carro',      icon: '🚗', color: '#1F8FFF' },
    bus:     { label: 'Ônibus',     icon: '🚌', color: '#F39C12' },
    truck:   { label: 'Caminhão',   icon: '🚛', color: '#A569BD' }
  };

  var CARBON_CREDIT = {
    KG_PER_CREDIT: 1000,
    PRICE_MIN_BRL: 50,
    PRICE_MAX_BRL: 160
  };

  /*
    Popula o <datalist id="cities-list"> com as cidades retornadas por RoutesDB.getAllCities()
    - Busca RoutesDB.getAllCities() (se existir)
    - Limpa opções existentes e adiciona novas <option value="Cidade, UF">
  */
  function populateCitiesDatalist(){
    try{
      var cities = [];
      if(typeof RoutesDB !== 'undefined' && RoutesDB && typeof RoutesDB.getAllCities === 'function'){
        cities = RoutesDB.getAllCities();
      }

      var datalist = document.getElementById('cities-list');
      if(!datalist) return;

      // limpar quaisquer options antigas
      datalist.innerHTML = '';

      cities.forEach(function(city){
        var opt = document.createElement('option');
        opt.value = city;
        datalist.appendChild(opt);
      });
    }catch(e){
      // falha silenciosa — evita quebrar a página
      console.warn('CONFIG.populateCitiesDatalist error:', e);
    }
  }

  /*
    Configura preenchimento automático de distância entre origin e destination
    - Observa mudanças (change) em `#origin` e `#destination`
    - Se ambas preenchidas, tenta RoutesDB.findDistance(origin, destination)
      - se encontrado: define valor em `#distance` e marca `#manualDistance` (conforme solicitado)
      - se não encontrado: desmarca `#manualDistance`
  */
  function setupDistanceAutofill(){
    try{
      var originEl = document.getElementById('origin');
      var destEl = document.getElementById('destination');
      var distanceEl = document.getElementById('distance');
      var manualCheckbox = document.getElementById('manualDistance');

      if(!originEl || !destEl || !distanceEl || !manualCheckbox) return;

      function handleChange(){
        var oVal = originEl.value ? originEl.value.trim() : '';
        var dVal = destEl.value ? destEl.value.trim() : '';

        if(!oVal || !dVal){
          // não há dados suficientes — desmarca manual
          manualCheckbox.checked = false;
          return;
        }

        var found = null;
        if(typeof RoutesDB !== 'undefined' && RoutesDB && typeof RoutesDB.findDistance === 'function'){
          found = RoutesDB.findDistance(oVal, dVal);
        }

        if(found !== null && found !== undefined){
          // preenche distância e marca a checkbox (conforme solicitado)
          distanceEl.value = found;
          manualCheckbox.checked = true;
        } else {
          // não encontrado — desmarca
          manualCheckbox.checked = false;
        }
      }

      originEl.addEventListener('change', handleChange);
      destEl.addEventListener('change', handleChange);
    }catch(e){
      console.warn('CONFIG.setupDistanceAutofill error:', e);
    }
  }

  // Expor API
  return {
    EMISSION_FACTORS: EMISSION_FACTORS,
    TRANSPORT_MODES: TRANSPORT_MODES,
    CARBON_CREDIT: CARBON_CREDIT,
    populateCitiesDatalist: populateCitiesDatalist,
    setupDistanceAutofill: setupDistanceAutofill
  };

})();
