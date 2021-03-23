'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2021-03-10T14:11:59.604Z',
    '2021-03-18T17:01:17.194Z',
    '2021-03-22T23:36:17.929Z',
    '2021-03-23T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};


const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');


const formatCur = function (value, locale, currency){
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value)
}

const displayMovements = function(acc, sort = false) {
  //limpar o HTML primeiro
  containerMovements.innerHTML = ''

  const movs = sort ? acc.movements.slice().sort((a,b) => a - b) : acc.movements

  const formatMovementDate = function(date, locale){
    const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 *24))

    const daysPassed = calcDaysPassed(new Date(), date)
    if(daysPassed === 0) return 'Today'
    if(daysPassed === 1) return 'Yesterday'
    if(daysPassed <= 7) return `${daysPassed} days ago`
    else{
      return new Intl.DateTimeFormat(locale).format(date)
    }   
  }

  //carregar os dados no html
  movs.forEach(function(mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal'
    const date = new Date (acc.movementsDates[i])

    const displayDate = formatMovementDate(date, acc.locale)

    const formattedMov = formatCur(mov, acc.locale, acc.currency)

    const html =`
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>`
    containerMovements.insertAdjacentHTML('afterbegin', html)
  })
}


// CALCULANDO O VALOR TOTAL(COM O METODO REDUCE) DO BALANCE E APRESENTANDO NO DISPLAY
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov,0)
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency)
}



// CALCULANDO O DIPLAY DO SUMMARY
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
  .filter(mov => mov > 0)
  .reduce((acc, mov) => acc + mov, 0)
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency)

  const out = acc.movements.filter(mov => mov < 0)
  .reduce((acc, mov) => acc + mov, 0)
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency)

  const interest = acc.movements.filter(mov => mov > 0)
  .map(deposit =>( deposit * acc.interestRate) / 100)
  .filter(int => int >= 1)
  .reduce((acc, int) => acc + int, 0)
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency)
}



// CRIANDO UMA FUNCAO APRA CRIAR O USERNAME COM AS PRIMEIRAS LETRAS DO NOME E ADICIONANDO AO OBJETO EX: username = rbm
const createUsernames = function (accs){
  accs.forEach(function (acc) {
    acc.username = acc.owner
    .toLowerCase()
    .split(' ')
    .map(name => name[0])
    .join('')
  })
}
createUsernames(accounts)


//atualizando o display
const updateUi = function (acc){
  //DISPLAY MOVEMENTS
  displayMovements(acc)

  //DISPLAY BALANCE
  calcDisplayBalance(acc)

  //DISPLAY SUMARY
  calcDisplaySummary(acc)
}


//EVENT HANDLER
let currentAccount, timer


const startLogOutTimer = function (){
    const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0)
    const sec = time % 60
    // IN EACH CALL, PRINT THE REMAINING TIME TO UI
    labelTimer.textContent = `${min}:${sec}`
    //WHEN 0 SECONDS, STOP TIMER AND LOG OUT USER
    if(time === 0){
      clearInterval(timer)
      labelWelcome.textContent = `Log in to get Started`
      
      containerApp.style.opacity = 0
    }
    // DECREASE 1S
    time--
  }

  // SET TIME TO 5 MIN
  let time = 120

  // CALL THE TIMER EVERY SECOND
  tick()
  const timer = setInterval(tick, 1000)

  return timer
}


btnLogin.addEventListener('click', function (e){
  //PREVITE QUE O BOTAO DO LOGIN ATUALIZE A PAGINA
  e.preventDefault()
  
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value)

  if(currentAccount?.pin === +(inputLoginPin.value)){
    //DISPLAY UI AND WELCOME MESSAGE
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`

    containerApp.style.opacity = 100
    //CLEAR INPUT FIELDS
    inputLoginUsername.value = inputLoginPin.value = ''
    inputLoginPin.blur()

    //create current date and time
    const now = new Date()
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    }

  //TIMER
  if(timer) clearInterval(timer)
  timer =  startLogOutTimer()

  labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now)
  updateUi(currentAccount)

  // RESET TIMER
  clearInterval(timer)
  timer = startLogOutTimer()
  }
})

btnTransfer.addEventListener('click', function(e) {
  e.preventDefault()
  const amount = +(inputTransferAmount.value)
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value)

  inputTransferAmount.value = inputTransferTo.value = ''
  
  if(amount > 0 &&
    receiverAcc && 
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username){
    //FAZENDO A TRANSFERENCIA
      currentAccount.movements.push(-amount)
      receiverAcc.movements.push(amount)
      
    //ADD TRNASFER DATE
    currentAccount.movementsDates.push(new Date().toISOString())
    receiverAcc.movementsDates.push(new Date().toISOString())

    updateUi(currentAccount)

    clearInterval(timer)
    timer = startLogOutTimer()
    }
})

btnLoan.addEventListener('click', function (e){
  e.preventDefault()

  const amount = Math.floor(+(inputLoanAmount.value))
  // CHECANDO SE  O VALOR PEDIDO NO LOAN E MAIOR QUE 10% DE ALGUM VALOR JA DEPOSITA 
  if(amount > 0 && currentAccount.movements.some(mov => mov >= amount / 10)){

    setTimeout(function(){currentAccount.movements.push(amount)
    
    //ADD LOAN DATE
    currentAccount.movementsDates.push(new Date().toISOString())

    //UPDATEUI
    updateUi(currentAccount)

    clearInterval(timer)
    timer = startLogOutTimer()
  },2500)

  }
})


btnClose.addEventListener('click', function(e){
  e.preventDefault()
  
  if(inputCloseUsername.value === currentAccount.username && +(inputClosePin.value) === currentAccount.pin){
    const index = accounts.findIndex(acc => acc.username === currentAccount.username)
    
    //DELETE ACCOUNT
    accounts.splice(index, 1)
    
    //HIDE UI
    containerApp.style.opacity = 0
  }

  inputCloseUsername.value = inputClosePin.value = ''
})

//INFORMATION FOR THE BANK WITH ALL MOVEMENTS
const accountMovements = accounts.map(acc => acc.movements)
const allMovements = accountMovements.flat()
const overalBalance = allMovements.reduce((acc, mov) => acc + mov,0)

const overalBalance2 = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov,0)

const overalBalance3 = accounts.flatMap(acc => acc.movements).reduce((acc, mov) => acc + mov,0)

let sorted = false
btnSort.addEventListener('click', function(e){
  e.preventDefault()
  displayMovements(currentAccount, !sorted)
  sorted = !sorted
})
