/*
  ui.js

  Define um único objeto global `UI` com helpers para renderização de resultados
  e elementos da interface, usando dados de `CONFIG` e `Calculator` quando disponíveis.

  Funções principais:
  - populateTransportSelect(selectId)
  - renderResult(containerElement, data)
  - renderModesTable(allModes)
*/

var UI = (function(){
  'use strict';

  function formatKg(n){
    if(n === null || n === undefined) return '—';
    return Number(n).toLocaleString('pt-BR', {maximumFractionDigits:2, minimumFractionDigits:2});
  }

  function formatCurrency(n){
    if(n === null || n === undefined) return '—';
    return Number(n).toLocaleString('pt-BR', {style:'currency', currency:'BRL', minimumFractionDigits:2});
  }

  function getModeMeta(mode){
    if(typeof CONFIG !== 'undefined' && CONFIG.TRANSPORT_MODES && CONFIG.TRANSPORT_MODES[mode]){
      return CONFIG.TRANSPORT_MODES[mode];
    }
    return { label: mode, icon: '', color: '#ccc' };
  }

  // Popula um <select> com os modos definidos em CONFIG.TRANSPORT_MODES
  function populateTransportSelect(selectId){
    try{
      var sel = document.getElementById(selectId);
      if(!sel) return;
      // limpar
      sel.innerHTML = '';
      if(typeof CONFIG === 'undefined' || !CONFIG.TRANSPORT_MODES){
        // fallback: manter opções existentes
        return;
      }
      Object.keys(CONFIG.TRANSPORT_MODES).forEach(function(k){
        var m = CONFIG.TRANSPORT_MODES[k];
        var opt = document.createElement('option');
        opt.value = k;
        opt.textContent = (m.icon ? (m.icon + ' ') : '') + m.label;
        sel.appendChild(opt);
      });
    }catch(e){ console.warn('UI.populateTransportSelect error', e); }
  }

  // Popula um <select> com as cidades disponíveis em RoutesDB.getAllCities()
  function populateCitySelect(selectId){
    try{
      var sel = document.getElementById(selectId);
      if(!sel) return;
      // limpar opções existentes
      sel.innerHTML = '';
      var defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = 'Selecione a cidade...';
      sel.appendChild(defaultOpt);

      var cities = [];
      if(typeof RoutesDB !== 'undefined' && RoutesDB && typeof RoutesDB.getAllCities === 'function'){
        cities = RoutesDB.getAllCities();
      }

      // Agrupar por estado (espera formato "Cidade, UF")
      var groups = {};
      cities.forEach(function(c){
        var parts = c.split(',');
        var state = (parts.length > 1) ? parts[1].trim() : 'Outros';
        if(!groups[state]) groups[state] = [];
        groups[state].push(c);
      });

      // ordenar grupos por chave (UF) e cidades dentro dos grupos
      var stateKeys = Object.keys(groups).sort(function(a,b){ return a.localeCompare(b, 'pt-BR'); });
      stateKeys.forEach(function(state){
        var optgroup = document.createElement('optgroup');
        optgroup.label = state;
        groups[state].sort(function(a,b){ return a.localeCompare(b, 'pt-BR'); }).forEach(function(c){
          var opt = document.createElement('option');
          opt.value = c;
          opt.textContent = c;
          optgroup.appendChild(opt);
        });
        sel.appendChild(optgroup);
      });
    }catch(e){ console.warn('UI.populateCitySelect error', e); }
  }

  /*
    Transform a <select> em um componente pesquisável (searchable).
    - Cria um input para digitar a busca e uma lista drop-down com opções
    - Mantém o <select> sincronizado (value) para compatibilidade com o restante do código
    - Usa classes CSS `searchable-select`, `search-input`, `search-list`, `search-item`, `search-group`
  */
  function makeSelectSearchable(selectId){
    try{
      var sel = document.getElementById(selectId);
      if(!sel) return;
      // evitar aplicar duas vezes
      if(sel.dataset.searchable === '1') return;

      // criar wrapper
      var wrapper = document.createElement('div');
      wrapper.className = 'searchable-select';
      sel.parentNode.insertBefore(wrapper, sel);
      wrapper.appendChild(sel);

      // esconder select visualmente, mantê-lo para formulário
      sel.style.display = 'none';
      sel.dataset.searchable = '1';

      // criar input de busca
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'search-input';
      input.setAttribute('aria-label','Pesquisar cidade');
      input.placeholder = 'Digite para buscar...';
      wrapper.insertBefore(input, sel);

      // criar container da lista
      var list = document.createElement('div');
      list.className = 'search-list';
      list.setAttribute('role','listbox');
      list.style.display = 'none';
      wrapper.appendChild(list);

      // construir itens a partir das opções/optgroups do select
      function buildList(){
        // limpar
        while(list.firstChild) list.removeChild(list.firstChild);
        for(var i=0;i<sel.children.length;i++){
          var child = sel.children[i];
          if(child.tagName.toLowerCase() === 'optgroup'){
            var label = child.label || '';
            var grp = document.createElement('div');
            grp.className = 'search-group';
            grp.setAttribute('aria-hidden','true');
            grp.textContent = label;
            list.appendChild(grp);
            for(var j=0;j<child.children.length;j++){
              var op = child.children[j];
              var item = document.createElement('div');
              item.className = 'search-item';
              item.setAttribute('role','option');
              item.dataset.value = op.value;
              item.textContent = op.textContent;
              list.appendChild(item);
            }
          } else if(child.tagName.toLowerCase() === 'option'){
            var it = document.createElement('div');
            it.className = 'search-item';
            it.setAttribute('role','option');
            it.dataset.value = child.value;
            it.textContent = child.textContent;
            list.appendChild(it);
          }
        }
      }

      buildList();

      // helper: escapar texto para atributos
      function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

      // filtro
      var items = [];
      function refreshItems(){
        items = Array.from(list.querySelectorAll('.search-item')).filter(function(it){ return it.style.display !== 'none'; });
      }
      refreshItems();

      function showList(){ list.style.display = ''; }
      function hideList(){ list.style.display = 'none'; }

      // navegação por teclado
      var idx = -1;
      function highlight(i){
        items.forEach(function(it){ it.classList.remove('active'); });
        if(i>=0 && i<items.length){ items[i].classList.add('active'); items[i].scrollIntoView({block:'nearest'}); }
        idx = i;
      }

      input.addEventListener('input', function(){
        var q = input.value.trim().toLowerCase();
        if(!q){
          // mostrar todos
          Array.from(list.querySelectorAll('.search-item')).forEach(function(it){ it.style.display='block'; });
          refreshItems(); showList(); highlight(-1); return;
        }
        Array.from(list.querySelectorAll('.search-item')).forEach(function(it){
          var txt = it.textContent.trim().toLowerCase();
          it.style.display = (txt.indexOf(q) !== -1) ? 'block' : 'none';
        });
        refreshItems();
        showList(); highlight(-1);
      });

      input.addEventListener('focus', function(){ showList(); refreshItems(); highlight(-1); });
      input.addEventListener('blur', function(){ setTimeout(hideList, 150); });

      input.addEventListener('keydown', function(ev){
        if(ev.key === 'ArrowDown'){
          ev.preventDefault();
          if(items.length===0) return;
          var next = (idx+1 >= items.length) ? 0 : idx+1;
          highlight(next);
        } else if(ev.key === 'ArrowUp'){
          ev.preventDefault();
          if(items.length===0) return;
          var prev = (idx-1 < 0) ? items.length-1 : idx-1;
          highlight(prev);
        } else if(ev.key === 'Enter'){
          ev.preventDefault();
          if(idx >=0 && idx < items.length){ selectItem(items[idx]); }
        } else if(ev.key === 'Escape'){
          hideList();
        }
      });

      function selectItem(it){
        var val = it.dataset.value;
        // definir no select e disparar change
        sel.value = val;
        var evt;
        try{ evt = new Event('change', { bubbles:true }); }catch(e){ evt = document.createEvent('HTMLEvents'); evt.initEvent('change', true, false); }
        sel.dispatchEvent(evt);
        input.value = it.textContent;
        hideList();
      }

      list.addEventListener('click', function(e){
        var target = e.target;
        if(target.classList.contains('search-item')){
          selectItem(target);
        }
      });

      // sincronizar input quando select mudar externamente
      sel.addEventListener('change', function(){
        var opt = sel.options[sel.selectedIndex];
        if(opt) input.value = opt.textContent;
      });

      // inicial: se já houver valor no select, refletir
      if(sel.value){
        var op = sel.options[sel.selectedIndex]; if(op) input.value = op.textContent;
      }
    }catch(e){ console.warn('UI.makeSelectSearchable error', e); }
  }

  // Gera HTML para a tabela de modos usando classes CSS (sem estilos inline)
  function renderModesTable(allModes){
    if(!allModes || !allModes.length) return '';
    var html = '';
    html += '<h4 id="modes-title">Emissões por modo</h4>';
    html += '<table class="modes-table" aria-labelledby="modes-title">';
    html += '<thead><tr><th scope="col">Modo</th><th scope="col" class="text-right">kg CO₂</th><th scope="col" class="text-right">% vs carro</th></tr></thead>';
    html += '<tbody>';
    allModes.forEach(function(r){
      var meta = getModeMeta(r.mode);
      var label = '<span class="mode-label"><span class="mode-icon" style="background:' + (meta.color || '#ccc') + '">' + (meta.icon || '') + '</span>' + (meta.label || r.mode) + '</span>';
      var pct = (r.percentageVsCar === null || r.percentageVsCar === undefined) ? '—' : (r.percentageVsCar + '%');
      html += '<tr>';
      html += '<td>' + label + '</td>';
      html += '<td class="text-right">' + formatKg(r.emission) + '</td>';
      html += '<td class="text-right">' + pct + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  // Renderiza o resultado completo dentro do containerElement
  // data: { origin, destination, distance, transport, mainEmission, allModes, savings, credits, priceEstimate }
  function renderResult(containerElement, data){
    try{
      if(!containerElement) return;
      // tornar o container acessível como região dinâmica
      containerElement.setAttribute('role', 'region');
      containerElement.setAttribute('aria-live', 'polite');
      containerElement.setAttribute('tabindex', '0');

      var html = '';
      html += '<div class="result-header">';
      html += '<p><strong>Origem:</strong> ' + (data.origin || '—') + '</p>';
      html += '<p><strong>Destino:</strong> ' + (data.destination || '—') + '</p>';
      html += '<p><strong>Distância:</strong> ' + (data.distance || '—') + ' km';
      if(data.estimatedMethod && data.estimatedMethod !== 'db'){
        var note = data.estimatedMethod === 'haversine' ? ' (estimativa por linha reta)' : ' (estimativa por rota)';
        html += ' <small aria-hidden="false" style="color:var(--muted);">' + note + '</small>';
      }
      html += '</p>';
      var meta = getModeMeta(data.transport);
      html += '<p><strong>Meio selecionado:</strong> ' + ((meta.icon ? (meta.icon + ' ') : '') + (meta.label || data.transport)) + '</p>';
      html += '</div>';
      html += '<hr/>';
      html += '<p><strong>Emissão estimada:</strong> ' + formatKg(data.mainEmission) + ' kg CO₂</p>';

      html += renderModesTable(data.allModes);

      if(data.savings){
        html += '<hr/>';
        html += '<p><strong>Economia vs Carro:</strong> ' + formatKg(data.savings.savedKg) + ' kg CO₂ (' + (data.savings.percentage === null ? '—' : data.savings.percentage + '%') + ')</p>';
      }

      if(data.credits !== null && data.credits !== undefined){
        html += '<hr/>';
        html += '<p><strong>Créditos de carbono estimados:</strong> ' + data.credits + '</p>';
        if(data.priceEstimate){
          html += '<p><strong>Estimativa de preço:</strong> ' + formatCurrency(data.priceEstimate.min) + ' — ' + formatCurrency(data.priceEstimate.max) + ' (média ' + formatCurrency(data.priceEstimate.average) + ')</p>';
        }
      }

      containerElement.innerHTML = html;
    }catch(e){ console.warn('UI.renderResult error', e); }
  }

  return {
    populateTransportSelect: populateTransportSelect,
    populateCitySelect: populateCitySelect,
    makeSelectSearchable: makeSelectSearchable,
    renderModesTable: renderModesTable,
    renderResult: renderResult
  };

})();
