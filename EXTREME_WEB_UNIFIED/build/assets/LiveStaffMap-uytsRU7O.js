import{a as e}from"./chunk-BEqpzyXh.js";import{n as t}from"./react-dom-DQeDwO8J.js";import{C as n,S as r,_ as i,a,b as o,c as s,d as c,f as ee,g as te,h as ne,i as re,l,m as ie,n as ae,p as oe,r as se,t as u,u as ce,v as le,w as d,x as f,y as ue}from"./index-CcBTBCk6.js";var de=f(`pen-line`,[[`path`,{d:`M13 21h8`,key:`1jsn5i`}],[`path`,{d:`M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z`,key:`1a8usu`}]]),p=e(t(),1),m=e(u(),1),h=d();function fe(e=0,t=``){let n=t.toLowerCase(),r=e<=50?75:e<=150?120:e<=500?200:300;return(n.includes(`festival`)||n.includes(`concert`)||n.includes(`outdoor`))&&(r+=50),(n.includes(`restaurant`)||n.includes(`dinner`)||n.includes(`cafe`))&&(r=Math.max(50,r-25)),r}function pe(e,t,n){let r=!1;for(let i=0,a=n.length-1;i<n.length;a=i++){let[o,s]=n[i],[c,ee]=n[a];o>e!=c>e&&t<(ee-s)*(e-o)/(c-o)+s&&(r=!r)}return r}async function me(e,t){let n=`[out:json][timeout:15];(way["building"](around:60,${e},${t});way["amenity"](around:80,${e},${t});way["leisure"](around:80,${e},${t}););out geom;`;try{let r=await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(n)}`);if(!r.ok)return null;let i=await r.json();if(!i.elements?.length)return null;let a=[];for(let e of i.elements){if(e.type!==`way`||!e.geometry?.length)continue;let t=e.geometry.map(e=>[e.lat,e.lon]);if(t.length<3)continue;let n=t.map(e=>e[0]),r=t.map(e=>e[1]),i=(Math.max(...n)-Math.min(...n))*(Math.max(...r)-Math.min(...r));a.push({coords:t,area:i})}a.sort((e,t)=>e.area-t.area);for(let n of a)if(pe(e,t,n.coords))return n.coords;return a[0]?.coords??null}catch{return null}}function he(e,t,n,r){let i=(n-e)*Math.PI/180,a=(r-t)*Math.PI/180,o=Math.sin(i/2)*Math.sin(i/2)+Math.cos(e*Math.PI/180)*Math.cos(n*Math.PI/180)*Math.sin(a/2)*Math.sin(a/2);return 6371e3*(2*Math.atan2(Math.sqrt(o),Math.sqrt(1-o)))}var g={TRAVEL_TO_VENUE:`#0ea5e9`,ARRIVED:`#14b8a6`,IN_PROGRESS:`#22c55e`,ONGOING:`#22c55e`,BREAK:`#a855f7`,COMPLETED:`#3b82f6`,TRAVEL_HOME:`#f97316`,CONFIRMED:`#eab308`,PENDING:`#6b7280`},_={TRAVEL_TO_VENUE:`Traveling`,ARRIVED:`Arrived`,IN_PROGRESS:`Working`,ONGOING:`Working`,BREAK:`On Break`,COMPLETED:`Completed`,TRAVEL_HOME:`Going Home`,CONFIRMED:`Confirmed`,PENDING:`Pending`};function ge(e,t,n){let r=g[t]||`#6b7280`,i=e.split(` `).map(e=>e[0]).join(``).slice(0,2).toUpperCase(),a=n?48:40,o=a+24,s=n?`box-shadow: 0 0 0 4px rgba(255,255,255,0.9), 0 0 0 6px `+r+`;`:``;return m.default.divIcon({className:`custom-staff-icon`,html:`
      <div style="position:relative; display:flex; align-items:center; justify-content:center; width:${a}px; height:${a}px;">
        <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:${r}; opacity:0.25; ${t===`TRAVEL_TO_VENUE`||t===`TRAVEL_HOME`?`animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;`:``}"></div>
        <div style="position:relative; width:${a-8}px; height:${a-8}px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:${r}; border:3px solid white; ${s} z-index:10; cursor:pointer;">
          <span style="color:white; font-weight:700; font-size:${n?14:12}px; letter-spacing:0.5px;">${i}</span>
        </div>
        <div style="position:absolute; top:${a+2}px; left:50%; transform:translateX(-50%); background:white; padding:2px 8px; border-radius:10px; box-shadow:0 1px 4px rgba(0,0,0,0.15); white-space:nowrap; z-index:20; border:1px solid ${r}30;">
          <span style="font-size:10px; font-weight:600; color:#333;">${e.split(` `)[0]}</span>
        </div>
      </div>
    `,iconSize:[a,o],iconAnchor:[a/2,a/2]})}function _e(){return m.default.divIcon({className:`custom-staff-icon`,html:`
      <div style="position:relative; display:flex; align-items:center; justify-content:center; width:52px; height:52px;">
        <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:#dc2626; opacity:0.15;"></div>
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:linear-gradient(135deg, #dc2626, #b91c1c); border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.3); z-index:10;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div style="position:absolute; top:54px; left:50%; transform:translateX(-50%); background:#dc2626; padding:2px 10px; border-radius:10px; white-space:nowrap; z-index:20;">
          <span style="font-size:10px; font-weight:700; color:white;">VENUE</span>
        </div>
      </div>
    `,iconSize:[52,72],iconAnchor:[26,26]})}function v({eventId:e,venueLat:t,venueLng:u,venueName:d,guestCount:f=0,eventType:v=``,canEditGeofence:ve=!1,savedGeofencePolygon:y=null,savedGeofenceRadius:ye=null,onClose:be,onStaffExitVenue:b,className:xe=``,selectedStaffId:x}){let S=(0,p.useRef)(null),C=(0,p.useRef)(null),w=(0,p.useRef)(new Map),Se=(0,p.useRef)(null),T=(0,p.useRef)(null),E=(0,p.useRef)(null),D=(0,p.useRef)(null),O=(0,p.useRef)(null),k=(0,p.useRef)(null),A=(0,p.useRef)([]),j=(0,p.useRef)(null),M=(0,p.useRef)(!1),N=(0,p.useRef)(null),P=(0,p.useRef)(new Set),[F,Ce]=(0,p.useState)([]),[I,we]=(0,p.useState)(!1),[L,Te]=(0,p.useState)(!0),[Ee,De]=(0,p.useState)(!1),[R,z]=(0,p.useState)(x||null),[Oe,ke]=(0,p.useState)([]),[Ae,B]=(0,p.useState)([]),[V,je]=(0,p.useState)(null),[H,Me]=(0,p.useState)(10),[U,W]=(0,p.useState)(null),[G,K]=(0,p.useState)(!1),[q,J]=(0,p.useState)([]),Ne=(0,p.useCallback)((e,t,n,r)=>{if(!S.current||!C.current)return;if(T.current){let e=T.current.getElement();e&&(e.classList.add(`venue-radius-flash`),setTimeout(()=>e.classList.remove(`venue-radius-flash`),1e3))}let i=S.current.latLngToContainerPoint([n,r]),a=document.createElement(`div`);a.className=`staff-arrival-marker`,a.style.left=`${i.x-30}px`,a.style.top=`${i.y-30}px`,C.current.appendChild(a),setTimeout(()=>a.remove(),1500);let o=`${t}-${Date.now()}`;ke(t=>[...t,{id:o,staffName:e,timestamp:Date.now()}]),setTimeout(()=>{ke(e=>e.filter(e=>e.id!==o))},4e3)},[]),Pe=(0,p.useCallback)(e=>{if(!t||!u||!e.lat||!e.lng)return;let n=e.staffId||e.shiftId,r=U??V,i=r?pe(e.lat,e.lng,r):he(e.lat,e.lng,t,u)<=H,a=P.current.has(n);if(i&&!a)P.current.add(n),Ne(e.staffName,n,e.lat,e.lng);else if(!i&&a){P.current.delete(n);let t=`exit-${n}-${Date.now()}`;B(n=>[...n,{id:t,staffName:e.staffName,timestamp:Date.now()}]),setTimeout(()=>B(e=>e.filter(e=>e.id!==t)),5e3),b?.(e.staffName,n)}},[t,u,V,U,H,Ne,b]),Y=(0,p.useCallback)(async()=>{try{Ce((await r.get(`/events/${e}/staff-locations`)).data.staff||[])}catch(e){console.error(`Failed to fetch staff locations:`,e)}finally{Te(!1)}},[e]);(0,p.useEffect)(()=>{if(!C.current||S.current)return;let e=t&&u?[t,u]:[40.7128,-74.006],n=m.default.map(C.current,{zoomControl:!1,attributionControl:!1,dragging:!0,scrollWheelZoom:!0,touchZoom:!0,doubleClickZoom:!0,boxZoom:!0}).setView(e,14);m.default.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,{attribution:`&copy; OpenStreetMap contributors`,maxZoom:19}).addTo(n),m.default.control.zoom({position:`bottomright`}).addTo(n),t&&u&&(Se.current=m.default.marker([t,u],{icon:_e()}).addTo(n).bindPopup(`<div style="text-align:center; padding:4px;"><strong>${d||`Event Venue`}</strong></div>`),T.current=m.default.circle([t,u],{radius:10,color:`#dc2626`,fillColor:`#dc2626`,fillOpacity:.08,weight:2,dashArray:`8, 4`,className:`venue-radius-circle`}).addTo(n),D.current=m.default.circle([t,u],{radius:10,color:`#dc2626`,fillColor:`transparent`,fillOpacity:0,weight:3,opacity:.6,className:`venue-pulse-circle`}).addTo(n)),S.current=n,setTimeout(()=>n.invalidateSize(),100),setTimeout(()=>n.invalidateSize(),500);let r=document.createElement(`style`);return r.textContent=`
      @keyframes ping {
        75%, 100% { transform: scale(2); opacity: 0; }
      }
      @keyframes venue-pulse {
        0% { 
          stroke-opacity: 0.6;
          stroke-width: 3px;
        }
        50% {
          stroke-opacity: 0.3;
          stroke-width: 5px;
        }
        100% {
          stroke-opacity: 0.6;
          stroke-width: 3px;
        }
      }
      @keyframes arrival-burst {
        0% { 
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(2.5);
          opacity: 0.6;
        }
        100% {
          transform: scale(4);
          opacity: 0;
        }
      }
      @keyframes radius-flash {
        0% { 
          fill-opacity: 0.08;
        }
        25% {
          fill-opacity: 0.3;
          fill: #22c55e;
        }
        50% {
          fill-opacity: 0.4;
          fill: #22c55e;
        }
        100% {
          fill-opacity: 0.08;
          fill: #dc2626;
        }
      }
      @keyframes notification-slide {
        0% { 
          transform: translateX(100%);
          opacity: 0;
        }
        10% {
          transform: translateX(0);
          opacity: 1;
        }
        90% {
          transform: translateX(0);
          opacity: 1;
        }
        100% {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      .venue-pulse-circle {
        animation: venue-pulse 2s ease-in-out infinite;
      }
      .venue-radius-flash {
        animation: radius-flash 1s ease-out forwards;
      }
      .staff-arrival-marker {
        position: absolute;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: radial-gradient(circle, #22c55e 0%, transparent 70%);
        animation: arrival-burst 1.5s ease-out forwards;
        pointer-events: none;
        z-index: 1000;
      }
      .arrival-notification {
        animation: notification-slide 4s ease-in-out forwards;
      }
      .custom-staff-icon {
        background: transparent !important;
        border: none !important;
      }
      .leaflet-container {
        cursor: grab !important;
        touch-action: none !important;
      }
      .leaflet-container:active {
        cursor: grabbing !important;
      }
      .leaflet-grab {
        cursor: grab !important;
      }
      .leaflet-dragging .leaflet-grab {
        cursor: grabbing !important;
      }
    `,document.head.appendChild(r),()=>{n.remove(),S.current=null,r.remove()}},[t,u,d]),(0,p.useEffect)(()=>{Me(fe(f,v)),!(!t||!u)&&me(t,u).then(e=>{if(je(e),!S.current)return;let t=S.current;e?(T.current&&=(t.removeLayer(T.current),null),D.current&&=(t.removeLayer(D.current),null),E.current&&t.removeLayer(E.current),E.current=m.default.polygon(e,{color:`#dc2626`,fillColor:`#dc2626`,fillOpacity:.08,weight:2,dashArray:`8, 4`,className:`venue-radius-circle`}).addTo(t)):(T.current&&T.current.setRadius(10),D.current&&D.current.setRadius(10))})},[t,u,f,v]),(0,p.useEffect)(()=>(Y(),N.current=setInterval(()=>{Y()},1e4),()=>{N.current&&clearInterval(N.current)}),[Y]),(0,p.useEffect)(()=>{let t=localStorage.getItem(`token`);if(!t){console.warn(`[LiveStaffMap] No auth token found, socket will not connect`);return}let n=`http://139.59.61.92:5000/`;console.log(`[LiveStaffMap] Connecting socket to:`,n);let r=ae(n,{auth:{token:t},transports:[`websocket`,`polling`]});return r.on(`connect`,()=>{console.log(`[LiveStaffMap] Socket connected, id:`,r.id),De(!0)}),r.on(`connect_error`,e=>{console.error(`[LiveStaffMap] Socket connection error:`,e.message)}),r.on(`disconnect`,e=>{console.log(`[LiveStaffMap] Socket disconnected:`,e),De(!1)}),r.on(`staff:location`,t=>{console.log(`[LiveStaffMap] Received staff:location`,t.staffName,t.lat,t.lng,`eventId:`,t.eventId),t.eventId===e&&Ce(e=>{let n=e.findIndex(e=>e.staffId===t.staffId||e.shiftId===t.shiftId);if(n>=0){let r=[...e];return r[n]={...r[n],lat:t.lat,lng:t.lng,status:t.status},r}return[...e,{shiftId:t.shiftId,staffId:t.staffId,staffName:t.staffName,status:t.status,lat:t.lat,lng:t.lng,travelEnabled:!0}]})}),r.on(`geofence:exit`,t=>{if(t.eventId!==e)return;let n=`exit-srv-${t.shiftId}-${Date.now()}`;B(e=>[...e,{id:n,staffName:t.staffName,timestamp:Date.now()}]),setTimeout(()=>B(e=>e.filter(e=>e.id!==n)),5e3),b?.(t.staffName,t.shiftId)}),r.on(`geofence:enter`,t=>{t.eventId===e&&B(e=>e.filter(e=>!e.id.includes(t.shiftId)))}),j.current=r,()=>{r.disconnect(),j.current=null}},[e]),(0,p.useEffect)(()=>{if(!S.current)return;let e=S.current,n=w.current,r=new Set;if(F.forEach(t=>{if(!t.lat||!t.lng)return;let i=t.staffId||t.shiftId;r.add(i),Pe(t);let a=x===t.staffId,o=ge(t.staffName||`Staff`,t.status,a),s=`
        <div style="min-width:180px; padding:4px;">
          <div style="font-weight:700; font-size:14px; margin-bottom:4px;">${t.staffName||`Staff`}</div>
          <div style="display:inline-block; padding:2px 8px; border-radius:12px; background:${g[t.status]||`#6b7280`}20; color:${g[t.status]||`#6b7280`}; font-size:12px; font-weight:600; margin-bottom:6px;">
            ${_[t.status]||t.status}
          </div>
          ${t.staffPhone?`<div style="font-size:12px; color:#666; margin-top:4px;">📞 ${t.staffPhone}</div>`:``}
          ${t.clockIn?`<div style="font-size:12px; color:#666; margin-top:2px;">🕐 In: ${new Date(t.clockIn).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})}</div>`:``}
          ${t.clockOut?`<div style="font-size:12px; color:#666;">🕐 Out: ${new Date(t.clockOut).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})}</div>`:``}
        </div>
      `,c=n.get(i);if(c)c.setLatLng([t.lat,t.lng]),c.setIcon(o),c.getPopup()?.setContent(s);else{let r=m.default.marker([t.lat,t.lng],{icon:o}).addTo(e).bindPopup(s);n.set(i,r)}}),n.forEach((t,i)=>{r.has(i)||(e.removeLayer(t),n.delete(i))}),!M.current){let n=[];t&&u&&n.push([t,u]),F.forEach(e=>{e.lat&&e.lng&&n.push([e.lat,e.lng])}),n.length>1?(e.fitBounds(m.default.latLngBounds(n),{padding:[60,60],maxZoom:16}),M.current=!0):n.length===1&&(M.current=!0)}},[F,x,t,u,Pe]),(0,p.useEffect)(()=>{if(!S.current||!x)return;z(x);let e=F.find(e=>e.staffId===x);if(e?.lat&&e?.lng){S.current.flyTo([e.lat,e.lng],16,{duration:1});let t=w.current.get(e.staffId||e.shiftId);t&&t.openPopup()}},[x]),(0,p.useEffect)(()=>{if(!S.current||!R)return;let e=F.find(e=>e.staffId===R);e?.lat&&e?.lng&&S.current.panTo([e.lat,e.lng],{animate:!0,duration:.5})},[F,R]),(0,p.useEffect)(()=>{setTimeout(()=>S.current?.invalidateSize(),300)},[I]);let Fe=F.filter(e=>e.lat&&e.lng&&[`TRAVEL_TO_VENUE`,`TRAVEL_HOME`].includes(e.status)),X=F.filter(e=>[`ARRIVED`,`IN_PROGRESS`,`ONGOING`,`BREAK`,`COMPLETED`].includes(e.status)),Ie=e=>{if(z(e.staffId),e.lat&&e.lng&&S.current){S.current.flyTo([e.lat,e.lng],17,{duration:1});let t=w.current.get(e.staffId||e.shiftId);t&&setTimeout(()=>t.openPopup(),500)}},Le=()=>{if(z(null),!S.current)return;let e=[];t&&u&&e.push([t,u]),F.forEach(t=>{t.lat&&t.lng&&e.push([t.lat,t.lng])}),e.length>1?S.current.fitBounds(m.default.latLngBounds(e),{padding:[60,60],maxZoom:16}):t&&u&&S.current.flyTo([t,u],14,{duration:1}),M.current=!0};(0,p.useEffect)(()=>{try{let t=localStorage.getItem(`geofence_manual_${e}`);if(t){W(JSON.parse(t));return}}catch{}y?.length&&W(y)},[e,y]),(0,p.useEffect)(()=>{if(!S.current)return;let e=S.current;O.current&&=(e.removeLayer(O.current),null),U&&U.length>=3&&(O.current=m.default.polygon(U,{color:`#2563eb`,fillColor:`#2563eb`,fillOpacity:.1,weight:2.5,dashArray:`6, 3`}).addTo(e))},[U]),(0,p.useEffect)(()=>{let e=S.current;if(!e)return;if(!G){e.getContainer().style.cursor=``;return}e.getContainer().style.cursor=`crosshair`;let t=t=>{let n=[t.latlng.lat,t.latlng.lng];J(r=>{let i=[...r,n],a=m.default.divIcon({className:``,html:`<div style="width:10px;height:10px;border-radius:50%;background:#2563eb;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,iconSize:[10,10],iconAnchor:[5,5]}),o=m.default.marker([n[0],n[1]],{icon:a,interactive:!1}).addTo(e);if(A.current.push(o),k.current&&e.removeLayer(k.current),i.length>=2&&(k.current=m.default.polygon(i,{color:`#2563eb`,fillColor:`#2563eb`,fillOpacity:.08,weight:2,dashArray:`5,5`}).addTo(e)),i.length>=4){let n=e.latLngToContainerPoint(i[0]),r=t.containerPoint;if(Math.hypot(n.x-r.x,n.y-r.y)<=20){let t=i.slice(0,-1);return setTimeout(()=>Z.current?.(t,e),0),t}}return i})};return e.on(`click`,t),()=>{e.off(`click`,t),e.getContainer().style.cursor=``}},[G]);let Z=(0,p.useRef)(null),Q=(0,p.useCallback)(()=>{let e=S.current;e&&(A.current.forEach(t=>e.removeLayer(t)),A.current=[],k.current&&=(e.removeLayer(k.current),null))},[]),$=(0,p.useCallback)((t,n)=>{A.current.forEach(e=>n.removeLayer(e)),A.current=[],k.current&&=(n.removeLayer(k.current),null),K(!1),J([]),W(t);try{localStorage.setItem(`geofence_manual_${e}`,JSON.stringify(t))}catch{}r.put(`/events/${e}/geofence`,{geofencePolygon:t}).catch(()=>{})},[e]);Z.current=$;let Re=(0,p.useCallback)(()=>{q.length<3||!S.current||$(q,S.current)},[q,$]),ze=(0,p.useCallback)(()=>{Q(),K(!1),J([])},[Q]),Be=(0,p.useCallback)(()=>{W(null);try{localStorage.removeItem(`geofence_manual_${e}`)}catch{}r.put(`/events/${e}/geofence`,{geofencePolygon:null,geofenceRadius:null}).catch(()=>{}),P.current.clear()},[e]),Ve=(0,p.useCallback)(()=>{Q(),J([]),K(!0)},[Q]);return(0,h.jsxs)(`div`,{className:`relative bg-white rounded-xl border shadow-sm overflow-hidden ${I?`fixed inset-4 z-50`:``} ${xe}`,children:[(0,h.jsxs)(`div`,{className:`flex items-center justify-between border-b px-4 py-2.5 bg-white`,children:[(0,h.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,h.jsxs)(`div`,{className:`flex items-center gap-1.5`,children:[(0,h.jsx)(i,{className:`w-4 h-4 text-red-600`}),(0,h.jsx)(`span`,{className:`font-semibold text-sm`,children:`Live Staff Tracking`})]}),(0,h.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,h.jsxs)(a,{variant:`outline`,className:`text-xs gap-1`,children:[(0,h.jsx)(l,{className:`w-3 h-3`}),F.length,` staff`]}),Fe.length>0&&(0,h.jsxs)(a,{className:`text-xs gap-1 bg-sky-100 text-sky-700 border-sky-200`,children:[(0,h.jsx)(ie,{className:`w-3 h-3`}),Fe.length,` traveling`]}),X.length>0&&(0,h.jsxs)(a,{className:`text-xs gap-1 bg-green-100 text-green-700 border-green-200`,children:[X.length,` on-site`]}),(0,h.jsx)(`div`,{className:`w-2 h-2 rounded-full ${Ee?`bg-green-500`:`bg-gray-400`}`,title:Ee?`Live updates connected`:`Connecting...`})]})]}),(0,h.jsxs)(`div`,{className:`flex items-center gap-1`,children:[ve&&(G?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsxs)(n,{variant:`default`,size:`sm`,className:`h-7 text-xs gap-1 bg-blue-600 hover:bg-blue-700`,onClick:Re,disabled:q.length<3,title:`Finish drawing (min 3 points)`,children:[(0,h.jsx)(o,{className:`w-3.5 h-3.5`}),` Finish (`,q.length,`)`]}),(0,h.jsxs)(n,{variant:`outline`,size:`sm`,className:`h-7 text-xs gap-1`,onClick:ze,children:[(0,h.jsx)(s,{className:`w-3.5 h-3.5`}),` Cancel`]})]}):(0,h.jsxs)(h.Fragment,{children:[(0,h.jsxs)(n,{variant:U?`default`:`outline`,size:`sm`,className:`h-7 text-xs gap-1 ${U?`bg-blue-600 hover:bg-blue-700`:``}`,onClick:Ve,title:`Draw custom geofence boundary`,children:[(0,h.jsx)(de,{className:`w-3.5 h-3.5`}),U?`Redraw`:`Draw Geofence`]}),U&&(0,h.jsxs)(n,{variant:`ghost`,size:`sm`,className:`h-7 text-xs gap-1 text-red-500 hover:text-red-600`,onClick:Be,title:`Remove manual boundary, revert to auto`,children:[(0,h.jsx)(c,{className:`w-3.5 h-3.5`}),` Reset`]})]})),(0,h.jsx)(n,{variant:`ghost`,size:`sm`,onClick:Y,title:`Refresh`,children:(0,h.jsx)(ee,{className:`w-4 h-4`})}),(0,h.jsx)(n,{variant:`ghost`,size:`sm`,onClick:()=>we(!I),title:I?`Minimize`:`Maximize`,children:I?(0,h.jsx)(ne,{className:`w-4 h-4`}):(0,h.jsx)(te,{className:`w-4 h-4`})}),be&&(0,h.jsx)(n,{variant:`ghost`,size:`sm`,onClick:be,children:(0,h.jsx)(s,{className:`w-4 h-4`})})]})]}),(0,h.jsxs)(`div`,{className:`flex`,style:{height:I?`calc(100% - 48px)`:`550px`},children:[(0,h.jsxs)(`div`,{className:`w-80 flex-shrink-0 border-r bg-gray-50/50 flex flex-col`,children:[(0,h.jsx)(`div`,{className:`p-3 border-b bg-white`,children:(0,h.jsxs)(`div`,{className:`flex items-center justify-between mb-1`,children:[(0,h.jsx)(`span`,{className:`text-xs font-semibold text-gray-500 uppercase tracking-wide`,children:`Staff Members`}),(0,h.jsxs)(n,{variant:`ghost`,size:`sm`,className:`h-7 text-xs`,onClick:Le,children:[(0,h.jsx)(l,{className:`w-3 h-3 mr-1`}),` Show All`]})]})}),(0,h.jsxs)(`div`,{className:`flex-1 overflow-y-auto p-2 space-y-1.5`,children:[F.map(e=>{let t=g[e.status]||`#6b7280`,r=_[e.status]||e.status,i=!!(e.lat&&e.lng),a=R===e.staffId,o=(e.staffName||`S`).split(` `).map(e=>e[0]).join(``).slice(0,2).toUpperCase();return(0,h.jsxs)(`div`,{className:`rounded-lg border p-3 transition-all cursor-pointer ${a?`border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20`:`border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm`}`,onClick:()=>Ie(e),children:[(0,h.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,h.jsxs)(`div`,{className:`relative flex-shrink-0`,children:[(0,h.jsx)(se,{className:`h-10 w-10 border-2`,style:{borderColor:t},children:(0,h.jsx)(re,{className:`text-white text-xs font-bold`,style:{backgroundColor:t},children:o})}),(e.status===`TRAVEL_TO_VENUE`||e.status===`TRAVEL_HOME`)&&(0,h.jsx)(`span`,{className:`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-sky-500 border-2 border-white animate-pulse`})]}),(0,h.jsxs)(`div`,{className:`flex-1 min-w-0`,children:[(0,h.jsx)(`div`,{className:`font-semibold text-sm truncate`,children:e.staffName||`Staff`}),(0,h.jsxs)(`div`,{className:`flex items-center gap-2 mt-0.5`,children:[(0,h.jsx)(`span`,{className:`text-[10px] font-bold px-2 py-0.5 rounded-full`,style:{backgroundColor:t+`20`,color:t},children:r}),!i&&(0,h.jsx)(`span`,{className:`text-[10px] text-gray-400`,children:`No GPS`})]})]}),(0,h.jsx)(n,{variant:a?`default`:`outline`,size:`sm`,className:`h-8 w-8 p-0 flex-shrink-0 ${i?``:`opacity-40`}`,disabled:!i,onClick:t=>{t.stopPropagation(),Ie(e)},title:`Recenter on ${e.staffName}`,children:(0,h.jsx)(le,{className:`w-4 h-4`})})]}),a&&(0,h.jsxs)(`div`,{className:`mt-2 pt-2 border-t border-gray-100 space-y-1`,children:[e.staffPhone&&(0,h.jsxs)(`div`,{className:`flex items-center gap-1.5 text-xs text-gray-600`,children:[(0,h.jsx)(oe,{className:`w-3 h-3`}),e.staffPhone]}),e.clockIn&&(0,h.jsxs)(`div`,{className:`flex items-center gap-1.5 text-xs text-gray-600`,children:[(0,h.jsx)(ue,{className:`w-3 h-3`}),`Checked in: `,new Date(e.clockIn).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})]}),e.travelStartTime&&!e.travelArrivalTime&&(0,h.jsxs)(`div`,{className:`flex items-center gap-1.5 text-xs text-sky-600`,children:[(0,h.jsx)(ie,{className:`w-3 h-3`}),`Left at: `,new Date(e.travelStartTime).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})]})]})]},e.staffId||e.shiftId)}),F.length===0&&!L&&(0,h.jsxs)(`div`,{className:`text-center py-8 text-gray-400`,children:[(0,h.jsx)(l,{className:`w-8 h-8 mx-auto mb-2 opacity-50`}),(0,h.jsx)(`p`,{className:`text-xs`,children:`No staff assigned`})]})]})]}),(0,h.jsxs)(`div`,{className:`flex-1 relative`,children:[(0,h.jsx)(`div`,{ref:C,style:{width:`100%`,height:`100%`,zIndex:1,touchAction:`none`}}),G&&(0,h.jsxs)(`div`,{className:`absolute top-3 left-1/2 -translate-x-1/2 z-[1003] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 pointer-events-none`,children:[(0,h.jsx)(de,{className:`w-4 h-4 flex-shrink-0`}),q.length===0?`Click on the map to start drawing the boundary`:q.length<3?`${q.length} point${q.length>1?`s`:``} — keep clicking to add more`:`Click near the first point to close, or press Finish`]}),L&&(0,h.jsx)(`div`,{className:`absolute inset-0 z-[1001] bg-white/80 flex items-center justify-center`,children:(0,h.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,h.jsx)(`div`,{className:`animate-spin rounded-full h-5 w-5 border-b-2 border-primary`}),(0,h.jsx)(`span`,{className:`text-sm text-muted-foreground`,children:`Loading staff locations...`})]})}),!L&&F.filter(e=>e.lat&&e.lng).length===0&&(0,h.jsx)(`div`,{className:`absolute inset-0 z-[999] flex items-center justify-center pointer-events-none`,children:(0,h.jsxs)(`div`,{className:`bg-white/90 backdrop-blur rounded-lg p-6 text-center shadow`,children:[(0,h.jsx)(i,{className:`w-8 h-8 text-gray-400 mx-auto mb-2`}),(0,h.jsx)(`p`,{className:`text-sm font-medium text-gray-600`,children:`No location data yet`}),(0,h.jsx)(`p`,{className:`text-xs text-gray-400 mt-1`,children:`Staff locations will appear once they start travel`})]})}),(0,h.jsxs)(`div`,{className:`absolute top-4 right-4 z-[1002] space-y-2 pointer-events-none`,children:[Oe.map(e=>(0,h.jsxs)(`div`,{className:`arrival-notification flex items-center gap-3 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg pointer-events-auto`,children:[(0,h.jsx)(`div`,{className:`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center`,children:(0,h.jsx)(i,{className:`w-4 h-4`})}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{className:`font-semibold text-sm`,children:e.staffName}),(0,h.jsx)(`p`,{className:`text-xs opacity-90`,children:`Arrived at venue!`})]})]},e.id)),Ae.map(e=>(0,h.jsxs)(`div`,{className:`arrival-notification flex items-center gap-3 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg pointer-events-auto`,children:[(0,h.jsx)(`div`,{className:`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center`,children:(0,h.jsx)(ce,{className:`w-4 h-4`})}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{className:`font-semibold text-sm`,children:e.staffName}),(0,h.jsx)(`p`,{className:`text-xs opacity-90`,children:`Left the venue!`})]})]},e.id))]}),t&&u&&(0,h.jsxs)(`div`,{className:`absolute bottom-4 left-4 z-[1002] bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg space-y-1.5`,children:[U&&(0,h.jsxs)(`div`,{className:`flex items-center gap-2 text-xs text-blue-700 font-medium`,children:[(0,h.jsx)(`div`,{className:`w-3 h-3 rounded border-2 border-dashed border-blue-600 bg-blue-600/10`}),(0,h.jsx)(`span`,{children:`Manual boundary (active)`})]}),!U&&(0,h.jsxs)(`div`,{className:`flex items-center gap-2 text-xs text-gray-600`,children:[(0,h.jsx)(`div`,{className:`w-3 h-3 rounded border-2 border-dashed border-red-500 bg-red-500/10`}),(0,h.jsx)(`span`,{children:V?`Auto: building shape (OSM)`:`Auto: ${H}m radius`})]})]})]})]}),I&&(0,h.jsx)(`div`,{className:`fixed inset-0 bg-black/50 -z-10`,onClick:()=>we(!1)})]})}export{v as default};