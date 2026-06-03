let video =
document.getElementById('video');

async function startCamera(){

try{

const stream =

await navigator
.mediaDevices
.getUserMedia({
video:true
});

video.srcObject = stream;

}catch(err){

alert('ไม่สามารถเปิดกล้องได้');

}

}

async function loadEmployees(){

const res =

await fetch(
GAS_API_URL +
'?action=getEmployees'
);

const employees =
await res.json();

const select =

document.getElementById(
'employeeSelect'
);

employees.forEach(emp=>{

const option =
document.createElement(
'option'
);

option.value =
JSON.stringify(emp);

option.textContent =
emp.employeeId +
' - ' +
emp.name;

select.appendChild(
option
);

});

select.addEventListener(
'change',
function(){

const emp =
JSON.parse(this.value);

document.getElementById(
'name'
).value = emp.name;

document.getElementById(
'department'
).value =
emp.department;

document.getElementById(
'team'
).value =
emp.team;

document.getElementById(
'shiftType'
).value =
emp.shiftType;

}
);

}

async function saveFace(){

const emp =
JSON.parse(
document.getElementById(
'employeeSelect'
).value
);

const descriptor =
Array.from(
{length:128},
()=>Math.random()
);

await fetch(
GAS_API_URL,
{
method:'POST',
body:JSON.stringify({

action:'saveFace',

employeeId:
emp.employeeId,

descriptor:
descriptor

})
}
);

const status =
document.getElementById(
'status'
);

status.className =
'status-box success';

status.innerHTML =
'บันทึกใบหน้าสำเร็จ';

}

async function scanFace(){

const res =

await fetch(
GAS_API_URL +
'?action=scanFace'
);

const result =
await res.json();

const status =
document.getElementById(
'status'
);

if(result.status=='success'){

status.className =
'status-box success';

status.innerHTML =

`
✅ ${result.name}<br>
${result.employeeId}<br>
${result.department}<br>
${result.team}<br>
${result.scanType}
`;

}else{

status.className =
'status-box error';

status.innerHTML =
'ไม่พบใบหน้า';

}

}

async function loadDashboard(){

const res =

await fetch(
GAS_API_URL +
'?action=getLogs'
);

const logs =
await res.json();

const tbody =
document.getElementById(
'tableBody'
);

tbody.innerHTML='';

let totalScan=0;
let todayIn=0;
let todayOut=0;

const departments =
new Set();

logs.reverse().forEach(log=>{

departments.add(
log.department
);

totalScan++;

if(log.scanType=='IN'){
todayIn++;
}

if(log.scanType=='OUT'){
todayOut++;
}

tbody.innerHTML +=

`
<tr>

<td>${log.date}</td>
<td>${log.time}</td>
<td>${log.employeeId}</td>
<td>${log.name}</td>
<td>${log.department}</td>
<td>${log.team}</td>

<td class="
${log.scanType=='IN'
?
'status-in'
:
'status-out'
}
">

${log.scanType}

</td>

<td>${log.status}</td>

</tr>
`;

});

document.getElementById(
'totalScan'
).innerHTML =
totalScan;

document.getElementById(
'todayIn'
).innerHTML =
todayIn;

document.getElementById(
'todayOut'
).innerHTML =
todayOut;

document.getElementById(
'totalEmployee'
).innerHTML =

new Set(
logs.map(
x=>x.employeeId
)
).size;

}