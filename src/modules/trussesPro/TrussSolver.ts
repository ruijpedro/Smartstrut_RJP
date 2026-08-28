export type TrussType='pratt'|'howe'|'warren'
export type TrussInput={L:number;H:number;panels:number;P:number;type:TrussType;A:number;E:number;fy:number}
export type TNode={id:number,x:number,y:number,fixX?:boolean,fixY?:boolean,Fx?:number,Fy?:number}
export type TBar={id:number,a:number,b:number,A:number,E:number}
type BarResult={id:number,N:number,stress:number,L:number,kind:'Tração'|'Compressão'|'Nulo',util:number}

function solveLinear(A:number[][],b:number[]){
 const n=b.length,M=A.map((r,i)=>[...r,b[i]])
 for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(M[i][k])>Math.abs(M[p][k]))p=i
  ;[M[k],M[p]]=[M[p],M[k]];const d=M[k][k];if(Math.abs(d)<1e-12)throw new Error('Treliça instável ou geometria inadequada.')
  for(let j=k;j<=n;j++)M[k][j]/=d
  for(let i=0;i<n;i++){if(i===k)continue;const f=M[i][k];for(let j=k;j<=n;j++)M[i][j]-=f*M[k][j]}
 }
 return M.map(r=>r[n])
}
function build(i:TrussInput){
 const n=Math.max(2,Math.round(i.panels)),dx=i.L/n,nodes:TNode[]=[],bars:TBar[]=[]
 for(let k=0;k<=n;k++)nodes.push({id:k+1,x:k*dx,y:0})
 for(let k=0;k<=n;k++)nodes.push({id:n+2+k,x:k*dx,y:i.H})
 nodes[0].fixX=true;nodes[0].fixY=true;nodes[n].fixY=true
 for(let k=1;k<n;k++)nodes[k].Fy=-i.P*1000
 let id=1
 const add=(a:number,b:number)=>bars.push({id:id++,a,b,A:i.A,E:i.E*1e9})
 for(let k=0;k<n;k++){add(k+1,k+2);add(n+2+k,n+3+k)}
 add(1,n+2);add(n+1,2*n+2)
 for(let k=1;k<n;k++)add(k+1,n+2+k)
 if(i.type==='warren'){for(let k=0;k<n;k++)add(k%2===0?k+1:n+2+k,k%2===0?n+3+k:k+2)}
 else{
  for(let k=0;k<n;k++){const towardCenter=i.type==='pratt';const left=k<n/2
   if((left&&towardCenter)||(!left&&!towardCenter))add(k+1,n+3+k);else add(n+2+k,k+2)
  }
 }
 return {nodes,bars,n,dx}
}
export function solveTruss(i:TrussInput){
 const g=build(i),nd=2*g.nodes.length,K=Array.from({length:nd},()=>Array(nd).fill(0)),F=Array(nd).fill(0),map=new Map(g.nodes.map((n,k)=>[n.id,k]))
 g.nodes.forEach((n,k)=>{F[2*k]=n.Fx||0;F[2*k+1]=n.Fy||0})
 const cache:any[]=[]
 for(const e of g.bars){const ia=map.get(e.a)!,ib=map.get(e.b)!,a=g.nodes[ia],b=g.nodes[ib],dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy),c=dx/L,s=dy/L,k=e.E*e.A/L
  const ke=[[c*c,c*s,-c*c,-c*s],[c*s,s*s,-c*s,-s*s],[-c*c,-c*s,c*c,c*s],[-c*s,-s*s,c*s,s*s]].map(r=>r.map(v=>v*k)),d=[2*ia,2*ia+1,2*ib,2*ib+1]
  d.forEach((r,x)=>d.forEach((q,y)=>K[r][q]+=ke[x][y]));cache.push({e,ia,ib,L,c,s})
 }
 const fixed:boolean[]=[];g.nodes.forEach(n=>fixed.push(!!n.fixX,!!n.fixY));const free=fixed.map((v,k)=>v?-1:k).filter(k=>k>=0)
 const u=Array(nd).fill(0),uf=solveLinear(free.map(r=>free.map(c=>K[r][c])),free.map(r=>F[r]));free.forEach((d,k)=>u[d]=uf[k])
 const Ku=K.map(r=>r.reduce((s,v,k)=>s+v*u[k],0)),R=Ku.map((v,k)=>v-F[k])
 const results:BarResult[]=cache.map(({e,ia,ib,L,c,s})=>{const du=(u[2*ib]-u[2*ia])*c+(u[2*ib+1]-u[2*ia+1])*s,N=e.E*e.A/L*du,stress=N/e.A/1e6;return{id:e.id,N:N/1000,stress,L,kind:Math.abs(N)<1?'Nulo':N>0?'Tração':'Compressão',util:Math.abs(stress)/Math.max(i.fy,1)}})
 const maxDisp=Math.max(...g.nodes.map((_,k)=>Math.hypot(u[2*k],u[2*k+1]))),maxT=Math.max(0,...results.map(x=>x.N)),maxC=Math.min(0,...results.map(x=>x.N))
 return {...g,u,R,results,maxDisp,maxT,maxC}
}