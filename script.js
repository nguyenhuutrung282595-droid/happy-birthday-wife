const canvas=document.getElementById("sky");
const ctx=canvas.getContext("2d");
let W,H,hearts=[],stars=[],fireworks=[];
let rotX=0,rotY=0,targetX=0,targetY=0,zoom=1;
let dragging=false,lastX=0,lastY=0,started=false;

function resize(){
 W=canvas.width=innerWidth*devicePixelRatio;
 H=canvas.height=innerHeight*devicePixelRatio;
 canvas.style.width=innerWidth+"px";
 canvas.style.height=innerHeight+"px";
 ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
addEventListener("resize",resize);resize();

function makeStars(){
 stars=[];
 for(let i=0;i<150;i++)stars.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.4+.25,a:Math.random()*9});
}
makeStars();

function makeHearts(){
 document.querySelectorAll(".heart").forEach(e=>e.remove());
 hearts=[];
 const count=innerWidth<520?42:58;
 for(let i=0;i<count;i++){
  const el=document.createElement("div");
  el.className="heart";
  el.textContent="❤️";
  document.body.appendChild(el);
  const radius=160+Math.random()*420;
  const theta=Math.random()*Math.PI*2,phi=Math.acos(2*Math.random()-1);
  hearts.push({
   el,
   x:radius*Math.sin(phi)*Math.cos(theta),
   y:radius*Math.sin(phi)*Math.sin(theta),
   z:radius*Math.cos(phi),
   s:.75+Math.random()*1.45,
   speed:.0008+Math.random()*.0016,
   phase:Math.random()*99
  });
 }
}
makeHearts();

function project(p){
 let x=p.x,y=p.y,z=p.z;
 let cy=Math.cos(rotY),sy=Math.sin(rotY),cx=Math.cos(rotX),sx=Math.sin(rotX);
 let x1=x*cy-z*sy,z1=x*sy+z*cy;
 let y1=y*cx-z1*sx,z2=y*sx+z1*cx;
 const f=680*zoom/(680+z2);
 return{x:innerWidth/2+x1*f,y:innerHeight/2+y1*f,z:z2,scale:f};
}

function boom(){
 for(let k=0;k<2;k++){
  const x=innerWidth*(.18+Math.random()*.64),y=innerHeight*(.15+Math.random()*.32);
  for(let i=0;i<45;i++){
   const a=Math.random()*Math.PI*2,sp=1+Math.random()*3.4;
   fireworks.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:65,age:0});
  }
 }
}

function animate(){
 ctx.clearRect(0,0,innerWidth,innerHeight);
 stars.forEach(s=>{
  s.a+=.025;
  ctx.globalAlpha=.28+.6*Math.sin(s.a)**2;
  ctx.fillStyle="#fff";
  ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill();
 });
 ctx.globalAlpha=1;

 for(const p of fireworks){
  p.age++;p.x+=p.vx;p.y+=p.vy;p.vy+=.025;
  ctx.globalAlpha=Math.max(0,1-p.age/p.life);
  ctx.fillStyle="#ffd66b";
  ctx.beginPath();ctx.arc(p.x,p.y,2,0,7);ctx.fill();
 }
 fireworks=fireworks.filter(p=>p.age<p.life);
 ctx.globalAlpha=1;

 rotX+=(targetX-rotX)*.035;
 rotY+=(targetY-rotY)*.035+(started?.0015:.0005);

 hearts.forEach(h=>{
  h.phase+=h.speed*18;
  const pr=project({x:h.x,y:h.y+Math.sin(h.phase)*18,z:h.z});
  const visible=pr.z>-650;
  h.el.style.display=visible&&started?"block":"none";
  if(visible&&started){
   const sc=Math.max(.25,pr.scale*h.s);
   h.el.style.transform=`translate(-50%,-50%) translate(${pr.x}px,${pr.y}px) scale(${sc})`;
   h.el.style.opacity=Math.min(.95,Math.max(.16,(pr.z+760)/1250));
   h.el.style.fontSize="27px";
  }
 });
 requestAnimationFrame(animate);
}
animate();

canvas.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY});
addEventListener("pointerup",()=>dragging=false);
addEventListener("pointermove",e=>{
 if(!dragging)return;
 targetY+=(e.clientX-lastX)*.005;
 targetX-=(e.clientY-lastY)*.005;
 lastX=e.clientX;lastY=e.clientY;
});
canvas.addEventListener("wheel",e=>{zoom=Math.min(1.8,Math.max(.7,zoom-e.deltaY*.001));});

const intro=document.getElementById("intro");
const giftScene=document.getElementById("giftScene");
const centerText=document.getElementById("centerText");
document.getElementById("startBtn").onclick=()=>{
 intro.style.opacity=0;
 setTimeout(()=>intro.style.display="none",900);
 giftScene.style.display="flex";
 setTimeout(()=>{started=true;boom();centerText.style.opacity=1;},900);
 setTimeout(()=>giftScene.style.display="none",2300);
 setInterval(boom,6500);
 setTimeout(showFinal,20000);
};

function showFinal(){
 document.getElementById("familyFinal").style.opacity=1;
 setTimeout(()=>document.getElementById("familyFinal").style.opacity=0,9000);
}

document.getElementById("memoryBtn").onclick=()=>{document.getElementById("messageBox").style.display="flex";boom();}
document.getElementById("closeMsg").onclick=()=>{document.getElementById("messageBox").style.display="none";showFinal();}

const music=document.getElementById("bgMusic"),btn=document.getElementById("musicBtn");
btn.onclick=async()=>{
 if(music.paused){try{await music.play();btn.textContent="🔇 Tắt nhạc"}catch(e){}}
 else{music.pause();btn.textContent="🎵 Bật nhạc"}
};
canvas.addEventListener("click",()=>{if(started){document.getElementById("messageBox").style.display="flex";boom();}});
