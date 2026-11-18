/* DADOS FICTÍCIOS DE DEMONSTRAÇÃO: não são extraídos do Neon. */
const DB = {"aeroporto":[{"nome_aeroporto":"Confins","cidade":"Belo Horizonte","estado":"MG"},{"nome_aeroporto":"Guarulhos","cidade":"São Paulo","estado":"SP"},{"nome_aeroporto":"Galeao","cidade":"Rio de Janeiro","estado":"RJ"},{"nome_aeroporto":"Congonhas","cidade":"São Paulo","estado":"SP"},{"nome_aeroporto":"Brasilia","cidade":"Brasília","estado":"DF"}],"aeronave":[{"numero_serie":"AER001","modelo":"Boeing 737-800","qtd_assentos":189},{"numero_serie":"AER002","modelo":"Airbus A320","qtd_assentos":180},{"numero_serie":"AER003","modelo":"Embraer E195","qtd_assentos":120},{"numero_serie":"AER004","modelo":"Airbus A319","qtd_assentos":144}],"funcionario":[{"cpf":"00000000001","nome":"Gerente Demonstração","tipo_funcionario":"GERENTE","data_nascimento":"1990-01-01","genero":null,"rua":null,"numero":null,"bairro":null,"cidade":null},{"cpf":"00000000002","nome":"Administrador Demonstração","tipo_funcionario":"ADMINISTRADOR","data_nascimento":"1990-01-01","genero":null,"rua":null,"numero":null,"bairro":null,"cidade":null},{"cpf":"00000000003","nome":"Carlos Exemplo","tipo_funcionario":"PILOTO","data_nascimento":"1990-01-01","genero":null,"rua":null,"numero":null,"bairro":null,"cidade":null},{"cpf":"00000000004","nome":"Ana Exemplo","tipo_funcionario":"COPILOTO","data_nascimento":"1990-01-01","genero":null,"rua":null,"numero":null,"bairro":null,"cidade":null},{"cpf":"00000000005","nome":"Rafael Exemplo","tipo_funcionario":"PILOTO","data_nascimento":"1990-01-01","genero":null,"rua":null,"numero":null,"bairro":null,"cidade":null},{"cpf":"00000000006","nome":"Luiza Exemplo","tipo_funcionario":"COPILOTO","data_nascimento":"1990-01-01","genero":null,"rua":null,"numero":null,"bairro":null,"cidade":null},{"cpf":"00000000007","nome":"Joana Exemplo","tipo_funcionario":"COMISSARIO","data_nascimento":"1990-01-01","genero":null,"rua":null,"numero":null,"bairro":null,"cidade":null},{"cpf":"00000000008","nome":"Pedro Exemplo","tipo_funcionario":"COMISSARIO","data_nascimento":"1990-01-01","genero":null,"rua":null,"numero":null,"bairro":null,"cidade":null},{"cpf":"00000000009","nome":"Marina Exemplo","tipo_funcionario":"COMISSARIO","data_nascimento":"1990-01-01","genero":null,"rua":null,"numero":null,"bairro":null,"cidade":null},{"cpf":"00000000010","nome":"Felipe Exemplo","tipo_funcionario":"COMISSARIO","data_nascimento":"1990-01-01","genero":null,"rua":null,"numero":null,"bairro":null,"cidade":null}],"cliente":[{"cpf":"00000000101","nome":"Cliente Exemplo A"},{"cpf":"00000000102","nome":"Cliente Exemplo B"}],"trajeto":[{"codigo_rota":1,"aeroporto_partida":"Confins","aeroporto_chegada":"Guarulhos","hora_partida":"08:00:00","hora_chegada":"09:30:00","distancia":500,"cpf_gerente":"00000000001"},{"codigo_rota":2,"aeroporto_partida":"Guarulhos","aeroporto_chegada":"Brasilia","hora_partida":"11:00:00","hora_chegada":"12:45:00","distancia":900,"cpf_gerente":"00000000001"},{"codigo_rota":3,"aeroporto_partida":"Confins","aeroporto_chegada":"Galeao","hora_partida":"14:00:00","hora_chegada":"15:00:00","distancia":350,"cpf_gerente":"00000000001"},{"codigo_rota":4,"aeroporto_partida":"Congonhas","aeroporto_chegada":"Confins","hora_partida":"17:00:00","hora_chegada":"18:15:00","distancia":450,"cpf_gerente":"00000000001"}],"voo":[{"codigo_voo":101,"d_h_partida":"2026-11-19 08:00:00","d_h_chegada":"2026-11-19 09:30:00","codigo_rota":1,"numero_serie_aeronave":"AER001","cpf_administrador":"00000000002","cpf_piloto":"00000000003","cpf_copiloto":"00000000004"},{"codigo_voo":102,"d_h_partida":"2026-11-19 11:00:00","d_h_chegada":"2026-11-19 12:45:00","codigo_rota":2,"numero_serie_aeronave":"AER002","cpf_administrador":"00000000002","cpf_piloto":"00000000005","cpf_copiloto":"00000000006"},{"codigo_voo":103,"d_h_partida":"2026-11-19 14:00:00","d_h_chegada":"2026-11-19 15:00:00","codigo_rota":3,"numero_serie_aeronave":"AER003","cpf_administrador":"00000000002","cpf_piloto":"00000000003","cpf_copiloto":"00000000004"},{"codigo_voo":104,"d_h_partida":"2026-11-20 17:00:00","d_h_chegada":"2026-11-20 18:15:00","codigo_rota":4,"numero_serie_aeronave":"AER004","cpf_administrador":"00000000002","cpf_piloto":"00000000005","cpf_copiloto":"00000000006"}],"escala_comissario":[{"codigo_voo":101,"cpf_comissario":"00000000007"},{"codigo_voo":101,"cpf_comissario":"00000000008"},{"codigo_voo":102,"cpf_comissario":"00000000009"},{"codigo_voo":102,"cpf_comissario":"00000000010"},{"codigo_voo":103,"cpf_comissario":"00000000007"},{"codigo_voo":103,"cpf_comissario":"00000000008"},{"codigo_voo":104,"cpf_comissario":"00000000009"},{"codigo_voo":104,"cpf_comissario":"00000000010"}],"passagem":[{"codigo_reserva":"DEMO001","cpf_cliente":"00000000101","codigo_voo":101,"numero_assento":1,"valor":350.0},{"codigo_reserva":"DEMO002","cpf_cliente":"00000000102","codigo_voo":102,"numero_assento":1,"valor":420.0}],"cliente_telefone":[],"funcionario_telefone":[]};

/* A base acima contém dados de demonstração com os mesmos campos do SQL enviado. MODO DEMONSTRAÇÃO:
   alterações abaixo ocorrem somente na memória do navegador e NÃO no Neon.
   A camada DATA deverá ser substituída por fetch('/api/...') na integração. */
const $=(s,r=document)=>r.querySelector(s);
function h(tag,attrs={},...children){
  const el=document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{
    if(v===null||v===undefined||v===false)return;
    if(k==='class')el.className=v;
    else if(k==='value')el.value=v;
    else if(k==='checked')el.checked=!!v;
    else if(k==='disabled')el.disabled=!!v;
    else if(k.startsWith('on'))el.addEventListener(k.slice(2),v);
    else el.setAttribute(k,v===true?'':String(v));
  });
  children.flat().forEach(c=>{if(c!==null&&c!==undefined)el.append(c instanceof Node?c:document.createTextNode(String(c)))});
  return el;
}
const msg=(type,text)=>h('div',{class:'msg '+type,role:'alert'},text);
const state=text=>h('div',{class:'state card'},text);
const money=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const date=s=>s?String(s).slice(8,10)+'/'+String(s).slice(5,7)+'/'+String(s).slice(0,4):'—';
const time=s=>s?String(s).slice(11,16):'—';
const localDT=s=>String(s||'').replace(' ','T').slice(0,16);
const keyOf={aeronave:'numero_serie',trajeto:'codigo_rota',funcionario:'cpf',voo:'codigo_voo'};
const first=(table,key,val)=>DB[table].find(x=>String(x[key])===String(val));
const airport=name=>first('aeroporto','nome_aeroporto',name);
const city=name=>{const a=airport(name);return a?`${a.cidade} (${name})`:name};
const flightRoute=v=>first('trajeto','codigo_rota',v.codigo_rota);
const plane=v=>first('aeronave','numero_serie',v.numero_serie_aeronave);
const occupancy=v=>DB.passagem.filter(p=>p.codigo_voo===v.codigo_voo).map(p=>p.numero_assento);
const crew=v=>DB.escala_comissario.filter(x=>x.codigo_voo===v.codigo_voo).map(x=>x.cpf_comissario);
const staff=(type)=>DB.funcionario.filter(f=>f.tipo_funcionario===type);
const changed = ()=>new Promise(resolve=>setTimeout(resolve,120));
// Preço é estimativa de demonstração, NÃO existe como atributo de voo no SQL.
// Usa preço de passagem já vendida naquele voo ou uma tarifa fictícia fixa.
const demoFare =v=>first('passagem','codigo_voo',v.codigo_voo)?.valor ?? 300;

const DATA={
  async list(table){await changed();return DB[table]},
  async search(o,d,day){await changed();return DB.voo.filter(v=>{
    const t=flightRoute(v);return t&&t.aeroporto_partida===o&&t.aeroporto_chegada===d&&v.d_h_partida.startsWith(day);
  }).sort((a,b)=>a.d_h_partida.localeCompare(b.d_h_partida))},
  async save(table,record,oldKey){
    await changed();const pk=keyOf[table];const old=oldKey===undefined?null:first(table,pk,oldKey);
    if(!old&&first(table,pk,record[pk]))throw Error('Já existe um registro com esse identificador.');
    if(old){if(String(record[pk])!==String(oldKey))throw Error('A chave primária não pode ser alterada na edição.');Object.assign(old,record)}
    else DB[table].push({...record});
  },
  async remove(table,pk){
    await changed();const ref={
      aeronave:DB.voo.some(v=>v.numero_serie_aeronave===pk),
      trajeto:DB.voo.some(v=>String(v.codigo_rota)===String(pk)),
      funcionario:DB.voo.some(v=>[v.cpf_administrador,v.cpf_piloto,v.cpf_copiloto].includes(pk)) || DB.escala_comissario.some(c=>c.cpf_comissario===pk)||DB.trajeto.some(t=>t.cpf_gerente===pk),
      voo:DB.passagem.some(p=>String(p.codigo_voo)===String(pk))
    };
    if(ref[table])throw Error('Este registro possui vínculos e não pode ser removido.');
    DB[table]=DB[table].filter(x=>String(x[keyOf[table]])!==String(pk));
    if(table==='voo')DB.escala_comissario=DB.escala_comissario.filter(c=>String(c.codigo_voo)!==String(pk));
  },
  async buy(voo,cpf,assento){
    await changed();const a=plane(voo);
    if(!first('cliente','cpf',cpf))throw Error('Selecione um cliente cadastrado.');
    if(!Number.isInteger(assento)||assento<1||assento>a.qtd_assentos)throw Error('Assento fora da capacidade da aeronave.');
    if(occupancy(voo).includes(assento))throw Error('Esse assento já está ocupado.');
    const codigo='DCL-'+Math.random().toString(36).slice(2,9).toUpperCase();
    DB.passagem.push({codigo_reserva:codigo,cpf_cliente:cpf,codigo_voo:voo.codigo_voo,numero_assento:assento,valor:demoFare(voo),data_compra:new Date().toISOString()});
    return {codigo_reserva:codigo};
  },
  async saveFlight(v,comissarios,original){
    await changed();const codigo=v.codigo_voo;
    if(original==null&&first('voo','codigo_voo',codigo))throw Error('Código de voo já cadastrado.');
    if(original!=null&&codigo!==original)throw Error('Não altere o código do voo durante a edição.');
    if(v.d_h_chegada<=v.d_h_partida)throw Error('A chegada deve ocorrer após a partida.');
    if(v.cpf_piloto===v.cpf_copiloto)throw Error('Piloto e copiloto precisam ser diferentes.');
    if(comissarios.length<2||comissarios.length>4||new Set(comissarios).size!==comissarios.length)throw Error('Selecione entre 2 e 4 comissários diferentes.');
    if(comissarios.includes(v.cpf_piloto)||comissarios.includes(v.cpf_copiloto))throw Error('Um tripulante não pode ocupar duas funções no mesmo voo.');
    const selected=[v.cpf_piloto,v.cpf_copiloto,...comissarios];
    // Regra didática: nenhuma sobreposição e mínimo de 36h entre voos de um mesmo tripulante.
    for(const old of DB.voo){
      if(old.codigo_voo===original)continue;
      const overlap=v.d_h_partida<old.d_h_chegada&&v.d_h_chegada>old.d_h_partida;
      if(overlap&&v.numero_serie_aeronave===old.numero_serie_aeronave)throw Error('Conflito: aeronave já usada no voo '+old.codigo_voo+'.');
      const others=[old.cpf_piloto,old.cpf_copiloto,...crew(old)];
      const repeat=selected.filter(c=>others.includes(c));
      if(repeat.length){
        if(overlap)throw Error('Conflito: tripulante já escalado no voo '+old.codigo_voo+'.');
        const rest=36*3600*1000;
        const endOld=new Date(localDT(old.d_h_chegada)).getTime(),startOld=new Date(localDT(old.d_h_partida)).getTime();
        const start=new Date(localDT(v.d_h_partida)).getTime(),end=new Date(localDT(v.d_h_chegada)).getTime();
        if((start>=endOld&&start-endOld<rest)||(startOld>=end&&startOld-end<rest))throw Error('Descanso insuficiente (mínimo 36h) para tripulante do voo '+old.codigo_voo+'.');
      }
    }
    const duration=(new Date(localDT(v.d_h_chegada))-new Date(localDT(v.d_h_partida)))/3600000;
    if(duration>12)throw Error('Voo com duração superior a 12h: revise a regra demonstrativa de jornada.');
    if(original==null)DB.voo.push({...v});
    else Object.assign(first('voo','codigo_voo',original),v);
    DB.escala_comissario=DB.escala_comissario.filter(c=>c.codigo_voo!==codigo);
    DB.escala_comissario.push(...comissarios.map(cpf=>({codigo_voo:codigo,cpf_comissario:cpf})));
  }
};

function toast(text){const el=$('#toast');el.textContent=text;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,3000)}
function table(columns,rows,actions){
  if(!rows.length)return state('Nenhum registro cadastrado.');
  const headers=columns.map(c=>h('th',{},c.label));
  if(actions)headers.push(h('th',{},'Ações'));
  const lines=rows.map(record=>{
    const cells=columns.map(c=>h('td',{},c.render?c.render(record):record[c.key]??'—'));
    if(actions)cells.push(h('td',{},h('div',{class:'actions'},...actions(record))));
    return h('tr',{},...cells);
  });
  return h('div',{class:'tw'},h('table',{},h('thead',{},h('tr',{},...headers)),h('tbody',{},...lines)));
}
function options(rows,key,label,placeholder=false){return [...(placeholder?[h('option',{value:''},'Selecione…')]:[]),...rows.map(x=>h('option',{value:x[key]},typeof label==='function'?label(x):x[label]))]}
function selectField(id,label,opts,val){const input=h('select',{id,name:id},...opts);if(val!==undefined&&val!==null)input.value=String(val);return h('div',{},h('label',{for:id},label),input)}
function inputField(id,label,type='text',value='',extra={}){return h('div',{},h('label',{for:id},label),h('input',{id,name:id,type,value:value??'',...extra}))}
function modal(title,fields,values={},save){
  const f=$('#dForm'),box=h('div',{class:'form'}),message=h('div');
  for(const fld of fields){const id='m_'+fld.key;let input;
    if(fld.options)input=h('select',{id,name:fld.key},...options(fld.options,fld.optKey||'value',fld.optLabel||'label',fld.placeholder));
    else input=h('input',{id,name:fld.key,type:fld.type||'text',min:fld.min??null,max:fld.max??null,step:fld.step??null,maxlength:fld.maxlength??null});
    input.value=values[fld.key]??'';input.required=fld.required!==false;
    if(fld.readOnly)input.disabled=true;
    box.append(h('div',{class:fld.full?'full':''},h('label',{for:id},fld.label),input));
  }
  f.replaceChildren(h('h2',{},title),message,box,h('div',{class:'actions',style:'justify-content:flex-end;margin-top:18px'},
    h('button',{class:'btn s',type:'button',onclick:()=>$('#dlg').close()},'Cancelar'),h('button',{class:'btn',type:'submit'},'Salvar')));
  f.onsubmit=async e=>{e.preventDefault();const result={};
    for(const fld of fields){const inp=f.elements[fld.key];const raw=inp.disabled?values[fld.key]:inp.value.trim();
      if(fld.required!==false&&(raw===''||raw===undefined||raw===null)){message.replaceChildren(msg('err','Preencha: '+fld.label));return}
      result[fld.key]=fld.type==='number'&&raw!==''?Number(raw):raw===''&&fld.required===false?null:raw;
      if(fld.type==='number'&&raw!==''&&(!Number.isFinite(result[fld.key])||(fld.integer&&!Number.isInteger(result[fld.key]))||(fld.min!==undefined&&result[fld.key]<fld.min))){message.replaceChildren(msg('err','Valor inválido: '+fld.label));return}
    }
    try{await save(result);$('#dlg').close();toast('Registro salvo na demonstração.')}catch(err){message.replaceChildren(msg('err',err.message))}
  };
  $('#dlg').showModal();
}

const S={search:null,flight:null,tab:'aeronave',selectedFlight:null};
function route(){
  let target=location.hash.slice(1)||'inicio';
  if(!['inicio','resultados','compra','gerente','admin'].includes(target))target='inicio';
  if(target==='resultados'&&!S.search||target==='compra'&&!S.flight)target='inicio';
  for(const page of ['inicio','resultados','compra','gerente','admin'])$('#'+page).hidden=page!==target;
  const current=['inicio','resultados','compra'].includes(target)?'cliente':target;
  document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.dataset.g===current));
  if(target==='resultados')renderResults();
  if(target==='compra')renderPurchase();
  if(target==='gerente')renderManager();
  if(target==='admin')renderAdmin();
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
function init(){
  const airports=DB.aeroporto;
  $('#bo').replaceChildren(...options(airports,'nome_aeroporto',x=>city(x.nome_aeroporto),true));
  $('#bd').replaceChildren(...options(airports,'nome_aeroporto',x=>city(x.nome_aeroporto),true));
  $('#gResponsavel').replaceChildren(...options(staff('GERENTE'),'cpf','nome'));
  $('#vResponsavel').replaceChildren(...options(staff('ADMINISTRADOR'),'cpf','nome'));
  $('#fBusca').onsubmit=e=>{
    e.preventDefault();const o=$('#bo').value,d=$('#bd').value,data=$('#bdata').value;
    if(!o||!d||!data||o===d){$('#buscaMsg').replaceChildren(msg('err','Selecione origem, destino diferentes e a data.'));return}
    $('#buscaMsg').replaceChildren();S.search={o,d,data};location.hash='resultados';if(location.hash==='#resultados')renderResults();
  };
  const firstFlight=DB.voo[0];if(firstFlight)$('#bdata').value=firstFlight.d_h_partida.slice(0,10);
  route();
}
async function renderResults(){
  const b=S.search;if(!b)return;
  $('#resInfo').textContent=city(b.o)+' → '+city(b.d)+' · '+date(b.data);
  const list=$('#resList');list.replaceChildren(state('Carregando voos…'));
  try{const flights=await DATA.search(b.o,b.d,b.data);
    if(!flights.length){list.replaceChildren(state('Nenhum voo encontrado para a data selecionada.'));return}
    list.replaceChildren(...flights.map(v=>{
      const t=flightRoute(v),a=plane(v),free=a.qtd_assentos-occupancy(v).length;
      return h('div',{class:'card flight'},h('div',{},
        h('div',{class:'route'},h('div',{},h('div',{class:'t'},time(v.d_h_partida)),h('div',{class:'ap'},city(t.aeroporto_partida))),h('div',{class:'line'}),h('div',{},h('div',{class:'t'},time(v.d_h_chegada)),h('div',{class:'ap'},city(t.aeroporto_chegada)))),
        h('div',{class:'meta'},'📅 '+date(v.d_h_partida)+' · ✈ '+a.modelo+' · '+free+' lugares disponíveis')),
        h('div',{},h('div',{class:'price'},money(demoFare(v))),h('button',{class:'btn y',disabled:free<1,onclick:()=>{S.flight=v;location.hash='compra'}},free?'Selecionar voo':'Esgotado')));
    }));
  }catch(err){list.replaceChildren(msg('err',err.message),h('button',{class:'btn',onclick:renderResults},'Tentar novamente'))}
}
function renderPurchase(){
  const v=S.flight;if(!v)return;const t=flightRoute(v),a=plane(v),occupied=occupancy(v);
  const summary=h('div',{class:'card'},h('h2',{},'Resumo do voo'),h('dl',{class:'sum'},
    h('dt',{},'Trajeto'),h('dd',{},city(t.aeroporto_partida)+' → '+city(t.aeroporto_chegada)),
    h('dt',{},'Data e horário'),h('dd',{},date(v.d_h_partida)+' · '+time(v.d_h_partida)+' às '+time(v.d_h_chegada)),
    h('dt',{},'Aeronave'),h('dd',{},a.modelo),h('dt',{},'Valor de demonstração'),h('dd',{class:'price',style:'text-align:left'},money(demoFare(v)))));
  const selector=h('select',{id:'cCli'},...options(DB.cliente,'cpf','nome',true));
  const seats=h('select',{id:'cAss',class:'assentos'},h('option',{value:''},'Selecione um assento livre…'),
    ...Array.from({length:a.qtd_assentos},(_,i)=>h('option',{value:i+1,disabled:occupied.includes(i+1)},
      `Assento ${i+1}${occupied.includes(i+1)?' (ocupado)':''}`)));
  const m=h('div'),submit=h('button',{class:'btn y',type:'button'},'Confirmar compra');
  const form=h('div',{class:'card'},h('h2',{},'Passageiro e assento'),m,h('label',{for:'cCli'},'Cliente cadastrado'),selector,
    h('div',{style:'margin-top:10px'},h('label',{for:'cAss'},'Assento disponível'),seats),
    h('div',{class:'actions',style:'margin-top:16px'},submit,h('a',{class:'btn s',href:'#resultados'},'Voltar')));
  $('#compraBox').replaceChildren(summary,form);
  submit.onclick=async()=>{
    if(!selector.value||!seats.value){m.replaceChildren(msg('err','Escolha o cliente e um assento livre.'));return}
    submit.disabled=true;m.replaceChildren(msg('info','Registrando reserva de demonstração…'));
    try{const r=await DATA.buy(v,selector.value,Number(seats.value));
      $('#compraBox').replaceChildren(h('div',{class:'card full',style:'grid-column:1/-1;text-align:center'},
        msg('ok','Compra confirmada no modo demonstração!'),h('p',{class:'sub'},'Código da reserva'),h('div',{class:'code'},r.codigo_reserva),
        h('p',{},city(t.aeroporto_partida)+' → '+city(t.aeroporto_chegada)+' · '+date(v.d_h_partida)+' · Assento '+seats.value),
        h('a',{class:'btn',href:'#inicio'},'Voltar ao início')));
    }catch(err){submit.disabled=false;m.replaceChildren(msg('err',err.message))}
  };
}

/* Formulários seguem as colunas do SQL_DECOLAE.sql enviado. */
function managerFields(table){
  if(table==='aeronave')return [
    {key:'numero_serie',label:'Número de série',maxlength:30},
    {key:'modelo',label:'Modelo'},
    {key:'qtd_assentos',label:'Capacidade (assentos)',type:'number',integer:true,min:1}
  ];
  if(table==='trajeto')return [
    {key:'codigo_rota',label:'Código da rota',type:'number',integer:true,min:1},
    {key:'aeroporto_partida',label:'Aeroporto de origem',options:DB.aeroporto,optKey:'nome_aeroporto',optLabel:'nome_aeroporto'},
    {key:'aeroporto_chegada',label:'Aeroporto de destino',options:DB.aeroporto,optKey:'nome_aeroporto',optLabel:'nome_aeroporto'},
    {key:'hora_partida',label:'Horário previsto de partida',type:'time'},
    {key:'hora_chegada',label:'Horário previsto de chegada',type:'time'},
    {key:'distancia',label:'Distância (km)',type:'number',min:0.01,step:'0.01',required:false}
  ];
  return [
    {key:'cpf',label:'CPF (11 dígitos)',maxlength:11},
    {key:'nome',label:'Nome completo'},
    {key:'tipo_funcionario',label:'Função',options:['GERENTE','ADMINISTRADOR','PILOTO','COPILOTO','COMISSARIO'].map(x=>({id:x,label:x})),optKey:'id',optLabel:'label'},
    {key:'data_nascimento',label:'Data de nascimento',type:'date'},
    {key:'genero',label:'Gênero',required:false},
    {key:'rua',label:'Rua',required:false},
    {key:'numero',label:'Número',type:'number',integer:true,min:1,required:false},
    {key:'bairro',label:'Bairro',required:false},
    {key:'cidade',label:'Cidade',required:false}
  ];
}
const managerMeta={
  aeronave:{title:'Aeronaves',columns:[{label:'Série',key:'numero_serie'},{label:'Modelo',key:'modelo'},{label:'Assentos',key:'qtd_assentos'}]},
  trajeto:{title:'Trajetos',columns:[{label:'Código',key:'codigo_rota'},{label:'Origem',key:'aeroporto_partida'},{label:'Destino',key:'aeroporto_chegada'},{label:'Partida prevista',key:'hora_partida'},{label:'Chegada prevista',key:'hora_chegada'},{label:'Distância',key:'distancia'}]},
  funcionario:{title:'Funcionários',columns:[{label:'CPF',key:'cpf'},{label:'Nome',key:'nome'},{label:'Função',key:'tipo_funcionario'},{label:'Nascimento',key:'data_nascimento'}]}
};
async function renderManager(){
  const m=managerMeta[S.tab],body=$('#gBody');
  $('#gTabs').replaceChildren(...Object.entries(managerMeta).map(([k,v])=>h('button',{class:k===S.tab?'on':'',onclick:()=>{S.tab=k;renderManager()}},v.title)));
  $('#gTitle').textContent=m.title;
  $('#gAdd').onclick=()=>openManager();
  body.replaceChildren(state('Carregando…'));
  try{const records=await DATA.list(S.tab);
    body.replaceChildren(table(m.columns,records,r=>[
      h('button',{class:'btn s sm',onclick:()=>openManager(r)},'Editar'),
      h('button',{class:'btn d sm',onclick:()=>removeManager(r)},'Remover')
    ]));
  }catch(err){body.replaceChildren(msg('err',err.message))}
}
function openManager(existing){
  const table=S.tab,pk=keyOf[table],data=existing?{...existing}:{};
  if(table==='trajeto'&&!existing)data.codigo_rota=Math.max(0,...DB.trajeto.map(x=>x.codigo_rota))+1;
  if(table==='trajeto'&&existing){data.hora_partida=String(data.hora_partida).slice(0,5);data.hora_chegada=String(data.hora_chegada).slice(0,5)}
  const fields=managerFields(table).map(f=>({...f,readOnly:!!existing&&f.key===pk}));
  modal((existing?'Editar ':'Adicionar ')+managerMeta[table].title.toLowerCase(),fields,data,async record=>{
    if(table==='trajeto'){
      if(record.aeroporto_partida===record.aeroporto_chegada)throw Error('Origem e destino devem ser diferentes.');
      record.cpf_gerente=$('#gResponsavel').value||null;
      if(!record.distancia)record.distancia=null;
      record.hora_partida=record.hora_partida+':00';record.hora_chegada=record.hora_chegada+':00';
    }
    if(table==='funcionario'){
      if(!/^\d{11}$/.test(record.cpf))throw Error('CPF deve conter 11 dígitos.');
      if(!record.numero)record.numero=null;
      if(!record.data_nascimento)throw Error('Informe a data de nascimento.');
    }
    await DATA.save(table,record,existing?.[pk]);
    renderManager();
  });
}
async function removeManager(record){
  if(!confirm('Remover este registro da demonstração?'))return;
  try{await DATA.remove(S.tab,record[keyOf[S.tab]]);toast('Registro removido na demonstração.');renderManager()}
  catch(err){alert(err.message)}
}

async function renderAdmin(){
  const body=$('#vBody');$('#vNovo').onclick=()=>openFlight();body.replaceChildren(state('Carregando voos…'));
  const flights=await DATA.list('voo');
  body.replaceChildren(table([
    {label:'Nº',key:'codigo_voo'},
    {label:'Trajeto',render:v=>{const t=flightRoute(v);return t?`${t.aeroporto_partida} → ${t.aeroporto_chegada}`:'—'}},
    {label:'Partida',render:v=>date(v.d_h_partida)+' '+time(v.d_h_partida)},
    {label:'Chegada',render:v=>date(v.d_h_chegada)+' '+time(v.d_h_chegada)},
    {label:'Aeronave',render:v=>plane(v)?.modelo??'—'},
    {label:'Equipe',render:v=>(2+crew(v).length)+' pessoas'}
  ],flights,v=>[
    h('button',{class:'btn s sm',onclick:()=>openFlight(v)},'Editar'),
    h('button',{class:'btn d sm',onclick:()=>deleteFlight(v)},'Remover')
  ]));
}
async function deleteFlight(v){
  if(!confirm('Remover o voo '+v.codigo_voo+' da demonstração?'))return;
  try{await DATA.remove('voo',v.codigo_voo);toast('Voo removido na demonstração.');renderAdmin()}
  catch(err){alert(err.message)}
}
function openFlight(existing){
  const box=$('#vForm'),form=$('#fVoo'),error=$('#vMsg');box.hidden=false;
  $('#vFormTitle').textContent=existing?'Editar voo '+existing.codigo_voo:'Novo voo';error.replaceChildren();
  const next=Math.max(100,...DB.voo.map(v=>v.codigo_voo))+1;
  const defaults=existing||{};
  const parts=[
    inputField('vCodigo','Código do voo','number',defaults.codigo_voo??next,{min:1,step:1,disabled:!!existing}),
    selectField('vTrajeto','Trajeto',options(DB.trajeto,'codigo_rota',t=>`${t.codigo_rota}: ${t.aeroporto_partida} → ${t.aeroporto_chegada}`,true),defaults.codigo_rota),
    selectField('vAeronave','Aeronave',options(DB.aeronave,'numero_serie',a=>`${a.modelo} (${a.numero_serie}, ${a.qtd_assentos} assentos)`,true),defaults.numero_serie_aeronave),
    inputField('vPartida','Data e hora de partida','datetime-local',localDT(defaults.d_h_partida)),
    inputField('vChegada','Data e hora de chegada','datetime-local',localDT(defaults.d_h_chegada)),
    selectField('vPiloto','Piloto',options(staff('PILOTO'),'cpf','nome',true),defaults.cpf_piloto),
    selectField('vCopiloto','Copiloto',options(staff('COPILOTO'),'cpf','nome',true),defaults.cpf_copiloto),
  ];
  const checked=new Set(existing?crew(existing):[]);
  const list=h('div',{class:'checkbox-group'},h('label',{},'Comissários (selecione de 2 a 4)'),
    h('div',{class:'checks'},...staff('COMISSARIO').map(f=>h('label',{},h('input',{name:'comissario',type:'checkbox',value:f.cpf,checked:checked.has(f.cpf)}),f.nome))),
    h('p',{class:'hint'},'O backend deverá conferir conflitos, descanso e quantidade de tripulantes antes de gravar.'));
  form.replaceChildren(...parts,list,h('div',{class:'full actions'},
    h('button',{class:'btn y',type:'submit'},existing?'Salvar alterações':'Criar voo'),
    h('button',{class:'btn s',type:'button',onclick:()=>box.hidden=true},'Cancelar')));
  form.onsubmit=async e=>{
    e.preventDefault();const get=id=>$('#'+id).value.trim();
    const comissarios=[...form.querySelectorAll('input[name="comissario"]:checked')].map(x=>x.value);
    if(!get('vCodigo')||!get('vTrajeto')||!get('vAeronave')||!get('vPartida')||!get('vChegada')||!get('vPiloto')||!get('vCopiloto')){
      error.replaceChildren(msg('err','Preencha todos os campos do voo.'));return;
    }
    if(!Number.isInteger(Number(get('vCodigo')))||Number(get('vCodigo'))<=0){error.replaceChildren(msg('err','Código do voo inválido.'));return}
    if(comissarios.length<2||comissarios.length>4){error.replaceChildren(msg('err','Selecione de 2 a 4 comissários.'));return}
    if(!get('vResponsavel')){error.replaceChildren(msg('err','Selecione o administrador responsável.'));return}
    const voo={codigo_voo:Number(get('vCodigo')),codigo_rota:Number(get('vTrajeto')),
      numero_serie_aeronave:get('vAeronave'),d_h_partida:get('vPartida').replace('T',' ')+':00',
      d_h_chegada:get('vChegada').replace('T',' ')+':00',cpf_administrador:get('vResponsavel'),
      cpf_piloto:get('vPiloto'),cpf_copiloto:get('vCopiloto')};
    const submit=form.querySelector('button[type="submit"]');submit.disabled=true;
    error.replaceChildren(msg('info','Validando escala de demonstração…'));
    try{await DATA.saveFlight(voo,comissarios,existing?.codigo_voo??null);
      error.replaceChildren(msg('ok','Voo salvo na demonstração.'));toast('Voo salvo na demonstração.');box.hidden=true;renderAdmin();
    }catch(err){error.replaceChildren(msg('err',err.message))}
    finally{submit.disabled=false}
  };
  box.scrollIntoView({behavior:'smooth',block:'nearest'});
}
init();
