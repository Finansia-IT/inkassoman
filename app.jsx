import { useEffect, useRef, useState, useCallback } from "react";

const TILE = 40, COLS = 14, ROWS = 12;

const MAP_TEMPLATE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,1,0,0,0,0,0,1],
  [1,0,1,1,0,0,0,0,0,0,1,1,0,1],
  [1,0,1,0,0,1,0,0,1,0,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,0,1,0,0,1,0,0,1,0,1],
  [1,0,1,1,0,0,0,0,0,0,1,1,0,1],
  [1,0,0,0,0,0,1,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const STAGES = [
  { name:"Påminnelse",          color:"#81c784", textColor:"#1b5e20", points:10,  emoji:"📧", speedMult:1.0 },
  { name:"Inkassokrav",         color:"#ffb74d", textColor:"#e65100", points:25,  emoji:"📄", speedMult:1.5 },
  { name:"Betalningsförelägg.", color:"#ef5350", textColor:"#7f0000", points:50,  emoji:"⚖️", speedMult:2.2 },
  { name:"Kronofogden",         color:"#7e57c2", textColor:"#1a0050", points:100, emoji:"🔨", speedMult:3.2 },
];

const BASE_SPEEDS = [1.2,1.6,1.4,1.3,1.5,1.1,1.7];
const NAMES = ["Svensson","Lindqvist","Magnusson","Persson","Johansson","Karlsson","Nilsson"];
const CUSTOMER_STARTS = [
  {r:1,c:1},{r:1,c:8},{r:10,c:1},{r:10,c:8},{r:1,c:12},{r:3,c:6},{r:8,c:6},
];

function isWall(r,c){ if(r<0||r>=ROWS||c<0||c>=COLS)return true; return MAP_TEMPLATE[r][c]===1; }

function drawPahlsson(ctx, x, y, radius) {
  const r = radius;
  ctx.save();
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.clip();
  ctx.fillStyle='#f0c9a0'; ctx.beginPath(); ctx.arc(x,y+r*0.05,r,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#e8b888'; ctx.fillRect(x-r*0.28,y+r*0.54,r*0.56,r*0.52);
  ctx.fillStyle='#2c2c2e';
  ctx.beginPath(); ctx.moveTo(x-r*1.1,y+r*1.1); ctx.lineTo(x-r*0.48,y+r*0.58); ctx.lineTo(x-r*0.18,y+r*0.7); ctx.lineTo(x,y+r*0.6); ctx.lineTo(x+r*0.18,y+r*0.7); ctx.lineTo(x+r*0.48,y+r*0.58); ctx.lineTo(x+r*1.1,y+r*1.1); ctx.fill();
  ctx.fillStyle='#a8c8e8';
  ctx.beginPath(); ctx.moveTo(x-r*0.18,y+r*0.7); ctx.lineTo(x,y+r*0.6); ctx.lineTo(x+r*0.18,y+r*0.7); ctx.lineTo(x+r*0.13,y+r*1.1); ctx.lineTo(x-r*0.13,y+r*1.1); ctx.fill();
  ctx.strokeStyle='#c5dff5'; ctx.lineWidth=r*0.022;
  for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(x+i*r*0.055,y+r*0.68);ctx.lineTo(x+i*r*0.055,y+r*1.1);ctx.stroke();}
  ctx.fillStyle='#d8eaf8';
  ctx.beginPath(); ctx.moveTo(x,y+r*0.62); ctx.lineTo(x-r*0.25,y+r*0.53); ctx.lineTo(x-r*0.14,y+r*0.73); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x,y+r*0.62); ctx.lineTo(x+r*0.25,y+r*0.53); ctx.lineTo(x+r*0.14,y+r*0.73); ctx.fill();
  ctx.fillStyle='#cc2200';
  ctx.beginPath(); ctx.moveTo(x-r*0.075,y+r*0.7); ctx.lineTo(x+r*0.075,y+r*0.7); ctx.lineTo(x+r*0.052,y+r*0.93); ctx.lineTo(x,y+r*1.03); ctx.lineTo(x-r*0.052,y+r*0.93); ctx.fill();
  ctx.fillStyle='#aa1a00'; ctx.beginPath(); ctx.ellipse(x,y+r*0.7,r*0.075,r*0.05,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(180,215,255,0.5)';
  [[0,0.76],[-0.028,0.82],[0.028,0.82],[0,0.88]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(x+dx*r,y+dy*r,r*0.017,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle='#e0a870';
  ctx.beginPath(); ctx.ellipse(x-r*0.87,y+r*0.05,r*0.15,r*0.21,0.15,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+r*0.87,y+r*0.05,r*0.15,r*0.21,-0.15,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#3d2510';
  ctx.beginPath(); ctx.ellipse(x,y-r*0.5,r*0.76,r*0.44,0,Math.PI,0); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x-r*0.66,y-r*0.26,r*0.3,r*0.36,0.28,Math.PI,0); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+r*0.66,y-r*0.26,r*0.3,r*0.36,-0.28,Math.PI,0); ctx.fill();
  ctx.fillStyle='#f0c9a0';
  ctx.beginPath(); ctx.ellipse(x-r*0.5,y-r*0.6,r*0.2,r*0.11,0.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+r*0.5,y-r*0.6,r*0.2,r*0.11,-0.5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#5a3818'; ctx.lineWidth=r*0.078; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x-r*0.44,y-r*0.24); ctx.quadraticCurveTo(x-r*0.27,y-r*0.32,x-r*0.11,y-r*0.26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+r*0.11,y-r*0.26); ctx.quadraticCurveTo(x+r*0.27,y-r*0.32,x+r*0.44,y-r*0.24); ctx.stroke();
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.ellipse(x-r*0.26,y-r*0.1,r*0.135,r*0.09,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+r*0.26,y-r*0.1,r*0.135,r*0.09,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#3a1e08';
  ctx.beginPath(); ctx.arc(x-r*0.26,y-r*0.1,r*0.072,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+r*0.26,y-r*0.1,r*0.072,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.75)';
  ctx.beginPath(); ctx.arc(x-r*0.235,y-r*0.125,r*0.025,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+r*0.285,y-r*0.125,r*0.025,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#d49060'; ctx.beginPath(); ctx.arc(x,y+r*0.08,r*0.085,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#bf7a48';
  ctx.beginPath(); ctx.arc(x-r*0.1,y+r*0.1,r*0.052,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+r*0.1,y+r*0.1,r*0.052,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#b85030'; ctx.beginPath(); ctx.arc(x,y+r*0.29,r*0.34,0.18,Math.PI-0.18); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x,y+r*0.29,r*0.27,0.28,Math.PI-0.28); ctx.fill();
  ctx.strokeStyle='#b05030'; ctx.lineWidth=r*0.038;
  ctx.beginPath(); ctx.moveTo(x-r*0.25,y+r*0.29); ctx.lineTo(x+r*0.25,y+r*0.29); ctx.stroke();
  ctx.fillStyle='rgba(210,90,70,0.16)';
  ctx.beginPath(); ctx.ellipse(x-r*0.42,y+r*0.2,r*0.19,r*0.11,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+r*0.42,y+r*0.2,r*0.19,r*0.11,0,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
  ctx.strokeStyle='#4fc3f7'; ctx.lineWidth=2.5; ctx.stroke();
}

function drawPavle(ctx, x, y, radius) {
  const r = radius;
  ctx.save();
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.clip();
  ctx.fillStyle='#e0b896'; ctx.beginPath(); ctx.arc(x,y+r*0.05,r,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#d4a880'; ctx.fillRect(x-r*0.24,y+r*0.52,r*0.48,r*0.55);
  ctx.fillStyle='#222';
  ctx.beginPath(); ctx.moveTo(x-r*1.1,y+r*1.1); ctx.lineTo(x-r*0.46,y+r*0.56); ctx.lineTo(x,y+r*0.62); ctx.lineTo(x+r*0.46,y+r*0.56); ctx.lineTo(x+r*1.1,y+r*1.1); ctx.fill();
  ctx.fillStyle='#7a8070';
  ctx.beginPath(); ctx.moveTo(x-r*1.1,y+r*1.1); ctx.lineTo(x-r*0.46,y+r*0.56); ctx.lineTo(x-r*0.14,y+r*0.68); ctx.lineTo(x-r*0.06,y+r*1.1); ctx.lineTo(x-r*1.1,y+r*1.1); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x+r*1.1,y+r*1.1); ctx.lineTo(x+r*0.46,y+r*0.56); ctx.lineTo(x+r*0.14,y+r*0.68); ctx.lineTo(x+r*0.06,y+r*1.1); ctx.lineTo(x+r*1.1,y+r*1.1); ctx.fill();
  ctx.strokeStyle='#bbb'; ctx.lineWidth=r*0.04;
  ctx.beginPath(); ctx.moveTo(x,y+r*0.62); ctx.lineTo(x,y+r*1.1); ctx.stroke();
  ctx.fillStyle='#ccc'; ctx.fillRect(x-r*0.04,y+r*0.7,r*0.08,r*0.06);
  ctx.strokeStyle='rgba(100,105,90,0.5)'; ctx.lineWidth=r*0.02;
  [[-0.5,0.75],[0.5,0.75],[-0.55,0.88],[0.55,0.88]].forEach(([dx,dy])=>{
    ctx.beginPath(); ctx.moveTo(x+dx*r,y+(dy-0.04)*r); ctx.lineTo(x+(dx+0.06)*r,y+dy*r); ctx.lineTo(x+dx*r,y+(dy+0.04)*r); ctx.lineTo(x+(dx-0.06)*r,y+dy*r); ctx.closePath(); ctx.stroke();
  });
  ctx.strokeStyle='rgba(200,200,200,0.7)'; ctx.lineWidth=r*0.018;
  ctx.beginPath(); ctx.arc(x,y+r*0.72,r*0.18,0.3,Math.PI-0.3); ctx.stroke();
  ctx.fillStyle='#c8956a';
  ctx.beginPath(); ctx.ellipse(x-r*0.86,y+r*0.04,r*0.14,r*0.2,0.15,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+r*0.86,y+r*0.04,r*0.14,r*0.2,-0.15,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#2a1f14';
  ctx.beginPath(); ctx.arc(x,y-r*0.56,r*0.55,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x-r*0.4,y-r*0.48,r*0.38,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+r*0.4,y-r*0.48,r*0.38,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x-r*0.62,y-r*0.3,r*0.3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+r*0.62,y-r*0.3,r*0.3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x-r*0.22,y-r*0.72,r*0.28,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+r*0.22,y-r*0.72,r*0.28,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#3d2c1a';
  ctx.beginPath(); ctx.arc(x+r*0.15,y-r*0.6,r*0.2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#2e2018';
  ctx.beginPath(); ctx.ellipse(x,y+r*0.38,r*0.46,r*0.28,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#3a2a1c';
  ctx.beginPath(); ctx.ellipse(x,y+r*0.32,r*0.36,r*0.16,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#251a10';
  ctx.beginPath(); ctx.ellipse(x,y+r*0.18,r*0.22,r*0.08,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#201408'; ctx.lineWidth=r*0.085; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x-r*0.42,y-r*0.22); ctx.quadraticCurveTo(x-r*0.25,y-r*0.3,x-r*0.1,y-r*0.23); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+r*0.1,y-r*0.23); ctx.quadraticCurveTo(x+r*0.25,y-r*0.3,x+r*0.42,y-r*0.22); ctx.stroke();
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.ellipse(x-r*0.25,y-r*0.1,r*0.13,r*0.088,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+r*0.25,y-r*0.1,r*0.13,r*0.088,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#2a1a08';
  ctx.beginPath(); ctx.arc(x-r*0.25,y-r*0.1,r*0.068,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+r*0.25,y-r*0.1,r*0.068,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.beginPath(); ctx.arc(x-r*0.225,y-r*0.122,r*0.022,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+r*0.275,y-r*0.122,r*0.022,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#6b4a28'; ctx.lineWidth=r*0.055; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(x-r*0.26,y-r*0.1,r*0.175,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x+r*0.26,y-r*0.1,r*0.175,0,Math.PI*2); ctx.stroke();
  ctx.lineWidth=r*0.04;
  ctx.beginPath(); ctx.moveTo(x-r*0.085,y-r*0.1); ctx.lineTo(x+r*0.085,y-r*0.1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x-r*0.435,y-r*0.1); ctx.lineTo(x-r*0.72,y-r*0.06); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+r*0.435,y-r*0.1); ctx.lineTo(x+r*0.72,y-r*0.06); ctx.stroke();
  ctx.fillStyle='#c08060';
  ctx.beginPath(); ctx.arc(x,y+r*0.06,r*0.07,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#7a3a20'; ctx.lineWidth=r*0.055; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x-r*0.16,y+r*0.14); ctx.quadraticCurveTo(x+r*0.05,y+r*0.22,x+r*0.2,y+r*0.16); ctx.stroke();
  ctx.restore();
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
  ctx.strokeStyle='#a5d6a7'; ctx.lineWidth=2.5; ctx.stroke();
}

function AvatarPreview({ drawFn, size=80 }) {
  const ref = useRef(null);
  useEffect(()=>{
    const c=ref.current; if(!c)return;
    const ctx=c.getContext('2d');
    ctx.clearRect(0,0,size,size);
    drawFn(ctx, size/2, size/2, size/2-3);
  },[drawFn,size]);
  return <canvas ref={ref} width={size} height={size} style={{borderRadius:'50%',display:'block'}}/>;
}

const CHARACTERS = [
  { id:'pahlsson', name:'Påhlsson', title:'Inkassochef',            ring:'#4fc3f7', draw: drawPahlsson },
  { id:'pavle',    name:'Pavle',    title:'Debt Collection Officer', ring:'#a5d6a7', draw: drawPavle   },
];

export default function App(){
  const canvasRef=useRef(null);
  const stateRef=useRef(null);
  const rafRef=useRef(null);
  const timerRef=useRef(null);
  const lastRef=useRef(0);
  const nextDirRef=useRef({dr:0,dc:0});
  const currentDirRef=useRef({dr:0,dc:0});
  const popupsRef=useRef([]);
  const typingRef=useRef(false);
  const charRef=useRef('pahlsson');
  const [phase,setPhase]=useState("start");
  const [selectedChar,setSelectedChar]=useState('pahlsson');
  const [score,setScore]=useState(0);
  const [caught,setCaught]=useState(0);
  const [timeLeft,setTimeLeft]=useState(60);
  const [finalScore,setFinalScore]=useState(0);
  const [finalCaught,setFinalCaught]=useState(0);
  const [finalBreakdown,setFinalBreakdown]=useState([0,0,0,0]);
  const [playerName,setPlayerName]=useState("");
  const [nameInput,setNameInput]=useState("");
  const [scoreboard,setScoreboard]=useState([]);
  const [sbLoading,setSbLoading]=useState(false);
  const [saved,setSaved]=useState(false);

  const loadScoreboard=useCallback(async()=>{
    setSbLoading(true);
    try{
      const res=await window.storage.list("inkasso:score:");
      const entries=[];
      for(const key of (res?.keys||[])){
        try{const r2=await window.storage.get(key,true);if(r2)entries.push(JSON.parse(r2.value));}catch{}
      }
      entries.sort((a,b)=>b.score-a.score);
      setScoreboard(entries.slice(0,10));
    }catch(e){console.error(e);}
    setSbLoading(false);
  },[]);

  useEffect(()=>{loadScoreboard();},[loadScoreboard]);

  const saveScore=useCallback(async(name,sc,bd,ct,char)=>{
    const key=`inkasso:score:${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const entry={name,score:sc,breakdown:bd,caught:ct,char,date:new Date().toLocaleDateString("sv-SE")};
    try{await window.storage.set(key,JSON.stringify(entry),true);}catch{};
    setSaved(true); loadScoreboard();
  },[loadScoreboard]);

  const initState=useCallback(()=>{
    const dots=[];
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(MAP_TEMPLATE[r][c]===0)dots.push({r,c,active:true});
    const customers=CUSTOMER_STARTS.map((s,i)=>({
      r:s.r,c:s.c,px:s.c*TILE+TILE/2,py:s.r*TILE+TILE/2,
      baseSpeed:BASE_SPEEDS[i],dr:0,dc:1,name:NAMES[i],stage:0,
    }));
    stateRef.current={player:{r:5,c:6,px:6*TILE+TILE/2,py:5*TILE+TILE/2,dr:0,dc:0},customers,dots,score:0,caught:0,timeLeft:60,breakdown:[0,0,0,0]};
    nextDirRef.current={dr:0,dc:0}; currentDirRef.current={dr:0,dc:0}; popupsRef.current=[];
  },[]);

  const endGame=useCallback(()=>{
    cancelAnimationFrame(rafRef.current); clearInterval(timerRef.current);
    const s=stateRef.current;
    setFinalScore(s.score); setFinalCaught(s.caught); setFinalBreakdown([...s.breakdown]);
    setSaved(false); setNameInput(playerName||""); setPhase("end");
  },[playerName]);

  const startGame=useCallback((charId)=>{
    charRef.current=charId||charRef.current;
    initState(); setScore(0); setCaught(0); setTimeLeft(60); setPhase("playing");
  },[initState]);

  useEffect(()=>{
    const dn=e=>{
      if(typingRef.current)return;
      const m={'ArrowUp':[-1,0],'ArrowDown':[1,0],'ArrowLeft':[0,-1],'ArrowRight':[0,1],
        'w':[-1,0],'W':[-1,0],'s':[1,0],'S':[1,0],'a':[0,-1],'A':[0,-1],'d':[0,1],'D':[0,1]};
      if(m[e.key]){nextDirRef.current={dr:m[e.key][0],dc:m[e.key][1]};e.preventDefault();}
    };
    window.addEventListener('keydown',dn);
    return()=>window.removeEventListener('keydown',dn);
  },[]);

  useEffect(()=>{
    if(phase!=="playing")return;
    timerRef.current=setInterval(()=>{
      if(!stateRef.current)return;
      stateRef.current.timeLeft--;
      setTimeLeft(stateRef.current.timeLeft);
      if(stateRef.current.timeLeft<=0)endGame();
    },1000);
    return()=>clearInterval(timerRef.current);
  },[phase,endGame]);

  useEffect(()=>{
    if(phase!=="playing")return;
    const canvas=canvasRef.current;
    const ctx=canvas.getContext('2d');
    const char=CHARACTERS.find(c=>c.id===charRef.current)||CHARACTERS[0];

    function moveCustomer(cu,dt){
      const spd=cu.baseSpeed*STAGES[cu.stage].speedMult;
      const targetX=cu.c*TILE+TILE/2, targetY=cu.r*TILE+TILE/2;
      const dx=targetX-cu.px, dy=targetY-cu.py;
      const dist=Math.sqrt(dx*dx+dy*dy);
      const step=spd*TILE*dt;
      if(dist>step){
        const nx=cu.px+(dx/dist)*step, ny=cu.py+(dy/dist)*step;
        if(!isWall(Math.floor(ny/TILE),Math.floor(nx/TILE))){cu.px=nx;cu.py=ny;}
      } else {
        cu.px=targetX; cu.py=targetY;
        const dirs=[[-1,0],[1,0],[0,-1],[0,1]];
        const fwd=dirs.filter(([dr,dc])=>dr===cu.dr&&dc===cu.dc&&!isWall(cu.r+dr,cu.c+dc));
        const turn=dirs.filter(([dr,dc])=>!(dr===cu.dr&&dc===cu.dc)&&!(dr===-cu.dr&&dc===-cu.dc)&&!isWall(cu.r+dr,cu.c+dc));
        const rev=dirs.filter(([dr,dc])=>dr===-cu.dr&&dc===-cu.dc&&!isWall(cu.r+dr,cu.c+dc));
        const rnd=Math.random();
        let pool=fwd.length&&rnd<0.55?fwd:turn.length&&rnd<0.95?turn:fwd.length?fwd:turn.length?turn:rev;
        if(pool&&pool.length){const d=pool[Math.floor(Math.random()*pool.length)];cu.dr=d[0];cu.dc=d[1];}
        const nr=cu.r+cu.dr,nc=cu.c+cu.dc;
        if(!isWall(nr,nc)){cu.r=nr;cu.c=nc;cu.px=targetX+cu.dc*step;cu.py=targetY+cu.dr*step;}
      }
    }

    function respawn(cu){
      const p=stateRef.current.player;
      const spots=CUSTOMER_STARTS.filter(s=>Math.abs(s.r-p.r)+Math.abs(s.c-p.c)>4);
      const s=spots[Math.floor(Math.random()*spots.length)]||CUSTOMER_STARTS[3];
      cu.r=s.r;cu.c=s.c;cu.px=s.c*TILE+TILE/2;cu.py=s.r*TILE+TILE/2;
    }

    function drawCustomer(cu){
      const st=STAGES[cu.stage]; const{px:x,py:y}=cu;
      ctx.save(); ctx.translate(x,y);
      if(cu.stage>=2){ctx.beginPath();ctx.arc(0,0,TILE*0.42,0,Math.PI*2);ctx.strokeStyle=cu.stage===3?'#ce93d8':'#ef9a9a';ctx.lineWidth=2.5;ctx.stroke();}
      ctx.beginPath();ctx.arc(0,0,TILE*0.34,0,Math.PI*2);ctx.fillStyle=st.color;ctx.fill();
      const es=cu.stage*1.5;
      ctx.fillStyle='rgba(0,0,0,0.6)';
      ctx.beginPath();ctx.arc(-4+es*0.3,-3-es*0.2,2+es*0.2,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(4-es*0.3,-3-es*0.2,2+es*0.2,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,0.6)';ctx.lineWidth=1.5;
      if(cu.stage<=1){ctx.beginPath();ctx.arc(0,5,4,0.2,Math.PI-0.2);ctx.stroke();}
      else{ctx.beginPath();ctx.arc(0,8,5,Math.PI+0.3,Math.PI*2-0.3);ctx.stroke();}
      ctx.fillStyle=st.color;ctx.fillRect(-14,7,28,10);
      ctx.fillStyle=st.textColor;ctx.font=`bold ${cu.stage===2?5.5:6}px sans-serif`;
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(st.emoji+' '+st.name,-0.5,12);
      for(let i=0;i<=cu.stage;i++){ctx.fillStyle=cu.stage===3?'#ce93d8':cu.stage===2?'#ef5350':cu.stage===1?'#ffb74d':'#81c784';ctx.fillRect(-14+i*7,19,5,3);}
      ctx.restore();
      ctx.fillStyle='#bbb';ctx.font='8px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
      ctx.fillText(cu.name,x,y+TILE*0.44);
    }

    let mouthDir=1,mouthA=0;
    function loop(ts=0){
      const dt=Math.min((ts-lastRef.current)/1000,0.05); lastRef.current=ts;
      const st2=stateRef.current; if(!st2)return;
      const{player:p,customers,dots}=st2;
      const nd=nextDirRef.current,cd=currentDirRef.current;
      if(nd.dr!==cd.dr||nd.dc!==cd.dc){
        const cx=p.c*TILE+TILE/2,cy=p.r*TILE+TILE/2;
        if(Math.sqrt((p.px-cx)**2+(p.py-cy)**2)<6&&!isWall(p.r+nd.dr,p.c+nd.dc)){
          p.dr=nd.dr;p.dc=nd.dc;currentDirRef.current={...nd};
        }
      }
      if(!isWall(p.r+p.dr,p.c+p.dc)){p.px+=p.dc*3.8*TILE*dt;p.py+=p.dr*3.8*TILE*dt;}
      else{p.px=p.c*TILE+TILE/2;p.py=p.r*TILE+TILE/2;p.dr=0;p.dc=0;currentDirRef.current={dr:0,dc:0};}
      const cr=Math.round((p.py-TILE/2)/TILE),cc=Math.round((p.px-TILE/2)/TILE);
      if(!isWall(cr,cc)){p.r=cr;p.c=cc;}
      mouthA+=mouthDir*180*dt; if(mouthA>30)mouthDir=-1; if(mouthA<2)mouthDir=1;
      dots.forEach(d=>{if(d.active&&d.r===p.r&&d.c===p.c){d.active=false;st2.score+=5;setScore(st2.score);}});
      customers.forEach(cu=>{
        moveCustomer(cu,dt);
        const dx=cu.px-p.px,dy=cu.py-p.py;
        if(Math.sqrt(dx*dx+dy*dy)<TILE*0.6){
          const stage=STAGES[cu.stage];
          st2.score+=stage.points;st2.caught++;st2.breakdown[cu.stage]++;
          setScore(st2.score);setCaught(st2.caught);
          popupsRef.current.push({x:cu.px,y:cu.py,text:`+${stage.points} ${stage.emoji}`,color:stage.color,life:1.2});
          cu.stage=Math.min(cu.stage+1,3); respawn(cu);
        }
      });
      popupsRef.current=popupsRef.current.filter(pp=>pp.life>0);
      popupsRef.current.forEach(pp=>{pp.life-=dt;pp.y-=35*dt;});
      ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,canvas.width,canvas.height);
      for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
        if(MAP_TEMPLATE[row][col]===1){
          ctx.fillStyle='#2a2a5a';ctx.fillRect(col*TILE,row*TILE,TILE,TILE);
          ctx.strokeStyle='#3a3a8a';ctx.lineWidth=0.5;ctx.strokeRect(col*TILE+0.5,row*TILE+0.5,TILE-1,TILE-1);
        }
      }
      dots.forEach(d=>{
        if(!d.active)return;
        ctx.fillStyle='#ffd700';ctx.font='9px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText('kr',d.c*TILE+TILE/2,d.r*TILE+TILE/2);
      });
      customers.forEach(cu=>drawCustomer(cu));
      char.draw(ctx,p.px,p.py,TILE*0.44);
      ctx.fillStyle=char.ring;ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
      ctx.fillText(char.name,p.px,p.py+TILE*0.47);
      popupsRef.current.forEach(pp=>{
        ctx.globalAlpha=Math.max(0,pp.life);ctx.fillStyle=pp.color;ctx.font='bold 13px sans-serif';
        ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(pp.text,pp.x,pp.y);ctx.globalAlpha=1;
      });
      rafRef.current=requestAnimationFrame(loop);
    }
    lastRef.current=0; rafRef.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(rafRef.current);
  },[phase]);

  const handleDpad=(dr,dc)=>{nextDirRef.current={dr,dc};};
  const handleSave=()=>{
    const n=nameInput.trim()||"Anonym";
    setPlayerName(n);
    saveScore(n,finalScore,finalBreakdown,finalCaught,charRef.current);
  };

  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'1rem 0',fontFamily:'var(--font-sans, sans-serif)'}}>
      <div style={{display:'flex',gap:'1.5rem',marginBottom:'0.5rem',fontSize:14,color:'var(--color-text-primary,#f0f0f0)',fontWeight:500}}>
        <div>Poäng: <span style={{fontWeight:400,color:'var(--color-text-secondary,#aaa)'}}>{score}</span></div>
        <div>Infångade: <span style={{fontWeight:400,color:'var(--color-text-secondary,#aaa)'}}>{caught}</span></div>
        <div>Tid: <span style={{fontWeight:400,color:'var(--color-text-secondary,#aaa)'}}>{timeLeft}</span>s</div>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap',justifyContent:'center'}}>
        {STAGES.map((s,i)=>(
          <div key={i} style={{background:s.color,color:s.textColor,fontSize:10,fontWeight:500,padding:'2px 7px',borderRadius:6}}>
            {s.emoji} {s.name} +{s.points}p
          </div>
        ))}
      </div>
      <div style={{position:'relative'}}>
        <canvas ref={canvasRef} width={COLS*TILE} height={ROWS*TILE}
          style={{border:'1px solid #555',borderRadius:8,background:'#1a1a2e',display:'block'}}/>
        {phase==='start'&&(
          <Overlay>
            <div style={{fontSize:22,fontWeight:500}}>💼 INKASSO-MAN</div>
            <div style={{fontSize:13,opacity:0.8}}>Indrivning med Påhlsson</div>
            <div style={{fontSize:11,opacity:0.65,lineHeight:1.9}}>
              {STAGES.map((s,i)=><div key={i}>{s.emoji} {s.name} = {s.points}p | x{s.speedMult} hastighet</div>)}
            </div>
            <button style={btnStyle} onClick={()=>setPhase('pick')}>Välj spelare ▶</button>
            <div style={{marginTop:4,fontSize:12,opacity:0.6,cursor:'pointer',textDecoration:'underline'}} onClick={()=>setPhase('scores')}>Se scoreboard 🏆</div>
          </Overlay>
        )}
        {phase==='pick'&&(
          <Overlay>
            <div style={{fontSize:18,fontWeight:500}}>Välj din spelare</div>
            <div style={{display:'flex',gap:16,marginTop:4}}>
              {CHARACTERS.map(ch=>(
                <div key={ch.id} onClick={()=>setSelectedChar(ch.id)}
                  style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'12px 16px',
                    border:`2px solid ${selectedChar===ch.id?ch.ring:'rgba(255,255,255,0.2)'}`,
                    borderRadius:12,cursor:'pointer',
                    background:selectedChar===ch.id?'rgba(255,255,255,0.1)':'transparent'}}>
                  <AvatarPreview drawFn={ch.draw} size={80}/>
                  <div style={{fontSize:14,fontWeight:500}}>{ch.name}</div>
                  <div style={{fontSize:11,opacity:0.65}}>{ch.title}</div>
                </div>
              ))}
            </div>
            <button style={{...btnStyle,marginTop:8}} onClick={()=>startGame(selectedChar)}>Starta spelet 🎮</button>
            <div style={{fontSize:12,opacity:0.5,cursor:'pointer',marginTop:4}} onClick={()=>setPhase('start')}>← Tillbaka</div>
          </Overlay>
        )}
        {phase==='end'&&(
          <Overlay>
            <div style={{fontSize:20,fontWeight:500}}>Tid ute!</div>
            <div style={{fontSize:22,fontWeight:500,color:'#ffd700'}}>Poäng: {finalScore}</div>
            <div style={{fontSize:12,lineHeight:1.9,opacity:0.85}}>
              {STAGES.map((s,i)=><div key={i}>{s.emoji} {s.name}: <b>{finalBreakdown[i]}</b> st (+{finalBreakdown[i]*s.points}p)</div>)}
            </div>
            {!saved?(
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,marginTop:4}}>
                <div style={{fontSize:12,opacity:0.75}}>Ange ditt namn för scoreboard:</div>
                <input value={nameInput} onChange={e=>setNameInput(e.target.value)}
                  onFocus={()=>{typingRef.current=true;}} onBlur={()=>{typingRef.current=false;}}
                  onKeyDown={e=>{e.stopPropagation();if(e.key==='Enter')handleSave();}}
                  placeholder="Ditt namn..." maxLength={20} autoFocus
                  style={{padding:'6px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.1)',color:'#fff',fontSize:14,textAlign:'center',width:160,outline:'none'}}/>
                <div style={{display:'flex',gap:8}}>
                  <button style={btnStyle} onClick={handleSave}>Spara 🏆</button>
                  <button style={{...btnStyle,opacity:0.6}} onClick={()=>setPhase('pick')}>Skippa</button>
                </div>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                <div style={{fontSize:13,color:'#81c784'}}>✅ Sparat!</div>
                <div style={{display:'flex',gap:8}}>
                  <button style={btnStyle} onClick={()=>setPhase('pick')}>Spela igen</button>
                  <button style={{...btnStyle,opacity:0.8}} onClick={()=>setPhase('scores')}>Se scoreboard 🏆</button>
                </div>
              </div>
            )}
          </Overlay>
        )}
        {phase==='scores'&&(
          <Overlay>
            <div style={{fontSize:20,fontWeight:500}}>🏆 Scoreboard</div>
            {sbLoading?<div style={{opacity:0.6,fontSize:13}}>Laddar...</div>:(
              <div style={{width:'100%',maxWidth:360,maxHeight:260,overflowY:'auto'}}>
                {scoreboard.length===0&&<div style={{opacity:0.6,fontSize:13}}>Inga resultat än!</div>}
                {scoreboard.map((e,i)=>{
                  const ch=CHARACTERS.find(c=>c.id===e.char);
                  return(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 8px',borderRadius:8,background:i===0?'rgba(255,215,0,0.15)':i<3?'rgba(255,255,255,0.07)':'transparent',marginBottom:3}}>
                      <span style={{fontSize:16,minWidth:24}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}.`}</span>
                      {ch&&<AvatarPreview drawFn={ch.draw} size={28}/>}
                      <span style={{flex:1,fontSize:13,fontWeight:500}}>{e.name}</span>
                      <span style={{fontSize:14,fontWeight:500,color:'#ffd700'}}>{e.score}p</span>
                      <span style={{fontSize:10,opacity:0.5}}>{e.date}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{display:'flex',gap:8,marginTop:4}}>
              <button style={btnStyle} onClick={()=>setPhase('pick')}>Spela 🎮</button>
              <button style={{...btnStyle,opacity:0.6,fontSize:13}} onClick={loadScoreboard}>Uppdatera</button>
            </div>
          </Overlay>
        )}
      </div>
      <div style={{marginTop:10,display:'grid',gridTemplateColumns:'40px 40px 40px',gridTemplateRows:'40px 40px',gap:4}}>
        <div/><DpadBtn label="▲" onClick={()=>handleDpad(-1,0)}/><div/>
        <DpadBtn label="◄" onClick={()=>handleDpad(0,-1)}/>
        <DpadBtn label="▼" onClick={()=>handleDpad(1,0)}/>
        <DpadBtn label="►" onClick={()=>handleDpad(0,1)}/>
      </div>
    </div>
  );
}

function Overlay({children}){
  return <div style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(10,10,20,0.9)',borderRadius:8,color:'#fff',textAlign:'center',gap:10,padding:'1rem'}}>
    {children}
  </div>;
}
function DpadBtn({label,onClick}){
  return <button onMouseDown={onClick} onTouchStart={e=>{e.preventDefault();onClick();}}
    style={{background:'#2a2a2a',border:'1px solid #444',borderRadius:8,fontSize:16,cursor:'pointer',color:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center'}}>
    {label}
  </button>;
}
const btnStyle={padding:'8px 20px',border:'1px solid rgba(255,255,255,0.4)',background:'transparent',color:'#fff',borderRadius:8,fontSize:14,cursor:'pointer'};
