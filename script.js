const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");
let W,H,hearts=[],stars=[],fireworks=[];
let rotX=0, rotY=0, targetX=0, targetY=0, zoom=1;
let dragging=false,lastX=0,lastY=0;

const words=[
 "Kim Thoại ❤️","17/07","Anh yêu em","Happy Birthday","Vợ yêu của anh",
 "Khải Minh ❤️","Gia đình mình","Mãi bên nhau","Cảm ơn em","Yêu em mãi mãi",
 "Em là cả thế giới","Người vợ tuyệt vời","Mỗi ngày yêu em hơn","Chúc mừng sinh nhật",
 "Trung yêu Kim Thoại","Mãi nắm tay nhau"
];

function resize(){
 W=canvas.width=innerWidth*devicePixelRatio;
 H=canvas.height=innerHeight*devicePixelRatio;
 canvas.style.width=innerWidth+"px"; canvas.style.height=innerHeight+"px";
 ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
addEventListener("resize",resize); resize();

function makeStars(){
 stars=[];
 for(let i=0;i<170;i++) stars.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.5+.25,a:Math.random()});
}
makeStars();

function makeHearts(){
 document.querySelectorAll(".heartLabel").forEach(e=>e.remove());
 hearts=[];
 const count = innerWidth < 520 ? 260 : 520;
 for(let i=0;i<count;i++){
   const el=document.createElement("div");
   el.className="heartLabel";
   el.innerHTML = Math.random()<.55 ? "❤️" : words[Math.floor(Math.random()*words.length)];
   document.body.appendChild(el);
   const radius=160+Math.random()*520;
   const theta=Math.random()*Math.PI*2, phi=Math.acos(2*Math.random()-1);
   hearts.push({
    el, x:radius*Math.sin(phi)*Math.cos(theta), y:radius*Math.sin(phi)*Math.sin(theta), z:radius*Math.cos(phi),
    s:.55+Math.random()*1.45, speed:.001+Math.random()*.003, phase:Math.random()*99
   });
 }
}
makeHearts();

function project(p){
 let x=p.x, y=p.y, z=p.z;
 let cy=Math.cos(rotY), sy=Math.sin(rotY), cx=Math.cos(rotX), sx=Math.sin(rotX);
 let x1=x*cy-z*sy, z1=x*sy+z*cy;
 let y1=y*cx-z1*sx, z2=y*sx+z1*cx;
 const f=680*zoom/(680+z2);
 return {x:innerWidth/2+x1*f,y:innerHeight/2+y1*f,z:z2,scale:f};
}

function drawHeart(x,y,size,alpha){
 ctx.save(); ctx.translate(x,y); ctx.scale(size,size); ctx.globalAlpha=alpha;
 ctx.beginPath();
 ctx.moveTo(0,0);
 ctx.bezierCurveTo(-2,-3,-8,-3,-8,2);
 ctx.bezierCurveTo(-8,8,0,12,0,16);
 ctx.bezierCurveTo(0,12,8,8,8,2);
 ctx.bezierCurveTo(8,-3,2,-3,0,0);
 ctx.fillStyle="#ff3f91"; ctx.shadowColor="#ff3f91"; ctx.shadowBlur=18; ctx.fill();
 ctx.restore();
}

function boom(){
 for(let k=0;k<3;k++){
  const x=innerWidth*(.2+Math.random()*.6), y=innerHeight*(.15+Math.random()*.38);
  for(let i=0;i<55;i++){
   const a=Math.random()*Math.PI*2, sp=1+Math.random()*4;
   fireworks.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:70,age:0});
  }
 }
}

function animate(){
 ctx.clearRect(0,0,innerWidth,innerHeight);
 stars.forEach(s=>{s.a+=.03; ctx.globalAlpha=.35+.65*Math.sin(s.a)**2; ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,7); ctx.fill();});
 ctx.globalAlpha=1;
 rotX += (targetX-rotX)*.04; rotY += (targetY-rotY)*.04 + .002;

 for(const p of fireworks){
  p.age++; p.x+=p.vx; p.y+=p.vy; p.vy+=.025;
  ctx.globalAlpha=Math.max(0,1-p.age/p.life);
  ctx.fillStyle="#ffd66b"; ctx.beginPath(); ctx.arc(p.x,p.y,2,0,7); ctx.fill();
 }
 fireworks=fireworks.filter(p=>p.age<p.life);
 ctx.globalAlpha=1;

 hearts.forEach((h,idx)=>{
  h.phase += h.speed*18;
  const pr=project({x:h.x,y:h.y+Math.sin(h.phase)*25,z:h.z});
  const visible = pr.z > -650;
  h.el.style.display = visible ? "block" : "none";
  if(visible){
    const sc=Math.max(.18,pr.scale*h.s);
    h.el.style.transform=`translate(-50%,-50%) translate(${pr.x}px,${pr.y}px) scale(${sc})`;
    h.el.style.opacity=Math.min(1,Math.max(.15,(pr.z+760)/1250));
    h.el.style.fontSize = (idx%3===0?18:24)+"px";
  }
 });
 requestAnimationFrame(animate);
}
animate();

canvas.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY});
addEventListener("pointerup",()=>dragging=false);
addEventListener("pointermove",e=>{
 if(!dragging) return;
 targetY += (e.clientX-lastX)*.006; targetX -= (e.clientY-lastY)*.006;
 lastX=e.clientX; lastY=e.clientY;
});
canvas.addEventListener("wheel",e=>{zoom=Math.min(2.2,Math.max(.55,zoom-e.deltaY*.001));});

document.getElementById("startBtn").onclick=()=>{
 document.getElementById("intro").style.opacity=0;
 setTimeout(()=>document.getElementById("intro").style.display="none",900);
 boom(); setInterval(boom,4500);
};
document.getElementById("memoryBtn").onclick=()=>{document.getElementById("messageBox").style.display="flex"; boom();}
document.getElementById("closeMsg").onclick=()=>document.getElementById("messageBox").style.display="none";

const music=document.getElementById("bgMusic"), btn=document.getElementById("musicBtn");
btn.onclick=async()=>{
 if(music.paused){try{await music.play(); btn.textContent="🔇 Tắt nhạc"}catch(e){}}
 else{music.pause(); btn.textContent="🎵 Bật nhạc"}
};
canvas.addEventListener("click",e=>{
 if(Math.random()<.9){document.getElementById("messageBox").style.display="flex"; boom();}
});
