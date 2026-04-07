import{a as e}from"./chunk-BEqpzyXh.js";import{n as t}from"./react-dom-DQeDwO8J.js";import{_ as n,a as r,b as i,c as a,d as o,f as s,g as c,h as l,i as u,l as d,m as ee,n as te,p as ne,r as f,t as p,u as m,v as h,y as g}from"./index-Bf1RQCdi.js";var _=e(t(),1),v=e(p(),1),y=i(),b=100;function x(e,t,n,r){let i=(n-e)*Math.PI/180,a=(r-t)*Math.PI/180,o=Math.sin(i/2)*Math.sin(i/2)+Math.cos(e*Math.PI/180)*Math.cos(n*Math.PI/180)*Math.sin(a/2)*Math.sin(a/2);return 6371e3*(2*Math.atan2(Math.sqrt(o),Math.sqrt(1-o)))}var S={TRAVEL_TO_VENUE:`#0ea5e9`,ARRIVED:`#14b8a6`,IN_PROGRESS:`#22c55e`,ONGOING:`#22c55e`,BREAK:`#a855f7`,COMPLETED:`#3b82f6`,TRAVEL_HOME:`#f97316`,CONFIRMED:`#eab308`,PENDING:`#6b7280`},C={TRAVEL_TO_VENUE:`Traveling`,ARRIVED:`Arrived`,IN_PROGRESS:`Working`,ONGOING:`Working`,BREAK:`On Break`,COMPLETED:`Completed`,TRAVEL_HOME:`Going Home`,CONFIRMED:`Confirmed`,PENDING:`Pending`};function w(e,t,n){let r=S[t]||`#6b7280`,i=e.split(` `).map(e=>e[0]).join(``).slice(0,2).toUpperCase(),a=n?48:40,o=a+24,s=n?`box-shadow: 0 0 0 4px rgba(255,255,255,0.9), 0 0 0 6px `+r+`;`:``;return v.default.divIcon({className:`custom-staff-icon`,html:`
      <div style="position:relative; display:flex; align-items:center; justify-content:center; width:${a}px; height:${a}px;">
        <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:${r}; opacity:0.25; ${t===`TRAVEL_TO_VENUE`||t===`TRAVEL_HOME`?`animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;`:``}"></div>
        <div style="position:relative; width:${a-8}px; height:${a-8}px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:${r}; border:3px solid white; ${s} z-index:10; cursor:pointer;">
          <span style="color:white; font-weight:700; font-size:${n?14:12}px; letter-spacing:0.5px;">${i}</span>
        </div>
        <div style="position:absolute; top:${a+2}px; left:50%; transform:translateX(-50%); background:white; padding:2px 8px; border-radius:10px; box-shadow:0 1px 4px rgba(0,0,0,0.15); white-space:nowrap; z-index:20; border:1px solid ${r}30;">
          <span style="font-size:10px; font-weight:600; color:#333;">${e.split(` `)[0]}</span>
        </div>
      </div>
    `,iconSize:[a,o],iconAnchor:[a/2,a/2]})}function T(){return v.default.divIcon({className:`custom-staff-icon`,html:`
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
    `,iconSize:[52,72],iconAnchor:[26,26]})}function E({eventId:e,venueLat:t,venueLng:i,venueName:p,onClose:E,className:re=``,selectedStaffId:D}){let O=(0,_.useRef)(null),k=(0,_.useRef)(null),A=(0,_.useRef)(new Map),j=(0,_.useRef)(null),M=(0,_.useRef)(null),N=(0,_.useRef)(null),P=(0,_.useRef)(null),F=(0,_.useRef)(!1),I=(0,_.useRef)(null),L=(0,_.useRef)(new Set),[R,z]=(0,_.useState)([]),[B,V]=(0,_.useState)(!1),[H,ie]=(0,_.useState)(!0),[U,W]=(0,_.useState)(!1),[G,K]=(0,_.useState)(D||null),[ae,q]=(0,_.useState)([]),J=(0,_.useCallback)((e,t,n,r)=>{if(!O.current||!k.current)return;if(M.current){let e=M.current.getElement();e&&(e.classList.add(`venue-radius-flash`),setTimeout(()=>e.classList.remove(`venue-radius-flash`),1e3))}let i=O.current.latLngToContainerPoint([n,r]),a=document.createElement(`div`);a.className=`staff-arrival-marker`,a.style.left=`${i.x-30}px`,a.style.top=`${i.y-30}px`,k.current.appendChild(a),setTimeout(()=>a.remove(),1500);let o=`${t}-${Date.now()}`;q(t=>[...t,{id:o,staffName:e,timestamp:Date.now()}]),setTimeout(()=>{q(e=>e.filter(e=>e.id!==o))},4e3)},[]),Y=(0,_.useCallback)(e=>{if(!t||!i||!e.lat||!e.lng)return;let n=e.staffId||e.shiftId,r=x(e.lat,e.lng,t,i),a=r<=b,o=L.current.has(n);a&&!o?(L.current.add(n),J(e.staffName,n,e.lat,e.lng),console.log(`[LiveStaffMap] ${e.staffName} entered venue radius (${Math.round(r)}m)`)):!a&&o&&(L.current.delete(n),console.log(`[LiveStaffMap] ${e.staffName} left venue radius (${Math.round(r)}m)`))},[t,i,J]),X=(0,_.useCallback)(async()=>{try{z((await h.get(`/events/${e}/staff-locations`)).data.staff||[])}catch(e){console.error(`Failed to fetch staff locations:`,e)}finally{ie(!1)}},[e]);(0,_.useEffect)(()=>{if(!k.current||O.current)return;let e=t&&i?[t,i]:[40.7128,-74.006],n=v.default.map(k.current,{zoomControl:!1,attributionControl:!1,dragging:!0,scrollWheelZoom:!0,touchZoom:!0,doubleClickZoom:!0,boxZoom:!0}).setView(e,14);v.default.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,{attribution:`&copy; OpenStreetMap contributors`,maxZoom:19}).addTo(n),v.default.control.zoom({position:`bottomright`}).addTo(n),t&&i&&(j.current=v.default.marker([t,i],{icon:T()}).addTo(n).bindPopup(`<div style="text-align:center; padding:4px;"><strong>${p||`Event Venue`}</strong></div>`),M.current=v.default.circle([t,i],{radius:b,color:`#dc2626`,fillColor:`#dc2626`,fillOpacity:.08,weight:2,dashArray:`8, 4`,className:`venue-radius-circle`}).addTo(n),N.current=v.default.circle([t,i],{radius:b,color:`#dc2626`,fillColor:`transparent`,fillOpacity:0,weight:3,opacity:.6,className:`venue-pulse-circle`}).addTo(n)),O.current=n,setTimeout(()=>n.invalidateSize(),100),setTimeout(()=>n.invalidateSize(),500);let r=document.createElement(`style`);return r.textContent=`
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
    `,document.head.appendChild(r),()=>{n.remove(),O.current=null,r.remove()}},[t,i,p]),(0,_.useEffect)(()=>(X(),I.current=setInterval(()=>{X()},1e4),()=>{I.current&&clearInterval(I.current)}),[X]),(0,_.useEffect)(()=>{let t=localStorage.getItem(`token`);if(!t){console.warn(`[LiveStaffMap] No auth token found, socket will not connect`);return}let n=`http://139.59.61.92:5000/`;console.log(`[LiveStaffMap] Connecting socket to:`,n);let r=te(n,{auth:{token:t},transports:[`websocket`,`polling`]});return r.on(`connect`,()=>{console.log(`[LiveStaffMap] Socket connected, id:`,r.id),W(!0)}),r.on(`connect_error`,e=>{console.error(`[LiveStaffMap] Socket connection error:`,e.message)}),r.on(`disconnect`,e=>{console.log(`[LiveStaffMap] Socket disconnected:`,e),W(!1)}),r.on(`staff:location`,t=>{console.log(`[LiveStaffMap] Received staff:location`,t.staffName,t.lat,t.lng,`eventId:`,t.eventId),t.eventId===e&&z(e=>{let n=e.findIndex(e=>e.staffId===t.staffId||e.shiftId===t.shiftId);if(n>=0){let r=[...e];return r[n]={...r[n],lat:t.lat,lng:t.lng,status:t.status},r}return[...e,{shiftId:t.shiftId,staffId:t.staffId,staffName:t.staffName,status:t.status,lat:t.lat,lng:t.lng,travelEnabled:!0}]})}),P.current=r,()=>{r.disconnect(),P.current=null}},[e]),(0,_.useEffect)(()=>{if(!O.current)return;let e=O.current,n=A.current,r=new Set;if(R.forEach(t=>{if(!t.lat||!t.lng)return;let i=t.staffId||t.shiftId;r.add(i),Y(t);let a=D===t.staffId,o=w(t.staffName||`Staff`,t.status,a),s=`
        <div style="min-width:180px; padding:4px;">
          <div style="font-weight:700; font-size:14px; margin-bottom:4px;">${t.staffName||`Staff`}</div>
          <div style="display:inline-block; padding:2px 8px; border-radius:12px; background:${S[t.status]||`#6b7280`}20; color:${S[t.status]||`#6b7280`}; font-size:12px; font-weight:600; margin-bottom:6px;">
            ${C[t.status]||t.status}
          </div>
          ${t.staffPhone?`<div style="font-size:12px; color:#666; margin-top:4px;">📞 ${t.staffPhone}</div>`:``}
          ${t.clockIn?`<div style="font-size:12px; color:#666; margin-top:2px;">🕐 In: ${new Date(t.clockIn).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})}</div>`:``}
          ${t.clockOut?`<div style="font-size:12px; color:#666;">🕐 Out: ${new Date(t.clockOut).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})}</div>`:``}
        </div>
      `,c=n.get(i);if(c)c.setLatLng([t.lat,t.lng]),c.setIcon(o),c.getPopup()?.setContent(s);else{let r=v.default.marker([t.lat,t.lng],{icon:o}).addTo(e).bindPopup(s);n.set(i,r)}}),n.forEach((t,i)=>{r.has(i)||(e.removeLayer(t),n.delete(i))}),!F.current){let n=[];t&&i&&n.push([t,i]),R.forEach(e=>{e.lat&&e.lng&&n.push([e.lat,e.lng])}),n.length>1?(e.fitBounds(v.default.latLngBounds(n),{padding:[60,60],maxZoom:16}),F.current=!0):n.length===1&&(F.current=!0)}},[R,D,t,i,Y]),(0,_.useEffect)(()=>{if(!O.current||!D)return;K(D);let e=R.find(e=>e.staffId===D);if(e?.lat&&e?.lng){O.current.flyTo([e.lat,e.lng],16,{duration:1});let t=A.current.get(e.staffId||e.shiftId);t&&t.openPopup()}},[D]),(0,_.useEffect)(()=>{if(!O.current||!G)return;let e=R.find(e=>e.staffId===G);e?.lat&&e?.lng&&O.current.panTo([e.lat,e.lng],{animate:!0,duration:.5})},[R,G]),(0,_.useEffect)(()=>{setTimeout(()=>O.current?.invalidateSize(),300)},[B]);let Z=R.filter(e=>e.lat&&e.lng&&[`TRAVEL_TO_VENUE`,`TRAVEL_HOME`].includes(e.status)),Q=R.filter(e=>[`ARRIVED`,`IN_PROGRESS`,`ONGOING`,`BREAK`].includes(e.status)),$=e=>{if(K(e.staffId),e.lat&&e.lng&&O.current){O.current.flyTo([e.lat,e.lng],17,{duration:1});let t=A.current.get(e.staffId||e.shiftId);t&&setTimeout(()=>t.openPopup(),500)}};return(0,y.jsxs)(`div`,{className:`relative bg-white rounded-xl border shadow-sm overflow-hidden ${B?`fixed inset-4 z-50`:``} ${re}`,children:[(0,y.jsxs)(`div`,{className:`flex items-center justify-between border-b px-4 py-2.5 bg-white`,children:[(0,y.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,y.jsxs)(`div`,{className:`flex items-center gap-1.5`,children:[(0,y.jsx)(l,{className:`w-4 h-4 text-red-600`}),(0,y.jsx)(`span`,{className:`font-semibold text-sm`,children:`Live Staff Tracking`})]}),(0,y.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,y.jsxs)(r,{variant:`outline`,className:`text-xs gap-1`,children:[(0,y.jsx)(d,{className:`w-3 h-3`}),R.length,` staff`]}),Z.length>0&&(0,y.jsxs)(r,{className:`text-xs gap-1 bg-sky-100 text-sky-700 border-sky-200`,children:[(0,y.jsx)(s,{className:`w-3 h-3`}),Z.length,` traveling`]}),Q.length>0&&(0,y.jsxs)(r,{className:`text-xs gap-1 bg-green-100 text-green-700 border-green-200`,children:[Q.length,` on-site`]}),(0,y.jsx)(`div`,{className:`w-2 h-2 rounded-full ${U?`bg-green-500`:`bg-gray-400`}`,title:U?`Live updates connected`:`Connecting...`})]})]}),(0,y.jsxs)(`div`,{className:`flex items-center gap-1`,children:[(0,y.jsx)(g,{variant:`ghost`,size:`sm`,onClick:X,title:`Refresh`,children:(0,y.jsx)(m,{className:`w-4 h-4`})}),(0,y.jsx)(g,{variant:`ghost`,size:`sm`,onClick:()=>V(!B),title:B?`Minimize`:`Maximize`,children:B?(0,y.jsx)(ne,{className:`w-4 h-4`}):(0,y.jsx)(ee,{className:`w-4 h-4`})}),E&&(0,y.jsx)(g,{variant:`ghost`,size:`sm`,onClick:E,children:(0,y.jsx)(a,{className:`w-4 h-4`})})]})]}),(0,y.jsxs)(`div`,{className:`flex`,style:{height:B?`calc(100% - 48px)`:`550px`},children:[(0,y.jsxs)(`div`,{className:`w-80 flex-shrink-0 border-r bg-gray-50/50 flex flex-col`,children:[(0,y.jsx)(`div`,{className:`p-3 border-b bg-white`,children:(0,y.jsxs)(`div`,{className:`flex items-center justify-between mb-1`,children:[(0,y.jsx)(`span`,{className:`text-xs font-semibold text-gray-500 uppercase tracking-wide`,children:`Staff Members`}),(0,y.jsxs)(g,{variant:`ghost`,size:`sm`,className:`h-7 text-xs`,onClick:()=>{if(K(null),!O.current)return;let e=[];t&&i&&e.push([t,i]),R.forEach(t=>{t.lat&&t.lng&&e.push([t.lat,t.lng])}),e.length>1?O.current.fitBounds(v.default.latLngBounds(e),{padding:[60,60],maxZoom:16}):t&&i&&O.current.flyTo([t,i],14,{duration:1}),F.current=!0},children:[(0,y.jsx)(d,{className:`w-3 h-3 mr-1`}),` Show All`]})]})}),(0,y.jsxs)(`div`,{className:`flex-1 overflow-y-auto p-2 space-y-1.5`,children:[R.map(e=>{let t=S[e.status]||`#6b7280`,r=C[e.status]||e.status,i=!!(e.lat&&e.lng),a=G===e.staffId,l=(e.staffName||`S`).split(` `).map(e=>e[0]).join(``).slice(0,2).toUpperCase();return(0,y.jsxs)(`div`,{className:`rounded-lg border p-3 transition-all cursor-pointer ${a?`border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20`:`border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm`}`,onClick:()=>$(e),children:[(0,y.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,y.jsxs)(`div`,{className:`relative flex-shrink-0`,children:[(0,y.jsx)(f,{className:`h-10 w-10 border-2`,style:{borderColor:t},children:(0,y.jsx)(u,{className:`text-white text-xs font-bold`,style:{backgroundColor:t},children:l})}),(e.status===`TRAVEL_TO_VENUE`||e.status===`TRAVEL_HOME`)&&(0,y.jsx)(`span`,{className:`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-sky-500 border-2 border-white animate-pulse`})]}),(0,y.jsxs)(`div`,{className:`flex-1 min-w-0`,children:[(0,y.jsx)(`div`,{className:`font-semibold text-sm truncate`,children:e.staffName||`Staff`}),(0,y.jsxs)(`div`,{className:`flex items-center gap-2 mt-0.5`,children:[(0,y.jsx)(`span`,{className:`text-[10px] font-bold px-2 py-0.5 rounded-full`,style:{backgroundColor:t+`20`,color:t},children:r}),!i&&(0,y.jsx)(`span`,{className:`text-[10px] text-gray-400`,children:`No GPS`})]})]}),(0,y.jsx)(g,{variant:a?`default`:`outline`,size:`sm`,className:`h-8 w-8 p-0 flex-shrink-0 ${i?``:`opacity-40`}`,disabled:!i,onClick:t=>{t.stopPropagation(),$(e)},title:`Recenter on ${e.staffName}`,children:(0,y.jsx)(c,{className:`w-4 h-4`})})]}),a&&(0,y.jsxs)(`div`,{className:`mt-2 pt-2 border-t border-gray-100 space-y-1`,children:[e.staffPhone&&(0,y.jsxs)(`div`,{className:`flex items-center gap-1.5 text-xs text-gray-600`,children:[(0,y.jsx)(o,{className:`w-3 h-3`}),e.staffPhone]}),e.clockIn&&(0,y.jsxs)(`div`,{className:`flex items-center gap-1.5 text-xs text-gray-600`,children:[(0,y.jsx)(n,{className:`w-3 h-3`}),`Checked in: `,new Date(e.clockIn).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})]}),e.travelStartTime&&!e.travelArrivalTime&&(0,y.jsxs)(`div`,{className:`flex items-center gap-1.5 text-xs text-sky-600`,children:[(0,y.jsx)(s,{className:`w-3 h-3`}),`Left at: `,new Date(e.travelStartTime).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})]})]})]},e.staffId||e.shiftId)}),R.length===0&&!H&&(0,y.jsxs)(`div`,{className:`text-center py-8 text-gray-400`,children:[(0,y.jsx)(d,{className:`w-8 h-8 mx-auto mb-2 opacity-50`}),(0,y.jsx)(`p`,{className:`text-xs`,children:`No staff assigned`})]})]})]}),(0,y.jsxs)(`div`,{className:`flex-1 relative`,children:[(0,y.jsx)(`div`,{ref:k,style:{width:`100%`,height:`100%`,zIndex:1,touchAction:`none`}}),H&&(0,y.jsx)(`div`,{className:`absolute inset-0 z-[1001] bg-white/80 flex items-center justify-center`,children:(0,y.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,y.jsx)(`div`,{className:`animate-spin rounded-full h-5 w-5 border-b-2 border-primary`}),(0,y.jsx)(`span`,{className:`text-sm text-muted-foreground`,children:`Loading staff locations...`})]})}),!H&&R.filter(e=>e.lat&&e.lng).length===0&&(0,y.jsx)(`div`,{className:`absolute inset-0 z-[999] flex items-center justify-center pointer-events-none`,children:(0,y.jsxs)(`div`,{className:`bg-white/90 backdrop-blur rounded-lg p-6 text-center shadow`,children:[(0,y.jsx)(l,{className:`w-8 h-8 text-gray-400 mx-auto mb-2`}),(0,y.jsx)(`p`,{className:`text-sm font-medium text-gray-600`,children:`No location data yet`}),(0,y.jsx)(`p`,{className:`text-xs text-gray-400 mt-1`,children:`Staff locations will appear once they start travel`})]})}),(0,y.jsx)(`div`,{className:`absolute top-4 right-4 z-[1002] space-y-2 pointer-events-none`,children:ae.map(e=>(0,y.jsxs)(`div`,{className:`arrival-notification flex items-center gap-3 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg pointer-events-auto`,children:[(0,y.jsx)(`div`,{className:`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center`,children:(0,y.jsx)(l,{className:`w-4 h-4`})}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`p`,{className:`font-semibold text-sm`,children:e.staffName}),(0,y.jsx)(`p`,{className:`text-xs opacity-90`,children:`Arrived at venue!`})]})]},e.id))}),t&&i&&(0,y.jsx)(`div`,{className:`absolute bottom-4 left-4 z-[1002] bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg`,children:(0,y.jsxs)(`div`,{className:`flex items-center gap-2 text-xs text-gray-600`,children:[(0,y.jsx)(`div`,{className:`w-3 h-3 rounded-full border-2 border-dashed border-red-500 bg-red-500/10`}),(0,y.jsxs)(`span`,{children:[`Venue geofence (`,b,`m radius)`]})]})})]})]}),B&&(0,y.jsx)(`div`,{className:`fixed inset-0 bg-black/50 -z-10`,onClick:()=>V(!1)})]})}export{E as default};