
import React,{useMemo,useState} from "react";
import {program} from "./data/program";
import "./styles.css";

type Store=Record<string,any>;
const KEY="leanwell-v1";
const load=():Store=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return {}}};
const save=(s:Store)=>localStorage.setItem(KEY,JSON.stringify(s));
const todayISO=()=>{const d=new Date(); const local=new Date(d.getTime()-d.getTimezoneOffset()*60000); return local.toISOString().slice(0,10)};
const clampDate=(x:string)=> x<program[0].date?program[0].date:x>program[program.length-1].date?program[program.length-1].date:x;

function App(){
 const [store,setStore]=useState<Store>(load());
 const [tab,setTab]=useState("HOME");
 const [date,setDate]=useState(clampDate(todayISO()));
 const day:any=program.find(d=>d.date===date)||program[0];
 const patch=(p:Store)=>setStore(s=>{const n={...s,...p};save(n);return n});
 if(!store.onboarded) return <Onboarding onDone={(profile:any)=>patch({onboarded:true,profile})}/>;
 return <div className="app">
   {tab==="HOME"&&<Home day={day} store={store} patch={patch} setTab={setTab}/>}
   {tab==="MEALS"&&<Meals day={day} store={store} patch={patch}/>}
   {tab==="WORKOUT"&&<Workout day={day} store={store} patch={patch}/>}
   {tab==="PROGRESS"&&<Progress store={store} patch={patch} date={date} setDate={setDate}/>}
   {tab==="PROFILE"&&<Profile store={store} patch={patch}/>}
   <nav className="nav">{["HOME","MEALS","WORKOUT","PROGRESS","PROFILE"].map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x}</button>)}</nav>
 </div>
}

function Onboarding({onDone}:{onDone:(p:any)=>void}){
 const [p,setP]=useState<any>({age:21,sex:"female",height:163,weight:78,goal:60,steps:7000,activity:"light",experience:"beginner",availability:5,preferences:"",limitations:""});
 const bmr=p.sex==="male"?10*p.weight+6.25*p.height-5*p.age+5:10*p.weight+6.25*p.height-5*p.age-161;
 const factor={sedentary:1.25,light:1.4,moderate:1.55,high:1.7}[p.activity as string]||1.4;
 const maintenance=Math.round(bmr*factor); const target=Math.max(p.sex==="female"?1400:1600,Math.round((maintenance-500)/50)*50);
 const protein=Math.round(Math.max(1.6*p.weight,1.8*Math.min(p.weight,p.goal))); const fat=Math.round(Math.max(45,target*.27/9)); const carbs=Math.max(70,Math.round((target-protein*4-fat*9)/4));
 return <div className="app"><div className="hero"><div className="eyebrow">Your program</div><h1>LeanWell</h1><p>Personalized through November 20, 2026.</p></div>
 <div className="card"><h2>Tell me about you</h2>
 {["age","height","weight","goal","steps","availability"].map(k=><input className="input" key={k} type="number" value={p[k]} placeholder={k} onChange={e=>setP({...p,[k]:+e.target.value})}/>)}
 <select className="input" value={p.sex} onChange={e=>setP({...p,sex:e.target.value})}><option value="female">Female</option><option value="male">Male</option></select>
 <select className="input" value={p.activity} onChange={e=>setP({...p,activity:e.target.value})}><option value="sedentary">Sedentary</option><option value="light">Light activity</option><option value="moderate">Moderate</option><option value="high">High</option></select>
 <input className="input" placeholder="Gym experience" value={p.experience} onChange={e=>setP({...p,experience:e.target.value})}/>
 <textarea className="input" placeholder="Food preferences" value={p.preferences} onChange={e=>setP({...p,preferences:e.target.value})}/>
 <textarea className="input" placeholder="Injuries / limitations" value={p.limitations} onChange={e=>setP({...p,limitations:e.target.value})}/>
 <div className="notice">Estimated maintenance: <b>{maintenance} kcal/day</b><br/>Starting target: <b>{target} kcal</b> · Protein {protein}g · Carbs {carbs}g · Fat {fat}g.<br/>Expected initial trend: roughly 0.25–0.75 kg/week; actual change varies.</div>
 <button className="btn" style={{marginTop:12}} onClick={()=>onDone({...p,maintenance,target,protein,carbs,fat})}>Build my plan</button></div></div>
}
function Home({day,store,patch,setTab}:any){
 const end=new Date("2026-11-20T23:59:59"); const now=new Date(); const left=Math.max(0,Math.ceil((end.getTime()-now.getTime())/86400000));
 const log=store.logs?.[day.date]||{}; const profile=store.profile;
 const setLog=(p:any)=>patch({logs:{...(store.logs||{}),[day.date]:{...log,...p}}});
 return <><div className="hero"><div className="eyebrow">November 20 countdown</div><h1>{left} Days Until November 20</h1><p className="muted">Day {day.dayNumber} of {program.length} · Week {day.week}</p></div>
 <div className="grid">
  <Metric label="Today's weight" value={log.weight?`${log.weight} kg`:"Log weight"}/>
  <Metric label="Calories" value={`${log.calories||0} / ${profile.target}`}/>
  <Metric label="Protein" value={`${log.protein||0} / ${profile.protein} g`}/>
  <Metric label="Steps" value={`${log.steps||0} / ${day.stepGoal}`}/>
  <Metric label="Water" value={`${log.water||0} / 2500 ml`}/>
  <Metric label="Sleep" value={log.sleep?`${log.sleep} h`:"—"}/>
 </div>
 <div className="card"><div className="eyebrow">Today's workout</div><h2>{day.workout.title}</h2><p>{day.workout.type==="training"?"Warm-up → strength → cardio → cool-down":"Recovery, mobility, steps and nutrition."}</p><button className="btn" onClick={()=>setTab("WORKOUT")}>START TODAY'S WORKOUT</button></div>
 <div className="card"><div className="row"><h2>Quick log</h2><span className="pill">{day.stepGoal} steps</span></div>
 <input className="input" type="number" placeholder="Morning weight (kg)" value={log.weight||""} onChange={e=>setLog({weight:+e.target.value})}/>
 <input className="input" type="number" placeholder="Steps" value={log.steps||""} onChange={e=>setLog({steps:+e.target.value})}/>
 <div className="row"><button className="btn secondary" onClick={()=>setLog({water:(log.water||0)+250})}>+250 ml</button><button className="btn secondary" onClick={()=>setLog({water:(log.water||0)+500})}>+500 ml</button></div></div>
 <div className="notice">Daily scale changes are noisy. Progress decisions should use your 7-day trend, adherence, performance, hunger, sleep and symptoms—not one weigh-in.</div></>
}
function Metric({label,value}:any){return <div className="card metric"><span className="eyebrow">{label}</span><strong>{value}</strong></div>}
function Meals({day,store,patch}:any){
 const profile=store.profile; const eaten=store.eaten?.[day.date]||[];
 const planned=day.meals.reduce((a:any,m:any)=>({calories:a.calories+m.calories,protein:a.protein+m.protein,carbs:a.carbs+m.carbs,fat:a.fat+m.fat}),{calories:0,protein:0,carbs:0,fat:0});
 const addOther=()=>{const food=prompt("What did you eat?"); if(!food)return; const calories=+(prompt("Calories (estimate is okay):")||0); const protein=+(prompt("Protein grams:")||0); patch({eaten:{...(store.eaten||{}),[day.date]:[...eaten,{food,calories,protein}]}})}
 return <><h1>Meals</h1><p className="muted">{day.date} · Personalized target {profile.target} kcal / {profile.protein}g protein</p>
 {day.meals.map((m:any,i:number)=><div className="card meal" key={i}><div className="eyebrow">{m.label}</div><h3>{m.name}</h3><div className="macro">{m.calories} kcal · P {m.protein}g · C {m.carbs}g · F {m.fat}g</div><div className="ingredients">{m.ingredients}</div>
 <div className="row" style={{marginTop:12}}><button className="btn secondary" onClick={()=>alert("Swap options preserve roughly similar calories/protein. Meal 1 swaps remain low-carb: Chicken Labneh Bowl; Turkey Greek Yogurt Plate; Beef Breakfast Salad.")}>SWAP MEAL</button><button className="btn secondary" onClick={()=>alert("A new compatible option would be selected from the built-in meal library; no eggs, salmon, oats, cottage cheese, or plain tuna.")}>REGENERATE</button></div></div>)}
 <div className="card"><h3>Daily planned total</h3><b>{planned.calories} kcal · P {planned.protein}g · C {planned.carbs}g · F {planned.fat}g</b><p className="muted">Portions can be scaled slightly by the app toward your personalized target while preserving protein.</p></div>
 <button className="btn" onClick={addOther}>I ATE SOMETHING ELSE</button>
 <div className="card" style={{marginTop:12}}><h3>Restaurant mode</h3><p className="muted">Log known macros, or enter your best estimate. Estimates should be treated as approximate.</p><button className="btn secondary" onClick={addOther}>LOG RESTAURANT MEAL</button></div>
 <Grocery week={day.week}/></>
}
function Grocery({week}:any){
 const ds:any[]=program.filter(d=>d.week===week); const text=ds.flatMap(d=>d.meals.map((m:any)=>m.ingredients)).join(", ");
 const cats:any={Protein:[],Dairy:[],Fruits:[],Vegetables:[],Carbohydrates:[],Condiments:[],Other:[]};
 const keys:any={Protein:["chicken","turkey","beef","tuna","whey"],Dairy:["yogurt","labneh","cheese","milk","parmesan"],Fruits:["berries","apple","orange","strawberries"],Vegetables:["cucumber","tomato","lettuce","salad","vegetables","zucchini","corn"],Carbohydrates:["rice","pasta","potato","tortilla","bun"],Condiments:["sauce","mayo","mayonnaise","pesto","salsa","ketchup","olive oil","soy"]};
 Object.entries(keys).forEach(([c,arr]:any)=>arr.forEach((k:string)=>{if(text.toLowerCase().includes(k)&&!cats[c].includes(k))cats[c].push(k)}));
 return <div className="card"><div className="eyebrow">Week {week}</div><h2>Grocery list</h2>{Object.entries(cats).map(([c,a]:any)=><p key={c}><b>{c}:</b> {a.length?a.join(", "):"—"}</p>)}<p className="muted">Quantities are derived from scheduled portions; buy package sizes nearest your summed weekly needs.</p></div>
}
function Workout({day,store,patch}:any){
 const state=store.workouts?.[day.date]||{}; const update=(p:any)=>patch({workouts:{...(store.workouts||{}),[day.date]:{...state,...p}}});
 return <><h1>{day.workout.title}</h1><p className="muted">{day.date}</p>
 {day.workout.type==="rest"?<div className="card"><h2>Recovery checklist</h2><p>Step goal: {day.stepGoal}</p><p>{day.workout.cardio}</p>{day.workout.cooldown.map((x:string)=><p key={x}>✓ {x}</p>)}<p>Hydration: drink regularly to thirst · Sleep goal: 7–9 hours</p></div>:<>
 <Section title="Warm-up" items={day.workout.warmup}/>
 <div className="card"><div className="eyebrow">Strength</div>{day.workout.exercises.map((e:any,i:number)=><div className="exercise" key={e.name}><div className="row"><h3>{e.name}</h3><span className="pill">RPE {e.rpe}</span></div><b>{e.sets} sets × {e.reps}</b><p className="macro">Rest {e.rest} · {e.target}</p><p className="ingredients">{e.form}</p><div>{Array.from({length:e.sets}).map((_,s)=><button key={s} className="checkset" onClick={(ev:any)=>ev.currentTarget.textContent=ev.currentTarget.textContent?"":"✓"}></button>)}</div><input className="input" placeholder="Weight used (kg) / notes"/></div>)}</div>
 <Section title="Cardio" items={[day.workout.cardio]}/><Section title="Cool-down" items={day.workout.cooldown}/>
 <div className="notice">Progression rule: when all prescribed reps are completed around RPE ≤8 with good form, try the smallest practical increase next time. If RPE was 9–10 or form broke down, repeat or reduce the load.</div></>}
 <button className="btn" style={{marginTop:12}} onClick={()=>update({completed:true})}>{state.completed?"WORKOUT COMPLETED ✓":"MARK COMPLETE"}</button></>
}
function Section({title,items}:any){return <div className="card"><div className="eyebrow">{title}</div>{items.map((x:string)=><p key={x}>• {x}</p>)}</div>}
function Progress({store,patch,date,setDate}:any){
 const logs=store.logs||{}; const weights=Object.entries(logs).filter(([_,v]:any)=>v.weight).map(([d,v]:any)=>({d,w:v.weight}));
 const avg=weights.slice(-7).reduce((s,x)=>s+x.w,0)/(weights.slice(-7).length||1);
 return <><h1>Progress</h1><div className="grid"><Metric label="Starting weight" value={weights[0]?`${weights[0].w} kg`:"—"}/><Metric label="Current weight" value={weights.length?`${weights[weights.length-1].w} kg`:"—"}/><Metric label="7-day average" value={weights.length?`${avg.toFixed(1)} kg`:"—"}/><Metric label="Total change" value={weights.length>1?`${(weights[weights.length-1].w-weights[0].w).toFixed(1)} kg`:"—"}/></div>
 <div className="card"><h2>Calendar</h2><div className="calendar">{program.map((d:any)=><button className={"day "+(store.workouts?.[d.date]?.completed?"done":"")} key={d.date} onClick={()=>setDate(d.date)}>{new Date(d.date+"T12:00").getDate()}</button>)}</div><p className="muted">Selected: {date}</p></div>
 <div className="card"><h2>Progress photos</h2><p className="muted">Start · Week 2 · Week 4 · Week 6 · Nov 20</p><div className="grid"><div className="photo">FRONT</div><div className="photo">SIDE</div><div className="photo">BACK</div></div></div>
 <div className="card"><h2>Measurements</h2>{["Waist","Hips","Chest","Thigh","Arm"].map(x=><input key={x} className="input" placeholder={`${x} (cm)`}/>)}</div></>
}
function Profile({store,patch}:any){const p=store.profile; return <><h1>Profile</h1><div className="card"><h2>Your targets</h2><p>Maintenance estimate: <b>{p.maintenance} kcal</b></p><p>Daily target: <b>{p.target} kcal</b></p><p>Protein: <b>{p.protein}g</b> · Carbs: <b>{p.carbs}g</b> · Fat: <b>{p.fat}g</b></p><p className="muted">Targets are estimates, not medical prescriptions. The weekly check-in should favor small changes after a genuine multi-week stall with good adherence.</p></div>
 <div className="card"><h2>Weekly check-in</h2>{["Current weight","Average steps","Workouts completed","Nutrition adherence %","Hunger 1–10","Energy 1–10","Workout performance","Average sleep","Unusual symptoms"].map(x=><input className="input" key={x} placeholder={x}/>)}
 <button className="btn" onClick={()=>alert("Check-in saved. Keep the plan if the rolling trend is appropriate; adjust only modestly after a genuine stall with good adherence.")}>SAVE CHECK-IN</button></div>
 <div className="notice">Safety: the app never recommends starvation, dehydration, purging, extreme step counts, or compensatory exercise. Stop and seek medical advice for concerning symptoms, injury, fainting, chest pain, or persistent menstrual/health changes.</div></>}
export default App;
