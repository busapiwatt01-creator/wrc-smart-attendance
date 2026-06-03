let video =
document.getElementById(
'video'
);

let faceMatcher;

async function startCamera(){

try{

const stream =

await navigator
.mediaDevices
.getUserMedia({

video:true

});

video.srcObject =
stream;

await loadModels();

}catch(err){

alert(
'ไม่สามารถเปิดกล้องได้'
);

}

}

async function loadModels(){

await faceapi.nets.tinyFaceDetector
.loadFromUri(
'https://justadudewhohacks.github.io/face-api.js/models'
);

await faceapi.nets.faceLandmark68Net
.loadFromUri(
'https://justadudewhohacks.github.io/face-api.js/models'
);

await faceapi.nets.faceRecognitionNet
.loadFromUri(
'https://justadudewhohacks.github.io/face-api.js/models'
);

}

/* CLOCK */

const clock =
document.getElementById(
'clock'
);

if(clock){

setInterval(()=>{

clock.innerHTML =

new Date()
.toLocaleString(
'th-TH'
);

},1000);

}

/* LOAD EMPLOYEE */

async function loadEmployees(){

const select =

document.getElementById(
'employeeSelect'
);

const res =

await fetch(
GAS_API_URL +
'?action=getUsers'
);

const data =
await res.json();

data.forEach(emp=>{

const option =
document.createElement(
'option'
);

option.value =
emp.employeeId;

option.textContent =

emp.employeeId +
' - ' +
emp.name;

option.dataset.name =
emp.name;

option.dataset.department =
emp.department;

option.dataset.team =
emp.team;

option.dataset.shiftType =
emp.shiftType;

select.appendChild(
option
);

});

select.addEventListener(
'change',
function(){

const op =

this.options[
this.selectedIndex
];

document.getElementById(
'name'
).value =
op.dataset.name || '';

document.getElementById(
'department'
).value =
op.dataset.department || '';

document.getElementById(
'team'
).value =
op.dataset.team || '';

document.getElementById(
'shiftType'
).value =
op.dataset.shiftType || '';

});

}

/* SAVE FACE */

async function saveFace(){

const employeeId =

document.getElementById(
'employeeSelect'
).value;

if(!employeeId){

alert(
'เลือกพนักงาน'
);

return;

}

const detection =

await faceapi

.detectSingleFace(
video,
new faceapi.TinyFaceDetectorOptions()
)

.withFaceLandmarks()

.withFaceDescriptor();

if(!detection){

alert(
'ไม่พบใบหน้า'
);

return;

}

const descriptor =

Array.from(
detection.descriptor
);

await fetch(
GAS_API_URL,
{

method:'POST',

body:JSON.stringify({

action:'register',

employeeId:

employeeId,

descriptor:

descriptor

})

}

);

document.getElementById(
'status'
).innerHTML =

'✅ Save Success';

}

/* SCAN FACE */

async function scanFace(){

const detection =

await faceapi

.detectSingleFace(
video,
new faceapi.TinyFaceDetectorOptions()
)

.withFaceLandmarks()

.withFaceDescriptor();

if(!detection){

alert(
'ไม่พบใบหน้า'
);

return;

}

const descriptor =

Array.from(
detection.descriptor
);

const res =

await fetch(
GAS_API_URL,
{

method:'POST',

body:JSON.stringify({

action:'scan',

descriptor:

descriptor

})

}

);

const data =
await res.json();

if(data.status == 'success'){

document.getElementById(
'result'
).innerHTML =

`
<h2>
✅ Welcome
</h2>

<p>
${data.name}
</p>

<p>
${data.employeeId}
</p>

<p>
${data.department}
</p>

<p>
${data.team}
</p>

<p>
${data.scanType}
</p>
`;

}else{

document.getElementById(
'result'
).innerHTML =

'❌ Face Not Match';

}

}

/* DASHBOARD */

async function loadDashboard(){

const res =

await fetch(
GAS_API_URL +
'?action=getLogs'
);

const data =
await res.json();

const table =

document.getElementById(
'tableBody'
);

table.innerHTML = '';

data.reverse();

data.forEach(log=>{

table.innerHTML +=

`
<tr>

<td>
${log.date}
</td>

<td>
${log.time}
</td>

<td>
${log.employeeId}
</td>

<td>
${log.name}
</td>

<td>
${log.department}
</td>

<td>
${log.team}
</td>

<td>
${log.status}
</td>

</tr>
`;

});

}