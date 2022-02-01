// some global variables
const sub = document.querySelector('#sub');
const cal = document.querySelector('#cal');
const getStarted = document.querySelector('#get-started');
const mainJumbotron = document.querySelector('#main-jumbotron');
const landing = document.querySelector('#landing');
const details = document.querySelector('#details');
const tripNameSpan = document.querySelector('#trip-name');
const finalDiv = document.querySelector('#final-results');
const resultDiv = document.querySelector('#reults-div');
const paymentList = document.querySelector('#payments');
const share = document.querySelector('#share');
const install = document.querySelector('#install');
const alertOverlay = document.querySelector('.alert-overlay')
const alertBox = document.querySelector('.alert-box');
const alertContent = document.querySelector('#alert-content');
const alertBtn = document.querySelector('#alert-btn');
const homeBtn = document.querySelector('#home-btn')
let numMembers = 0,
    tripName = null,
    totalExp = 0,
    members = [],
    perPersonExp,
    doneCount = 0,
    bip = null;

// beforeInstall Prompt

window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    bip = event;
    install.style.display = 'block';
})
// event listners
sub.addEventListener('click', store);
cal.addEventListener('click', totalPerPerson);
getStarted.addEventListener('click', (() => {
    mainJumbotron.style.display = 'block';
    landing.style.display = 'none';
}));
share.addEventListener('click', event => {
    event.preventDefault();
    let list = '';
    let nodeList = paymentList.querySelectorAll('li');
    let arr = Array.from(nodeList);
    arr.map(item => {
        list += item.innerText + '\n'
    })

    navigator.share({
        title: "Bill Prism",
        text: list
    })

})
install.addEventListener('click', event => {
    event.preventDefault();
    if (bip) {
        bip.prompt();
    }
})
alertBtn.addEventListener('click', closeAlert);
homeBtn.addEventListener('click', event => {
    event.preventDefault();
    location.reload();
})


// store
function store(e) {
    e.preventDefault();
    numMembers = document.querySelector('#member').value;
    tripName = document.querySelector('#trip').value;
    if (numMembers === '' || tripName === '') {
        alertCall('Please fill the details first!');
    } else {
        mainJumbotron.style.display = "none";
        details.style.display = "block";
        createDiv();
    }
}

function createDiv() {
    for (let i = 1; i <= numMembers; i++) {
        const div = document.createElement('div');
        div.className = 'person-div';
        div.innerHTML = ` <form>                     
          <h2>Person ${i}</h2>
          <h3>total = <span id="total-${i}"></span></h3>
          <label for="name">Name: </label>
          <input type="text" name="name" id="name-${i}" placeholder="John Doe">
          <br>
          <br>
          <input type="text" name="what" id="what" placeholder="For What?">
          <input type="number" name="exp" id="exp" placeholder="How Much?" min="0" required>
          <br>
          <br>
          <input type="button" class="btn-tertiary" value="Add More" id="add" onclick="addMore(this)">
          <button type="button" class="btn-secondary" data-person = "${i}" onclick="saveCurrent(this)">Done</button>
          </form>
          <br>
          `
        const bill = document.querySelector('#bill');
        tripNameSpan.innerText = tripName + '!';
        bill.appendChild(div);

    }

}
// addmore

function addMore(e) {
    const div = document.createElement('div');
    div.innerHTML = `
    <input type="text" name="what" id="what" placeholder="For What?">
    <input type="number" name="exp" id="exp" placeholder="How Much?" min="0" required>
    <input type="button" value="x" onclick="deleteCurrent(this)" class="btn-tertiary delete-btn">
          <br>
          <br>
    `;
    e.parentNode.insertBefore(div, e);
}

//deleteCurrent
function deleteCurrent(e) {
    e.parentNode.remove();
}

// saveCurrent
function saveCurrent(e) {
    let person = e.getAttribute("data-person");
    // total span element
    const totalSpan = document.querySelector(`#total-${person}`);
    const name = document.querySelector(`#name-${person}`).value;
    let total = 0;

    if (name === '') {
        alertCall('Name field can\'t be empty.')
    } else {

        // fetching all input elements of current div
        let nodes = e.parentNode.querySelectorAll(`input`);
        // making array form node list
        let nodesArr = Array.from(nodes);
        // filtering array with the input that has an id of exp
        let expArr = nodesArr.filter(item => {
            if (item.id === 'exp') {
                return true;
            };
        })
//        console.log(expArr);

        let expValue = expArr.map(item => {
            return parseFloat(item.value);
        })

        if (expValue.includes(NaN)) {
            alertCall("Expanse field can\'t be empty!");

        } else {
            total = expValue.reduce((x, y) => x + y, 0)
            totalSpan.innerText = total;
//            console.log(total);
            disableItems(nodes);
            e.disabled = true;

            // creating new object and pushing it to array

            let obj = new Object;
            obj = {
                person,
                name,
                total
            }
            members.push(obj);
        }
//        console.log(members);
        doneCount++;
//        console.log(doneCount)
    }
}

// disabling items
function disableItems(nodes) {
    Array.prototype.map.call(nodes, function (item) {
        item.disabled = true;
    })
}

// getting total and divide
function totalPerPerson(e) {
    e.preventDefault();
    if (doneCount < numMembers) {
        alertCall("Please click the Done button before you proceed!")
    } else {
        sum = 0;
        members.map(item => {
            sum += item.total
        })
        console.log(sum);
        const numMembersInt = parseInt(numMembers);
        perPersonExp = (sum / numMembersInt).toFixed(2);
//        console.log(perPersonExp);
        distribute();
    }
}

function distribute() {
    let pay = 0,
        receive = 0;

    // adding pay and receive property to the members
    members.map(item => {
        if (item.total < perPersonExp) {
            let give = perPersonExp - item.total
            item.pay = give;
            pay += give;
        } else if (item.total > perPersonExp) {
            let get = item.total - perPersonExp;
            item.receive = get;
            receive += get;
        }
    })

    // making to different arrays from members
    let receivers = members.filter(item => item.hasOwnProperty('receive'));
    let payers = members.filter(item => item.hasOwnProperty('pay'));

//    console.log("pay :", pay, "receive ", receive)

    // compare and distribute
    if (pay == 0 || receive == 0) {
        addResultItem();
    } else {
        while (pay !== 0 && receive !== 0) {
//            console.log("while running")
            if (receivers.length === 0 && payers.length === 0) {
                break;
            } else if (receivers[0].receive == payers[0].pay) {

                console.log(`${payers[0].name} has to give ${payers[0].pay} to ${receivers[0].name}`);
                // appending child
                addResultItem(payers[0].name, payers[0].pay, receivers[0].name);

                pay -= payers[0].pay;
                receive -= receivers[0].receive;
                payers.shift();
                receivers.shift();
            } else if (receivers[0].receive < payers[0].pay) {

                console.log(`${payers[0].name} has to give ${receivers[0].receive} to ${receivers[0].name}`);
                // appending child
                addResultItem(payers[0].name, receivers[0].receive, receivers[0].name);

                pay -= receivers[0].receive;
                receive -= receivers[0].receive;
                payers[0].pay -= receivers[0].receive;
                receivers.shift();
            } else if (receivers[0].receive > payers[0].pay) {

                console.log(`${payers[0].name} has to give ${payers[0].pay} to ${receivers[0].name}`);
                // appending child
                addResultItem(payers[0].name, payers[0].pay, receivers[0].name);

                pay -= payers[0].pay;
                receive -= payers[0].pay;
                receivers[0].receive -= payers[0].pay;
                payers.shift();
            }
        }
    }
    details.style.display = 'none';
    finalDiv.style.display = 'block';

}

// making final result list
function addResultItem(payer = 'No One', money = 'Anything', receiver = 'Anybody') {
    const li = document.createElement('li');
    li.textContent = `${payer} has to give ₹${money} to ${receiver}.`
    paymentList.appendChild(li);
//    console.log('list item to be appended', li);
}

// making alert 
function alertCall(content) {

    let scrollVal = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    let height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
    alertBox.style.top = scrollVal + 30 + 'px';
    alertOverlay.style.display = 'block';
    alertBox.style.display = 'block';
//    console.log(height);
    alertOverlay.style.height = height + 'px';
    alertContent.innerText = content;

}

// closeAlert{
function closeAlert() {
    alertBox.style.display = 'none';
    alertOverlay.style.display = 'none';
}



