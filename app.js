const LAT = 28.859, LON = -13.803; // Las Coloradas, Playa Blanca (zona del Gran Castillo Tagoro Family & Fun)
const START = "2026-09-01", END = "2026-09-06";
const TZ = "Atlantic/Canary";

/* ---------- Construcción de DOM sin innerHTML ---------- */

const SVG_NS = "http://www.w3.org/2000/svg";

function appendChildren(node, children){
  children.forEach(c=>{
    if(c == null || c === false) return;
    node.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
  });
  return node;
}

// Elemento HTML: los atributos se asignan con setAttribute y el texto como nodos de texto
function h(tag, attrs, ...children){
  const node = document.createElement(tag);
  if(attrs) Object.entries(attrs).forEach(([k,v])=>{ if(v != null) node.setAttribute(k, String(v)); });
  return appendChildren(node, children);
}

// Elemento SVG
function s(tag, attrs, ...children){
  const node = document.createElementNS(SVG_NS, tag);
  if(attrs) Object.entries(attrs).forEach(([k,v])=>{ if(v != null) node.setAttribute(k, String(v)); });
  return appendChildren(node, children);
}

/* ---------- Iconos (cada llamada devuelve un nodo nuevo) ---------- */

const LINE_ICON = {viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", "stroke-width":"1.6"};
const ROUND = {"stroke-linecap":"round"};

function lineIcon(shapes, extra){
  return s("svg", Object.assign({}, LINE_ICON, extra), ...shapes.map(([tag, attrs])=>s(tag, attrs)));
}

const ICONS = {
  morning: ()=>lineIcon([
    ["circle", {cx:12, cy:17, r:4}],
    ["path", {d:"M12 3v3M4.2 17H2M22 17h-2.2M5.6 9.6L4 8M20 8l-1.6 1.6", ...ROUND}]
  ]),
  sun: ()=>lineIcon([
    ["circle", {cx:12, cy:12, r:4.5}],
    ["path", {d:"M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4", ...ROUND}]
  ]),
  moon: ()=>lineIcon([
    ["path", {d:"M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"}]
  ]),
  partly: ()=>lineIcon([
    ["circle", {cx:8, cy:9, r:3.2}],
    ["path", {d:"M8 3.5v1.4M13.5 9h-1.4M3.9 4.4l1 1M3.9 13.6l1-1", ...ROUND}],
    ["path", {d:"M9 19h8.5a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 8.7 13.2 3.5 3.5 0 0 0 9 19Z"}]
  ]),
  cloudy: ()=>lineIcon([
    ["path", {d:"M7 18h11a3.8 3.8 0 0 0 .5-7.56A5.5 5.5 0 0 0 7.6 12.2 4 4 0 0 0 7 18Z"}]
  ]),
  rain: ()=>lineIcon([
    ["path", {d:"M6.5 16h10.2a3.6 3.6 0 0 0 .5-7.16A5.2 5.2 0 0 0 7.2 10.4 3.7 3.7 0 0 0 6.5 16Z"}],
    ["path", {d:"M8 19.5l-1 2M12 19.5l-1 2M16 19.5l-1 2", ...ROUND}]
  ]),
  wind: ()=>lineIcon([
    ["path", {d:"M3 8h11a3 3 0 1 0-2.5-4.7M3 16h15a3 3 0 1 1-2.5 4.7M3 12h8", ...ROUND}]
  ]),
  drop: ()=>lineIcon([
    ["path", {d:"M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z"}]
  ]),
  cloudSmall: ()=>lineIcon([
    ["path", {d:"M7 17h10a3.4 3.4 0 0 0 .5-6.76A5 5 0 0 0 7.6 11.2 3.6 3.6 0 0 0 7 17Z"}]
  ]),
  thermo: ()=>lineIcon([
    ["path", {d:"M12 2v11M12 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"}],
    ["path", {d:"M9 5.5a3 3 0 1 1 6 0", ...ROUND}]
  ], {"stroke-width":"1.8"}),
  star: ()=>s("svg", {class:"star-icon", viewBox:"0 0 24 24", fill:"currentColor"},
    s("path", {d:"M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 17.3l-5.9 3.2 1.3-6.5-4.9-4.6 6.6-.8L12 2.5z"})
  )
};

const PERIODS = [
  {key:"morning", label:"Mañana", hours:[8,9,10,11,12,13], icon:ICONS.morning},
  {key:"afternoon", label:"Tarde", hours:[14,15,16,17,18], icon:ICONS.sun},
  {key:"night", label:"Noche", hours:[19,20,21,22,23,0,1,2,3,4,5,6,7], icon:ICONS.moon}
];

const WEEKDAYS = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];

function avg(arr){ const v=arr.filter(x=>x!=null); return v.length? v.reduce((a,b)=>a+b,0)/v.length : null; }
function max(arr){ const v=arr.filter(x=>x!=null); return v.length? Math.max(...v) : null; }
function r(n,d=1){ return n==null ? "–" : Math.round(n*10**d)/10**d; }

function skyInfo(cloud, precip){
  // Iconos simples y coherentes con el resto del set de línea fina
  if(precip!=null && precip >= 45) return {icon:ICONS.rain, label:"Posible lluvia"};
  if(cloud==null) return {icon:ICONS.sun, label:"–"};
  if(cloud < 20) return {icon:ICONS.sun, label:"Despejado"};
  if(cloud < 55) return {icon:ICONS.partly, label:"Parcialmente nublado"};
  if(cloud < 85) return {icon:ICONS.cloudy, label:"Nuboso"};
  return {icon:ICONS.cloudy, label:"Cubierto"};
}

function heatWarning(temp, wind, cloud){
  // Calor que se siente de verdad: temperatura alta + poco viento que lo alivie + sol directo (poca nube)
  if(temp==null || wind==null || cloud==null) return null;
  if(temp >= 28 && wind < 15 && cloud < 30){
    return "Poco viento y sol directo: se sentirá bastante calor";
  }
  return null;
}

function emptyChart(el){
  el.replaceChildren(h("p", {class:"chart-empty"}, "Sin datos suficientes para la gráfica."));
}

async function loadWeather(){
  const statusEl = document.getElementById('status');
  const btn = document.getElementById('refreshBtn');
  const daysEl = document.getElementById('days');
  statusEl.className = "";
  statusEl.textContent = "Consultando previsión en vivo…";
  btn.disabled = true;
  daysEl.replaceChildren();

  try{
    const fUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=temperature_2m,wind_speed_10m,precipitation_probability,uv_index,cloud_cover&start_date=${START}&end_date=${END}&timezone=${encodeURIComponent(TZ)}`;
    const mUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${LAT}&longitude=${LON}&hourly=sea_surface_temperature&start_date=${START}&end_date=${END}&timezone=${encodeURIComponent(TZ)}`;

    const [fRes, mRes] = await Promise.all([fetch(fUrl), fetch(mUrl).catch(()=>null)]);
    if(!fRes.ok) throw new Error("No se pudo obtener la previsión (" + fRes.status + ")");
    const fData = await fRes.json();
    let mData = null;
    if(mRes && mRes.ok){ mData = await mRes.json(); }

    const hr = fData.hourly;
    const times = hr.time; // ISO strings per hour
    const byDate = {};
    times.forEach((t,i)=>{
      const [date, time] = t.split("T");
      const hour = parseInt(time.split(":")[0],10);
      if(!byDate[date]) byDate[date] = [];
      byDate[date].push({hour, temp:hr.temperature_2m[i], wind:hr.wind_speed_10m[i], precip:hr.precipitation_probability[i], uv:hr.uv_index[i], cloud:hr.cloud_cover ? hr.cloud_cover[i] : null});
    });

    let seaByDate = {};
    if(mData && mData.hourly){
      mData.hourly.time.forEach((t,i)=>{
        const [date] = t.split("T");
        if(!seaByDate[date]) seaByDate[date] = [];
        seaByDate[date].push(mData.hourly.sea_surface_temperature[i]);
      });
    }

    const todayStr = new Intl.DateTimeFormat('en-CA', {timeZone: TZ}).format(new Date()); // YYYY-MM-DD, hoy en Canarias
    const dates = Object.keys(byDate).sort().filter(d => d >= todayStr);

    if(dates.length === 0){
      statusEl.textContent = "El viaje (1–6 sept) ya ha terminado, o todavía está fuera de rango de previsión — no hay días que mostrar.";
      daysEl.replaceChildren();
      document.getElementById('chart').replaceChildren();
      document.getElementById('windChart').replaceChildren();
      return;
    }

    const dayNodes = [];
    const dailyStats = []; // {dayNum, weekday, tmax, tmin}
    const windPoints = []; // {dayNum, weekday, periodLabel, wind}

    // Pasada 1: estadísticas diarias, para saber cuál es el mejor día antes de pintar nada
    dates.forEach(date=>{
      const entries = byDate[date];
      const dObj = new Date(date + "T12:00:00");
      const dayTemps = entries.map(e=>e.temp).filter(t=>t!=null);
      dailyStats.push({
        date, dayNum: dObj.getDate(), weekday: WEEKDAYS[dObj.getDay()],
        tmax: dayTemps.length ? Math.max(...dayTemps) : null,
        tmin: dayTemps.length ? Math.min(...dayTemps) : null
      });
    });
    const bestDay = dailyStats.reduce((best,d)=>{
      if(d.tmax==null) return best;
      if(!best) return d;
      if(d.tmax > best.tmax) return d;
      if(d.tmax === best.tmax && (d.tmin ?? -Infinity) > (best.tmin ?? -Infinity)) return d;
      return best;
    }, null);
    const bestDate = bestDay ? bestDay.date : null;

    // Pasada 2: construir las tarjetas de cada día
    dates.forEach(date=>{
      const entries = byDate[date];
      const dObj = new Date(date + "T12:00:00");
      const dayNum = dObj.getDate();
      const weekday = WEEKDAYS[dObj.getDay()];
      const seaAvg = seaByDate[date] ? avg(seaByDate[date]) : null;

      const periodNodes = PERIODS.map(p=>{
        const rows = entries.filter(e=>p.hours.includes(e.hour));
        const t = avg(rows.map(x=>x.temp));
        const w = avg(rows.map(x=>x.wind));
        const pr = max(rows.map(x=>x.precip));
        const uv = max(rows.map(x=>x.uv));
        const cloud = avg(rows.map(x=>x.cloud));
        const sky = skyInfo(cloud, pr);
        const heatWarn = heatWarning(t, w, cloud);
        windPoints.push({dayNum, weekday, periodLabel:p.label, wind:w});

        return h("div", {class: "period" + (heatWarn ? " period-hot" : "")},
          h("div", {class:"period-top"},
            h("div", {class:"period-label"}, p.icon(), p.label),
            h("div", {class:"sky-badge", title: sky.label + (cloud!=null ? " · " + r(cloud,0) + "% nubes" : "")}, sky.icon())
          ),
          h("div", {class:"temp"}, String(r(t,0)), h("small", null, "°C")),
          h("div", {class:"sky-label"}, sky.label),
          h("div", {class:"metrics"},
            h("div", {class:"metric"}, ICONS.wind(), " Viento: ", h("b", null, r(w,0) + " km/h")),
            h("div", {class:"metric"}, ICONS.drop(), " Lluvia: ", h("b", null, pr==null ? "–" : r(pr,0) + "%")),
            h("div", {class:"metric"}, ICONS.sun(), " UV: ", h("b", null, uv==null ? "–" : String(r(uv,0)))),
            h("div", {class:"metric"}, ICONS.cloudSmall(), " Nubes: ", h("b", null, cloud==null ? "–" : r(cloud,0) + "%"))
          ),
          heatWarn ? h("div", {class:"heat-warn"}, ICONS.thermo(), heatWarn) : null
        );
      });

      const isBest = date === bestDate;
      dayNodes.push(
        h("div", {class: "day" + (isBest ? " day-best" : "")},
          h("div", {class:"day-head"},
            h("div", {class:"day-num"}, String(dayNum), isBest ? ICONS.star() : null),
            h("div", {class:"day-name"},
              weekday + " de septiembre " + (seaAvg!=null ? "· 🌊 mar " + r(seaAvg,0) + "°C" : "") + (isBest ? " · mejor día" : ""))
          ),
          h("div", {class:"periods"}, ...periodNodes)
        )
      );
    });

    daysEl.replaceChildren(...dayNodes);
    window.lastDailyStats = dailyStats;
    drawChart(dailyStats, window.lastAemetByDate || null);
    drawWindChart(windPoints);
    const hiddenPast = START < todayStr;
    statusEl.textContent = "Actualizado: " + new Date().toLocaleString('es-ES', {dateStyle:'medium', timeStyle:'short'})
      + (hiddenPast ? " · días ya pasados ocultos automáticamente" : "");

  }catch(err){
    statusEl.className = "err";
    statusEl.textContent = "No se pudo cargar el tiempo: " + err.message + ". Comprueba tu conexión y pulsa 'Actualizar ahora'.";
  }finally{
    btn.disabled = false;
  }
}

// Líneas de rejilla horizontales con su etiqueta en el eje Y
function gridNodes(min, maxV, y, padL, W, padR, fmt){
  const nodes = [];
  const steps = 4;
  for(let st=0; st<=steps; st++){
    const v = min + ((maxV-min)*st/steps);
    const yy = y(v);
    nodes.push(s("line", {x1:padL, y1:yy.toFixed(1), x2:W-padR, y2:yy.toFixed(1), stroke:"rgba(28,26,23,0.08)", "stroke-width":"1"}));
    nodes.push(s("text", {x:padL-8, y:(yy+3.5).toFixed(1), "text-anchor":"end", class:"chart-daylabel"}, fmt(v)));
  }
  return nodes;
}

// Separador vertical de día + etiqueta "1 lun"
function dayMarkerNodes(xx, padT, innerH, H, label){
  return [
    s("line", {x1:xx.toFixed(1), y1:padT, x2:xx.toFixed(1), y2:padT+innerH, stroke:"rgba(28,26,23,0.06)", "stroke-width":"1", "stroke-dasharray":"3,3"}),
    s("text", {x:xx.toFixed(1), y:H-10, "text-anchor":"middle", class:"chart-daylabel", "font-weight":"600"}, label)
  ];
}

function legendItem(swatchClass, text){
  return h("span", null, h("i", {class:swatchClass}), text);
}

function drawChart(days, aemetByDate){
  const el = document.getElementById('chart');
  const valid = days.filter(d=>d.tmax!=null && d.tmin!=null);
  if(valid.length < 2){ emptyChart(el); return; }

  const W = 880, H = 240, padL = 32, padR = 16, padT = 44, padB = 34;
  const innerW = W - padL - padR, innerH = H - padT - padB;

  const aemetVals = aemetByDate ? days.flatMap(d=>{
    const a = aemetByDate[d.date];
    return a ? [a.tmax, a.tmin] : [];
  }) : [];
  const allTemps = days.flatMap(d=>[d.tmax, d.tmin]).filter(t=>t!=null).concat(aemetVals.filter(t=>t!=null));
  const tMin = Math.min(...allTemps) - 1.5;
  const tMax = Math.max(...allTemps) + 1.5;

  const n = days.length;
  const x = i => n === 1 ? padL + innerW/2 : padL + (innerW * i) / (n - 1);
  const y = t => padT + innerH - ((t - tMin) / (tMax - tMin)) * innerH;

  let bestIdx = -1, bestTmax = -Infinity, bestTmin = -Infinity;
  days.forEach((d,i)=>{
    if(d.tmax==null) return;
    if(d.tmax > bestTmax || (d.tmax === bestTmax && (d.tmin ?? -Infinity) > bestTmin)){
      bestTmax = d.tmax; bestTmin = d.tmin ?? -Infinity; bestIdx = i;
    }
  });

  const maxPath = days.map((d,i)=> (i===0?"M":"L") + x(i).toFixed(1) + "," + y(d.tmax).toFixed(1)).join(" ");
  const minPath = days.map((d,i)=> (i===0?"M":"L") + x(i).toFixed(1) + "," + y(d.tmin).toFixed(1)).join(" ");
  const bandPath = maxPath + " " + days.slice().reverse().map(d=>"L"+x(days.indexOf(d)).toFixed(1)+","+y(d.tmin).toFixed(1)).join(" ") + " Z";

  // AEMET overlay paths (only for days where we have data)
  let aemetMaxPath = "", aemetMinPath = "";
  if(aemetByDate){
    const pts = days.map((d,i)=> aemetByDate[d.date] ? {i, a: aemetByDate[d.date]} : null).filter(Boolean);
    if(pts.length){
      aemetMaxPath = pts.map((p,idx)=> (idx===0?"M":"L") + x(p.i).toFixed(1) + "," + y(p.a.tmax).toFixed(1)).join(" ");
      aemetMinPath = pts.map((p,idx)=> (idx===0?"M":"L") + x(p.i).toFixed(1) + "," + y(p.a.tmin).toFixed(1)).join(" ");
    }
  }

  // horizontal grid
  const grid = gridNodes(tMin, tMax, y, padL, W, padR, t=>Math.round(t) + "°");

  // day labels
  const dayMarks = days.flatMap((d,i)=> dayMarkerNodes(x(i), padT, innerH, H, d.dayNum + " " + d.weekday.slice(0,3)));

  // star over the best day (highest tmax)
  let star = null;
  if(bestIdx >= 0){
    const sx = x(bestIdx), sy = y(days[bestIdx].tmax) - 26;
    star = s("g", {transform:`translate(${(sx-8).toFixed(1)},${(sy-8).toFixed(1)})`},
      s("path", {d:"M8 0l1.9 4.1L14 4.6l-3.3 3 1 4.3L8 9.7 4.3 11.9l1-4.3L2 4.6l4.1-.5z", fill:"var(--sun)"})
    );
  }

  // points + labels for both Open-Meteo lines
  const pts = days.flatMap((d,i)=>{
    const xx = x(i);
    const yMax = y(d.tmax), yMin = y(d.tmin);
    return [
      s("g", {class:"chart-point"},
        s("circle", {cx:xx.toFixed(1), cy:yMax.toFixed(1), r:"3.5", fill:"var(--sun)", stroke:"#fff", "stroke-width":"1.5"}),
        s("text", {x:xx.toFixed(1), y:(yMax-10).toFixed(1), "text-anchor":"middle", class:"chart-val", fill:"var(--sun)"}, Math.round(d.tmax) + "°")
      ),
      s("g", {class:"chart-point"},
        s("circle", {cx:xx.toFixed(1), cy:yMin.toFixed(1), r:"3.5", fill:"var(--ocean-light)", stroke:"#fff", "stroke-width":"1.5"}),
        s("text", {x:xx.toFixed(1), y:(yMin+18).toFixed(1), "text-anchor":"middle", class:"chart-val", fill:"var(--ocean-light)"}, Math.round(d.tmin) + "°")
      )
    ];
  });

  // AEMET points
  const aemetPts = [];
  if(aemetByDate){
    days.forEach((d,i)=>{
      const a = aemetByDate[d.date];
      if(!a) return;
      const xx = x(i);
      if(a.tmax!=null) aemetPts.push(s("circle", {cx:xx.toFixed(1), cy:y(a.tmax).toFixed(1), r:"3", fill:"#fff", stroke:"var(--sun)", "stroke-width":"2"}));
      if(a.tmin!=null) aemetPts.push(s("circle", {cx:xx.toFixed(1), cy:y(a.tmin).toFixed(1), r:"3", fill:"#fff", stroke:"var(--ocean-light)", "stroke-width":"2"}));
    });
  }

  const legend = h("div", {class:"chart-legend"},
    legendItem("sw-max", "Máxima (Open-Meteo)"),
    legendItem("sw-min", "Mínima (Open-Meteo)"),
    aemetByDate ? legendItem("sw-aemet-max", "Máxima (AEMET, discontinua)") : null,
    aemetByDate ? legendItem("sw-aemet-min", "Mínima (AEMET, discontinua)") : null
  );

  const chartSvg = s("svg", {viewBox:`0 0 ${W} ${H}`},
    s("defs", null,
      s("linearGradient", {id:"bandFill", x1:"0", y1:"0", x2:"0", y2:"1"},
        s("stop", {offset:"0%", "stop-color":"#e2793d", "stop-opacity":"0.14"}),
        s("stop", {offset:"100%", "stop-color":"#3d8b98", "stop-opacity":"0.14"})
      )
    ),
    ...grid,
    ...dayMarks,
    s("path", {d:bandPath, fill:"url(#bandFill)"}),
    aemetMaxPath ? s("path", {d:aemetMaxPath, fill:"none", stroke:"var(--sun)", "stroke-width":"1.8", "stroke-dasharray":"5,4", "stroke-linejoin":"round", "stroke-linecap":"round"}) : null,
    aemetMinPath ? s("path", {d:aemetMinPath, fill:"none", stroke:"var(--ocean-light)", "stroke-width":"1.8", "stroke-dasharray":"5,4", "stroke-linejoin":"round", "stroke-linecap":"round"}) : null,
    s("path", {d:maxPath, fill:"none", stroke:"var(--sun)", "stroke-width":"2.2", "stroke-linejoin":"round", "stroke-linecap":"round"}),
    s("path", {d:minPath, fill:"none", stroke:"var(--ocean-light)", "stroke-width":"2.2", "stroke-linejoin":"round", "stroke-linecap":"round"}),
    ...aemetPts,
    ...pts,
    star
  );

  el.replaceChildren(legend, chartSvg);

  // texto resumen: máxima y mínima absolutas del periodo, con su día
  const capEl = document.getElementById('chartCaption');
  if(capEl){
    let maxDay = days[0], minDay = days[0];
    days.forEach(d=>{
      if(d.tmax!=null && d.tmax > maxDay.tmax) maxDay = d;
      if(d.tmin!=null && d.tmin < minDay.tmin) minDay = d;
    });
    capEl.replaceChildren(
      "Máxima del periodo: ", h("b", null, Math.round(maxDay.tmax) + "°"),
      ` (${maxDay.weekday.slice(0,3)} ${maxDay.dayNum}) · Mínima: `, h("b", null, Math.round(minDay.tmin) + "°"),
      ` (${minDay.weekday.slice(0,3)} ${minDay.dayNum})`
    );
  }
}

function drawWindChart(points){
  const el = document.getElementById('windChart');
  const valid = points.filter(p=>p.wind!=null);
  if(valid.length < 2){ emptyChart(el); return; }

  const W = 880, H = 220, padL = 32, padR = 16, padT = 26, padB = 34;
  const innerW = W - padL - padR, innerH = H - padT - padB;

  const winds = points.map(p=>p.wind).filter(w=>w!=null);
  const wMin = Math.max(0, Math.min(...winds) - 3);
  const wMax = Math.max(...winds) + 3;

  const n = points.length;
  const x = i => padL + (innerW * i) / (n - 1);
  const y = w => padT + innerH - ((w - wMin) / (wMax - wMin)) * innerH;

  const linePath = points.map((p,i)=> (i===0?"M":"L") + x(i).toFixed(1) + "," + y(p.wind).toFixed(1)).join(" ");
  const areaPath = linePath + ` L${x(n-1).toFixed(1)},${(padT+innerH).toFixed(1)} L${x(0).toFixed(1)},${(padT+innerH).toFixed(1)} Z`;

  // horizontal grid
  const grid = gridNodes(wMin, wMax, y, padL, W, padR, wv=>String(Math.round(wv)));

  // day separators + labels (start of each day)
  const dayMarks = points.flatMap((p,i)=>
    p.periodLabel === "Mañana" ? dayMarkerNodes(x(i), padT, innerH, H, p.dayNum + " " + p.weekday.slice(0,3)) : []
  );

  // points + labels
  const pts = points.map((p,i)=>{
    const xx = x(i), yy = y(p.wind);
    return s("g", {class:"chart-point"},
      s("circle", {cx:xx.toFixed(1), cy:yy.toFixed(1), r:"3.5", fill:"var(--green)", stroke:"#fff", "stroke-width":"1.5"}),
      s("text", {x:xx.toFixed(1), y:(yy-10).toFixed(1), "text-anchor":"middle", class:"chart-val", fill:"var(--green)"}, String(Math.round(p.wind))),
      s("text", {x:xx.toFixed(1), y:padT-10, "text-anchor":"middle", class:"chart-periodlabel"}, p.periodLabel[0])
    );
  });

  const legend = h("div", {class:"chart-legend"}, legendItem("sw-wind", "Viento medio (km/h)"));

  const chartSvg = s("svg", {viewBox:`0 0 ${W} ${H}`},
    s("defs", null,
      s("linearGradient", {id:"windFill", x1:"0", y1:"0", x2:"0", y2:"1"},
        s("stop", {offset:"0%", "stop-color":"#5c7a4a", "stop-opacity":"0.18"}),
        s("stop", {offset:"100%", "stop-color":"#5c7a4a", "stop-opacity":"0"})
      )
    ),
    ...grid,
    ...dayMarks,
    s("path", {d:areaPath, fill:"url(#windFill)"}),
    s("path", {d:linePath, fill:"none", stroke:"var(--green)", "stroke-width":"2.2", "stroke-linejoin":"round", "stroke-linecap":"round"}),
    ...pts
  );

  el.replaceChildren(legend, chartSvg);

  // texto resumen: viento máximo y mínimo del periodo, con día y momento del día
  const capEl = document.getElementById('windChartCaption');
  if(capEl){
    let maxP = points[0], minP = points[0];
    points.forEach(p=>{
      if(p.wind!=null && p.wind > maxP.wind) maxP = p;
      if(p.wind!=null && p.wind < minP.wind) minP = p;
    });
    capEl.replaceChildren(
      "Viento más fuerte: ", h("b", null, Math.round(maxP.wind) + " km/h"),
      ` (${maxP.periodLabel.toLowerCase()} del ${maxP.weekday.slice(0,3)} ${maxP.dayNum}) · Más suave: `, h("b", null, Math.round(minP.wind) + " km/h"),
      ` (${minP.periodLabel.toLowerCase()} del ${minP.weekday.slice(0,3)} ${minP.dayNum})`
    );
  }
}

document.getElementById('refreshBtn').addEventListener('click', ()=>loadWeather());
document.getElementById('aemetBtn').addEventListener('click', ()=>loadAemet());

loadWeather();

const AEMET_MUNICIPIO = "35004"; // Arrecife, Lanzarote
const AEMET_DATA_PREFIX = "https://opendata.aemet.es/";

async function loadAemet(){
  const statusEl = document.getElementById('aemetStatus');
  const btn = document.getElementById('aemetBtn');
  const keyInput = document.getElementById('aemetKey');
  const key = keyInput.value.trim();

  if(!key){
    statusEl.className = "err";
    statusEl.textContent = "Pega antes tu API key de AEMET.";
    return;
  }
  if(!window.lastDailyStats){
    statusEl.className = "err";
    statusEl.textContent = "Espera a que cargue primero la previsión de Open-Meteo.";
    return;
  }

  btn.disabled = true;
  statusEl.className = "";
  statusEl.textContent = "Consultando AEMET…";

  try{
    const stepUrl = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${AEMET_MUNICIPIO}?api_key=${encodeURIComponent(key)}`;
    const stepRes = await fetch(stepUrl);
    if(!stepRes.ok) throw new Error("AEMET rechazó la key o la petición (" + stepRes.status + ")");
    const stepData = await stepRes.json();
    if(!stepData.datos) throw new Error(stepData.descripcion || "Respuesta inesperada de AEMET");
    // Solo se descarga el dato final si la URL apunta al propio servidor de AEMET
    if(typeof stepData.datos !== "string" || !stepData.datos.startsWith(AEMET_DATA_PREFIX)){
      throw new Error("Respuesta inesperada de AEMET");
    }

    const dataRes = await fetch(stepData.datos);
    if(!dataRes.ok) throw new Error("No se pudo descargar el dato final de AEMET (" + dataRes.status + ")");
    const buf = await dataRes.arrayBuffer();
    const text = new TextDecoder('iso-8859-15').decode(buf);
    const parsed = JSON.parse(text);

    const dias = parsed[0]?.prediccion?.dia || [];
    const aemetByDate = {};
    dias.forEach(d=>{
      const date = d.fecha.split("T")[0];
      const tmax = d.temperatura?.maxima!=null ? Number(d.temperatura.maxima) : null;
      const tmin = d.temperatura?.minima!=null ? Number(d.temperatura.minima) : null;
      if(tmax!=null || tmin!=null) aemetByDate[date] = {tmax, tmin};
    });

    const covered = window.lastDailyStats.filter(d=>aemetByDate[d.date]).length;
    if(covered === 0){
      statusEl.className = "err";
      statusEl.textContent = "AEMET solo da previsión a 7 días vista: todavía no cubre estas fechas. Prueba de nuevo más cerca del viaje.";
      window.lastAemetByDate = null;
      drawChart(window.lastDailyStats, null);
      return;
    }

    window.lastAemetByDate = aemetByDate;
    drawChart(window.lastDailyStats, aemetByDate);
    statusEl.className = "ok";
    statusEl.textContent = `Comparado ✓ (AEMET cubre ${covered} de ${window.lastDailyStats.length} días — su previsión solo llega a 7 días vista).`;

  }catch(err){
    statusEl.className = "err";
    const isLikelyCors = err instanceof TypeError;
    statusEl.textContent = isLikelyCors
      ? "No se pudo conectar con AEMET desde el navegador (probablemente su API bloquea peticiones directas por CORS). Puedes ver la previsión oficial en aemet.es como alternativa."
      : "Error: " + err.message;
  }finally{
    btn.disabled = false;
  }
}
