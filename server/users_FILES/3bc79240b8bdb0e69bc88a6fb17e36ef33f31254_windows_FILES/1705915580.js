let urlHolder;
let debugMode = true;
let gameSound = true;
let staticContentUrl = (
  $('#StaticContentUrl').length ? $('#StaticContentUrl').val() : ''
);
if (staticContentUrl.indexOf('?')) {
  staticContentUrl = staticContentUrl.split('?');
  staticContentUrl = staticContentUrl[0];
}
let userCurrencyCode = 'GEL';
let userFractionDigit = 2;
let fixedIndex = 2;
let runJackpot = true;
let mobile = $('#game').hasClass('mobile');
let ios = bowser.ios;
let clickEvent = 'click'; //ios ? 'touchstart' : 'click';
let giftClickEvent = 'click'; //mobile ? 'touchstart' : 'click';
let mobileDesktop = false;
let vertical = false;
let rowHeight = getRowHeight();
let rowCount = getRowCount();
let noSleep;
let noSleepLoaded = false;
let wakeLockEnabled = false;
function mobileNoSleep() {
  if (!noSleepLoaded) {
    noSleep = new NoSleep();
    noSleepLoaded = true;
  }
  noSleep.enable();
  wakeLockEnabled = true;
}
let sessionStorageAllow = false;
try {
  let buttons = sessionStorage.getItem('buttons');
  sessionStorageAllow = true;
} catch (e) {
}
let localStorageAllow = false;
try {
  let buttons = localStorage.getItem('buttons');
  localStorageAllow = true;
} catch (e) {
}
function currencyFormat(currency, format = false) {
  return format &&
    currency === 'IRR' ? '' : currency;
}
function numberFormat(number, currency, format = false, cashOut = false) {
  number = parseFloat(number);
  number *= Math.pow(10, player.currency.fractionDigit);
  //number = Math.floor(number);
  if (cashOut) {
    number = parseInt(number);
  }
  number = Math.round(number);
  number /= Math.pow(10, player.currency.fractionDigit);
  number = number.toFixed(player.currency.fractionDigit);
  if (format && currency === 'IRR') { //player.currency.currencyCode
    number = number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  }
  return number
}
function vibrate() {
  //navigator.vibrate(300);
}
document.oncontextmenu = document.body.oncontextmenu = function () {
  return false;
};
function InitializeUrls(baseUrl, connrollerName, externalUrl) {
  urlHolder = {
    Chat:
    {
      MessagesUrl: baseUrl + '/api/' + connrollerName + '/GetChatMessages',
      SendMessageUrl: baseUrl + '/api/' + connrollerName + '/PutChatMessage'
    },
    Actions:
    {
      Bet: baseUrl + '/api/' + connrollerName + '/Bet',
      FastBet: baseUrl + '/api/' + connrollerName + '/FastBet',
      PostCustomEventUrl: baseUrl + '/api/' + connrollerName + '/CustomEvent',
      PlayerHistoryUrl: baseUrl + '/api/' + connrollerName + '/GetPlayerHistory',
      GetBoard: baseUrl + '/api/' + connrollerName + '/Board',
      Ping: baseUrl + '/api/' + connrollerName + '/Ping',
      Cashout: baseUrl + '/api/' + connrollerName + '/Cashout',
      Player: baseUrl + '/api/' + connrollerName + '/Player'
    },
    Board:
    {
      Url: baseUrl + '/api/' + connrollerName + '/Board'
    },
    External:
    {
      Url: externalUrl
    },
    History:
    {
      Url: baseUrl + '/api/' + connrollerName + '/History'
    }
  };
}
let globalParams = JSON.parse(document.getElementById('GlobalParameters').value);
function GetCaption(captionKey) {
  if (
    captionKey !== undefined &&
    captionKey !== null &&
    captionKey.constructor === Array
  ) {
    let captionArray = [];
    for (let i = 0; i < captionKey.length; i++) captionArray[i] = GetCaption(captionKey[i]);
    return captionArray;
  } else {
    let caption = formatGlobalParameters(locale[captionKey], globalParams);
    return caption !== undefined ? caption : captionKey;
  }
}
function formatGlobalParameters(captionValue, globalParamaters) {
  if (captionValue) {
    const regex = /\{([^\}]+)\}/g;
    return captionValue.replace(
      regex,
      function ($0) {
        let val = globalParamaters[$0.substring(1, $0.length - 1)];
        if (val === undefined) val = $0;
        return val;
      }
    );
  }
  return captionValue
}// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments;
    return this.replace(
      /{(\d+)}/g,
      function (match, number) {
        if (args[0] !== undefined && args[0].constructor === Array) {
          return typeof args[0][number] !== 'undefined'
            ? args[0][number]
            : match;
        } else {
          return typeof args[number] !== 'undefined'
            ? args[number]
            : match;
        }
      }
    );
  };
}
function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
  var results = null;
  try {
    results = regex.exec(location.search);
  } catch (e) {
  }
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
function getParentParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = null;
  try {
    results = regex.exec(parent.location.search);
  } catch (e) {
  }
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
if (
  getParentParameterByName('chat') === 'no' ||
  getParameterByName('chat') === 'no'
) {
  $('body').addClass('chat-no');
}
if (getParentParameterByName('historyUrl') !== '') {
  $('body').addClass('show-history-button');
  $('#redirect-to-history').attr('href', getParentParameterByName('historyUrl')).attr('target', '_blank');
} else if (getParameterByName('historyUrl') !== '') {
  $('body').addClass('show-history-button');
  $('#redirect-to-history').attr('href', getParameterByName('historyUrl')).attr('target', '_blank');
}
let cashierUrl = '';
if (getParentParameterByName('cashierUrl') !== '') {
  cashierUrl = getParentParameterByName('cashierUrl');
} else if (getParameterByName('cashierUrl') !== '') {
  cashierUrl = getParameterByName('cashierUrl');
}
if (cashierUrl !== '') {
  $('#BtnShowBalance').attr('href', cashierUrl).css('pointer-events', 'auto');
  if (cashierUrl.indexOf('javascript:') === - 1) {
    $('#BtnShowBalance').attr('target', '_blank');
  }
}
function consoleLog(logMessage) {
  if (debugMode) console.log(logMessage);
}
function popup_close() {
  return false;
}
function leaveGame() {
  gameEvent.quit();
  if (urlHolder.External.Url.indexOf('javascript:') >= 0) {
    eval(decodeURI(decodeHtml(urlHolder.External.Url)));
  } else if (mobileDesktop) {
    location.href = urlHolder.External.Url;
  } else {
    top.location.href = decodeHtml(urlHolder.External.Url);
  }
}
function decodeHtml(str) {
  str = str.replaceAll('&quot;', '\'');
  str = str.replaceAll('&amp;', '&');
  return str;
}
function loadJackpotsImages() {
  return false;
  $('.jackpot').css('visibility', 'visible');
  for (var i = 9; i < 46; i++) {
    let url = `${staticContentUrl}../Images/Jackpot/Jackpot-Coins/JackpointCoins-000${i}.png`
    let img = `<img src="${url}">`
    $('#jacpotImage').append(img);
  }
}
function DrawJackpot(JackpotThrowAmount, JackpotThrowAmountPerPlayer) {
  runJackpot = false;
  let throwAmount = JackpotThrowAmount.toFixed(player.currency.fractionDigit);
  let throwAmountPerPlayer = JackpotThrowAmountPerPlayer.toFixed(player.currency.fractionDigit);
  drawJacpotAnimation(throwAmountPerPlayer);
}// New Jackpot Animation Code Start
// function drawJacpotAnimation(data) {
//     let time = 4500;
//     let repeatCount = 3;
//     for(let i = 0; i < repeatCount; i++) {
//         setTimeout(() => {
//             repeatAnimation(data);
//         }, i * time);
//     }
// }
function drawJacpotAnimation(data) {
  PlaySound(92, 'JackpotCoins');
  wonNumbers(data);
  let $img = document.getElementById('jackpots-image');
  let countFrom = 9;
  let repeatCoinAnimationCointer = 0;
  const lastImageCount = 46;
  const repeatCoinAnimation = 2;
  function drawAnimation() {
    $img.style.visibility = 'visible';
    if (lastImageCount > countFrom) {
      $('#jackpot-new').css('z-index', '1');
      $img.src = `${staticContentUrl}../Images/Jackpot/Jackpot-Coins/JackpointCoins-000${countFrom}.png`;
      countFrom++;
    } else {
      countFrom = 9
      $img.style.visibility = 'hidden';
      repeatCoinAnimationCointer++
      if (repeatCoinAnimationCointer === repeatCoinAnimation) {
        myStopFunction();
      }
    }
  }
  let clearJackpotAnimation = setInterval(function () {
    drawAnimation();
  }, 50)
  function myStopFunction() {
    clearInterval(clearJackpotAnimation);
  }
  if (mobile && window.innerWidth < window.innerHeight) {
    let scale = window.innerWidth / 590;
    let fromLeft = (window.innerWidth - 434) / 2;
    $('.jackpot-clone').css({
      'transform': `scale(${scale})`,
      'left': fromLeft + 'px'
    })
  }
  setTimeout(
    function () {
      $('.jackpot-clone').addClass('jackpot-animation');
    },
    500
  )
  setTimeout(function () {
    animationJackpotNumbers()
  }, 800)
  setTimeout(
    function () {
      $('.jackpot-clone').addClass('jackpot-animation1');
      setTimeout(
        () => {
          $('.jackpot-clone').removeClass('jackpot-animation jackpot-animation1');
          $('#jackpot-new').css('z-index', '-15');
        },
        100
      )
      $('.jackpot-dot').remove();
    },
    4200
  )
}
function animationJackpotNumbers() {
  let arrOfList = $('.list-elements');
  for (let i = 0; i < arrOfList.length; i++) {
    setTimeout(
      () => {
        arrOfList[i].classList.add('list-gradient');
        $('.list-gradient').next().css({
          'transform': 'scale(1.4)',
          'color': '#fff',
          'transition': '.2s'
        });
        if (i !== 0) {
          arrOfList[i - 1].classList.remove('list-gradient');
          $('.list-gradient').prev().css({
            'transform': 'scale(1)',
            'color': '#fde053',
            'transition': '.2s'
          });
        }
        if (i === 6) {
          setTimeout(
            function () {
              arrOfList[i].classList.remove('list-gradient');
              $('.list-gradient').last().css({
                'transform': 'scale(1)',
                'color': '#fde053',
                'transition': '.2s'
              });
            },
            100
          )
        }
        $('.list-gradient').last().css({
          'transform': 'scale(1)',
          'color': '#fde053',
          'transition': '.2s'
        });
      },
      75 * i
    )
  }
}
function wonNumbers(number) {
  let numberToString = number.toString();
  if (numberToString.includes('.')) {
    let toDigit = numberToString.substring(0, numberToString.indexOf('.'));
    let fromDigit = numberToString.substring(numberToString.indexOf('.') + 1, numberToString.length);
    if (fromDigit.split('').length < 2) {
      fromDigit = fromDigit + '0';
    }
    drawNumberToPopup(toDigit.split(''), fromDigit.split(''));
  } else {
    drawNumberToPopup(numberToString, []);
  }
}
function drawNumberToPopup(beforeDot, afterDot) {
  const afterDotMaxLength = player.currency.fractionDigit;
  const maxNumberOfJackpot = 7;
  const beforeDotMaxLength = maxNumberOfJackpot - player.currency.fractionDigit;
  const digitIndex = maxNumberOfJackpot - player.currency.fractionDigit;
  if (afterDot.length > 0) {
    let beforeDotElement = $('.list-element-1')[digitIndex];
    $('<div class="jackpot-dot"></div>').insertBefore(beforeDotElement);
  }
  if (beforeDot.length > beforeDotMaxLength) return;
  let $elems = $('.list-jackpot');
  for (let i = 0; i < $elems.length; i++) {
    $elems[i].innerText = '0';
  }
  let indexToStart = beforeDotMaxLength - beforeDot.length;
  let indexFromStart = $elems.length - afterDotMaxLength;
  for (let i = 0; i < maxNumberOfJackpot; i++) {
    if (i < beforeDotMaxLength && beforeDot[i] !== undefined) {
      let el = $elems[indexToStart];
      el.innerText = beforeDot[i];
    }
    if (i < afterDotMaxLength) {
      let el = $elems[indexFromStart];
      el.innerText = afterDot[i];
    }
    indexToStart++;
    indexFromStart++;
  }
}// New Jackpot Animation Code End
function setBalance(availableAmount) {
  $('.game-balance-bt').html(
    numberFormat(availableAmount, player.currency.currencyCode, true) + '<span class="currency">' + currencyFormat(player.currency.currencyCode) + '</span>'
  );
}
function helpHtml() {
  let helpHtml = GetCaption('jetx.board.rules.content.new');
  $('body').append(
    `<div id="helpHtml" style="position: absolute; left: -100000px; top: -100000px;">${helpHtml}</div>`
  );
  $('#helpHtml .rules-content').each(
    function () {
      let html = $(this).html();
      html = html.replaceAll('<br>', '</div><div>');
      html = html.replaceAll('<br >', '</div><div>');
      html = html.replaceAll('<br />', '</div><div>');
      html = html.replaceAll('<br/>', '</div><div>');
      html = `<div>${html}</div>`;
      $(this).html(html);
    }
  );
  helpHtml = $('#helpHtml').html();
  $('#helpHtml').remove();
  $('.help-popup-content.rules').html(helpHtml);
}
helpHtml();
// Board Post START
function GetBoard(token, load = false) {
  let eventUrl = urlHolder.Actions.GetBoard + '/' + token;
  $.get(
    eventUrl,
    null,
    function (data) {
      loadData(data, load);
      if (load) {
        boardLoaded = true;
        if (hubLoaded) hubGetList();
      }
    }
  ).fail(
    function (jqXHR, textStatus, errorThrown) {
      OnRequestFail(jqXHR, textStatus, errorThrown);
    }
  );
}
function PlayerInfo(token, isAutoCashout = false) {
  let eventUrl = urlHolder.Actions.Player + '/' + token;
  $.get(
    eventUrl,
    null,
    function (data) {
      loadPlayerData(data);
      if (updateBalanceRepost) {
        updateBalanceRepost = false;
        PostCustomEvent(token, 'update.balance');
      }
    }
  ).fail(
    function (jqXHR, textStatus, errorThrown) {
      OnRequestFail(jqXHR, textStatus, errorThrown, position);
    }
  );
}
function Cashout(token, position) {
  let eventUrl = urlHolder.Actions.Cashout + '/' + token;
  let bet = {
    Position: position
  };
  $.post(
    eventUrl,
    bet,
    function (data) {
      if (
        data.FirstCashout != null &&
        data.Bets.every(x => x.CashoutStep > 0) ||
        data.Bets[0].BetAmount > 0 &&
        data.Bets[1].BetAmount == 0 ||
        data.Bets[1].BetAmount > 0 &&
        data.Bets[0].BetAmount == 0
      ) {
        //pauseSounds();
      }
      loadPlayerData(data);
      gameEvent.betAction();
    }
  ).fail(
    function (jqXHR, textStatus, errorThrown) {
      OnRequestFail(jqXHR, textStatus, errorThrown, position);
    }
  );
}
function CustomEvent(eventCode, position) {
  this.EventCode = eventCode;
  this.SelectedPieces = position;
}
let updateBalanceRepost = false;
function PostCustomEvent(token, eventCode, position = 0) {
  let eventUrl = urlHolder.Actions.PostCustomEventUrl + '/' + token;
  let code = new CustomEvent(eventCode, position);
  $.post(
    eventUrl,
    code,
    function (data) {
      if (eventCode === 'jetx.gifts.start') {
        loadPlayerData(data);
      }
      if (eventCode === 'update.balance') {
        canvasResize();
        try {
          player.availableAmount = data.AvailableAmount;
          player.currency.fractionDigit = data.Currency.FractionDigit;
          player.currency.currencyCode = data.Currency.CurrencyCode;
          player.displayName = data.DisplayName;
          playerSetInfo();
        } catch (e) {
        }
      } else if (
        eventCode === 'return.balance' ||
        eventCode === 'jetx.gifts.remind.later' ||
        eventCode === 'jetx.gifts.cancel' ||
        eventCode === 'jetx.gifts.start' ||
        eventCode === 'jetx.gifts.zero.win'
      ) {
      } else if (eventCode === 'jetx.toggle.bet.place') {
      } else if (eventCode === 'jetx.no.info.on.start') {
      } else if (eventCode === 'jetx.undo.bet') {
        loadPlayerData(data);
        gameEvent.betAction();
        //if(!mobile) buttonMessage(position, GetCaption("jetx.board.bet.cancel"), 1500, 'error');
      } else {
        leaveGame();
      }
    }
  ).fail(
    function (jqXHR, textStatus, errorThrown) {
      OnRequestFail(jqXHR, textStatus, errorThrown, null);
    }
  );
}
function BetType(amount, autocashout, position) {
  this.Amount = amount;
  this.Autocashout = autocashout;
  this.Position = position;
}
let autoBetTrigger = [
  true,
  true
];
function PlaceBet(token, betAmount, autocashout, position) {
  autoBetTrigger[position] = true;
  let betType = new BetType(betAmount, autocashout, position);
  let eventUrl = urlHolder.Actions.Bet + '/' + token;
  $.post(
    eventUrl,
    betType,
    function (data) {
      loadPlayerData(data);
      gameEvent.betAction();
      setLastBet(position);
      // let betted = true;
      // if(position < 4) {
      //     betted = player.bets[position].ActiveButton === 'cancel-bet';
      // }
      //
      // if(!mobile) {
      //     if(betted) {
      //         buttonMessage(position, GetCaption("jetx.board.place.bet"), 1500, 'success');
      //     } else {
      //         buttonMessage(position, GetCaption("jetx.board.bet.cancel"), 1500, 'error');
      //     }
      // }
    }
  ).fail(
    function (jqXHR, textStatus, errorThrown) {
      OnRequestFail(jqXHR, textStatus, errorThrown, position);
    }
  );
}
let lastFail401 = 0;
let ExceptionMessage = '';
function OnRequestFail(jqXHR, textStatus, errorThrown, button) {
  if (jqXHR.responseJSON !== undefined && jqXHR.responseJSON !== null) {
    ExceptionMessage = jqXHR.responseJSON.ExceptionMessage !== undefined ? jqXHR.responseJSON.ExceptionMessage : jqXHR.responseJSON.Message;
    let errorObj = {
      Message: jqXHR.responseJSON.Message,
      Status: jqXHR.status
    };
    gameEvent.errorMessage(errorObj);
  }
  if (jqXHR.status === 0 || jqXHR.status === 500) {
    if (jqXHR.status === 500) {
      //LogTimerError(LastEventId, 'status.code.error');
    }
    popup_close();
    ShowInternetLost();
    return false;
  } else if (jqXHR.status === 400) {
    // let position = $(this).attr('data-placement');
    if (ExceptionMessage === 'error.jetx.not.enough.money') {
      buttonMessage(button, GetCaption('jetx.board.amount.error'), 1500, 'error');
      //for (let i = 0; i < 2; i++) {
      $(`#auto-bet-${button}`).prop('checked', false);
      $(`#auto-cash-out-${button}`).prop('checked', false);
      //}
    } else if (ExceptionMessage == 'error.invalid.jetx.bet') {
      let input = $('#bet-value-' + button);
      if (input.val() < input.data('minbet')) {
        buttonMessage(
          button,
          GetCaption('jetx.board.bet.min') + ' ' + board.minBet + ' <span class="currency">' + currencyFormat(player.currency.currencyCode) + '</span>',
          1500,
          'error'
        );
      } else {
        buttonMessage(
          button,
          GetCaption('jetx.board.bet.max') + ' ' + board.maxBet + ' <span class="currency">' + currencyFormat(player.currency.currencyCode) + '</span>',
          1500,
          'error'
        );
      }
    } else if (ExceptionMessage === 'error.nextbet.already.placed') {
      //buttonMessage(button, GetCaption("jetx.board.next.bet"), 1500, 'error');
    } else if (ExceptionMessage === 'error.jetx.no.more.bet') {
      //buttonMessage(button, GetCaption("jetx.board.next.bet.cancel"), 1500, 'error');
    } else if (ExceptionMessage === 'error.JetX.no.more.bet') {
      //buttonMessage(button, GetCaption("jetx.board.next.bet.cancel"), 1500, 'error');
    } else if (ExceptionMessage === 'error.auto.cash.out.min') {
      buttonMessage(
        button,
        GetCaption('jetx.error.auto.cash.out.min') + ' ' + board.minAutoCashOut,
        1500,
        'error'
      );
    } else if (ExceptionMessage === 'error.auto.cash.out.max') {
      buttonMessage(
        button,
        GetCaption('jetx.error.auto.cash.out.max') + ' ' + board.maxAutoCashOut,
        1500,
        'error'
      );
    } else if (ExceptionMessage === 'error.bet.already.placed') {
      //buttonMessage(button, GetCaption("jetx.error.bet.already.placed"), 1500, 'error');
    } else if (ExceptionMessage === 'error.JetX.already.cashed.out') {
      buttonMessage(
        button,
        GetCaption('jetx.error.already.cashed.out'),
        1500,
        'error'
      );
    } else {
      buttonMessage(button, GetCaption('jetx.board.bet.error'), 1500, 'error');
    }
    return false;
  } else if (jqXHR.status === 401) {
    lastFail401++;
    if (lastFail401 > 5) {
      leaveGame();
    } else {
      //CallBoardTimer();
    }
    return false;
  } else if (jqXHR.status === 410) {
    $('#connection-lost-poup').css('visibility', 'hidden');
    responseText = JSON.parse(jqXHR.responseText);
    var Message = GetCaption(responseText.Message);
    var MessageParameter = GetCaption(responseText.MessageParameter);
    var html = '';
    html += Message.format(MessageParameter);
    html += '<br><br><a class="popup-bt" onclick="leaveGame();">' + GetCaption('jetx.board.exit') + '</a>';
    $('.popup-content').html(html);
    //$('.popup-head').html('');
    $('.popup').fadeIn(100);
    return false;
  } else {
    ShowInternetLost();
    return false;
  }
}
function buttonMessage(button, message, delay, status) {
  if (mobile) {
    if (status === 'cashout') {
      let el = $('#bet-' + button + ' .win');
      el.find('.win-value').html(message.winAmount);
      el.removeAttr('style');
      el.css('display', 'block');
      el.animate({
        top: - 40,
        opacity: 1
      }, 500);
      el.delay(1000).fadeOut(100);
    } else {
      let id = `message-` + (new Date()).getTime();
      let messageText = message;
      if (status === 'cashout') {
        messageText = `
                    <div class="cashout-left">
                        <div class="cashout-left1">
        ${GetCaption('jetx.board.win')}:</div>
                        <div class="cashout-left2">
        ${message.winAmount}</div>
                    </div>
                    <div class="cashout-right">
                        
        ${GetCaption('jetx.board.cashouted')}: <span>${message.cashout}x</span>
                    </div>                
                
        `;
      }
      let html = `
            <div id="
      ${id}" class="message ${status}" style="display: none;">
                <div class="close">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.66388 7.00036L13.6554 2.00909C14.1149 1.54963 14.1149 0.804714 13.6554 0.345327C13.1959 -0.114126 12.451 -0.114126 11.9916 0.345327L6.99998 5.33667L2.0084 0.345261C1.54892 -0.114192 0.804032 -0.114192 0.344557 0.345261C-0.114852 0.804714 -0.114852 1.54963 0.344557 2.00902L5.33614 7.0003L0.344557 11.9916C-0.114852 12.4511 -0.114852 13.196 0.344557 13.6554C0.804032 14.1149 1.54892 14.1149 2.0084 13.6554L6.99998 8.66406L11.9916 13.6554C12.451 14.1149 13.1959 14.1149 13.6554 13.6554C14.1149 13.1959 14.1149 12.4511 13.6554 11.9916L8.66388 7.00036Z" fill="white"/>
                    </svg>
                </div>
                <div class="icon">
                    <svg class="success-icon" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 0C5.60708 0 0 5.60708 0 12.5C0 19.3929 5.60708 25 12.5 25C19.3929 25 25 19.3919 25 12.5C25 5.60806 19.3929 0 12.5 0ZM12.5 23.0635C6.67603 23.0635 1.93647 18.325 1.93647 12.5C1.93647 6.67505 6.67603 1.93647 12.5 1.93647C18.325 1.93647 23.0635 6.67505 23.0635 12.5C23.0635 18.325 18.324 23.0635 12.5 23.0635Z" fill="#36CE2B"/>
                    <path d="M18.2349 8.15259C17.8408 7.79434 17.228 7.82242 16.8678 8.21841L10.9615 14.7221L8.10807 11.8213C7.73141 11.4398 7.1195 11.434 6.73898 11.8097C6.35748 12.1844 6.35167 12.7973 6.72736 13.1788L10.2992 16.8097C10.4822 16.9956 10.73 17.0992 10.9895 17.0992C10.9953 17.0992 11.0021 17.0992 11.0079 17.1002C11.2752 17.0943 11.5269 16.9801 11.706 16.7826L18.3007 9.52076C18.66 9.12374 18.6309 8.51182 18.2349 8.15259Z" fill="#36CE2B"/>
                    </svg>
    
                    <svg class="error-icon" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0)">
                    <path d="M12.4997 17.1329C11.8008 17.1329 11.2149 17.7188 11.2149 18.4177C11.2149 19.1166 11.8008 19.7025 12.4997 19.7025C13.1729 19.7025 13.7845 19.1166 13.7536 18.4486C13.7845 17.7137 13.2038 17.1329 12.4997 17.1329Z" fill="#F13D3D"/>
                    <path d="M24.3917 21.6862C25.1985 20.2935 25.2036 18.6336 24.4019 17.246L16.354 3.30864C15.5575 1.90566 14.1185 1.07312 12.5048 1.07312C10.8911 1.07312 9.45218 1.9108 8.65562 3.30351L0.597449 17.2563C-0.204256 18.6592 -0.199117 20.3295 0.612867 21.7222C1.41457 23.0995 2.84839 23.9269 4.4518 23.9269H20.527C22.1356 23.9269 23.5797 23.0892 24.3917 21.6862ZM22.6443 20.6789C22.1972 21.4498 21.4058 21.9072 20.5219 21.9072H4.44666C3.57301 21.9072 2.78672 21.4601 2.34989 20.7046C1.90793 19.9389 1.90279 19.0241 2.34476 18.2533L10.4029 4.30564C10.8397 3.53991 11.6209 3.08766 12.5048 3.08766C13.3836 3.08766 14.1699 3.54505 14.6067 4.31078L22.6598 18.2584C23.0915 19.0087 23.0863 19.9132 22.6443 20.6789Z" fill="#F13D3D"/>
                    <path d="M12.1811 8.11376C11.5695 8.28849 11.1892 8.84351 11.1892 9.51674C11.2201 9.92273 11.2458 10.3339 11.2766 10.7399C11.364 12.2867 11.4513 13.8028 11.5387 15.3497C11.5695 15.8739 11.9755 16.2541 12.4997 16.2541C13.0239 16.2541 13.435 15.8482 13.4607 15.3188C13.4607 15.0002 13.4607 14.7073 13.4916 14.3835C13.5481 13.3916 13.6098 12.3998 13.6663 11.4079C13.6971 10.7655 13.7537 10.1232 13.7845 9.48077C13.7845 9.2495 13.7537 9.04394 13.6663 8.83837C13.4042 8.26279 12.7926 7.96986 12.1811 8.11376Z" fill="#F13D3D"/>
                    </g>
                    <defs>
                    <clipPath id="clip0">
                    <rect width="25" height="25" fill="white"/>
                    </clipPath>
                    </defs>
                    </svg>
                </div>
                <div class="text">
      ${messageText}</div>
            </div>
            
      `;
      $('.message-div').append(html);
      $(`#${id}`).fadeIn(100);
      promoPrizeIcon();
      setTimeout(
        function () {
          $(`#${id}`).fadeOut(100).delay(100).remove();
          if (!$('.message-div .message').is(':visible')) {
            promoPrizeIcon(true);
          }
        },
        delay
      );
    }
  } else {
    if (status === 'cashout') {
      let el = $('#bet-' + button + ' .win');
      el.find('.win-value').html(message.winAmount);
      el.removeAttr('style');
      el.css('display', 'block');
      el.animate({
        top: - 47,
        opacity: 1
      }, 500);
      el.delay(1000).fadeOut(100);
    } else {
      let el = $('#bet-' + button + ' .info');
      el.find('.' + status + '-info').html(message);
      el.removeClass('error success').addClass(status).stop().fadeIn(100).delay(delay).fadeOut(100);
    }
  }
}
let internetPopupShow = 0;
function ShowInternetLost() {
  internetPopupShow++;
  if (internetPopupShow > 2) {
    jetX.showInternetLost();
  }
}
function HideInternetLost() {
  jetX.hideInternetLost();
}// Board Post END
// Load Data START
let history = {
  last20BigWins: [],
  last24ClientSpins: [],
  last100Spins: [],
  topDailyBigWins: [],
  topWeeklyBigWins: [],
  topMonthlyBigWins: [],
  topDailyHugeWins: [],
  topWeeklyHugeWins: [],
  topMonthlyHugeWins: [],
  topDailyCoeffs: [],
  topWeeklyCoeffs: [],
  topMonthlyCoeffs: [],
};
let player = {
  key: '',
  counterId: '',
  isObserver: false,
  availableAmount: 0,
  bets: [],
  win: 0,
  totalBet: 0,
  activeBet: 0,
  currency: {
    currencyCode: '',
    fractionDigit: 2
  },
  displayName: 'Pkhako',
  disableCashGame: false,
  gift: {
    amount: 0,
    count: 0,
    totalCreditWin: 0,
    totalWin: 0,
    startAmount: 0,
    started: false,
  },
  isDisabled: false,
  jackpot: {
    throwAmount: null,
    throwAmountPerPlayer: null,
    type: null,
  },
  portalName: '',
};
let board = {
  boardVersion: 0,
  coefficient: 0,
  autoBetOn: true,
  twoBetOn: true,
  showRtp: false,
  minAutoCashOut: 1.01,
  maxAutoCashOut: 1000,
  isBoardDisabled: false,
  isFinnished: false,
  isGameStarted: false,
  minBet: 0,
  maxBet: 0,
  maxWinAmount: 0,
  maxCashoutCoeff: 100000000,
  minMultiplier: 0,
  onlinePlayers: 0,
  progressPercent: 0,
  progressTime: 0,
  showFullNames: false,
  spinNumber: 0,
  isPortalFilterOn: false,
  showGameInfoOnStart: false,
  exchangeRate: 1,
  convertToPlayerCurrency: false,
  stopUrl: '',
};
function loadData(data, load = false) {
  /*
    SocketInfo:
        Degree: 1.27
        GraphicValue: 1.2264
        IsFinnished: true
        Step: 2.85
        Value: 1.22
    */
  board.boardVersion = data.BoardVersion;
  board.coefficient = data.Coefficient;
  board.autoBetOn = data.AutoBetOn;
  board.twoBetOn = data.TwoBetOn;
  board.showRtp = data.ShowRtp;
  board.minAutoCashOut = data.AutoCashOutMinValue;
  board.maxAutoCashOut = data.AutoCashOutMaxValue;
  board.isBoardDisabled = data.IsBoardDisabled;
  board.isFinnished = data.IsFinnished;
  board.isGameStarted = data.IsGameStarted;
  board.minBet = data.MinBetAmount;
  board.maxBet = data.MaxBetAmount;
  board.maxWinAmount = data.MaxWinAmount ||
    board.maxCashoutCoeff;
  board.maxCashoutCoeff = data.MaxCashoutCoeff ||
    board.maxCashoutCoeff;
  board.minMultiplier = data.MinMultiplier;
  board.onlinePlayers = data.OnlinePlayers;
  board.progressPercent = data.ProgressPercent;
  board.progressTime = data.ProgressTime;
  board.showFullNames = data.ShowFullNames;
  board.spinNumber = data.SpinNumber;
  board.isPortalFilterOn = data.IsPortalFilterOn;
  board.showGameInfoOnStart = data.ShowGameInfoOnStart;
  board.exchangeRate = data.ExchangeRate;
  board.convertToPlayerCurrency = data.ConvertToPlayerCurrency;
  player.key = data.PlayerKey;
  player.isObserver = data.IsObserver;
  loadPlayerData(data.PlayerInfo, load);
  gameStatus();
  history.last20BigWins = (data.Last20BigWins || []).reverse();
  history.last24ClientSpins = (data.Last24ClientSpins || []).reverse();
  history.last100Spins = (data.Last100Spins || []).reverse();
  history.topDailyBigWins = (data.TopDailyBigWins || []).reverse();
  history.topWeeklyBigWins = (data.TopWeeklyBigWins || []).reverse();
  history.topMonthlyBigWins = (data.TopMonthlyBigWins || []).reverse();
  history.topDailyHugeWins = (data.TopDailyHugeWins || []).reverse();
  history.topWeeklyHugeWins = (data.TopWeeklyHugeWins || []).reverse();
  history.topMonthlyHugeWins = (data.TopMonthlyHugeWins || []).reverse();
  history.topDailyCoeffs = (data.TopDailyCoeffs || []).reverse();
  history.topWeeklyCoeffs = (data.TopWeeklyCoeffs || []).reverse();
  history.topMonthlyCoeffs = (data.TopMonthlyCoeffs || []).reverse();
  last24ClientSpins();
  last20BigWins();
  last100Spins();
  statistics();
  jetX.setMaxMultiplier();
  if (load) {
    if (!board.autoBetOn) {
      $('.bet-input.bets .auto .checkbox').addClass('disabled');
      $('.bet-input.bets .auto .checkbox input').prop('disabled', true);
    }
    if (!board.twoBetOn) {
      $('.cash-game').addClass('one-bet');
    }
    if (board.showRtp) {
      $('.rtp').css('display', 'block');
    }
    let amount = numberFormat(board.maxBet, player.currency.currencyCode, false);
    let amountCurrency = player.currency.currencyCode;
    let coef = '10.00 x';
    let betList = [
      '1',
      '2',
      '3',
      GetCaption('jetx.board.all')
    ];
    $('.bet-list a').each(
      function (index) {
        if (index < 3) {
          betList[index] = numberFormat($(this).data('bet'), player.currency.currencyCode, true);
        }
      }
    );
    let helpButton = `
            <div class="help-bet">
    ${GetCaption('jetx.board.bet')}</div>
            <div class="help-bet-auto">
    ${GetCaption('jetx.board.aut')}</div>
            <div class="help-cash-out">
    ${GetCaption('jetx.board.cashout')}</div>
            <div class="help-cash-out-auto">
    ${GetCaption('jetx.board.aut')}</div>
            <div class="help-amount">
    ${amount} ${amountCurrency}</div>
            <div class="help-coef">
    ${coef}</div>
            <div class="help-bet-list-0">
    ${betList[0]} ${amountCurrency}</div>
            <div class="help-bet-list-1">
    ${betList[1]} ${amountCurrency}</div>
            <div class="help-bet-list-2">
    ${betList[2]} ${amountCurrency}</div>
            <div class="help-bet-list-3">
    ${betList[3]}</div>
        
    `;
    let help1 = `
            
    ${helpButton}
            <div class="help-place-bet-button">
    ${GetCaption('jetx.board.placebet')}</div>
        
    `;
    let help2 = `
            <div class="help-cash-out-coef">
    ${board.maxCashoutCoeff}</div>
        
    `;
    let help3 = `
            
    ${helpButton}
            <div class="help-cash-out-button">
                <div class="text1">
    ${board.maxWinAmount} ${amountCurrency}</div>
                <div class="text2">
    ${GetCaption('jetx.board.cashout.action')}</div>
            </div>
        
    `;
    $('.play-item.play-img1').html(help1);
    $('.play-item.play-img2').html(help2);
    $('.play-item.play-img3').html(help3);
    if (board.showGameInfoOnStart) {
      $('#info-on-start').fadeIn(100);
      $('body').addClass('overflow');
      promoPrizeIcon();
    }
    gameEvent.gameDataLoaded();
  }
}
let availableAmountOld = 0;
function loadPlayerData(data, load = false) {
  player.availableAmount = data.AvailableAmount;
  if (!load) {
    if (availableAmountOld !== data.AvailableAmount) {
      gameEvent.balance();
    }
  }
  availableAmountOld = data.AvailableAmount;
  player.bets = data.Bets;
  player.counterId = data.CounterId;
  if (data.Currency === undefined || data.Currency === null) {
    player.currency.fractionDigit = 2;
    player.currency.currencyCode = 'GEL';
  } else {
    player.currency.fractionDigit = data.Currency.FractionDigit;
    player.currency.currencyCode = data.Currency.CurrencyCode;
  }
  player.displayName = data.DisplayName;
  if (data.DisableCashGame !== undefined) player.disableCashGame = data.DisableCashGame;
  player.gift.amount = data.GiftSpinAmount;
  player.gift.count = data.GiftSpinCount;
  player.gift.totalCreditWin = data.GiftSpinTotalCreditWin;
  player.gift.totalWin = data.GiftSpinTotalWin;
  player.gift.startAmount = data.GiftSpinsStartAmount;
  player.gift.started = data.GiftsStarted;
  player.isDisabled = data.IsDisabled;
  player.jackpot.throwAmount = data.JackpotThrowAmount;
  player.jackpot.throwAmountPerPlayer = data.JackpotThrowAmountPerPlayer;
  player.jackpot.type = data.JacktopType;
  player.portalName = data.PortalName;
  if (player.disableCashGame) {
    $('.buttons .tabs a:eq(0)').addClass('disabled');
    for (let i = 0; i < 2; i++) {
      if ($('#auto-bet-' + i).is(':checked')) {
        $('#auto-bet-' + i).prop('checked', false)
      }
    }
  } else {
    $('.buttons .tabs a:eq(0)').removeClass('disabled');
  }
  for (
    let buttonIndex = 0;
    buttonIndex < player.bets.length;
    buttonIndex++
  ) {
    if ($('#bet-' + buttonIndex).hasClass('cancel-bet')) {
      gameEvent.updateBet();
    }
  }
  if (load) {
    for (let i = 0; i < 2; i++) {
      let v = $(`#bet-value-${i}`).val();
      v = numberFormat(parseFloat(v), player.currency.currencyCode, false);
      $(`#bet-value-${i}`).val(v);
      $(`#bet-value-${i}`).trigger('change');
      $(`#bet-value-${i}`).trigger('focusout');
      $(`#bet-value-${i}`).attr('onKeyDown', '').addClass(player.currency.currencyCode.toLocaleLowerCase());
    }
    $('.bet-list a').each(
      function () {
        if ($(this).data('bet') != '0') {
          $(this).html(
            numberFormat($(this).data('bet'), player.currency.currencyCode, true)
          );
        }
      }
    );
    $('.input span.currency').html(currencyFormat(player.currency.currencyCode, true));
    $('.bet-list a span.currency').html(currencyFormat(player.currency.currencyCode, true));
  }
  if (
    player.jackpot.throwAmount !== undefined &&
    player.jackpot.throwAmount !== null &&
    player.jackpot.throwAmountPerPlayer !== undefined &&
    player.jackpot.throwAmountPerPlayer !== null
  ) {
    DrawJackpot(
      player.jackpot.throwAmount,
      player.jackpot.throwAmountPerPlayer
    );
  }
  if (player.gift.started) {
    setGiftInfo();
  }
  if (player.gift.startAmount > 0 && player.gift.started) {
    showGiftTab(load && !player.disableCashGame);
  } else if (!player.gift.started) {
    hideGiftTab();
  }
  if (load) {
    if (
      player.gift.startAmount > 0 &&
      ((!player.gift.started && player.gift.totalWin === 0) || load)
    ) {
      if (!player.gift.started && player.gift.totalWin === 0) giftLoaded = false;
      showGiftPopup('new');
    }
  }
  if (!player.gift.started && player.gift.totalWin > 0) {
    showGiftPopup('win');
  }
  if (player.gift.count === 0) {
    $('#bet-2').addClass('disabled');
    $('#bet-3').addClass('disabled');
  } else {
    $('#bet-2').removeClass('disabled');
    $('#bet-3').removeClass('disabled');
  }
  playerButtons(load);
  playerSetInfo();
}
let buttonStatus = {
  'placement': 'place-bet',
  'cancel-bet': 'cancel-bet',
  'cashout': 'cash-out',
  'disable': 'disable',
};
function playerButtons(load = false) {
  let activeBet = 0;
  let totalBet = 0;
  let win = 0;
  let buttons = [
    false,
    false,
    false
  ];
  if (player.bets !== undefined && player.bets !== null) {
    for (let i = 0; i < player.bets.length; i++) {
      let button = $(`#bet-${i}`);
      let buttonDiv = $(`#button-${i}`);
      let autoCashOutCheckbox = $(`#auto-cash-out-${i}`);
      let autoCashOutInput = $(`#cash-out-value-${i}`);
      let bet = player.bets[i];
      let activeButton = bet.ActiveButton; //"placement" //cancel-bet //cashout
      let betAmount = bet.BetAmount;
      let cashoutStep = bet.CashoutStep;
      let isActive = bet.IsActive;
      let nextBetAmount = bet.NextBetAmount;
      let wonAmount = bet.WonAmount;
      let autoCashout = activeButton === 'cancel-bet' ? bet.NextAutoCashout : bet.AutoCashout;
      let autoCashoutValue = activeButton === 'cancel-bet' ? bet.NextAutoCashoutValue : bet.AutoCashoutValue;
      totalBet += betAmount;
      win += wonAmount;
      if (
        activeButton !== 'placement' &&
        activeButton !== 'cancel-bet' &&
        activeButton !== 'cashout' &&
        activeButton !== 'disable'
      ) {
        console.log('activeButton', activeButton);
      } else {
        let status = buttonStatus[activeButton];
        button.removeClass('place-bet cancel-bet cash-out disable').addClass(status);
        buttons[i] = status !== 'place-bet';
        buttons[i] = true;
        buttonDiv.removeClass('place-bet cancel-bet cash-out disable').addClass(status);
        buttonDiv.removeClass('disabled');
        if (
          status === 'cancel-bet' ||
          status === 'cash-out' ||
          status === 'disable'
        ) {
          buttonDiv.addClass('disabled');
          autoCashOutCheckbox.prop('checked', autoCashout);
          if (autoCashout) {
            if (
              parseFloat(autoCashOutInput.val()) !== parseFloat(autoCashoutValue)
            ) {
              autoCashOutInput.val(autoCashoutValue.toFixed(2));
              setInputValue(`cash-out-value-${i}`);
            }
          }
        }
      }
      if (activeButton === 'cancel-bet' || activeButton === 'cashout') {
        activeBet += betAmount > 0 ? betAmount : nextBetAmount;
      }
    }
  }
  player.activeBet = activeBet;
  player.totalBet = totalBet; // * board.exchangeRate;
  player.win = win; // * board.exchangeRate;
  if (load && mobile) {
    if (buttons[0] && buttons[1]) {
      $('.buttons-col').css('display', 'block');
      $('.bet-add').addClass('active');
      $('#game').addClass('two-buttons');
      if (sessionStorageAllow) sessionStorage.setItem('buttons', 'all');
    } else if (buttons[1]) {
      $('.bet-add').removeClass('active');
      $('.buttons-col').css('display', 'block');
      $('#button-0').css('display', 'none');
      $('#auto-bet-0').prop('checked', false);
      $('#auto-cash-out-0').prop('checked', false);
      $('#game').removeClass('two-buttons');
      if (sessionStorageAllow) sessionStorage.setItem('buttons', '0');
    } else if (buttons[0]) {
      $('.bet-add').removeClass('active');
      $('.buttons-col').css('display', 'block');
      $('#button-1').css('display', 'none');
      $('#auto-bet-1').prop('checked', false);
      $('#auto-cash-out-1').prop('checked', false);
      $('#game').removeClass('two-buttons');
      if (sessionStorageAllow) sessionStorage.setItem('buttons', '1');
    }
    footerPosition();
  }
}
function playerSetInfo() {
  $('#displayName').html(player.displayName);
  $('#availableAmount').html(formatAmount(player.availableAmount, player.currency));
  $('body').addClass(`currency-${player.currency.currencyCode}`);
}
function formatAmount(amount, currency) {
  amount = parseFloat(amount);
  return numberFormat(amount, currency.currencyCode, true) + '<span class="currency">' + currencyFormat(currency.currencyCode) + '</span>';
}
function gameStatus() {
  if (board.isFinnished) {
    $('#game').removeClass('game-started');
  } else {
    $('#game').addClass('game-started');
  }
}
let elements = {
  last100Spins: document.getElementById('last100Spins'),
  last24ClientSpins: document.getElementById('last24ClientSpins'),
  last20BigWins: document.getElementById('last20BigWins'),
  playersCurrent: document.getElementById('playersCurrent'),
  playersActive: document.getElementById('playersActive'),
  playersCashOut: document.getElementById('playersCashOut'),
  headerLast100Spins: mobile ? document.getElementsByClassName('history-list')[0] : null,
  infoContentStats: document.getElementById('infoContentStats'),
  infoContentStatsHead: document.getElementById('infoContentStatsHead'),
  infoContentStatsList: document.getElementById('infoContentStatsList'),
};
function addCurrentSpin() {
  $(`.history-list .history-item.current`).remove();
  $(`#last100Spins .row.current`).remove();
  if (currentSpinInfo.SpinHash !== '') {
    if (mobile) {
      $('.history-list').prepend(
        `<div id="${currentSpinInfo.SpinHash}" data-info='${JSON.stringify(currentSpinInfo)}' class="history-item current"><span class="history-logo"></span></div>`
      );
    } else {
      $('#last100Spins').prepend(
        `<div id="${currentSpinInfo.SpinHash}" data-info='${JSON.stringify(currentSpinInfo)}' class="row current"><span class="history-logo"></span></div>`
      );
    }
  }
}
function removeCurrentSpin() {
  $(`.history-list .history-item.current`).remove();
  $(`#last100Spins .row.current`).remove();
  currentSpinInfo = {
    SpinTime: '',
    Coefficient: 0,
    SpinHash: '',
    Info: '',
  };
}
function setCurrentSpin(value) {
  let coefficient = value.toFixed(2);
  $('.history-list .history-item.current').html(coefficient).css('min-width', `${41 + 6 * (coefficient.length - 4)}px`);
  $('#last100Spins .row.current').html(coefficient);
}
function last100Spins() {
  //let t = (new Date()).getTime();
  elements.last100Spins.innerHTML = '';
  if (mobile) elements.headerLast100Spins.innerHTML = '';
  let html = '';
  let headerHtml = '';
  for (let i = 0; i < history.last100Spins.length; i++) {
    let spin = history.last100Spins[i];
    let status = (spin.Coefficient >= 1.5 ? 'win' : 'lose');
    let coefficient = parseFloat(spin.Coefficient).toFixed(2);
    if (mobile) {
      html += `<div id="h-${spin.SpinHash}" data-info='${JSON.stringify(spin)}' class="item ${status}">${coefficient}</div>`;
      if (i < 25) {
        headerHtml += `<div id="${spin.SpinHash}" data-info='${JSON.stringify(spin)}' class="history-item ${status}" style="min-width: ${41 + 6 * (coefficient.length - 4)}px">${coefficient}</div>`;
      }
    } else {
      html += `<div id="${spin.SpinHash}" data-info='${JSON.stringify(spin)}' class="row ${status}">${coefficient}</div>`;
    }
  }
  elements.last100Spins.innerHTML = html;
  if (mobile) elements.headerLast100Spins.innerHTML = headerHtml;
  //t -= (new Date()).getTime(); console.log('last100Spins', t);
  if (last100SpinsInfoHash !== '') {
    $(`#${last100SpinsInfoHash}`).trigger(clickEvent);
  }
  addCurrentSpin();
}
let last100SpinsInfoHash = '';
let last100SpinsInfoMobileHistory = false;
function last100SpinsInfo(spin) {
  if (spin.SpinHash === '' || spin.SpinHash === 'loading') return false;
  let mh = last100SpinsInfoMobileHistory;
  last100SpinsInfoClose(false);
  let date = '';
  let time = '';
  if (!isNaN(new Date(spin.SpinTime))) {
    let dateTime = new Date(spin.SpinTime);
    date = `${String(dateTime.getDate()).padStart(2, '0')}.${String(dateTime.getMonth() + 1).padStart(2, '0')}.${dateTime.getFullYear()}`;
    time = `${String(dateTime.getHours()).padStart(2, '0')}:${String(dateTime.getMinutes() + 1).padStart(2, '0')}:${String(dateTime.getSeconds() + 1).padStart(2, '0')}`;
  } else {
    date = spin.SpinTime;
  }
  last100SpinsInfoHash = spin.SpinHash;
  last100SpinsInfoMobileHistory = mh;
  let coefficient = spin.Coefficient;
  if (parseFloat(coefficient) > 0) {
    coefficient = parseFloat(spin.Coefficient).toFixed(2);
  }
  let popupHtml = `
            <div class="hash-popup">
                <div class="hash-popup-content">
                    <div class="head">
                        <div class="date">
  ${date} <span>${time}</span></div>
                        <span class="close">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16px" height="15px">
                                <path fill-rule="evenodd" fill="rgb(108, 118, 141)" d="M9.808,7.490 L15.714,1.589 C16.081,1.223 16.081,0.629 15.714,0.262 C15.347,-0.104 14.753,-0.104 14.386,0.262 L8.480,6.163 L2.574,0.262 C2.207,-0.104 1.613,-0.104 1.245,0.262 C0.879,0.629 0.879,1.223 1.245,1.589 L7.152,7.490 L1.245,13.391 C0.879,13.758 0.879,14.352 1.245,14.718 C1.429,14.902 1.669,14.993 1.910,14.993 C2.150,14.993 2.390,14.902 2.574,14.718 L8.480,8.817 L14.386,14.718 C14.570,14.902 14.810,14.993 15.050,14.993 C15.290,14.993 15.531,14.902 15.714,14.718 C16.081,14.352 16.081,13.758 15.714,13.391 L9.808,7.490 Z"/>
                            </svg>
                        </span>
                    </div>
                    <div class="content">
                        <div class="coefficient">
                            <span class="prev"></span>
                            <div class="value 
  ${spin.Coefficient > 0 ? (spin.Coefficient >= 1.5 ? 'win' : 'lose') : ''}">${coefficient}</div>
                            <span class="next"></span>
                        </div>
                        <div class="hash">
                            <div class="label">
  ${GetCaption('jetx.board.hash')}</div>
                            <div class="hash-value value">
  ${spin.SpinHash}</div>
                            <div class="hash-copy copy"></div>
                        </div>
                        <div class="hash">
                            <div class="label">
  ${GetCaption('jetx.board.result')}</div>
                            <div class="result-value value">
  ${spin.Info}</div>
                            <div class="result-copy copy"></div>
                        </div>
                    </div>
                </div>
            </div>
        
  `;
  $('#main').append(popupHtml);
  $('body').addClass('overflow');
  if (mobile) promoPrizeIcon();
}
function last100SpinsInfoClose(hidePromo = true) {
  $('.hash-popup').remove();
  $('body').removeClass('overflow');
  last100SpinsInfoHash = '';
  last100SpinsInfoMobileHistory = false;
  if (mobile && hidePromo) promoPrizeIcon(true);
}
function fallbackCopyTextToClipboard(text) {
  let textArea = document.createElement('textarea');
  textArea.value = text;
  // Ensure the textarea element is not visible.
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = 0;
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    let successful = document.execCommand('copy');
  } catch (err) {
  }
  document.body.removeChild(textArea);
}
function last24ClientSpins() {
  //let t = (new Date()).getTime();
  elements.last24ClientSpins.innerHTML = '';
  let html = '';
  for (let i = 0; i < history.last24ClientSpins.length; i++) {
    let spin = history.last24ClientSpins[i];
    let currency = spin.Currency;
    let currencyCode = currency.CurrencyCode;
    let fractionDigit = currency.FractionDigit;
    let betAmount = spin.BetAmount;
    let wonAmount = spin.WonAmount;
    let spinTimeParsed = spin.SpinTimeParsed;
    let cashoutCoefficient = spin.CashoutCoefficient;
    let coefficient = spin.Coefficient;
    let status = (wonAmount > 0 ? ' win' : '');
    spinTimeParsed = spinTimeParsed.split(':');
    spinTimeParsed = `${spinTimeParsed[0]}:${spinTimeParsed[1]}`;
    betAmount = formatAmount(betAmount, {
      currencyCode,
      fractionDigit
    });
    cashoutCoefficient = cashoutCoefficient === 0 ? '--' : cashoutCoefficient;
    wonAmount = formatAmount(wonAmount, {
      currencyCode,
      fractionDigit
    });
    html += `
            <div class="row
    ${status}">
                <div class="col1"><div>
    ${spinTimeParsed}</div></div>
                <div class="col3">
    ${coefficient}</div>
                <div class="col2">
    ${betAmount}</div>
                <div class="col3">
    ${cashoutCoefficient}</div>
                <div class="col4">
    ${wonAmount}</div>
            </div>        
        
    `;
  }
  elements.last24ClientSpins.innerHTML = html;
  //t -= (new Date()).getTime(); console.log('last24ClientSpins', t);
}
function last20BigWins() {
  //let t = (new Date()).getTime();
  elements.last20BigWins.innerHTML = '';
  let html = '';
  for (let i = 0; i < history.last20BigWins.length; i++) {
    let spin = history.last20BigWins[i];
    let currency = spin.Currency;
    let currencyCode = currency.CurrencyCode;
    let fractionDigit = currency.FractionDigit;
    let betAmount = spin.BetAmount;
    let wonAmount = spin.WonAmount;
    let spinTimeParsed = spin.SpinTimeParsed;
    let cashoutCoefficient = spin.CashoutCoefficient;
    let coefficient = spin.Coefficient;
    let balance = spin.Balance;
    let bets = spin.Bets;
    let clientName = formatClientName(spin.ClientName);
    let spinDate = spin.SpinDate;
    let spinNumber = spin.SpinNumber;
    betAmount = formatAmount(betAmount, {
      currencyCode,
      fractionDigit
    });
    wonAmount = formatAmount(wonAmount, {
      currencyCode,
      fractionDigit
    });
    html += `
        <div class="row">
            <div class="col1"><div>
    ${clientName}</div></div>
            <div class="col2">
    ${betAmount}</div>
            <div class="col3">
    ${cashoutCoefficient} x</div>
            <div class="col4">
    ${wonAmount}</div>
        </div>
        
    `;
  }
  elements.last20BigWins.innerHTML = html;
  //t -= (new Date()).getTime(); console.log('last20BigWins', t);
}
function statistics() {
  if (
    $('.info-tabs a[data-tab="stats"]').hasClass('active') ||
    $('#footer-menu a[data-tab="stats"]').hasClass('active')
  ) {
    let time = $('#infoContentStatsMenu2 a.active').data('tab');
    let type = $('#infoContentStatsMenu a.active').data('tab');
    let list = history[`top${time}${type}`];
    let headHtml = ``;
    if (type === 'Coeffs') {
      headHtml = `
                <div class="col1"><div>
      ${GetCaption('jetx.board.time')}</div></div>
                <div class="col12">
      ${GetCaption('jetx.board.multiplier')}</div>
            
      `;
    } else {
      headHtml = `
                <div class="col1"><div>
      ${GetCaption('jetx.board.user')}</div></div>
                <div class="col2">
      ${GetCaption('jetx.board.bet')}</div>
                <div class="col3">
      ${GetCaption('jetx.board.coeficient')}</div>
                <div class="col4">
      ${GetCaption('jetx.board.win')}</div>
            
      `;
    }
    elements.infoContentStatsHead.innerHTML = headHtml;
    let html = ``;
    elements.infoContentStatsList.innerHTML = '';
    for (let i = 0; i < list.length; i++) {
      let spin = list[i];
      if (type === 'Coeffs') {
        let spinDate = spin.SpinDate;
        let coefficient = spin.WonAmount;
        let date = '';
        let time = '';
        if (spinDate !== '') {
          let dateTime = new Date(spinDate);
          date = `${String(dateTime.getDate()).padStart(2, '0')}.${String(dateTime.getMonth() + 1).padStart(2, '0')}.${dateTime.getFullYear()}`;
          time = `${String(dateTime.getHours()).padStart(2, '0')}:${String(dateTime.getMinutes() + 1).padStart(2, '0')}:${String(dateTime.getSeconds() + 1).padStart(2, '0')}`;
        }
        html += `
                <div class="row">
                    <div class="col1"><div>
        ${date} ${time}</div></div>
                    <div class="col2">
        ${coefficient} x</div>
                </div>
                
        `;
      } else {
        let currency = spin.Currency;
        let currencyCode = currency.CurrencyCode;
        let fractionDigit = currency.FractionDigit;
        let betAmount = spin.BetAmount;
        let wonAmount = spin.WonAmount;
        let spinTimeParsed = spin.SpinTimeParsed;
        let cashoutCoefficient = spin.CashoutCoefficient;
        let coefficient = spin.Coefficient;
        let balance = spin.Balance;
        let bets = spin.Bets;
        let clientName = formatClientName(spin.ClientName);
        let spinDate = spin.SpinDate;
        let spinNumber = spin.SpinNumber;
        betAmount = formatAmount(betAmount, {
          currencyCode,
          fractionDigit
        });
        wonAmount = formatAmount(wonAmount, {
          currencyCode,
          fractionDigit
        });
        html += `
                <div class="row">
                    <div class="col1"><div>
        ${clientName}</div></div>
                    <div class="col2">
        ${betAmount}</div>
                    <div class="col3">
        ${cashoutCoefficient} x</div>
                    <div class="col4">
        ${wonAmount}</div>
                </div>
                
        `;
      }
    }
    elements.infoContentStatsList.innerHTML = html;
  }
}// Load Data END
// Gifts START
function showGiftPopup(type) {
  $('.gift-popup').fadeIn(100).removeClass('gift-status-new gift-status-win gift-status-cancel').addClass('gift-status-' + type);
  $('.gift-new').addClass('none');
  $('.gift-cancel').addClass('none');
  $('.gift-win').addClass('none');
  $('.gift-' + type).removeClass('none');
  $('.gift-popup-close').css('display', 'block');
  if (type === 'new') {
    let count = player.gift.count;
    let headCaption = GetCaption('jetx.board.freebet.text4');
    let acceptCaption = GetCaption('jetx.board.freebet.use');
    if (player.gift.count !== player.gift.startAmount) {
      headCaption = GetCaption('jetx.board.freebet.text4.continue');
      acceptCaption = GetCaption('jetx.board.freebet.continue');
      $('.gift-popup-close').css('display', 'none');
    }
    $('.gift-new-head').html(headCaption);
    $('.gift-button-accept').html(acceptCaption);
    $('.gift-new .giftSpinsStartAmount').html(count); //numberFormat(player.gift.startAmount, player.currency.currencyCode, true)
    $('.gift-new .giftSpinAmount').html(
      numberFormat(player.gift.amount, player.currency.currencyCode, true)
    );
    $('.gift-new .currency').html(currencyFormat(player.currency.currencyCode));
  } else if (type === 'win') {
    $('.gift-win .giftSpinTotalWin').html(
      player.gift.totalWin + ' <span class="currency">' + currencyFormat(player.currency.currencyCode) + '</span>'
    );
  }
}
function setGiftInfo() {
  $('#GiftSpinAmount').html(
    numberFormat(player.gift.amount, player.currency.currencyCode, true) + ' <span class="currency">' + currencyFormat(player.currency.currencyCode) + '</span>'
  );
  $('#GiftSpinWin').html(
    numberFormat(player.gift.totalWin, player.currency.currencyCode, true) + ' <span class="currency">' + currencyFormat(player.currency.currencyCode) + '</span>'
  );
  $('#bet-2 .place-bet1').html(
    numberFormat(player.gift.amount, player.currency.currencyCode, true) + ' <span class="currency">' + currencyFormat(player.currency.currencyCode) + '</span>'
  );
  $('#bet-3 .place-bet1').html(
    numberFormat(player.gift.amount, player.currency.currencyCode, true) + ' <span class="currency">' + currencyFormat(player.currency.currencyCode) + '</span>'
  );
  $('#GiftSpinCount').html(player.gift.startAmount);
  $('#GiftSpinUsed').html(player.gift.startAmount - player.gift.count);
  $('#GiftSpinLeft').html(player.gift.count);
}
let giftLoaded = false;
let giftTabClick = true;
function showGiftTab(load = false) {
  let active = $('.buttons .tabs a:eq(1)').hasClass('active');
  if (!active) $('.buttons .tabs').removeClass('none');
  if (!giftLoaded) {
    giftLoaded = true;
    if (giftTabClick && !load) {
      if (!active) {
        $('.buttons .tabs a:eq(1)').trigger(clickEvent);
      }
    }
    giftTabClick = true;
  }
  if (!active) canvasResize();
}
function hideGiftTab() {
  if (!$('.buttons .tabs').hasClass('none')) {
    $('.buttons .tabs').addClass('none');
    $('.buttons .tabs a:eq(0)').trigger(clickEvent);
  }
}// Gifts END
// Sound START
let sounds;
let audioElement = [];
let audioElementVolume = [];
for (let i = 0; i < 100; i++) {
  audioElement.push(null);
  audioElementVolume.push(0);
}
function flySound(position = 0) {
  let time1 = 14904;
  let time2 = 7464;
  let time3 = 7416;
  let forwardTime = position * 1000;
  PlaySound(77, 'FlyStart1');
  audioElement[77].position = forwardTime;
  if (forwardTime > time1) {
    forwardTime -= time1;
  } else {
    forwardTime = 0;
  }
  audioElement[77].addEventListener(
    'complete',
    function (instance) {
      let loopCount = 3;
      let forwardLoop = parseInt(forwardTime / time2);
      loopCount -= forwardLoop;
      forwardTime -= Math.min(forwardLoop, 4) * time2;
      if (loopCount < 0) {
        loopCount = 0;
      }
      PlaySound(77, 'FlyStart2', {
        loop: loopCount
      });
      audioElement[77].position = forwardLoop >= 4 ? 10000 : forwardTime;
      if (forwardLoop < 4) {
        forwardTime = 0;
      }
      audioElement[77].addEventListener(
        'complete',
        function (instance) {
          PlaySound(77, 'FlyStart3');
          audioElement[77].position = forwardTime;
          audioElement[77].addEventListener(
            'complete',
            function (instance) {
              PlaySound(77, 'FlyLoop', {
                loop: - 1
              });
            }
          );
        }
      );
    }
  );
}
function InitSound() {
  if (!createjs.Sound.initializeDefaultPlugins()) {
    return;
  }
  let assetsPath = '../../Content/SoundLight/';
  if (staticContentUrl !== '') {
    assetsPath = staticContentUrl + '../SoundLight/';
  }
  sounds = [
    {
      id: 'Boom',
      src: 'Boom.mp3',
      loaded: false
    },
    {
      id: 'Button',
      src: 'Button.mp3',
      loaded: false
    },
    //{id: 'CancelBet', src: 'CancelBet.mp3', loaded: false},
    {
      id: 'FlyLoop',
      src: 'FlyLoop.mp3',
      loaded: false
    },
    {
      id: 'FlyStart1',
      src: 'FlyStart1.mp3',
      loaded: false
    },
    {
      id: 'FlyStart2',
      src: 'FlyStart2.mp3',
      loaded: false
    },
    {
      id: 'FlyStart3',
      src: 'FlyStart3.mp3',
      loaded: false
    },
    {
      id: 'JackpotCoins',
      src: 'JackpotCoins.mp3',
      loaded: false
    },
    {
      id: 'PlaceBet',
      src: 'PlaceBet.mp3',
      loaded: false
    },
    {
      id: 'Tab',
      src: 'Tab.mp3',
      loaded: false
    },
    {
      id: 'Win',
      src: 'Win.mp3',
      loaded: false
    },
  ];
  createjs.Sound.alternateExtensions = [
    'mp3'
  ];
  createjs.Sound.addEventListener('fileload', createjs.proxy(soundLoaded, this));
  createjs.Sound.registerSounds(sounds, assetsPath);
}
function soundLoaded(event) {
  for (let soundIndex in sounds) {
    if (sounds[soundIndex].id === event.id) {
      sounds[soundIndex].loaded = true;
      break;
    }
  }
}
function PlaySound(index, type, params) {
  if (audioElement[index] !== null) {
    audioElement[index].destroy();
    audioElement[index] = null;
  }
  let loop = 0;
  if (params !== undefined && params !== null && params.loop !== undefined) {
    loop = params.loop;
  }
  let defaultVolume = 0.9;
  let buttons = [
    'PlaceBet',
    'CancelBet'
  ];
  if (buttons.indexOf(type) >= 0) {
    defaultVolume = 0.35;
  } else if (type === 'Win') {
    defaultVolume = 0.45;
  } else if (type === 'Tab') {
    defaultVolume = 0;
  }
  audioElementVolume[index] = defaultVolume;
  let volume = defaultVolume;
  // if (!$('.button.sound').hasClass('active')) {
  //     volume = 0;
  // }
  let soundChecked = $('.sound-menu-a.sound-sound .sound-checkbox input').is(':checked');
  let musicChecked = $('.sound-menu-a.sound-music .sound-checkbox input').is(':checked');
  if (index === 77) {
    if (!musicChecked) {
      volume = 0;
    }
  } else {
    if (!soundChecked) {
      volume = 0;
    }
  }
  if (soundPopup) {
    volume = 0;
  }
  for (let soundIndex in sounds) {
    if (sounds[soundIndex].id === type && !sounds[soundIndex].loaded) {
      let parentIndex = index;
      let parentType = type;
      let parentParams = params;
      setTimeout(
        function () {
          PlaySound(parentIndex, parentType, parentParams);
        },
        500
      );
      break;
    }
  }
  audioElement[index] = createjs.Sound.play(
    type,
    {
      interrupt: createjs.Sound.INTERRUPT_NONE,
      loop: loop,
      volume: volume
    }
  );
  if (
    audioElement[index] === null ||
    audioElement[index].playState === createjs.Sound.PLAY_FAILED
  ) {
    return;
  }
  audioElement[index].addEventListener('complete', function (instance) {
  });
}
function pauseSounds() {
  if (audioElement[77] !== null) {
    audioElement[77].stop();
    audioElement[77] = null;
  }
  if (audioElement[78] !== null) {
    audioElement[78].stop();
    audioElement[78] = null;
  }
  if (audioElement[79] !== null) {
    audioElement[79].stop();
  }
  if (audioElement[80] !== null) {
    audioElement[80].stop();
  }
}
function buttonSound(params) {
  let musicChecked = params.musicChecked;
  let soundChecked = params.soundChecked;
  for (let i = 0; i < audioElement.length; i++) {
    if (audioElement[i] !== null) {
      if (i === 77) {
        audioElement[i].volume = !soundPopup &&
          musicChecked ? audioElementVolume[i] : 0;
      } else {
        audioElement[i].volume = !soundPopup &&
          soundChecked ? audioElementVolume[i] : 0;
      }
    }
  }
}
$('body').addClass('overflow');
let soundPopup = mobile;
function mobileSound(type) {
  soundPopup = false;
  if (type) {
    $('.button.sound').addClass('active');
  } else {
    $('.button.sound').removeClass('active');
  }
  let checked = $('.sound-menu-a.sound-all .sound-checkbox input').is(':checked');
  if (type !== checked) {
    $('.sound-menu-a.sound-all .sound-checkbox span').trigger(clickEvent);
  } else {
    buttonSound({
      musicChecked: true,
      soundChecked: true
    });
  }
  $('.sound-popup').fadeOut(100);
  $('body').removeClass('overflow');
  mobileFullScreen();
  mobileNoSleep();
  promoPrizeIcon(true, 100);
}// Sound END
function mobileFullScreen() {
  if (bowser.name === 'Opera') {
    launchFullscreen(document.documentElement);
  } else {
    if (
      (window.fullScreen) ||
      (
        window.innerWidth === screen.width &&
        window.innerHeight === screen.height
      )
    ) {
      $('body').addClass('fullscreenView');
    } else {
      launchFullscreen(document.documentElement);
    }
  }
}
function setInputValue(inputId, defaultValue = '') {
  let el = $(`#${inputId}`);
  let buttonId = el.attr('id');
  if (buttonId.indexOf('bet-value-') >= 0) {
    buttonId = buttonId.replace('bet-value-', '');
    if ($(`#button-${buttonId}`).hasClass('disabled')) return false;
  }
  let value = el.val();
  if (value === '' && defaultValue !== '') {
    el.val(defaultValue);
  } else {
    let minBet = 0;
    let maxBet = 0;
    let fixedDigit = 2;
    let maxValue = 1000000000;
    let minMultiplier = 0;
    if (el.data('maxbet') !== undefined) {
      minBet = parseFloat(el.data('minbet'));
      maxBet = parseFloat(el.data('maxbet'));
      fixedDigit = player.currency.fractionDigit;
      if (player.availableAmount > 0) maxValue = Math.max(player.availableAmount, minBet);
      minMultiplier = board.minMultiplier;
    } else {
      minBet = parseFloat(board.minAutoCashOut);
      maxBet = parseFloat(board.maxAutoCashOut);
    }
    value = parseFloat(value);
    value = parseFloat(value.toFixed(fixedDigit));
    value = Math.min(Math.max(value, minBet), maxBet, maxValue);
    if (isNaN(value)) value = minBet;
    if (minMultiplier > 0) {
      if (value - Math.floor(value / minMultiplier) * minMultiplier != 0) {
        value = Math.floor(value / minMultiplier) * minMultiplier;
      }
    }
    el.val(value.toFixed(fixedDigit));
  }
  inputCurrency(el);
}
let iId = '';
let iVal = '';
let keyboardShow = false;
let bodyScroll = 0;
let scrollElement = $('html'); //$('body') $('#game')
function keyboardCursor(inputId) {
  let el = $('#' + inputId);
  let inputWidth = el.textWidth();
  let marginLeft = parseFloat(el.css('margin-left').replace('px', ''));
  let paddingLeft = parseFloat(el.css('padding-left').replace('px', ''));
  let paddingRight = parseFloat(el.css('padding-right').replace('px', ''));
  if ($('#' + inputId).val() === '') {
    inputWidth = 0;
  }
  inputWidth /= 2;
  inputWidth += marginLeft + paddingLeft + (bowser.firefox ? 5 : 0);
  el.parent().find('.input-cursor').css('margin-left', Math.min(50, inputWidth) + 'px');
}
function keyboardHide() {
  $('.input-cursor').hide();
  $('.keyboard-div').css('display', 'none');
  $('body').removeClass('overflow');
  keyboardShow = false;
  scrollElement.scrollTop(bodyScroll);
}
function keyboard(inputId) {
  let keyboardClickEvent = 'click'; //clickEvent
  let inputEl = $('#' + inputId);
  let defaultValue = $('#' + inputId).val();
  iVal = defaultValue;
  iId = inputId;
  $('#' + inputId).val('');
  inputEl.parent().find('.input-cursor').show();
  $('.keyboard-div').css('display', 'block');
  $('.keyboard-numbers a').unbind('touchstart');
  $('.keyboard-numbers a').on(
    'touchstart',
    function (e) {
      e.stopPropagation();
      if (keyboardShow) {
        $(this).addClass('mousedown').delay(100).queue(function (next) {
          $(this).removeClass('mousedown').dequeue();
        });
      }
    }
  );
  if (vertical) {
    let position = inputEl.offset();
    let top = position.top;
    let windowHeight = $(window).height();
    let height = $('.keyboard').height();
    let buttonHeight = $('#button-' + inputEl.data('button')).height();
    let scrollTop = scrollElement.scrollTop();
    let newScrollTop = scrollTop + (top - (windowHeight - height - buttonHeight)) - 80; // - 80 - 20
    bodyScroll = scrollElement.scrollTop();
    scrollElement.scrollTop(newScrollTop);
    //$('#right').scrollTop(0);
  } else {
    let position = inputEl.offset();
    let top = position.top;
    let height = $('.keyboard-div').height();
    let scrollTop = $('#right').scrollTop();
    let newScrollTop = top - (scrollTop + 18);
    scrollElement.scrollTop(0);
    //$('#right').scrollTop(newScrollTop);
  }  //$('body').addClass('overflow');
  keyboardCursor(inputId);
  $('.keyboard-buttons a').unbind(keyboardClickEvent);
  $('.keyboard-buttons a').on(
    keyboardClickEvent,
    function (e) {
      e.stopPropagation();
      if (keyboardShow) {
        if ($(this).hasClass('dot')) {
          let v = $('#' + inputId).val();
          if (v.indexOf('.') < 0) {
            v += '.';
            $('#' + inputId).val(v);
          }
        } else if ($(this).hasClass('delete')) {
          let v = $('#' + inputId).val();
          v = v.slice(0, - 1);
          $('#' + inputId).val(v);
        } else if ($(this).hasClass('cancel')) {
          $('#' + inputId).val(defaultValue);
          keyboardHide();
        } else if ($(this).hasClass('ok')) {
          setInputValue(inputId, defaultValue);
          keyboardHide();
        }
      }
      keyboardCursor(inputId);
    }
  );
  $('.keyboard .head a').unbind(keyboardClickEvent);
  $('.keyboard .head a').on(
    keyboardClickEvent,
    function (e) {
      e.stopPropagation();
      if (keyboardShow) {
        let n = $(this).html();
        $('#' + inputId).val(n);
        keyboardHide();
      }
    }
  );
  $('.keyboard-numbers a').unbind(keyboardClickEvent);
  $('.keyboard-numbers a').on(
    keyboardClickEvent,
    function (e) {
      e.stopPropagation();
      if (keyboardShow) {
        if ($(this).hasClass('dot')) {
          let v = $('#' + inputId).val();
          if (v.indexOf('.') < 0) {
            v += '.';
            $('#' + inputId).val(v);
          }
        } else if ($(this).hasClass('delete')) {
          let v = $('#' + inputId).val();
          v = v.slice(0, - 1);
          $('#' + inputId).val(v);
        } else {
          let n = $(this).html();
          let v = $('#' + inputId).val();
          let inputValue = v + n;
          if (v === '0') {
            inputValue = v + '.' + n;
            $('#' + inputId).val(inputValue);
          } else {
            v += n;
            $('#' + inputId).val(v);
          }
          inputCurrency($('#' + inputId));
        }
      }
      keyboardCursor(inputId);
    }
  );
  setTimeout(function () {
    keyboardShow = true;
  }, mobile ? 250 : 1);
}
function canvasResize() {
  let w = '100%';
  if (mobile && $(window).width() >= $(window).height()) {
    w = 'calc(100% - 340px)';
  }
  $('.GameParent').css({
    width: w,
    'margin-left': 0
  });
  let width = $('.canvas').width();
  let height = width * (gameInfo.height / gameInfo.width);
  $('.canvas').css('height', height);
  let canvasHeight = height;
  height += parseInt($('.canvas').css('margin-bottom'));
  let mainHeight = $('#main').height();
  let betDivHeight = $('.bet-div').height();
  if (mainHeight - height < betDivHeight) {
    height = mainHeight - betDivHeight;
    $('.canvas').css('height', height - parseInt($('.canvas').css('margin-bottom')));
  }
  if (mobile) {
    footerPosition();
  } else {
    $('.buttons').css('height', `calc(100% - ${height}px)`);
  }
  $('input[type=number]').each(
    function () {
      if (!$(this).is(':focus')) {
        // $(this).trigger('change');
        // $(this).trigger('focusout');
        inputCurrency($(this));
      }
    }
  );
  if (!mobile) {
    let scale = Math.min($(window).width() / 1920, $(window).height() / 890);
    let scaleResize = {
      small: 0.09,
      medium: 0.1,
      large: 0.2
    };
    $('.jackpot div').css({
      'width': 423 * scale
    });
    let postMessage = {
      action: 'scale',
      value: scale - scaleResize.small
    };
    document.getElementById('jackpotCounter').contentWindow.postMessage(JSON.stringify(postMessage), '*');
  }
  jetX.canvasHeight = canvasHeight;
  jetX.scale();
  rowHeight = getRowHeight();
  rowCount = getRowCount();
}
function footerPosition() {
  let width = $('.canvas').width();
  let height = width * (gameInfo.height / gameInfo.width);
  let footerTop = 'auto';
  let infoDivTop = 'auto';
  let infoDivHeight = `70vh`;
  let tabTop = `-35px`;
  if ($(window).width() >= $(window).height()) {
    let headerHeight = $('header').outerHeight();
    let gameHeight = $('#game').height();
    if (height + headerHeight + 25 + 5 > gameHeight) {
      height = gameHeight - headerHeight - 10 - 25 - 5;
    }
    height = Math.min(gameHeight * (45 / 100), height);
    footerTop = `${height + $('header').outerHeight() + 30}px`;
    infoDivTop = `${height + $('footer').outerHeight()}px`;
    infoDivHeight = `calc(100% - ${height + $('footer').outerHeight() - 5}px)`;
    tabTop = `${height - 20}px`;
  }
  $('.canvas').css('height', height);
  height += parseInt($('.canvas').css('margin-bottom'));
  vertical = false;
  if ($(window).width() < $(window).height()) {
    vertical = true;
    //height += $('.buttons').height();
    //infoDivHeight = `calc(100% - ${height}px)`;
    //if(mobile) $('.info-div').css('height', `70vh`);
  }
  $('footer').css('top', footerTop);
  $('.info-div').css('top', infoDivTop);
  $('.info-div').css('height', infoDivHeight);
  $('.buttons .tabs').css('top', tabTop);
}
function setLastBet(position) {
  if (!localStorageAllow) return false;
  if (position < 2) {
    let bet = {
      autoBet: false, //$(`#auto-bet-${position}`).is(':checked'),
      amount: $(`#bet-value-${position}`).val(),
      autoCashOut: false, //$(`#auto-cash-out-${position}`).is(':checked'),
      cashOut: $(`#cash-out-value-${position}`).val(),
    };
    localStorage.setItem(`bet-${position}`, JSON.stringify(bet));
  }
}
function getLastBet(position) {
  if (!localStorageAllow) return null;
  let lastBet = localStorage.getItem(`bet-${position}`);
  if (lastBet === null) return lastBet;
  return JSON.parse(lastBet);
}
let scrollOnFooterClick = true;
$(window).on(
  'load',
  function (e) {
    for (let position = 0; position < 2; position++) {
      let lastBet = getLastBet(position);
      if (lastBet !== null) {
        $(`#auto-bet-${position}`).prop('checked', lastBet.autoBet);
        if (lastBet.amount !== '') $(`#bet-value-${position}`).val(lastBet.amount);
        $(`#auto-cash-out-${position}`).prop('checked', lastBet.autoCashOut);
        if (lastBet.cashOut !== '') $(`#cash-out-value-${position}`).val(lastBet.cashOut);
      }
    }
    canvasResize();
    PostCustomEvent(token, 'update.balance');
    loadJackpotsImages();
    InitSound();
    GetBoard(token, true);
    setInterval(() => {
      LoadChatMessages();
    }, 1000);
    $(document).on(
      clickEvent,
      '.message .close',
      function () {
        $(this).parent().fadeOut(100).delay(100).remove();
        if (!$('.message-div .message').is(':visible')) {
          promoPrizeIcon(true);
        }
      }
    );
    /* Mobile Start */
    $(document).on(
      clickEvent,
      '.scroll-top',
      function () {
        $('html, body').animate({
          scrollTop: 0
        }, 200);
      }
    );
    $(document).on(
      clickEvent,
      '.mobile-more',
      function () {
        $('#game').toggleClass('mobile-more-active');
        canvasResize();
        setTimeout(function () {
          canvasResize();
        }, 250);
      }
    );
    let lastTab = 'bets';
    $(document).on(
      clickEvent,
      'footer a',
      function () {
        if (!$(this).hasClass('active')) {
          let tab = $(this).data('tab');
          if (tab === 'chat') {
            exitFullscreen();
            $('.chat').removeClass('none');
            $('.chat-message').scrollTop($('.chat-message')[0].scrollHeight);
            $('footer a').removeClass('active');
            $(this).addClass('active');
            $('body').addClass('overflow');
            if (mobile) promoPrizeIcon();
          } else {
            lastTab = tab;
            $('.chat').addClass('none');
            PlaySound(9, 'Tab');
            $('footer a').removeClass('active');
            $('.info-content').removeClass('active');
            $(this).addClass('active');
            $('.info-content.' + tab).addClass('active').fadeIn(100);
            $('body').removeClass('overflow');
            if (mobile) promoPrizeIcon(true);
            if (vertical && scrollOnFooterClick) {
              let scrollTop = $('header').height() + $('.GameParent').height() + $('.buttons').height() + 50;
              $('html').animate({
                scrollTop: '385px'
              }, 200);
            }
            scrollOnFooterClick = true;
            if (tab === 'history') {
              $('#last100Spins .item').each(
                (index, element) => {
                  $(element).css('opacity', 0);
                  if (index < 5) {
                    $(element).delay(index * 100).animate({
                      opacity: 1
                    }, 300);
                  } else {
                    $(element).delay(550 + (index - 5) * 10).animate({
                      opacity: 1
                    }, 100);
                  }
                }
              );
            }
            if (tab === 'stats') {
              statistics();
            }
          }
        }
      }
    );
    $(document).on(
      clickEvent,
      '.chat .close',
      function () {
        scrollOnFooterClick = false;
        $('body').removeClass('overflow');
        $('footer a[data-tab="' + lastTab + '"]').trigger(clickEvent);
        if (mobile) promoPrizeIcon(true);
      }
    );
    $(document).on(
      clickEvent,
      '.input-over',
      function () {
        let button = $(this).parent().find('input').data('button');
        if ($(`#button-${button}`).hasClass('disabled')) return false;
        let id = $(this).parent().find('input').attr('id');
        keyboard(id);
      }
    );
    $(document).on(
      clickEvent,
      '.keyboard-top',
      function (event) {
        keyboardHide();
        $('#' + iId).val(iVal);
      }
    );
    $(document).on(
      clickEvent,
      '.bet-add',
      function (event) {
        let button = $(this).data('button');
        //if($(`#button-${button}`).hasClass('disabled')) return false;
        let buttobEl = $(`#button-${button}`);
        if (
          $('#game').hasClass('two-buttons') &&
          (
            buttobEl.hasClass('cancel-bet') ||
            buttobEl.hasClass('cash-out')
          )
        ) return false;
        if ($(this).hasClass('active')) {
          $('.bet-add').removeClass('active');
          $('.buttons-col').css('display', 'block');
          $('#button-' + button).css('display', 'none');
          $('#auto-bet-' + button).prop('checked', false);
          $('#auto-cash-out-' + button).prop('checked', false);
          $('#game').removeClass('two-buttons');
          if (sessionStorageAllow) sessionStorage.setItem('buttons', button);
        } else {
          $('.bet-add').addClass('active');
          $('.buttons-col').css('display', 'block');
          $('#game').addClass('two-buttons');
          if (sessionStorageAllow) sessionStorage.setItem('buttons', 'all');
        }
        footerPosition();
      }
    );
    $(document).on(
      clickEvent,
      '#help-popup .rules-item .rules-title',
      function (event) {
        let index = $('#help-popup .rules-item').index($(this).parent());
        if (
          $('#help-popup .rules-item:eq(' + index + ')').hasClass('active')
        ) {
          $('#help-popup .rules-item:eq(' + index + ')').removeClass('active');
          $('#help-popup .rules-item:eq(' + index + ') .rules-content').slideToggle(200);
        } else {
          $('#help-popup .rules-item:eq(' + index + ')').addClass('active');
          $('#help-popup .rules-item:eq(' + index + ') .rules-content').slideToggle(200);
        }
      }
    );
    /*
    */
    if (mobile) {
      let buttons = sessionStorageAllow ? sessionStorage.getItem('buttons') : null;
      if (buttons !== null) {
        $('.buttons-col').css('display', 'block');
        $('.bet-add').addClass('active');
        $('#game').addClass('two-buttons');
        if (buttons === 'all') {
        } else if (buttons === '0') {
          $('#button-0').css('display', 'none');
          $('.bet-add').removeClass('active');
          $('#game').removeClass('two-buttons');
        } else if (buttons === '1') {
          $('#button-1').css('display', 'none');
          $('.bet-add').removeClass('active');
          $('#game').removeClass('two-buttons');
        }
        footerPosition();
      }
    }
    $('footer .footer-buttons.prev').click(
      function () {
        $('footer .footer-menu div').animate({
          scrollLeft: 0
        }, 200);
        return false;
      }
    );
    $('footer .footer-buttons.next').click(
      function () {
        let scrollLeft = document.getElementById('footer-menu').scrollWidth - $('#footer-menu').width();
        $('footer .footer-menu div').animate({
          scrollLeft: scrollLeft
        }, 200);
        return false;
      }
    );
    /* Mobile End */
    $(document).on(
      clickEvent,
      '.history-list .history-item',
      function () {
        let info = $(this).data('info');
        if (info) {
          last100SpinsInfo(info);
        }
      }
    );
    $(document).on(
      clickEvent,
      '.history .row',
      function () {
        let info = $(this).data('info');
        if (info) {
          last100SpinsInfo(info);
        }
      }
    );
    $(document).on(
      clickEvent,
      '#last100Spins .item',
      function () {
        let info = $(this).data('info');
        if (info) {
          last100SpinsInfoMobileHistory = true;
          last100SpinsInfo(info);
        }
      }
    );
    $(document).on(
      clickEvent,
      '.hash-popup .close',
      function () {
        last100SpinsInfoClose();
      }
    );
    $(document).on(
      clickEvent,
      '.hash-popup .coefficient .prev',
      function () {
        if (last100SpinsInfoMobileHistory) {
          $(`#h-${$('.hash-popup .hash-value').text()}`).prev().trigger(clickEvent);
        } else {
          $(`#${$('.hash-popup .hash-value').text()}`).prev().trigger(clickEvent);
        }
      }
    );
    $(document).on(
      clickEvent,
      '.hash-popup .coefficient .next',
      function () {
        if (last100SpinsInfoMobileHistory) {
          $(`#h-${$('.hash-popup .hash-value').text()}`).next().trigger(clickEvent);
        } else {
          $(`#${$('.hash-popup .hash-value').text()}`).next().trigger(clickEvent);
        }
      }
    );
    $(document).on(
      clickEvent,
      '.hash-popup .hash-copy',
      function () {
        fallbackCopyTextToClipboard($('.hash-popup .hash-value').text());
      }
    );
    $(document).on(
      clickEvent,
      '.hash-popup .result-copy',
      function () {
        fallbackCopyTextToClipboard($('.hash-popup .result-value').text());
      }
    );
    $(document).on(
      clickEvent,
      '.gift-popup-background',
      function () {
        if ($('.gift-popup').hasClass('gift-status-new')) {
          $('.gift-popup').fadeOut(100);
          PostCustomEvent(token, 'jetx.gifts.start');
          giftTabClick = false;
        } else if ($('.gift-popup').hasClass('gift-status-win')) {
          $('.gift-popup').fadeOut(100);
          PostCustomEvent(token, 'jetx.gifts.zero.win');
        } else if ($('.gift-popup').hasClass('gift-status-cancel')) {
          $('.gift-popup').fadeOut(100);
          PostCustomEvent(token, 'jetx.gifts.cancel');
          giftTabClick = false;
        }
      }
    );
    $(document).on(
      giftClickEvent,
      '.gift-button-accept',
      function () {
        $('.gift-popup').fadeOut(100);
        giftLoaded = false;
        PostCustomEvent(token, 'jetx.gifts.start');
      }
    );
    $(document).on(
      clickEvent,
      '.gift-popup-close',
      function () {
        if ($('.gift-popup').hasClass('gift-status-new')) {
          //$('.gift-popup').removeClass('gift-status-new gift-status-win gift-status-cancel').addClass('gift-status-cancel');
          //$('.gift-new').addClass('none');
          //$('.gift-cancel').removeClass('none');
          $('.gift-popup').fadeOut(100);
          //PostCustomEvent(token, 'jetx.gifts.remind.later');
          PostCustomEvent(token, 'jetx.gifts.start');
          giftTabClick = false;
        } else if ($('.gift-popup').hasClass('gift-status-win')) {
          $('.gift-popup').fadeOut(100);
          PostCustomEvent(token, 'jetx.gifts.zero.win');
        } else if ($('.gift-popup').hasClass('gift-status-cancel')) {
          $('.gift-popup').fadeOut(100);
          PostCustomEvent(token, 'jetx.gifts.cancel');
          giftTabClick = false;
        }
      }
    );
    $(document).on(
      clickEvent,
      '.gift-button-remind-me',
      function () {
        $('.gift-popup').fadeOut(100);
        PostCustomEvent(token, 'jetx.gifts.remind.later');
      }
    );
    $(document).on(
      clickEvent,
      '.gift-button-cancel',
      function () {
        $('.gift-popup').removeClass('gift-status-new gift-status-win gift-status-cancel').addClass('gift-status-cancel');
        $('.gift-new').addClass('none');
        $('.gift-cancel').removeClass('none');
      }
    );
    $(document).on(
      clickEvent,
      '.gift-button-cancel-yes',
      function () {
        $('.gift-popup').fadeOut(100);
        PostCustomEvent(token, 'jetx.gifts.cancel');
      }
    );
    $(document).on(
      clickEvent,
      '.gift-button-cancel-no',
      function () {
        $('.gift-popup').removeClass('gift-status-new gift-status-win gift-status-cancel').addClass('gift-status-new');
        $('.gift-new').removeClass('none');
        $('.gift-cancel').addClass('none');
      }
    );
    $(document).on(
      clickEvent,
      '.gift-button-gift-exit',
      function () {
        $('.gift-popup').fadeOut(100);
        PostCustomEvent(token, 'jetx.gifts.zero.win');
      }
    );
    $(document).on(
      clickEvent,
      '.jackpot-popup-close',
      function () {
        $('.jackpot-popup').fadeOut(100);
      }
    );
    $(document).on(
      clickEvent,
      '.button.sound',
      function () {
        $('.button.sound').toggleClass('active');
        for (let i = 0; i < audioElement.length; i++) {
          if (audioElement[i] !== null) {
            audioElement[i].volume = $('.button.sound').hasClass('active') ? audioElementVolume[i] : 0;
          }
        }
      }
    );
    $(document).on(
      clickEvent,
      '.sound-menu-icon',
      function () {
        $('.sound-menu').toggleClass('active');
      }
    );
    $(document).on(
      'mouseleave',
      '.sound-menu-popup',
      function () {
        $('.sound-menu').removeClass('active');
      }
    );
    $(document).on(
      clickEvent,
      '.sound-menu-a.sound-all .sound-checkbox span',
      function () {
        let checked = !$('.sound-menu-a.sound-all .sound-checkbox input').is(':checked');
        $('.sound-menu-a.sound-sound .sound-checkbox input').prop('checked', checked);
        $('.sound-menu-a.sound-music .sound-checkbox input').prop('checked', checked);
        buttonSound({
          soundChecked: checked,
          musicChecked: checked
        });
      }
    );
    $(document).on(
      clickEvent,
      '.sound-menu-a.sound-sound .sound-checkbox span',
      function () {
        let soundChecked = !$('.sound-menu-a.sound-sound .sound-checkbox input').is(':checked');
        let musicChecked = $('.sound-menu-a.sound-music .sound-checkbox input').is(':checked');
        $('.sound-menu-a.sound-all .sound-checkbox input').prop('checked', soundChecked && musicChecked);
        buttonSound({
          soundChecked: soundChecked,
          musicChecked: musicChecked
        });
      }
    );
    $(document).on(
      clickEvent,
      '.sound-menu-a.sound-music .sound-checkbox span',
      function () {
        let soundChecked = $('.sound-menu-a.sound-sound .sound-checkbox input').is(':checked');
        let musicChecked = !$('.sound-menu-a.sound-music .sound-checkbox input').is(':checked');
        $('.sound-menu-a.sound-all .sound-checkbox input').prop('checked', soundChecked && musicChecked);
        buttonSound({
          soundChecked: soundChecked,
          musicChecked: musicChecked
        });
      }
    );
    $(document).on(
      clickEvent,
      '.header-history .history-button',
      function () {
        $('.header-history .history-button').toggleClass('active');
        $('.header-history .history-list').toggleClass('active');
        promoPrizeIcon(!$('.header-history .history-button').hasClass('active'));
      }
    );
    // document.addEventListener("scroll", (event) => {
    //     $('.header-history .history-button').removeClass('active');
    //     $('.header-history .history-list').removeClass('active');
    // });
    // if(ios) {
    //     let lastScrollTop = 0;
    //     document.addEventListener("scroll", (event) => {
    //         let scrollTop = $('html').scrollTop();
    //
    //         if (lastScrollTop > scrollTop) {
    //             $('body').removeClass('scrolled');
    //         } else {
    //             if (scrollTop > 50) {
    //                 $('body').addClass('scrolled');
    //             } else {
    //                 $('body').removeClass('scrolled');
    //             }
    //         }
    //         lastScrollTop = scrollTop;
    //     });
    // }
    $(document).on(
      clickEvent,
      '.promotion-dailyleaderboard-button',
      function () {
        window.parent.postMessage({
          name: 'promotion-dailyleaderboard-show'
        }, '*');
      }
    );
    $(document).on(
      clickEvent,
      '.promotion-wheel-button',
      function () {
        window.parent.postMessage({
          name: 'promotion-wheel-show'
        }, '*');
      }
    );
    $(document).on(
      clickEvent,
      '.button.help',
      function () {
        $('#help-popup').fadeIn(100);
        $('body').addClass('overflow');
        window.parent.postMessage('jetXInfoOpen', '*');
        promoPrizeIcon();
      }
    );
    $(document).on(
      clickEvent,
      '#help-popup .help-popup-close',
      function () {
        $('#help-popup').fadeOut(100);
        $('.rules-item').each(
          function (index) {
            if ($('.rules-item:eq(' + index + ')').hasClass('active')) {
              $('.rules-item:eq(' + index + ')').removeClass('active');
              $('.rules-item:eq(' + index + ') .rules-content').slideToggle(0);
            }
          }
        );
        $('#help-popup .help-head-item:eq(0)').trigger(clickEvent);
        $('body').removeClass('overflow');
        window.parent.postMessage('jetXInfoClose', '*');
        promoPrizeIcon(true, 100);
      }
    );
    $(document).on(
      clickEvent,
      '#help-popup .help-head-item',
      function () {
        if (GetGameVersion() && $('#game-version').length > 0) {
          $('#game-version').html(GetCaption('game.version') + ' ' + GetGameVersion());
        }
        if (!$(this).hasClass('active')) {
          let tab = $(this).data('tab');
          $('#help-popup .help-head-item').removeClass('active');
          $('#help-popup .help-popup-content').addClass('none');
          $(this).addClass('active');
          $('#help-popup .help-popup-content.' + tab).removeClass('none');
        }
      }
    );
    $(document).on(
      clickEvent,
      '#info-on-start .help-popup-close',
      function () {
        $('#info-on-start').fadeOut(100);
        $('body').removeClass('overflow');
        PostCustomEvent(token, 'jetx.no.info.on.start');
        promoPrizeIcon(true, 100);
      }
    );
    $(document).on(
      clickEvent,
      '.help-popup-accept',
      function () {
        $('#info-on-start').fadeOut(100);
        $('body').removeClass('overflow');
        // if($('#help-accept').is(':checked')) {
        //     PostCustomEvent(token, 'jetx.no.info.on.start');
        // }
        PostCustomEvent(token, 'jetx.no.info.on.start');
        promoPrizeIcon(true, 100);
      }
    );
    $(document).on(
      clickEvent,
      '.button.exit',
      function () {
        if (token !== '') {
          PostCustomEvent(token, 'leave.game');
        } else {
          leaveGame();
        }
      }
    );
    $(document).on(
      clickEvent,
      '.info-tabs a',
      function () {
        if (!$(this).hasClass('active')) {
          PlaySound(9, 'Tab');
          $('.info-tabs a').removeClass('active');
          $('.info-content').removeClass('active');
          let tab = $(this).data('tab');
          $(this).addClass('active');
          $('.info-content.' + tab).addClass('active').fadeIn(100);
          if (tab === 'stats') {
            statistics();
          }
        }
      }
    );
    $(document).on(
      clickEvent,
      '.buttons .tabs a',
      function () {
        if (!$(this).hasClass('active')) {
          let tab = $(this).data('tab');
          if (player.disableCashGame && tab === 'cash-game') {
          } else {
            $('.buttons .tabs a').removeClass('active');
            $('.page').addClass('none');
            $(this).addClass('active');
            $('.page.' + tab).removeClass('none').fadeIn(100);
            $('#game').removeClass('cash-game-view gift-view').addClass(tab + '-view');
            if (mobile) footerPosition();
          }
        }
      }
    );
    $(document).on(
      clickEvent,
      '#infoContentStatsMenu a',
      function () {
        if (!$(this).hasClass('active')) {
          PlaySound(9, 'Tab');
          $('#infoContentStatsMenu a').removeClass('active');
          $(this).addClass('active');
          statistics();
        }
      }
    );
    $(document).on(
      clickEvent,
      '#infoContentStatsMenu2 a',
      function () {
        if (!$(this).hasClass('active')) {
          PlaySound(9, 'Tab');
          $('#infoContentStatsMenu2 a').removeClass('active');
          $(this).addClass('active');
          statistics();
        }
      }
    );
    $(document).on(
      clickEvent,
      '.buttons .bet',
      function () {
        let button = $(this).data('button');
        if ($(this).hasClass('place-bet')) {
          if ($(this).hasClass('disabled')) return false;
          PlaySound(5, 'PlaceBet');
          if (autoBetTrigger[button]) $('#bet-value-' + button).trigger('focusout');
          $('#cash-out-value-' + button).trigger('focusout');
          let bet = (
            button === 2 ||
              button === 3 ? board.minBet : $('#bet-value-' + button).val()
          );
          let cashOut = null;
          if (
            $('#auto-cash-out-' + button).is(':checked') &&
            $('#cash-out-value-' + button).val() !== ''
          ) {
            cashOut = $('#cash-out-value-' + button).val();
          }
          PlaceBet(token, bet, cashOut, button);
        } else if ($(this).hasClass('cancel-bet')) {
          PlaySound(6, 'PlaceBet');
          PostCustomEvent(token, 'jetx.undo.bet', button);
        } else if ($(this).hasClass('cash-out')) {
          Cashout(token, button);
        }
      }
    );
    $(document).on(
      clickEvent,
      '.bet-list a',
      function () {
        let button = $(this).data('button');
        if ($(`#button-${button}`).hasClass('disabled')) return false;
        let sound = $(this).data('sound');
        let bet = parseFloat($(this).data('bet'));
        let input = $('#bet-value-' + button);
        let val = parseFloat(input.val());
        let last = parseFloat(input.data('last'));
        PlaySound(0, 'Button');
        if (bet === 0) {
          let maxBet = parseFloat(board.maxBet);
          val = maxBet < player.availableAmount ? maxBet : player.availableAmount;
          input.data('last', 0);
        } else {
          if (bet === last) {
            let p = parseInt((val * 1000000) / (bet * 1000000));
            if (val * 1000000 - p * (bet * 1000000) !== 0) {
              last = - 1;
            }
          }
          let maxBet = parseFloat(board.maxBet);
          val = Math.min(bet === last ? val + bet : bet, maxBet);
          input.data('last', bet);
        }
        input.val(numberFormat(val), player.currency.currencyCode, false);
        inputCurrency(input);
      }
    );
    $(document).on(
      clickEvent,
      '.bet-x2',
      function () {
        let button = $(this).data('button');
        if ($(`#button-${button}`).hasClass('disabled')) return false;
        PlaySound(3, 'Button');
        let input = $('#bet-value-' + button);
        let val = parseFloat(input.val());
        let maxBet = parseFloat(input.data('maxbet'));
        val *= 2;
        val = parseFloat(val.toFixed(player.currency.fractionDigit));
        val = Math.min(maxBet, val);
        input.val(numberFormat(val, player.currency.currencyCode, false));
        inputCurrency(input);
      }
    );
    $(document).on(
      clickEvent,
      '.bet-input.bets .minus',
      function () {
        if ($(this).hasClass('disabled')) return false;
        let button = $(this).data('button');
        if ($(`#button-${button}`).hasClass('disabled')) return false;
        let input = $('#bet-value-' + button);
        PlaySound(3, 'Button');
        let step = parseFloat($(this).data('step'));
        let val = parseFloat(input.val());
        let minBet = parseFloat(input.data('minbet'));
        if (val <= step) {
          step /= 10;
        } else if (val <= 10 * step) {
        } else if (val <= 100 * step) {
          step *= 10;
        } else {
          step *= 50;
        }
        val -= step;
        val = parseFloat(numberFormat(val, player.currency.currencyCode));
        val = parseInt((val * 1000000) / (step * 1000000)) * step;
        input.val(
          numberFormat(Math.max(minBet, val)),
          player.currency.currencyCode,
          false
        );
        inputCurrency(input);
      }
    );
    $(document).on(
      clickEvent,
      '.bet-input.bets .plus',
      function () {
        if ($(this).hasClass('disabled')) return false;
        let button = $(this).data('button');
        if ($(`#button-${button}`).hasClass('disabled')) return false;
        let input = $('#bet-value-' + button);
        PlaySound(7, 'Button');
        let step = parseFloat($(this).data('step'));
        let val = parseFloat(input.val());
        let maxBet = parseFloat(input.data('maxbet'));
        if (val < step) {
          step /= 10;
        } else if (val < 10 * step) {
        } else if (val < 100 * step) {
          step *= 10;
        } else {
          step *= 50;
        }
        val += step;
        val = parseFloat(numberFormat(val, player.currency.currencyCode));
        val = parseInt((val * 1000000) / (step * 1000000)) * step;
        input.val(
          numberFormat(Math.min(maxBet, val)),
          player.currency.currencyCode,
          false
        );
        inputCurrency(input);
      }
    );
    $(document).on(
      clickEvent,
      '.bet-input.cash-out .minus',
      function () {
        if ($(this).hasClass('disabled')) return false;
        let button = $(this).data('button');
        if ($(`#button-${button}`).hasClass('disabled')) return false;
        let input = $('#cash-out-value-' + button);
        PlaySound(3, 'Button');
        let step = 1; //parseFloat(input.data('step'));
        let val = parseFloat(input.val());
        let m = 1;
        if (val <= 2) {
          step /= 10;
          m = 10;
        } else if (val <= 10 * step) {
        } else if (val <= 50 * step) {
          step *= 5;
          m = 5;
        } else if (val <= 100 * step) {
          step *= 10;
          m = 10;
        } else {
          step *= 100;
          m = 100;
        }
        val -= step;
        val = parseFloat(val.toFixed(2));
        val = Math.floor(val * m) / m;
        val = Math.max(board.minAutoCashOut, val);
        val = Math.min(board.maxAutoCashOut, val);
        input.val(val.toFixed(2));
        inputCurrency(input);
      }
    );
    $(document).on(
      clickEvent,
      '.bet-input.cash-out .plus',
      function () {
        if ($(this).hasClass('disabled')) return false;
        let button = $(this).data('button');
        if ($(`#button-${button}`).hasClass('disabled')) return false;
        let input = $('#cash-out-value-' + button);
        PlaySound(7, 'Button');
        let step = 1; //parseFloat(input.data('step'));
        let val = parseFloat(input.val());
        let m = 1;
        if (val < 2) {
          step /= 10;
          m = 10;
        } else if (val < 10 * step) {
        } else if (val < 50 * step) {
          step *= 5;
          m = 5;
        } else if (val < 100 * step) {
          step *= 10;
          m = 10;
        } else {
          step *= 100;
          m = 100;
        }
        val += step;
        val = parseFloat(val.toFixed(2));
        val = Math.floor(val * m) / m;
        val = Math.min(board.maxAutoCashOut, val);
        input.val(val.toFixed(2));
        inputCurrency(input);
      }
    );
    $(document).on(
      clickEvent,
      '.bet-input .auto .checkbox span',
      function () {
        PlaySound(9, 'Tab');
      }
    );
    $(document).on(
      clickEvent,
      '.chat .arrow',
      function () {
        $('#right').toggleClass('chat-active');
        $('.chat-message').scrollTop($('.chat-message')[0].scrollHeight);
      }
    );
    $(document).on(
      clickEvent,
      '#send-chat',
      function () {
        SendChatMessage();
        $('#send-chat').removeClass('active');
      }
    );
    $('#chat-message').keyup(
      function (e) {
        if ($('#chat-message').val() === '') {
          $('#send-chat').removeClass('active');
        } else {
          $('#send-chat').addClass('active');
        }
        if (e.which === 13) {
          e.preventDefault();
          $('#send-chat').removeClass('active');
          SendChatMessage();
        }
      }
    );
    $(document).on(
      clickEvent,
      '.balance-bt',
      function () {
        PostCustomEvent(token, 'return.balance');
        $('.balance-popup-bg').remove();
        $('#body').append('<div class="balance-popup-bg"></div>');
        $('.balance-bt').addClass('active');
        $('#updatepanelbalance').css('z-index', 2000);
      }
    );
    $(document).on(
      clickEvent,
      '#balance',
      function () {
        window.top.postMessage('openCashier', '*');
      }
    );
    $('#BtnShowBalance').hover(
      function () {
        $('#hover-balance').addClass('hover')
      },
      function () {
        $('#hover-balance').removeClass('hover')
      }
    );
    board.stopUrl = $('#stopUrl').val();
    if (board.stopUrl !== '') {
      $('.stop-button').attr('href', board.stopUrl).css('display', 'block');
    }
  }
);
$(window).on('resize', function (e) {
  canvasResize();
});
$(document).keydown(
  function (e) {
    if (e.which === 122) {
      e.preventDefault();
      //$('.fullscreen-bt').trigger(clickEvent);
      return false;
    }
  }
);
window.addEventListener(
  'message',
  function (event) {
    if (event.data === 'update.balance') {
      PostCustomEvent(token, 'update.balance');
    } else if (event.data.name === 'jackpot-size') {
      let height = event.data.height;
      $('iframe#jackpotCounter').css('height', height);
    } else if (event.data === 'mobile-desktop') {
      $('body').addClass('mobile-desktop');
      mobileDesktop = true;
    } else if (event.data.name === 'promotion-icon-show') {
      jetX.promotionIconVisible = true;
      jetX.promotionIconShow();
    } else if (event.data.name === 'promotion-leaderboard-icon-show') {
      $('.promotion-dailyleaderboard-button').fadeIn(0)
    } else if (event.data.name === 'promotion-wheel-icon-show') {
      $('.promotion-wheel-button').fadeIn(0)
    } else if (event.data.name === 'jurisdiction-name') {
      $('body').addClass(event.data.value);
    } else {
      try {
        eval(event.data);
      } catch (e) {
      }
    }
  }
);
window.addEventListener(
  'wheel',
  function (e) {
    parent.postMessage({
      'action': 'scroll',
      'deltaY': e.deltaY
    }, '*');
  }
);
function GetGameVersion() {
  const GAME_VERSION = $('#Version').val();
  return GAME_VERSION;
}
function resizeBalanceIframe(width, height) {
}
function closeBalanceIframe() {
  PostCustomEvent(token, 'update.balance');
  $('#balance-iframe').parent().html('');
  $('.balance-bt').removeClass('active');
  $('.balance-popup-bg').remove();
  $('#updatepanelbalance').css('z-index', 4);
}
$(
  function () {
    let defaultText = '';
    let currency = 1;
    $(this).next('span').css('left', 17 * currency + 'px');
    $('input.inp').focus(
      function () {
        defaultText = $(this).val();
        $(this).val('');
        $(this).next('span').hide();
      }
    );
    $('input.inp').change(function () {
      defaultText = $(this).val();
    });
    $('input.inp').focusout(function () {
      setInputValue($(this).attr('id'), defaultText);
    });
    $('input.inp').each(
      function () {
        if ($(this).data('maxbet') !== undefined) {
          let maxBet = parseFloat($(this).data('maxbet'));
          if (maxBet > 999999) $(this).parent().addClass('big');
        }
        $(this).trigger('change');
        $(this).trigger('focusout');
      }
    );
  }
);
function inputCurrency(el) {
  let inputWidth = el.textWidth();
  let left = parseFloat(el.css('left').replace('px', ''));
  let marginLeft = parseFloat(el.css('margin-left').replace('px', ''));
  let paddingLeft = parseFloat(el.css('padding-left').replace('px', ''));
  if (document.dir === 'rtl') {
    inputWidth = parseFloat(el.width()) + left - inputWidth - el.next('span').textWidth() - 2;
  } else {
    inputWidth += left + marginLeft + paddingLeft + 2;
  }
  el.next('span').css('left', inputWidth + 'px');
  if (!mobile) el.next('span').show();
  let value = parseFloat(el.val());
  let minBet = el.data('minbet') !== undefined ? parseFloat(el.data('minbet')) : board.minAutoCashOut;
  let maxBet = el.data('maxbet') !== undefined ? parseFloat(el.data('maxbet')) : board.maxAutoCashOut;
  if (value <= minBet) {
    el.parent().find('.minus').addClass('disabled');
    //el.val(minBet);
  } else {
    el.parent().find('.minus').removeClass('disabled');
  }
  if (value >= maxBet) {
    el.parent().find('.plus').addClass('disabled');
    //el.val(maxBet);
  } else {
    el.parent().find('.plus').removeClass('disabled');
  }
}
$.fn.textWidth = function (text, font) {
  if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
  $.fn.textWidth.fakeEl.text(text || this.val() || this.text() || this.attr('placeholder')).css('font', font || this.css('font'));
  return $.fn.textWidth.fakeEl.width();
};
$(document).on(
  'keypress',
  'input[type=number]',
  function (e) {
    // if(
    //     (e.which !== 46 || $(this).val().indexOf('.') !== -1 || $(this).val().indexOf(',') !== -1) &&
    //     (e.which !== 44 || $(this).val().indexOf('.') !== -1 || $(this).val().indexOf(',') !== -1) &&
    //     e.which > 31 &&
    //     (e.which < 48 || e.which > 57) &&
    //     //e.which !== 37 &&
    //     //e.which !== 38 &&
    //     //e.which !== 39 &&
    //     //e.which !== 40 &&
    //     //e.which !== 41 &&
    //     //e.which !== 43 &&
    //     //e.which !== 45 &&
    //     //e.which !== 58 &&
    //     //e.which !== 95 &&
    //     e.which !== 0 &&
    //     e.which !== 8
    // ) {
    //     return false;
    // }
    const keyCode = e.keyCode ||
      e.which;
    const keyValue = String.fromCharCode(keyCode);
    const isValidInput = /^[-\d.]$/.test(keyValue);
    if (!isValidInput) {
      e.preventDefault();
    }
    let inputValue = e.target.value + keyValue;
    if (e.target.value === '0' && (e.which !== 46 && e.which !== 44)) {
      inputValue = e.target.value + '.' + keyValue;
      e.target.value = inputValue;
      e.preventDefault();
    }
    const isValidFloat = /^(?!0\d)\d*(\.\d+)?$/.test(inputValue);
    if (e.which !== 46 && e.which !== 44 && !isValidFloat) {
      e.preventDefault();
    }
  }
);
$('input[type=number]').on(
  'paste',
  function (event) {
    if (
      event.originalEvent.clipboardData.getData('Text').match(/[^\d]/)
    ) {
      event.preventDefault();
    }
  }
);
$(document).on(
  'keydown',
  'input[type=number]',
  function (e) {
    if (
      e.target.id === 'cash-out-value-0' ||
      e.target.id === 'cash-out-value-1'
    ) {
      const keyCode = e.keyCode ||
        e.which;
      let inputValue = e.target.value + '';
      if (
        inputValue.length >= 6 &&
        keyCode !== 8 &&
        keyCode !== 46 &&
        keyCode !== 37 &&
        keyCode !== 39
      ) {
        e.preventDefault();
      }
    }
  }
);
$('input[type=number]').on(
  'paste',
  function (event) {
    if (
      event.originalEvent.clipboardData.getData('Text').match(/[^\d]/)
    ) {
      event.preventDefault();
    }
  }
);
let workerTime = $('#workerTime').length > 0 ? $('#workerTime').val() : 200;
let workerCode = `
    self.onmessage = function (event) {
        if (event.data === 'start') {
            setInterval(function () {
                self.postMessage('completed');
            }, 
${workerTime});
        }
    };

`;
let blob = new Blob([workerCode], {
  type: 'application/javascript'
});
let workerUrl = URL.createObjectURL(blob);
let worker = new Worker(workerUrl);
worker.onmessage = function (event) {
  window.hub.server.timerPing(window.token);
};
function timerPing() {
  worker.postMessage('start');
}// Hub START
let hubLoaded = false;
let boardLoaded = false;
function hubGetList() {
  hubLoaded = true;
  if (hubLoaded && boardLoaded) {
    window.hub.server.getList().then(x => playersInfo(x));
  }
}
window.hub.client.gBoard = (gameInfo) => {
  PlayerInfo(token);
  let activeAutolayButtons = 0;
  let giftBet = $('#bet-2').hasClass('cancel-bet') ||
    $('#bet-2').hasClass('cash-out') ||
    $('#bet-3').hasClass('cancel-bet') ||
    $('#bet-3').hasClass('cash-out');
  if (!player.disableCashGame && !giftBet) {
    for (let i = 0; i < 2; i++) {
      if ($('#auto-bet-' + i).is(':checked')) {
        activeAutolayButtons++;
        if ($('#bet-' + i).hasClass('place-bet')) {
          gameEvent.autoPlayStarted();
          autoBetTrigger[i] = false;
          $('#bet-' + i).trigger(clickEvent);
        }
      }
    }
  }
  if (activeAutolayButtons == 0) {
    gameEvent.autoPlayStoped();
  }
  jetX.newGame();
  jetX.tabLastGraphicValue = 1;
  graphicValue = 1;
  jetX.game.loader = true;
  playersCashOut = [];
  window.jetXReact.setCashOut([], 0, 0);
  document.getElementById('playersCashOut').innerHTML = '';
  document.getElementById('playersCashOut').style.height = '0';
  document.getElementById('playersCashOut').style.paddingTop = '0';
};
let response = {
  start: true
};
let graphicValue;
let graphicStep;
let currentSpinInfo = {
  SpinTime: '',
  Coefficient: 0,
  SpinHash: '',
  Info: '',
};
window.hub.client.response = (info) => {
  info = JSON.parse(info);
  if (response.start) {
    response.start = false;
    PlayerInfo(token);
    currentSpinInfo = {
      SpinTime: GetCaption('jetx.board.hash.time'),
      Coefficient: GetCaption('jetx.board.hash.value'),
      SpinHash: info.SpinHash,
      Info: GetCaption('jetx.board.hash.info'),
    };
    addCurrentSpin();
  }
  let isFinnished = info.IsFinnished;
  let value = info.Value;
  graphicValue = info.GraphicValue;
  let step = info.Step;
  let degree = info.Degree;
  graphicStep = step;
  jetX.planeMove(value, graphicValue, step, degree);
  if (value >= board.maxCashoutCoeff) {
    jetX.showMaxMultiplier();
  }
  if (isFinnished) {
    jetX.tabLastGraphicValue = 1;
    graphicValue = 1;
    jetX.boom(value);
    updateBalanceBoom = true;
    //playersFinish();
    currentSpinInfo.Coefficient = value;
    history.last100Spins = [
      ...[
        currentSpinInfo
      ],
      ...history.last100Spins
    ];
    removeCurrentSpin();
    last100Spins();
  } else {
    jetX.fly();
    currentSpinInfo = {
      SpinTime: GetCaption('jetx.board.hash.time'),
      Coefficient: GetCaption('jetx.board.hash.value'),
      SpinHash: info.SpinHash,
      Info: GetCaption('jetx.board.hash.info'),
    };
    setCurrentSpin(value);
  }
};
window.hub.client.getChanges = (updateInfo) => {
  updateInfo = JSON.parse(updateInfo);
  if (updateInfo.command === 'cashout') {
    playerCashOut(updateInfo.info);
  } else if (updateInfo.command === 'undo') {
    playerUndo(updateInfo.info);
  } else if (updateInfo.command === 'bet') {
    if (jetX.finish) {
      jetX.finish = false;
      playersFinish();
      playersClear();
    }
    playerBet(updateInfo.info);
  }
  if (updateInfo.info.counterId === player.counterId) PlayerInfo(token);
};
// Hub END
// Chat START
let chatVersion = 0;
let reloadVersion = 0;
function LoadChatMessages() {
  let chatMessageUrl = urlHolder.Chat.MessagesUrl + '/' + token + '?currentVersion=' + chatVersion + '&reloadVersion=' + reloadVersion;
  $.get(
    chatMessageUrl,
    function (data) {
      HideInternetLost();
      AddChatMessages(data);
    }
  ).fail(
    function (jqXHR, textStatus, errorThrown) {
      OnRequestFail(jqXHR, textStatus, errorThrown, null);
    }
  );
}
function AddChatMessages(data) {
  let newVersion = data[0];
  let messages = data[1];
  let newReloadVersion = data[2];
  if (newReloadVersion != reloadVersion) {
    $('.chat-message').html('');
  }
  if (messages !== null) {
    for (let index = 0; index < messages.length; index++) {
      let message = messages[index];
      let chatMessage = '<div class="chat-outer">'
        + ' <div class="chat-date">' + message.SendTimeParsed + '</div>'
        + ' <div class="chat-user">' + formatClientName(message.SenderName) + ':</div>'
        + ' <div class="chat-text">' + message.Message + '</div>'
        + '</div>';
      $('.chat-message').append(chatMessage);
      $('.chat-message').scrollTop($('.chat-message')[0].scrollHeight);
    }
    chatVersion = newVersion;
    reloadVersion = newReloadVersion;
  }
}
function SendChatMessage() {
  let message = $('#chat-message').val();
  if (message !== undefined && message !== null && message !== '') {
    let chatMessageUrl = urlHolder.Chat.SendMessageUrl + '/' + token;
    $.post(
      chatMessageUrl,
      new ChatMessage(message),
      function (data) {
        LoadChatMessages();
      }
    );
  }
  $('#chat-message').val('');
}
function ChatMessage(message) {
  this.Message = message;
}// Chat END
let game = null;
let gameInfo = {
  url: {
    sound: '../../Content/SoundLight/',
    image: '../../Content/ImagesLight/',
    spine: '../../Content/ImagesLight/Spine/',
    sprite: '../../Content/ImagesLight/Sprite/',
  },
  name: '',
  type: '',
  mobile: false,
  width: 1410,
  height: 689,
  paddingLeft: 0,
  marginLeft: 0,
  scale: 1,
  resourceLoaded: false,
  startView: true,
  doubleView: false,
  bonusView: false,
  superBonusView: false,
  freeSpinView: false,
  giftView: false,
  helpView: false,
  missionView: false,
  fps: {
    label: null,
    text: 'FPS: --',
    zOrder: 100,
    x: 70,
    y: 70,
    style: {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: [
        '#FFF'
      ]
    }
  },
};
//let skinName = getParentParameterByName('Skin') !== '' ? getParentParameterByName('Skin') : getParameterByName('Skin');
let skinName = getParameterByName('Skin');
let skinUrl = '';
let skinList = [];
let garageY = 0;
let skinColor = '';
let logoWidth = 105;
if (skinName !== '') {
  skinUrl = `Skins/${skinName}`;
  skinList = [
    'AirBalloon1',
    'AirBalloon2',
    'Airport',
    'Garage',
    'Plane',
    'PlaneWheel1',
    'PlaneWheel2',
    'CoefficientGreen',
    'CoefficientRed',
    'LoaderLogo',
    'Planet0',
    'Planet1',
    'Planet2',
    'Planet3',
    'Planet4',
    'Planet5',
    'Planet6',
    'Planet7',
    'Planet8',
    'Planet9',
    'Planet10',
    'Planet11',
    'Planet12',
    'Planet13',
    'Planet14',
    'Planet15',
    'Planet16',
    'Planet17',
    'Planet18',
    'Planet19',
    'Planet20',
    'Planet21',
    'Planet22',
    'Sprite-Loader',
    'Sprite-Parachute0',
    'Sprite-Parachute1',
    'Sprite-Spaceman0',
    'Sprite-Spaceman1'
  ];
  //, 'Clouds1', 'Clouds2', 'Fence', 'Ocean', 'Ozone', 'Road', 'Stars', 'StarsWhite'
  garageY = - 65;
  if (skinName === 'IMJBet') {
    skinColor = '#c8de17';
    logoWidth = 105;
  } else if (skinName === 'Perabet') {
    skinColor = '#28bc62';
    logoWidth = 105;
  } else if (skinName === 'Cbet') {
    skinColor = '#00be7c';
    logoWidth = 105;
  } else if (skinName === 'Favbet') {
    skinColor = '#fd267e';
    logoWidth = 110;
  } else if (skinName === 'Marsbet') {
    skinColor = '#c52426';
    logoWidth = 117;
  } else if (skinName === 'HarifJet') {
    skinColor = '#db7e3a';
    logoWidth = 105;
  } else if (skinName === 'RedX') {
    skinColor = '#c3072a';
    logoWidth = 106;
  } else if (skinName === 'VenusJet') {
    skinColor = '#f8b218';
    logoWidth = 211;
  } else if (skinName === 'PiaJet') {
    skinColor = '#2667c3';
    logoWidth = 155;
  } else if (skinName === 'ElexJet') {
    skinColor = '#fffc00';
    logoWidth = 202;
  } else if (skinName === 'TulipJet') {
    skinColor = '#f6d98b';
    logoWidth = 160;
  } else if (skinName === 'JetXCup') {
    skinColor = '#ffa800';
    logoWidth = 113;
  } else if (skinName === 'FogueteX') {
    skinColor = '#d7fc56';
    logoWidth = 140;
  } else if (skinName === 'VevoJet') {
    skinColor = '#fbca02';
    logoWidth = 158;
  } else if (skinName === 'KTOJet') {
    skinColor = '#fad749';
    logoWidth = 105;
  } else if (skinName === 'MeskJet') {
    skinColor = '#723b96';
    logoWidth = 215;
  } else if (skinName === 'JojoX') {
    skinColor = '#f4c300';
    logoWidth = 91;
  } else if (skinName === 'KlasJet') {
    skinColor = '#28894e';
    logoWidth = 175;
  } else if (skinName === 'JetMilbet') {
    skinColor = '#27ae60';
    logoWidth = 215;
  } else if (skinName === 'SafirJet') {
    skinColor = '#6699ff';
    logoWidth = 177;
  } else if (skinName === 'JetVera') {
    skinColor = '#1985a1';
    logoWidth = 230;
  } else if (skinName === 'BetperJet') {
    skinColor = '#f3ec19';
    logoWidth = 220;
  } else if (skinName === 'JetHeybet') {
    skinColor = '#ffcb00';
    logoWidth = 193;
  } else if (skinName === 'SavoyJet') {
    skinColor = '#d5a564';
    logoWidth = 172;
  } else if (skinName === 'MostX') {
    skinColor = '#fb4d00';
    logoWidth = 144;
  } else if (skinName === 'HitbetJet') {
    skinColor = '#f1d50a';
    logoWidth = 143;
  } else if (skinName === 'FenomenJet') {
    skinColor = '#ffc700';
    logoWidth = 204;
  } else if (skinName === 'BetParkJet') {
    skinColor = '#10815f';
    logoWidth = 101;
  } else if (skinName === 'GarantiX') {
    skinColor = '#62af28';
    logoWidth = 119;
  } else if (skinName === 'GoraJet') {
    skinColor = '#2ecc71';
    logoWidth = 158;
  } else if (skinName === 'JetUp') {
    skinColor = '#ff2400';
    logoWidth = 88;
  } else if (skinName === 'JetRest') {
    skinColor = '#b72221';
    logoWidth = 160;
  } else if (skinName === 'LidyaJet') {
    skinColor = '#3da2ef';
    logoWidth = 141;
  } else if (skinName === 'JetBetpas') {
    skinColor = '#5eb220';
    logoWidth = 214;
  } else if (skinName === 'MatJet') {
    skinColor = '#fddf56';
    logoWidth = 185;
  } else if (skinName === 'JasminX') {
    skinColor = '#ffa20e';
    logoWidth = 139;
  } else if (skinName === 'InterJetX') {
    skinColor = '#d81f27';
    logoWidth = 159;
  } else if (skinName === 'Holiganbet') {
    skinColor = '#fdc440';
    logoWidth = 81;
  } else if (skinName === 'Mybookie') {
    skinColor = '#ec8825';
    logoWidth = 76;
  } else if (skinName === 'Tipobet') {
    skinColor = '#129d48';
    logoWidth = 182;
  } else if (skinName === 'WildX') {
    skinColor = '#10cc66';
    logoWidth = 101;
  } else if (skinName === 'Vbet') {
    skinColor = '#d80d83';
    logoWidth = 84;
  } else if (skinName === 'Parimatch') {
    skinColor = '#f8ff13';
    logoWidth = 103;
  } else if (skinName === '1Win') {
    skinColor = '#2d81ff';
    logoWidth = 105;
  } else if (skinName === 'MrBahisJet') {
    skinColor = '#07be5e';
    logoWidth = 203;
  } else if (skinName === 'HipodromJet') {
    skinColor = '#daac5e';
    logoWidth = 171;
  } else if (skinName === 'OnwinX') {
    skinColor = '#bb10a3';
    logoWidth = 146;
  } else if (skinName === 'SahaX') {
    skinColor = '#008000';
    logoWidth = 89;
  } else if (skinName === 'BetX') {
    skinColor = '#3fb26e';
    logoWidth = 124;
  } else if (skinName === 'JetBeluga') {
    skinColor = '#137272';
    logoWidth = 176;
  } else if (skinName === 'JetLiman') {
    skinColor = '#cd9546';
    logoWidth = 144;
  } else if (skinName === 'JetHayal') {
    skinColor = '#d99226';
    logoWidth = 176;
  } else if (skinName === 'Grandpashabet') {
    skinColor = '#fdff79';
    logoWidth = 193;
  } else if (skinName === 'Betwinner') {
    skinColor = '#ffce06';
    logoWidth = 105;
  } else if (skinName === 'OleyX') {
    skinColor = '#b60b14';
    logoWidth = 110;
  } else if (skinName === 'BestbetJetX') {
    skinColor = '#c22b3c';
    logoWidth = 104;
  } else if (skinName === 'KolayX') {
    skinColor = '#f2be1a';
    logoWidth = 136;
  } else if (skinName === '4RABet') {
    skinColor = '#3486e3';
    logoWidth = 113;
  } else if (skinName === 'Rajabets') {
    skinColor = '#ffb900';
    logoWidth = 105;
  } else if (skinName === 'Bet7k') {
    skinColor = '#adc90e';
    logoWidth = 146;
  } else if (skinName === 'JetPix') {
    skinColor = '#f7ef22';
    logoWidth = 109;
  } else if (skinName === 'VGBet') {
    skinColor = '#0b9ca7';
    logoWidth = 102;
  } else if (skinName === 'Doradobet') {
    skinColor = '#d59c00';
    logoWidth = 103;
  } else if (skinName === 'Ecuabet') {
    skinColor = '#ffde00';
    logoWidth = 103;
  } else if (skinName === 'TexyBet') {
    skinColor = '#f46b00';
    logoWidth = 103;
  } else if (skinName === 'Brxbet') {
    skinColor = '#22b573';
    logoWidth = 103;
  } else if (skinName === 'CassinoPix') {
    skinColor = '#0075cd';
    logoWidth = 103;
  } else if (skinName === 'Bullsbet') {
    skinColor = '#6acb47';
    logoWidth = 103;
  }
  document.documentElement.style.setProperty('--main-color', skinColor);
  document.documentElement.style.setProperty('--tab-color', skinColor);
  document.documentElement.style.setProperty('--user-color', skinColor);
  document.documentElement.style.setProperty(
    '--logo',
    `url(../Images/${skinUrl}${mobile ? '/Mobile' : ''}/logo.png)`
  );
  document.documentElement.style.setProperty('--help2', `url(../Images/${skinUrl}/help2.png)`);
  document.documentElement.style.setProperty('--help-down', `url(../Images/${skinUrl}/help-down.png)`);
  document.documentElement.style.setProperty('--help-up', `url(../Images/${skinUrl}/help-up.png)`);
  if (!mobile) {
    window.parent.postMessage({
      name: 'jetx-logo-width',
      left: (logoWidth - 105)
    }, '*');
    $('.promotion-button').css('left', (145 + (logoWidth - 105)));
    window.addEventListener(
      'message',
      function (event) {
        let message = event.data;
        if (message.name !== undefined) {
          if (message.name === 'promotion-icon-show') {
            window.parent.postMessage({
              name: 'jetx-logo-width',
              left: (logoWidth - 105)
            }, '*');
          }
        }
      }
    )
  } else {
    $('header .logo').css('width', `${logoWidth * (23 / 40)}px`)
  }
}
let gameSoundResource = {};
let gameSounds = {};
let gameImageResource = {};
let gameImageSpriteResource = {};
let gameImage = {};
let gameContainer = {};
let gameText = {};
let gameTextVertical = {};
let gameSprite = {};
let gameSpriteResource = {}
let gameSpines = {};
function ContainerSettings(x, y, zOrder, parent) {
  this.x = x;
  this.y = y;
  this.zOrder = zOrder;
  this.parent = parent;
  this.container = null;
}
gameContainer.Layer = new ContainerSettings(0, 0, 1, null);
gameContainer.Popup = new ContainerSettings(0, 0, 50, 'Layer');
gameContainer.Background = new ContainerSettings(0, 0, 1, 'Layer');
gameContainer.PlaneParent = new ContainerSettings(0, 0, 2, 'Layer');
gameContainer.Plane = new ContainerSettings(0, 0, 2, 'PlaneParent');
gameContainer.Graphic = new ContainerSettings(0, 0, 10, 'Layer');
gameContainer.Loader = new ContainerSettings(0, 0, 20, 'Layer');
gameContainer.MaxMultiplier = new ContainerSettings(0, 0, 21, 'Layer');
gameContainer.ConnectionLost = new ContainerSettings(0, 0, 30, 'Layer');
let loadFromSprite = false;
gameImageResource = {
  AirBalloon1: {
    url: 'Canvas/AirBalloon1.png',
    Texture: null,
    sprite: loadFromSprite
  },
  AirBalloon2: {
    url: 'Canvas/AirBalloon2.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Airport: {
    url: 'Canvas/Airport.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Clouds1: {
    url: 'Canvas/Clouds1.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Clouds2: {
    url: 'Canvas/Clouds2.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Fence: {
    url: 'Canvas/Fence.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Garage: {
    url: 'Canvas/Garage.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Ocean: {
    url: 'Canvas/Ocean.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Ozone: {
    url: 'Canvas/Ozone.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Plane: {
    url: 'Canvas/Plane.png',
    Texture: null,
    sprite: loadFromSprite
  },
  PlaneWheel1: {
    url: 'Canvas/PlaneWheel1.png',
    Texture: null,
    sprite: loadFromSprite
  },
  PlaneWheel2: {
    url: 'Canvas/PlaneWheel2.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Road: {
    url: 'Canvas/Road.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Stars: {
    url: 'Canvas/Stars.png',
    Texture: null,
    sprite: loadFromSprite
  },
  StarsWhite: {
    url: 'Canvas/StarsWhite.png',
    Texture: null,
    sprite: loadFromSprite
  },
  LoaderLogo: {
    url: 'Canvas/LoaderLogo.png',
    Texture: null,
    sprite: loadFromSprite
  },
  MaxMultiplier: {
    url: 'Canvas/MaxMultiplier.png',
    Texture: null,
    sprite: loadFromSprite
  },
  CoefficientGreen: {
    url: 'Canvas/CoefficientGreen.png',
    Texture: null,
    sprite: loadFromSprite
  },
  CoefficientRed: {
    url: 'Canvas/CoefficientRed.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet0: {
    url: 'Canvas/Planet/0.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet1: {
    url: 'Canvas/Planet/1.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet2: {
    url: 'Canvas/Planet/2.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet3: {
    url: 'Canvas/Planet/3.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet4: {
    url: 'Canvas/Planet/4.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet5: {
    url: 'Canvas/Planet/5.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet6: {
    url: 'Canvas/Planet/6.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet7: {
    url: 'Canvas/Planet/7.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet8: {
    url: 'Canvas/Planet/8.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet9: {
    url: 'Canvas/Planet/9.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet10: {
    url: 'Canvas/Planet/10.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet11: {
    url: 'Canvas/Planet/11.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet12: {
    url: 'Canvas/Planet/12.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet13: {
    url: 'Canvas/Planet/13.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet14: {
    url: 'Canvas/Planet/14.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet15: {
    url: 'Canvas/Planet/15.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet16: {
    url: 'Canvas/Planet/16.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet17: {
    url: 'Canvas/Planet/17.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet18: {
    url: 'Canvas/Planet/18.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet19: {
    url: 'Canvas/Planet/19.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet20: {
    url: 'Canvas/Planet/20.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet21: {
    url: 'Canvas/Planet/21.png',
    Texture: null,
    sprite: loadFromSprite
  },
  Planet22: {
    url: 'Canvas/Planet/22.png',
    Texture: null,
    sprite: loadFromSprite
  },
};
gameSpriteResource = {
  'Sprite-Boom': {
    spriteName: 'Boom',
    url: 'Boom.json'
  },
  'Sprite-Comet': {
    spriteName: 'Comet',
    url: 'Comet.json'
  },
  'Sprite-ConnectionLost': {
    spriteName: 'ConnectionLost',
    url: 'ConnectionLost.json'
  },
  'Sprite-Fire1': {
    spriteName: 'Fire1',
    url: 'Fire1.json'
  },
  'Sprite-Fire2': {
    spriteName: 'Fire2',
    url: 'Fire2.json'
  },
  'Sprite-Fire3': {
    spriteName: 'Fire3',
    url: 'Fire3.json'
  },
  'Sprite-Fire4': {
    spriteName: 'Fire4',
    url: 'Fire4.json'
  },
  'Sprite-Loader': {
    spriteName: 'Loader',
    url: 'Loader.json'
  },
  'Sprite-LoaderWindow-0': {
    spriteName: 'LoaderWindow',
    url: 'LoaderWindow-0.json'
  },
  'Sprite-LoaderWindow-1': {
    spriteName: 'LoaderWindow',
    url: 'LoaderWindow-1.json'
  },
  'Sprite-Parachute0': {
    spriteName: 'Parachute0',
    url: 'Parachute0.json'
  },
  'Sprite-Parachute1': {
    spriteName: 'Parachute1',
    url: 'Parachute1.json'
  },
  'Sprite-Spaceman0': {
    spriteName: 'Spaceman0',
    url: 'Spaceman0.json'
  },
  'Sprite-Spaceman1': {
    spriteName: 'Spaceman1',
    url: 'Spaceman1.json'
  },
};
gameSprite = {
  'Boom': {
    textures: [],
    x: 426,
    y: 127,
    zOrder: 10,
    scale: 1,
    sprite: null
  },
  'Comet': {
    textures: [],
    x: 426,
    y: 127,
    zOrder: 10,
    scale: 1,
    sprite: null
  },
  'ConnectionLost': {
    textures: [],
    x: 580,
    y: 280,
    zOrder: 100,
    scale: 1,
    sprite: null
  },
  'Fire1': {
    textures: [],
    x: 174,
    y: 62,
    zOrder: 1,
    scale: 1,
    sprite: null
  },
  'Fire2': {
    textures: [],
    x: 191,
    y: 40,
    zOrder: 1,
    scale: 1,
    sprite: null
  },
  'Fire3': {
    textures: [],
    x: 197,
    y: 56,
    zOrder: 1,
    scale: 1,
    sprite: null
  },
  'Fire4': {
    textures: [],
    x: 269,
    y: 77,
    zOrder: 1,
    scale: 1,
    sprite: null
  },
  'Loader': {
    textures: [],
    x: 486,
    y: 277,
    zOrder: 2,
    scale: 1,
    sprite: null
  },
  'LoaderWindow': {
    textures: [],
    x: - 2,
    y: - 1,
    zOrder: 1,
    scale: 1,
    sprite: null
  },
  'Parachute0': {
    textures: [],
    x: - 50,
    y: - 50,
    zOrder: 100,
    scale: 1,
    sprite: null
  },
  'Parachute1': {
    textures: [],
    x: - 50,
    y: - 50,
    zOrder: 100,
    scale: 1,
    sprite: null
  },
  'Spaceman0': {
    textures: [],
    x: - 50,
    y: 150,
    zOrder: 100,
    scale: 1,
    sprite: null
  },
  'Spaceman1': {
    textures: [],
    x: - 50,
    y: 150,
    zOrder: 100,
    scale: 1,
    sprite: null
  },
};
gameText = {
  graphicValue: {
    label: null,
    text: '0.00',
    zOrder: 1,
    x: 791,
    y: 303,
    style: {
      fontFamily: 'robotobold',
      fontSize: 120,
      fill: [
        '#5ee32b'
      ],
      align: 'right'
    }
  },
  loading: {
    label: null,
    text: GetCaption('jetx.board.progress'),
    zOrder: 10,
    x: 705,
    y: 390,
    style: {
      fontFamily: 'CrystalUni-Medium',
      fontSize: 20,
      fill: [
        'rgba(255,255,255,0.8)'
      ],
      align: 'center',
      letterSpacing: 1.2
    }
  },
  connectionLost: {
    label: null,
    text: GetCaption('jetx.board.connection.lost'),
    zOrder: 10,
    x: 705,
    y: 380,
    style: {
      fontFamily: 'CrystalUni-Regular',
      fontSize: 16,
      fill: [
        'rgba(255,255,255,0.6)'
      ],
      align: 'center'
    }
  },
  maxMultiplier: {
    label: null,
    text: '0.00',
    zOrder: 1,
    x: 871,
    y: 288,
    style: {
      fontFamily: 'robotobold',
      fontSize: 117,
      fill: [
        '#5ee32b'
      ],
      align: 'right'
    }
  },
  maxMultiplierLabel: {
    label: null,
    text: GetCaption('jetx.board.max.multiplier'),
    zOrder: 1,
    x: 720,
    y: 408,
    style: {
      fontFamily: 'CrystalUni-Bold',
      fontSize: 29,
      fill: [
        '#ffdd14'
      ],
      align: 'center'
    }
  },
};
if (mobile) {
  gameInfo.width /= 2;
  gameInfo.height /= 2;
  gameText.graphicValue.x /= 2;
  gameText.graphicValue.y /= 2;
  gameText.graphicValue.x += 28;
  gameText.graphicValue.y -= 25;
  //gameText.graphicValue.style.fontSize /= 2;
  gameText.graphicValue.style.fontSize = 95;
  // gameText.graphicValue.x /= 2;
  // gameText.graphicValue.y /= 2;
  // gameText.graphicValue.x += 25;
  // gameText.graphicValue.y -= 47;
  // //gameText.graphicValue.style.fontSize /= 2;
  // gameText.graphicValue.style.fontSize = 120;
  gameText.connectionLost.x /= 2;
  gameText.connectionLost.y /= 2;
  gameText.connectionLost.style.fontSize /= 2;
}
function JetXClass() {
  this.tabActive = true;
  this.tabLastGraphicValue = 1;
  this.imageScale = mobile ? 2 : 1;
  this.gameScale = mobile ? 0.5 : 1;
  this.init = function () {
    this.drawConnectionLost();
    this.drawLoader();
    this.drawMaxMultiplier();
    this.drawCoefficient();
    this.drawItems();
    this.drawPlane();
    this.promotionIcon();
  };
  this.connectionLost = {
    container: null,
  };
  // ConnectionLost START
  this.drawConnectionLost = function () {
    let connectionLostBackground = new PIXI.Graphics();
    connectionLostBackground.beginFill(0, 0.8);
    connectionLostBackground.drawRect(0, 0, gameInfo.width, gameInfo.height);
    connectionLostBackground.zOrder = 1;
    gameContainer.ConnectionLost.container.addChild(connectionLostBackground);
    this.connectionLost.container = new PIXI.Container();
    this.connectionLost.container.x = 0;
    this.connectionLost.container.y = 0;
    this.connectionLost.container.zOrder = 2;
    gameContainer.ConnectionLost.container.addChild(this.connectionLost.container);
    let sprite;
    sprite = gameSprite['ConnectionLost'];
    let connectionLost = this.returnSprite(
      'ConnectionLost',
      {
        container: this.connectionLost.container,
        x: sprite.x * this.gameScale,
        y: sprite.y * this.gameScale,
        zOrder: sprite.zOrder,
        scale: sprite.scale * this.gameScale,
        align: 'left',
        verticalAlign: 'top',
        visible: true
      }
    );
    connectionLost.loop = true;
    connectionLost.gotoAndPlay(0);
    this.drawText('connectionLost', {
      container: this.connectionLost.container
    });
    gameText.connectionLost.label.text = GetCaption('jetx.board.connection.lost');
    gameContainer.ConnectionLost.container.visible = false;
  };
  this.showInternetLost = function () {
    if (!gameInfo.resourceLoaded) return false;
    if (!gameContainer.ConnectionLost.container.visible) {
      gameContainer.ConnectionLost.container.visible = true;
      for (let i = 0; i < 2; i++) {
        $(`#auto-bet-${i}`).prop('checked', false);
        $(`#auto-cash-out-${i}`).prop('checked', false);
      }
    }
  };
  this.hideInternetLost = function () {
    if (!gameInfo.resourceLoaded) return false;
    if (gameContainer.ConnectionLost.container.visible) {
      PlayerInfo(token);
      gameContainer.ConnectionLost.container.visible = false;
    }
  };
  // ConnectionLost END
  // Loader START
  this.loader = {
    container: null,
    loader: null,
    logo: null,
    window: null
  };
  this.drawLoader = function () {
    if (!gameInfo.resourceLoaded) return false;
    gameContainer.Loader.container.visible = false;
    this.loader.container = new PIXI.Container();
    this.loader.container.x = 0;
    this.loader.container.y = 0;
    gameContainer.Loader.container.addChild(this.loader.container);
    let scale = 1;
    if (mobile) {
      scale = 2;
    }
    this.drawText('loading', {
      container: this.loader.container,
      visible: false
    });
    gameText.loading.label.x = gameText.loading.x * this.gameScale;
    gameText.loading.label.y = gameText.loading.y * this.gameScale;
    gameText.loading.label.style.fontSize = gameText.loading.style.fontSize * this.gameScale * scale;
    gameText.loading.label.text = GetCaption('jetx.board.progress');
    //gameText.loading.label.alpha = mobile ? 0 : 1;
    this.loader.logo = this.returnImage(
      'LoaderLogo',
      {
        container: this.loader.container,
        x: 486 * this.gameScale,
        y: 0,
        zOrder: 2,
        scale: this.imageScale * this.gameScale,
        visible: false
      }
    );
    let sprite;
    sprite = gameSprite['Loader'];
    this.loader.loader = this.returnSprite(
      'Loader',
      {
        container: this.loader.container,
        x: sprite.x * this.gameScale,
        y: sprite.y * this.gameScale,
        zOrder: sprite.zOrder,
        scale: sprite.scale * this.gameScale,
        align: 'left',
        verticalAlign: 'top',
        visible: false
      }
    );
    this.loader.loader.loop = false;
    this.loader.loader.onComplete = function (index) {
      jetX.loader.logo.visible = false;
      jetX.loader.loader.visible = false;
      gameText.loading.label.visible = false;
      if (jetX.game.loader) {
        jetX.loader.window.gotoAndPlay(11);
        jetX.showCoefficient();
        jetX.planeVisible(true);
      }
    };
    sprite = gameSprite['LoaderWindow'];
    this.loader.window = this.returnSprite(
      'LoaderWindow',
      {
        container: this.loader.container,
        x: sprite.x * this.gameScale,
        y: sprite.y * this.gameScale,
        zOrder: sprite.zOrder,
        scale: sprite.scale * this.gameScale,
        align: 'left',
        verticalAlign: 'top',
        visible: false
      }
    );
    this.loader.window.loop = false;
    this.loader.window.onFrameChange = function (index) {
      if (index === 11) {
        if (jetX.game.loader) {
          jetX.loader.window.stop();
          jetX.loader.logo.visible = true;
          jetX.loader.loader.visible = true;
          jetX.loader.loader.gotoAndPlay(0);
          jetX.loader.loader.animationSpeed = 0.5;
          gameText.loading.label.visible = true;
          currentSpinInfo = {
            SpinTime: GetCaption('jetx.board.hash.time'),
            Coefficient: GetCaption('jetx.board.hash.value'),
            SpinHash: 'loading',
            Info: GetCaption('jetx.board.hash.info'),
          };
          addCurrentSpin();
        }
      }
    };
    this.loader.window.onComplete = function (index) {
      if (jetX.game.loader) {
        jetX.loader.window.visible = false;
        gameContainer.Loader.container.visible = false;
      }
    };
  };
  this.startLoader = function () {
    if (!gameInfo.resourceLoaded) return false;
    this.hideCoefficient();
    this.planeVisible(false);
    gameContainer.Loader.container.visible = true;
    this.loader.window.visible = true;
    this.loader.window.gotoAndPlay(0);
  };
  this.hideLoader = function () {
    gameContainer.Loader.container.visible = false;
  };
  // Loader END
  // MaxMultiplier START
  this.maxMultiplier = {
    container: null,
    background: null,
    multiplierContainer: null,
    maxMultiplier: null,
    maxMultiplierX: null,
  };
  this.drawMaxMultiplier = function () {
    if (!gameInfo.resourceLoaded) return false;
    let container = new PIXI.Container();
    container.x = 0;
    container.y = 0;
    container.visible = false;
    gameContainer.MaxMultiplier.container.addChild(container);
    let background = new PIXI.Graphics();
    background.beginFill(0, 0.85);
    background.drawRect(0, 0, gameInfo.width, gameInfo.height);
    background.zOrder = 1;
    container.addChild(background);
    let multiplierContainer = new PIXI.Container();
    multiplierContainer.x = 0;
    multiplierContainer.y = 0;
    container.addChild(multiplierContainer);
    if (mobile) {
      multiplierContainer.scale = {
        x: 0.9,
        y: 0.9
      };
      multiplierContainer.x = - 295;
      multiplierContainer.y = - 160;
    }
    let x = 350;
    let y = 205;
    let scale = 1;
    let maxMultiplier = this.returnImage(
      'MaxMultiplier',
      {
        container: multiplierContainer,
        x: x,
        y: y,
        zOrder: 1,
        scale: scale,
      }
    );
    this.drawText('maxMultiplier', {
      container: multiplierContainer
    });
    this.setMaxMultiplier();
    this.drawText('maxMultiplierLabel', {
      container: multiplierContainer
    });
    x = 885;
    y = 330;
    scale = 1;
    let maxMultiplierX = this.returnImage(
      'CoefficientGreen',
      {
        container: multiplierContainer,
        x: x,
        y: y,
        zOrder: 1,
        scale: scale,
      }
    );
    this.maxMultiplier.container = container;
    this.maxMultiplier.background = background;
    this.maxMultiplier.multiplierContainer = multiplierContainer;
    this.maxMultiplier.maxMultiplier = maxMultiplier;
    this.maxMultiplier.maxMultiplierX = maxMultiplierX;
  }
  this.setMaxMultiplier = function () {
    if (!gameInfo.resourceLoaded) return false;
    gameText.maxMultiplier.label.text = board.maxCashoutCoeff;
  }
  this.showMaxMultiplier = function () {
    if (!gameInfo.resourceLoaded) return false;
    if (this.maxMultiplier.container === null) return false;
    this.maxMultiplier.container.visible = true;
  }
  this.hideMaxMultiplier = function () {
    if (!gameInfo.resourceLoaded) return false;
    if (this.maxMultiplier.container === null) return false;
    this.maxMultiplier.container.visible = false;
  }  // MaxMultiplier END
  // Coefficient START
  this.graphic = {
    container: null,
  };
  this.graphicX = null;
  this.drawCoefficient = function () {
    if (!gameInfo.resourceLoaded) return false;
    this.graphic.container = new PIXI.Container();
    this.graphic.container.x = 0;
    this.graphic.container.y = 0;
    gameContainer.Graphic.container.addChild(this.graphic.container);
    this.drawText(
      'graphicValue',
      {
        container: this.graphic.container,
        visible: false
      }
    );
    let x = 805 * this.gameScale;
    let y = 350 * this.gameScale;
    let scale = this.imageScale * this.gameScale;
    if (mobile) {
      x += 25;
      y -= 18;
      scale = this.imageScale * 0.9;
    }
    this.graphicX = this.returnImage(
      'CoefficientGreen',
      {
        container: this.graphic.container,
        x: x,
        y: y,
        zOrder: 1,
        scale: scale,
        visible: false
      }
    );
  };
  this.showCoefficient = function () {
    if (!gameInfo.resourceLoaded) return false;
    gameText.graphicValue.label.text = '1.00';
    gameText.graphicValue.label.visible = true;
    this.graphicX.visible = true;
    gameText.graphicValue.label.style.fill = '#5ee32b';
    this.graphicX.texture = gameImageResource.CoefficientGreen.Texture;
  };
  this.hideCoefficient = function () {
    if (!gameInfo.resourceLoaded) return false;
    gameText.graphicValue.label.visible = false;
    this.graphicX.visible = false;
    gameText.graphicValue.label.style.fill = '#5ee32b';
    this.graphicX.texture = gameImageResource.CoefficientGreen.Texture;
  };
  // Coefficient END
  // Items START
  this.items = {
    background: null,
    clouds1: null,
    ocean: null,
    fence: null,
    road: null,
    garage: null,
    airport: null,
    clouds2: null,
    ozone: null,
    stars: null,
  };
  this.airBalloons = [];
  this.planetsStart = 1000;
  this.planetsCount = 27;
  this.planets = [];
  this.itemsList = [
    'clouds1',
    'ocean',
    'fence',
    'road',
    'garage',
    'airport',
    'clouds2',
    'ozone',
    'stars'
  ];
  this.drawItems = function () {
    if (!gameInfo.resourceLoaded) return false;
    let background = new PIXI.Graphics();
    background.beginFill(856089, 1);
    background.drawRect(0, 0, gameInfo.width, gameInfo.height);
    background.zOrder = 1;
    gameContainer.Background.container.addChild(background);
    let itemScale = 2;
    let pr;
    this.items.background = new itemsProperties(0, - 8727, 2, {
      x: 0,
      y: 0
    });
    this.items.clouds1 = new itemsProperties(- 39, - 193, 2, {
      x: 0,
      y: 0
    }, itemScale);
    this.items.ocean = new itemsProperties(- 15, 388, 3, {
      x: 0.25,
      y: 0
    }, itemScale);
    this.items.fence = new itemsProperties(482, 294, 4, {
      x: 0.25,
      y: 0
    }, itemScale);
    this.items.road = new itemsProperties(0, 451, 5, {
      x: 0.25,
      y: 0
    }, itemScale);
    this.items.garage = new itemsProperties(1043, 437 + garageY, 6, {
      x: 0.5,
      y: 0
    });
    this.items.airport = new itemsProperties(0, 211, 7, {
      x: 0.5,
      y: 0
    });
    this.items.clouds2 = new itemsProperties(2076, - 2980, 8, {
      x: 0,
      y: 0
    }, itemScale);
    this.items.ozone = new itemsProperties(824 + 14 * 80, - 3474 - 12 * 80, 9, {
      x: 0,
      y: 0
    }, itemScale);
    this.items.stars = new itemsProperties(4500, - 5228, 10, {
      x: 0,
      y: 0
    }, itemScale);
    pr = this.items.background;
    const gradTexture = this.createGradTexture();
    this.items.background.obj = new PIXI.Sprite(gradTexture);
    this.items.background.obj.x = pr.x * this.gameScale;
    this.items.background.obj.y = pr.y * this.gameScale;
    this.items.background.obj.zOrder = pr.zOrder;
    this.items.background.obj.width = 12923 * this.gameScale;
    this.items.background.obj.height = 9416 * this.gameScale;
    gameContainer.Background.container.addChild(this.items.background.obj);
    for (let i = 0; i < this.itemsList.length; i++) {
      pr = this.items[this.itemsList[i]];
      this.items[this.itemsList[i]].obj = this.returnImage(
        this.capitalize(this.itemsList[i]),
        {
          container: 'Background',
          x: pr.x * this.gameScale,
          y: pr.y * this.gameScale,
          zOrder: pr.zOrder,
          scale: this.imageScale * this.gameScale * pr.scale,
          visible: !(this.itemsList[i] === 'stars')
        }
      );
    }
    this.items.comet1 = new itemsProperties(4676 + 14 * 20, - 3877 + 689 - 12 * 20, 10, {
      x: 0,
      y: 0
    });
    this.items.comet1.animate = false;
    pr = this.items.comet1;
    this.items.comet1.obj = this.returnSprite(
      'Comet',
      {
        container: 'Background',
        x: pr.x * this.gameScale,
        y: pr.y * this.gameScale,
        zOrder: pr.zOrder,
        scale: this.gameScale,
        align: 'left',
        verticalAlign: 'top'
      }
    );
    this.items.comet1.obj.loop = false;
    //this.items.comet1.obj.gotoAndPlay(0);
    this.items.comet2 = new itemsProperties(4776 + 700 + 14 * 20, - 3877 + 689 - 12 * 20, 10, {
      x: 0,
      y: 0
    });
    this.items.comet2.animate = false;
    pr = this.items.comet2;
    this.items.comet2.obj = this.returnSprite(
      'Comet',
      {
        container: 'Background',
        x: pr.x * this.gameScale,
        y: pr.y * this.gameScale,
        zOrder: pr.zOrder,
        scale: this.gameScale,
        align: 'left',
        verticalAlign: 'top'
      }
    );
    this.items.comet2.obj.loop = false;
    //this.items.comet2.obj.gotoAndPlay(0);
    let x,
      y,
      speed;
    for (let i = 0; i < 2; i++) {
      if (i === 0) {
        x = 1411;
        y = - 694;
        speed = 0.9;
      } else if (i === 1) {
        x = 1411 + 653;
        y = - 192;
        speed = 0.95;
      }
      this.airBalloons.push({
        obj: null,
        default:
        {
          x: x,
          y: y
        },
        x: x,
        y: y,
        speed: speed
      });
      this.airBalloons[i].obj = this.returnImage(
        'AirBalloon' + (i + 1),
        {
          container: 'Background',
          x: this.airBalloons[i].x * this.gameScale,
          y: this.airBalloons[i].y * this.gameScale,
          zOrder: 20,
          scale: this.imageScale * this.gameScale
        }
      );
    }
    let whiteSpeed = 0.5;
    let yellowSpeed = 0.8;
    let blueSpeed = 1;
    let redSpeed = 1.05;
    let greenSpeed = 1.1;
    let whiteIndex = 1;
    let yellowIndex = 2;
    let blueIndex = 3;
    let redIndex = 4;
    let greenIndex = 5;
    let planets = [
      new planetProperties(0, 5695),
      new planetProperties(1229, 5671),
      new planetProperties(789, 4517),
      new planetProperties(1853, 5223),
      new planetProperties(2459, 5509),
      new planetProperties(2382, 4447),
      new planetProperties(2213, 3706),
      new planetProperties(2905, 3595),
      new planetProperties(3185, 3883),
      new planetProperties(3102, 2977),
      new planetProperties(4051, 3622),
      new planetProperties(4401, 3436),
      new planetProperties(3828, 2793),
      new planetProperties(4288, 2156),
      new planetProperties(4887, 2509),
      new planetProperties(5648, 2388),
      new planetProperties(5574, 1551, true),
      new planetProperties(6147, 1487, true),
      new planetProperties(5451 + 256 / 2, 892 + 232, true, true),
      new planetProperties(6294 + 14 * 20, 446 - 12 * 20, true),
      new planetProperties(6712, 918, true),
      new planetProperties(7290, 521, true),
      new planetProperties(7087, 0, true),
      new planetProperties(100 + 14 * 30, - 700 - 12 * 30, true),
      new planetProperties(800 + 14 * 30, - 1400 - 12 * 30, true),
      new planetProperties(100, - 700, true),
      new planetProperties(800, - 1400, true),
    ];
    let whiteList = [
      25,
      26
    ];
    let yellowList = [
      23,
      24
    ];
    let greenList = [
      0,
      2,
      8,
      11,
      13,
      16,
      19,
      21
    ];
    let redList = [
      1,
      3,
      9,
      14,
      17,
      20
    ];
    let blueList = [
      4,
      5,
      6,
      12,
      15,
      18,
      22
    ];
    for (let i = 0; i < this.planetsCount; i++) {
      let planet = planets[i];
      if (whiteList.indexOf(i) >= 0) {
        planet.speed = whiteSpeed;
        planet.zIndex = whiteIndex;
        planet.type = 'star';
      } else if (yellowList.indexOf(i) >= 0) {
        planet.speed = yellowSpeed;
        planet.zIndex = yellowIndex;
        planet.type = 'star';
      } else if (greenList.indexOf(i) >= 0) {
        planet.speed = greenSpeed;
        planet.zIndex = greenIndex;
      } else if (redList.indexOf(i) >= 0) {
        planet.speed = redSpeed;
        planet.zIndex = redIndex;
      } else if (blueList.indexOf(i) >= 0) {
        planet.speed = blueSpeed;
        planet.zIndex = blueIndex;
      }
      if (planet.type === 'planet') {
        planet.x += 800 - 200; //1411
        planet.y = planet.y - 5815;
      }
      this.planets.push({
        obj: null,
        default:
        {
          x: planet.x,
          y: planet.y
        },
        x: planet.x,
        y: planet.y,
        speed: planet.speed,
        repeat: planet.repeat,
        rotation: planet.rotation,
        type: planet.type
      });
      let name = 'Planet' + i;
      let scale = 1;
      if (whiteList.indexOf(i) >= 0) {
        name = 'StarsWhite';
        scale = 2;
      } else if (yellowList.indexOf(i) >= 0) {
        name = 'Stars';
        scale = 2;
      }
      this.planets[i].obj = this.returnImage(
        name,
        {
          container: 'Background',
          x: this.planets[i].x * this.gameScale,
          y: this.planets[i].y * this.gameScale,
          zOrder: 20 + planet.zIndex,
          scale: this.imageScale * this.gameScale * scale,
          align: planet.rotation ? 'center' : 'left',
        }
      );
    }
  };
  this.planetChangePosition = function (i) {
    this.planets[i].obj.x -= (14 / 2.5 * this.planets[i].speed) * this.gameScale;
    this.planets[i].obj.y += (12 / 2.5 * this.planets[i].speed) * this.gameScale;
    if (this.planets[i].rotation) {
      this.planets[i].obj.rotation += 0.004;
    }
    if (this.planets[i].type === 'star') {
      if (this.planets[i].obj.y >= 700 * this.gameScale) {
        this.planets[i].obj.x = 100 * this.gameScale;
        this.planets[i].obj.y = - 700 * this.gameScale;
      }
    } else if (
      this.planets[i].repeat &&
      this.planets[i].obj.y > 800 * this.gameScale
    ) {
      this.planets[i].obj.x = this.planets[i].x * this.gameScale;
      this.planets[i].obj.y = this.planets[i].y * this.gameScale;
    }
  };
  this.itemsDefaults = function () {
    if (!gameInfo.resourceLoaded) return false;
    let pr;
    pr = this.items.background;
    this.items.background.obj.x = pr.x * this.gameScale;
    this.items.background.obj.y = pr.y * this.gameScale;
    for (const key in this.items) {
      let item = this.items[key];
      item.obj.x = item.x * this.gameScale;
      item.obj.y = item.y * this.gameScale;
      let x = (8 / 2.5 + item.speed.x) * Math.min(this.plane.animation.index, 77) + (14 / 2.5 + item.speed.x) * Math.max(this.plane.animation.index - 77, 0);
      let y = (12 / 2.5 + item.speed.y) * Math.max(this.plane.animation.index - 77, 0);
      item.obj.x -= x * this.gameScale;
      item.obj.y += y * this.gameScale;
    }
    this.items.comet1.animate = false;
    this.items.comet2.animate = false;
    for (let i = 0; i < 2; i++) {
      this.airBalloons[i].x = this.airBalloons[i].default.x;
      this.airBalloons[i].y = this.airBalloons[i].default.y;
      this.airBalloons[i].obj.x = this.airBalloons[i].x * this.gameScale;
      this.airBalloons[i].obj.y = this.airBalloons[i].y * this.gameScale;
      if (this.plane.animation.index > 300) {
        this.airBalloons[i].obj.x -= (
          (this.plane.animation.index - 300) * 14 / 2.5 * this.airBalloons[i].speed
        ) * this.gameScale;
        this.airBalloons[i].obj.y += (
          (this.plane.animation.index - 300) * 12 / 2.5 * this.airBalloons[i].speed
        ) * this.gameScale;
      }
    }
    for (let i = 0; i < this.planetsCount; i++) {
      this.planets[i].x = this.planets[i].default.x;
      this.planets[i].y = this.planets[i].default.y;
      this.planets[i].obj.x = this.planets[i].x * this.gameScale;
      this.planets[i].obj.y = this.planets[i].y * this.gameScale;
      this.planets[i].obj.x = this.planets[i].x * this.gameScale;
      this.planets[i].obj.y = this.planets[i].y * this.gameScale;
      if (this.plane.animation.index > this.planetsStart) {
        const n = this.plane.animation.index - this.planetsStart;
        for (let j = Math.max(0, n - 800); j < n; j++) {
          this.planetChangePosition(i);
        }
      }
    }
    this.itemsResponsive();
  };
  this.itemsAnimations = function () {
    for (const key in this.items) {
      let item = this.items[key];
      if (this.plane.animation.index > 77) {
        item.obj.x -= (14 / 2.5 + item.speed.x) * this.gameScale;
        item.obj.y += (12 / 2.5 + item.speed.y) * this.gameScale;
      } else {
        item.obj.x -= (8 / 2.5 + item.speed.x) * this.gameScale;
      }
      if (key === 'comet1' && !item.animate && item.obj.x <= 900) {
        this.items[key].animate = true;
        this.items.comet1.obj.gotoAndPlay(0);
      }
      if (key === 'comet2' && !item.animate && item.obj.x <= 1100) {
        this.items[key].animate = true;
        this.items.comet2.obj.gotoAndPlay(0);
      }
    }
    if (this.plane.animation.index > 300) {
      for (let i = 0; i < 2; i++) {
        this.airBalloons[i].obj.x -= (14 / 2.5 * this.airBalloons[i].speed) * this.gameScale;
        this.airBalloons[i].obj.y += (12 / 2.5 * this.airBalloons[i].speed) * this.gameScale;
      }
    }
    if (this.plane.animation.index > this.planetsStart) {
      for (let i = 0; i < this.planetsCount; i++) {
        this.planetChangePosition(i);
      }
    }
    this.itemsResponsive();
  };
  this.itemsResponsive = function () {
    if (mobile) {
      let index = Math.min(429, this.plane.animation.index);
      let y = 0;
      y += (3 / 4) * 4 / 2.5 * Math.max(Math.min(index - 77, 300 - 77), 0);
      y += 3 / 2.5 * Math.max(index - 300, 0);
      if (this.vertical) {
        gameContainer.PlaneParent.container.y = 0;
        gameContainer.Background.container.y = 0;
      } else {
        //gameContainer.PlaneParent.container.y = this.plane.container.y * this.gameScale - gameContainer.Plane.container.y;
        gameContainer.PlaneParent.container.y = (422.4 - y) / 422.4 * this.gameScale;
        gameContainer.PlaneParent.container.y = y * this.gameScale * (jetX.responsiveY / 113);
        //gameContainer.Background.container.y = -y * this.gameScale;
      }
    }
  }  // Items END
  // Plane START
  this.plane = {
    container: {
      x: - 335 + 386 + 50,
      y: 480 + 110,
    },
    speed: {
      x: 5,
      y: 1
    },
    objects: {
      plane: null,
      wheel1: null,
      wheel2: null,
      fire1: null,
      fire2: null,
      fire3: null,
      fire4: null,
      boom: null
    },
    animation: {
      animate: false,
      index: 0,
      fire1: false,
      fire2: false,
      fire3: false,
      fire4: false,
    }
  };
  this.drawPlane = function () {
    if (!gameInfo.resourceLoaded) return false;
    let sprite;
    gameContainer.Plane.container.x = this.plane.container.x * this.gameScale;
    gameContainer.Plane.container.y = this.plane.container.y * this.gameScale;
    gameContainer.Plane.container.pivot.x = (386 + 50) * this.gameScale;
    gameContainer.Plane.container.pivot.y = (110) * this.gameScale;
    this.plane.objects.plane = this.returnImage(
      'Plane',
      {
        container: 'Plane',
        x: 380 * this.gameScale,
        y: 85 * this.gameScale,
        zOrder: 2,
        scale: this.imageScale * this.gameScale
      }
    );
    this.plane.objects.wheel1 = this.returnImage(
      'PlaneWheel1',
      {
        container: 'Plane',
        x: (380 + 28) * this.gameScale,
        y: (85 + 23 - 2) * this.gameScale,
        zOrder: 1,
        scale: this.imageScale * this.gameScale
      }
    );
    this.plane.objects.wheel2 = this.returnImage(
      'PlaneWheel2',
      {
        container: 'Plane',
        x: (380 + 120) * this.gameScale,
        y: (85 + 25 - 2) * this.gameScale,
        zOrder: 1,
        scale: this.imageScale * this.gameScale
      }
    );
    sprite = gameSprite['Fire1'];
    this.plane.objects.fire1 = this.returnSprite(
      'Fire1',
      {
        container: 'Plane',
        x: sprite.x * this.gameScale,
        y: sprite.y * this.gameScale,
        zOrder: sprite.zOrder,
        scale: sprite.scale * this.gameScale,
        align: 'left',
        verticalAlign: 'top',
        visible: false
      }
    );
    this.plane.objects.fire1.loop = true;
    this.plane.objects.fire1.gotoAndPlay(0);
    sprite = gameSprite['Fire2'];
    this.plane.objects.fire2 = this.returnSprite(
      'Fire2',
      {
        container: 'Plane',
        x: sprite.x * this.gameScale,
        y: sprite.y * this.gameScale,
        zOrder: sprite.zOrder,
        scale: sprite.scale * this.gameScale,
        align: 'left',
        verticalAlign: 'top',
        visible: false
      }
    );
    sprite = gameSprite['Fire3'];
    this.plane.objects.fire3 = this.returnSprite(
      'Fire3',
      {
        container: 'Plane',
        x: sprite.x * this.gameScale,
        y: sprite.y * this.gameScale,
        zOrder: sprite.zOrder,
        scale: sprite.scale * this.gameScale,
        align: 'left',
        verticalAlign: 'top',
        visible: false
      }
    );
    sprite = gameSprite['Fire4'];
    this.plane.objects.fire4 = this.returnSprite(
      'Fire4',
      {
        container: 'Plane',
        x: sprite.x * this.gameScale,
        y: sprite.y * this.gameScale,
        zOrder: sprite.zOrder,
        scale: sprite.scale * this.gameScale,
        align: 'left',
        verticalAlign: 'top',
        visible: false
      }
    );
    sprite = gameSprite['Boom'];
    this.plane.objects.boom = this.returnSprite(
      'Boom',
      {
        container: 'Plane',
        x: sprite.x * this.gameScale - 270 - (mobile ? 40 : 0),
        y: sprite.y * this.gameScale - 219 - (mobile ? 100 : 0),
        zOrder: sprite.zOrder,
        scale: sprite.scale * this.gameScale,
        align: 'center',
        verticalAlign: 'center',
        visible: false
      }
    );
    this.plane.objects.boom.pivot.x = 270 * this.gameScale;
    this.plane.objects.boom.pivot.y = 219 * this.gameScale;
    this.plane.objects.boom.onComplete = function () {
      jetX.plane.objects.boom.visible = false;
      //if(jetX.game.boom) jetX.newGame();
      //jetX.timeouts.push({name: 'newGame', delay: 25});
    };
  };
  this.planeDefaults = function (value = 0) {
    if (!gameInfo.resourceLoaded) return false;
    this.plane.animation.index = 0;
    if (value >= 1) this.plane.animation.index = 439 * (value - 1) / 0.66;
    gameContainer.Plane.container.x = this.plane.container.x * this.gameScale;
    gameContainer.Plane.container.y = this.plane.container.y * this.gameScale;
    gameContainer.Plane.container.rotation = 0;
    this.plane.objects.plane.visible = true;
    this.plane.objects.fire1.visible = !(value === 0);
    this.plane.objects.fire1.loop = true;
    this.plane.objects.fire1.gotoAndPlay(0);
    let x = 0;
    let y = 0;
    let r = 0;
    let index = Math.min(429, this.plane.animation.index);
    x += 8 / 2.5 * Math.min(index, 77);
    x += (3 / 4) * 8 / 2.5 * Math.max(Math.min(index - 77, 300 - 77), 0);
    x += 6 / 2.5 * Math.max(index - 300, 0);
    //y += 0 * Math.min(index, 77);
    y += (3 / 4) * 4 / 2.5 * Math.max(Math.min(index - 77, 300 - 77), 0);
    y += 3 / 2.5 * Math.max(index - 300, 0);
    r += 0.001 * Math.min(index, 77);
    r += 0.005 * Math.max(Math.min(index - 77, 300 - 77), 0);
    r += 0.005 * Math.max(index - 300, 0);
    this.plane.objects.wheel1.height = 38 * this.gameScale;
    this.plane.objects.wheel2.height = 32 * this.gameScale;
    if (this.plane.animation.index >= 78) {
      this.plane.objects.wheel1.height -= Math.min((this.plane.animation.index - 78) * 0.5, 38) * this.gameScale;
      this.plane.objects.wheel2.height -= Math.min((this.plane.animation.index - 78) * 0.5, 32) * this.gameScale;
    }
    gameContainer.Plane.container.x += x * this.gameScale;
    gameContainer.Plane.container.y -= y * this.gameScale;
    gameContainer.Plane.container.rotation -= r;
    if (gameContainer.Plane.container.rotation <= - 0.5) {
      gameContainer.Plane.container.rotation = - 0.5;
    }
    jetX.itemsDefaults();
  };
  this.planeVisible = function (visible) {
    this.plane.objects.plane.visible = visible;
    this.plane.objects.wheel1.visible = visible;
    this.plane.objects.wheel2.visible = visible;
    this.plane.objects.boom.visible = false;
  };
  this.planeFireChange = function (index) {
    if (!gameInfo.resourceLoaded) return false;
    if (!this.plane.animation['fire' + index]) {
      this.plane.animation['fire' + index] = true;
      for (let i = 1; i < index; i++) {
        this.plane.objects['fire' + i].visible = false;
        this.plane.objects['fire' + i].stop();
      }
      this.plane.objects['fire' + index].visible = true;
      this.plane.objects['fire' + index].loop = true;
      this.plane.objects['fire' + index].gotoAndPlay(0);
    }
  };
  this.planeMove = function (value, graphicValue, step, degree) {
    if (!gameInfo.resourceLoaded) return false;
    gameText.graphicValue.label.text = value.toFixed(2);
    if (player.bets !== undefined && player.bets !== null) {
      for (let i = 0; i < player.bets.length; i++) {
        let button = $('#bet-' + i);
        let bet = player.bets[i];
        let betAmount = bet.BetAmount;
        button.find('.cash-out1').html(
          numberFormat(value * betAmount, player.currency.currencyCode, true, true) + ' <span class="currency">' + currencyFormat(player.currency.currencyCode) + '</span>'
        );
      }
    }    //
  };
  this.planeBoom = function (value) {
    if (!gameInfo.resourceLoaded) return false;
    this.hideLoader();
    this.plane.animation.animate = false;
    this.plane.animation.index = 0;
    this.plane.animation.fire1 = false;
    this.plane.animation.fire2 = false;
    this.plane.animation.fire3 = false;
    this.plane.animation.fire4 = false;
    this.plane.objects.plane.visible = false;
    this.plane.objects.wheel1.height = 0;
    this.plane.objects.wheel2.height = 0;
    this.plane.objects.fire1.visible = false;
    this.plane.objects.fire1.stop();
    this.plane.objects.fire2.visible = false;
    this.plane.objects.fire2.stop();
    this.plane.objects.fire3.visible = false;
    this.plane.objects.fire3.stop();
    this.plane.objects.fire4.visible = false;
    this.plane.objects.fire4.stop();
    if (value < board.maxCashoutCoeff) {
      gameText.graphicValue.label.style.fill = '#f52626';
      this.graphicX.texture = gameImageResource.CoefficientRed.Texture;
    }
    this.plane.objects.boom.rotation = - gameContainer.Plane.container.rotation;
    this.plane.objects.boom.visible = true;
    this.plane.objects.boom.loop = false;
    this.plane.objects.boom.gotoAndPlay(0);
  };
  this.planeAnimations = function () {
    if (this.plane.animation.animate) {
      this.plane.animation.index++;
      if (this.plane.animation.index < 78) {
        gameContainer.Plane.container.x += (8 / 2.5) * this.gameScale;
        gameContainer.Plane.container.rotation -= 0.001;
      } else if (this.plane.animation.index < 300) {
        gameContainer.Plane.container.x += ((3 / 4) * 8 / 2.5) * this.gameScale;
        gameContainer.Plane.container.y -= ((3 / 4) * 4 / 2.5) * this.gameScale;
      } else if (this.plane.animation.index < 350 + 90) {
        gameContainer.Plane.container.x += (6 / 2.5) * this.gameScale;
        gameContainer.Plane.container.y -= (3 / 2.5) * this.gameScale;
      }
      if (this.plane.animation.index >= 78) {
        if (this.plane.objects.wheel1.height >= 0.2 * this.gameScale) {
          this.plane.objects.wheel1.height -= 0.2 * this.gameScale;
        }
        if (this.plane.objects.wheel2.height >= 0.2 * this.gameScale) {
          this.plane.objects.wheel2.height -= 0.2 * this.gameScale;
        }
      }
      if (this.plane.animation.index < 350 + 90) {
        if (
          this.plane.animation.index >= 78 &&
          gameContainer.Plane.container.rotation > - 0.5
        ) {
          gameContainer.Plane.container.rotation -= 0.005;
          if (gameContainer.Plane.container.rotation <= - 0.5) {
            gameContainer.Plane.container.rotation = - 0.5;
          }
        }
      } else {
        gameContainer.Plane.container.rotation = - 0.5 + Math.sin(this.plane.animation.index) / 220;
      }      /*
            if (this.plane.animation.index > 1200) {
                this.planeFireChange(4);
            } else if (this.plane.animation.index > 700) {
                this.planeFireChange(3);
            } else if (this.plane.animation.index > 350 + 80) {
                this.planeFireChange(2);
            } else {
                this.planeFireChange(1);
            }
            */
      if (graphicValue > 10) {
        this.planeFireChange(4);
      } else if (graphicValue > 5) {
        this.planeFireChange(3);
      } else if (graphicValue > 2) {
        this.planeFireChange(2);
      } else {
        this.planeFireChange(1);
      }
      this.itemsAnimations();
    }
  };
  // Plane END
  // CashOut START
  this.parachute = [];
  this.cashOut = function (coefficient, current) {
    if (!gameInfo.resourceLoaded) return false;
    if (!this.tabActive) return false;
    let spaceman = coefficient >= 10;
    let name = (spaceman ? 'Spaceman' : 'Parachute') + (current ? '0' : '1');
    let sprite;
    sprite = gameSprite[name];
    let x = gameContainer.Plane.container.x + sprite.x * this.gameScale;
    let y = gameContainer.Plane.container.y + sprite.y * this.gameScale;
    let randomX = 14 * this.getRandom(50, 100) / 200;
    let randomY = 12 * this.getRandom(50, 100) / 200;
    let jumpX = (this.getRandom(0, 100) < 50 ? 1 : - 1) * this.getRandom(550, 950) / 200;
    let jumpY = this.getRandom(300, 700) / 10;
    let delay = 200;
    if (spaceman) {
      y = sprite.y * this.gameScale;
      randomX = this.getRandom(1, 2);
      randomY = this.getRandom(1, 15) / 10;
      delay = 1;
      /* New
            y = sprite.y * this.gameScale;
            randomX = this.getRandom(10, 15);
            randomY = this.getRandom(1, 25) / 10;
            */
    }
    let index = this.parachute.push({
      animate: true,
      index: 0,
      spaceman: spaceman,
      x: x,
      y: y,
      stop: this.getRandom(15, 25),
      random: {
        x: randomX,
        y: randomY
      },
      jump: {
        x: jumpX,
        y: jumpY,
        distance: 0
      },
      space: {
        x: 0,
        y: 0
      },
      obj: null,
      planeIndex: this.plane.animation.index
    }) - 1;
    this.parachute[index].obj = this.returnSprite(
      name,
      {
        container: 'Background',
        x: sprite.x * this.gameScale,
        y: sprite.y * this.gameScale,
        zOrder: sprite.zOrder,
        scale: sprite.scale * this.gameScale,
        align: 'left',
        verticalAlign: 'top'
      }
    );
    this.parachute[index].obj.loop = false;
    let parachute = this.parachute[index].obj;
    setTimeout(
      function () {
        if (parachute !== undefined && parachute !== null) {
          parachute.gotoAndPlay(0);
        }
      },
      delay
    );
  };
  this.cashOutClear = function () {
    for (let i = 0; i < this.parachute.length; i++) {
      if (this.parachute[i].obj !== null) this.parachute[i].obj.destroy();
    }
    this.parachute = [];
  };
  this.cashOutAnimations = function () {
    if (this.parachute.length > 0) {
      for (let i = 0; i < this.parachute.length; i++) {
        if (this.parachute[i].animate) {
          this.parachute[i].index++;
          if (this.parachute[i].index > 0) {
            if (this.parachute[i].spaceman) {
              this.parachute[i].obj.x = this.parachute[i].x - (5 * this.parachute[i].index * this.parachute[i].random.x) * this.gameScale;
              this.parachute[i].obj.y = this.parachute[i].y + (this.parachute[i].index * this.parachute[i].random.y) * this.gameScale;
              /* New
                            this.parachute[i].space.x += (this.parachute[i].random.x * this.parachute[i].random.x) / 4;
                            this.parachute[i].space.y += this.parachute[i].random.y;
                            this.parachute[i].obj.x = this.parachute[i].x - (this.parachute[i].space.x) * this.gameScale;
                            this.parachute[i].obj.y = this.parachute[i].y + (this.parachute[i].space.y + Math.sin(this.parachute[i].index / 10) * 6) * this.gameScale;

                            if(this.parachute[i].random.x > 5) {
                                this.parachute[i].random.x -= 1;
                            }
                            */
              if (this.parachute[i].index > 500) {
                this.parachute[i].obj.destroy();
                this.parachute.splice(i, 1);
              }
            } else {
              if (this.parachute[i].planeIndex <= 320) {
                if (this.parachute[i].index < this.parachute[i].stop) {
                  this.parachute[i].jump.distance += (1 / this.parachute[i].index) * this.parachute[i].jump.y;
                  this.parachute[i].obj.x = this.parachute[i].x + (70 + this.parachute[i].index * this.parachute[i].jump.x) * this.gameScale;
                  this.parachute[i].obj.y = this.parachute[i].y - (20 + this.parachute[i].jump.distance) * this.gameScale;
                } else {
                  this.parachute[i].index = 0;
                  this.parachute[i].x = this.parachute[i].x + (70 + this.parachute[i].stop * this.parachute[i].jump.x) * this.gameScale;
                  this.parachute[i].y = this.parachute[i].y - (20 + this.parachute[i].jump.distance) * this.gameScale;
                  this.parachute[i].planeIndex = 500;
                }
              } else {
                this.parachute[i].obj.x = this.parachute[i].x - (this.parachute[i].index * this.parachute[i].random.x) * this.gameScale;
                this.parachute[i].obj.y = this.parachute[i].y + (this.parachute[i].index * this.parachute[i].random.y) * this.gameScale;
              }
              if (this.parachute[i].obj.y > 900 * this.gameScale) {
                this.parachute[i].obj.destroy();
                this.parachute.splice(i, 1);
              }
            }
          }
        }
      }
    }
  };
  // CashOut END
  // timeouts START
  this.timeouts = [];
  this.timeoutsAnimations = function () {
    for (let i = 0; i < this.timeouts.length; i++) {
      this.timeouts[i].delay--;
      if (this.timeouts[i].delay <= 0) {
        if (this.timeouts[i].name === 'finishGame') {
          this.finishGame();
        } else if (this.timeouts[i].name === 'newGame') {
          this.newGame();
        }
        this.timeouts.splice(i, 1);
      }
    }
  };
  // timeouts END
  this.boom = function (value) {
    if (mobile && !ios) {
      vibrate();
    }
    response.start = true;
    pauseSounds();
    PlaySound(79, 'Boom');
    this.game.started = false;
    this.plane.animation.animate = false;
    this.game.boom = true;
    this.planeBoom(value);
    //this.timeouts.push({name: 'finishGame', delay: 50});
    this.finish = true;
    this.finishGame();
    window.parent.postMessage({
      name: 'finish-jetx-game'
    }, '*');
    gameEvent.roundEnded();
  };
  this.game = {
    started: false,
    boom: false,
    loader: false,
  };
  this.fly = function () {
    if (!gameInfo.resourceLoaded) return false;
    if (!this.game.started) {
      this.game.started = true;
      this.game.boom = false;
      this.game.loader = false;
      board.isFinnished = false;
      gameStatus();
      //let position = (((graphicValue - 1) / 0.01) * 155) / 1000;
      if (audioElement[77] === null) {
        flySound(graphicStep);
      }
      this.cashOutClear();
      this.hideLoader();
      this.planeDefaults(graphicValue);
      this.showCoefficient();
      this.planeVisible(true);
      this.plane.animation.animate = true;
      gameEvent.roundStarted();
    }
  };
  this.finish = false;
  this.finishGame = function () {
    //playersClear();
    //playersFinish();
    setTimeout(function () {
      GetBoard(token);
    }, 300);
  };
  this.newGame = function () {
    this.planeDefaults(0);
    this.game.loader = true;
    this.startLoader();
    this.cashOutClear();
    this.hideMaxMultiplier();
    if (this.plane.objects.boom !== null) this.plane.objects.boom.visible = false;
    gameEvent.roundStart();
  };
  this.startTime = (new Date()).getTime();
  this.animations = function (delta) {
    if (!gameInfo.resourceLoaded) return false;
    if (!this.tabActive) return false;
    this.timeoutsAnimations();
    this.cashOutAnimations();
    this.planeAnimations();
  };
  this.promotionIconSpine = null;
  this.promotionIconVisible = false;
  this.promotionIcon = function () {
    let gameButton = new PIXI.Application({
      width: mobile ? 50 : 70,
      height: mobile ? 50 : 70,
      transparent: true,
      autoResize: true
    });
    document.getElementsByClassName('promotion-button')[0].appendChild(gameButton.view);
    let container = new PIXI.Container();
    gameButton.stage.addChild(container);
    let name = 'Spine-PromotionIcon';
    this.promotionIconSpine = this.drawAnimatedSpine(
      gameSpines[name].spineAnimations,
      {
        container: container,
        scale: gameSpines[name].scale,
        x: gameSpines[name].x,
        y: gameSpines[name].y,
        zOrder: gameSpines[name].zOrder,
        animateLoop: false,
        align: 'left',
        verticalAlign: 'top',
        visible: this.promotionIconVisible
      }
    );
    this.promotionIconSpine.state.setAnimation(0, 'loopi', true);
    this.promotionIconSpine.state.addListener({
      complete: function (track, event) {
      }
    });
    this.promotionIconSpine.interactive = true;
    this.promotionIconSpine.buttonMode = true;
    this.promotionIconSpine.mouseover = function (mouseData) {
      jetX.promotionIconSpine.state.setAnimation(0, 'isarihoveri', true);
    };
    this.promotionIconSpine.mouseout = function (mouseData) {
      jetX.promotionIconSpine.state.setAnimation(0, 'loopi', true);
    };
    this.promotionIconSpine.pointerdown = function (mouseData) {
      window.parent.postMessage({
        name: 'promotion-show'
      }, '*');
    };
  };
  this.promotionIconShow = function () {
    if (!gameInfo.resourceLoaded) return false;
    this.promotionIconSpine.visible = true;
  };
}
function planetProperties(x, y, repeat = false, rotation = false) {
  this.x = x;
  this.y = y;
  this.repeat = repeat;
  this.rotation = rotation;
  this.speed = 1;
  this.zIndex = 3;
  this.type = 'planet';
}
function itemsProperties(x, y, zOrder, speed, scale = 1) {
  this.obj = null;
  this.x = x;
  this.y = y;
  this.zOrder = zOrder;
  this.speed = speed;
  this.scale = scale;
}
JetXClass.prototype = new CanvasClass();
let jetX = new JetXClass();
$(window).on('load', function (e) {
  jetX.canvasInit();
});
(
  function () {
    let hidden = 'hidden';
    if (hidden in document)
      document.addEventListener('visibilitychange', onchange);
    else if ((hidden = 'mozHidden') in document)
      document.addEventListener('mozvisibilitychange', onchange);
    else if ((hidden = 'webkitHidden') in document)
      document.addEventListener('webkitvisibilitychange', onchange);
    else if ((hidden = 'msHidden') in document)
      document.addEventListener('msvisibilitychange', onchange);
    else if ('onfocusin' in document)
      document.onfocusin = document.onfocusout = onchange;
    else
      window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
    function onchange(evt) {
      let v = 'visible',
        h = 'hidden',
        evtMap = {
          focus: v,
          focusin: v,
          pageshow: v,
          blur: h,
          focusout: h,
          pagehide: h
        };
      evt = evt ||
        window.event;
      //if (evt.type in evtMap) {
      //    document.body.className = evtMap[evt.type];
      //} else {
      //    document.body.className = this[hidden] ? "hidden" : "visible";
      //}
      //if(jetX.plane.animation.animate) {
      //    jetX.planeDefaults(graphicValue);
      //    jetX.showCoefficient();
      //    jetX.planeVisible(true);
      //}
      //$('.sound-popup').css('display', 'block');
      jetX.tabActive = !this[hidden];
      let volume = false;
      if (jetX.tabActive) {
        if (graphicValue - jetX.tabLastGraphicValue >= 0.2) {
          if (jetX.plane.animation.animate) {
            jetX.planeDefaults(graphicValue);
            //jetX.showCoefficient();
            //jetX.planeVisible(true);
          }
        }
        volume = true;
      } else {
        jetX.tabLastGraphicValue = graphicValue;
        jetX.game.started = false;
      }
      let soundChecked = $('.sound-menu-a.sound-sound .sound-checkbox input').is(':checked');
      let musicChecked = $('.sound-menu-a.sound-music .sound-checkbox input').is(':checked');
      for (let i = 0; i < audioElement.length; i++) {
        if (audioElement[i] !== null) {
          if (i === 77) {
            audioElement[i].volume = !soundPopup &&
              volume &&
              musicChecked ? audioElementVolume[i] : 0;
          } else {
            audioElement[i].volume = !soundPopup &&
              volume &&
              soundChecked ? audioElementVolume[i] : 0;
          }
        }
      }
    }    //if( document[hidden] !== undefined ) {
    //    onchange({type: document[hidden] ? "blur" : "focus"});
    //}
  }
)();
function CanvasClass() {
  this.sounds = [];
  this.soundsVolume = [];
  for (let i = 0; i < 10; i++) {
    this.sounds.push(null);
    this.soundsVolume.push(0);
  }
  this.staticUrl = function (url, imageId = '') {
    if (staticContentUrl !== '') {
      url = staticContentUrl.replace('/Sound', '') + url.replace('../../Content/', '');
    } else if (gameInfo.mobile) {
      url = staticContentUrl.replace('/Sound', '') + url.replace('../../Content/', '../../../Content/');
    }
    if (mobile) {
      url = url.replace('/ImagesLight/', '/ImagesLight/Mobile/');
    }
    if (skinList.indexOf(imageId) >= 0) {
      url = url.replace(`/ImagesLight/`, `/ImagesLight/${skinUrl}/`);
    }
    return url;
  };
  this.direction = 'ltr';
  this.resources = null;
  this.canvasInit = function () {
    this.direction = $('html').attr('dir');
    if (this.direction === undefined) this.direction = 'ltr';
    let parent = this;
    game = new PIXI.Application({
      width: gameInfo.width,
      height: gameInfo.height,
      transparent: true,
      autoResize: true
    }); //, forceCanvas: gameInfo.mobile //
    //PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    document.getElementsByClassName('GameParent')[0].appendChild(game.view);
    let loader = PIXI.Loader.shared;
    this.createContainer();
    for (let imageId in gameImageSpriteResource) {
      loader.add(
        imageId,
        this.staticUrl(gameInfo.url.image, imageId) + gameImageSpriteResource[imageId].url
      );
    }
    for (let imageId in gameImageResource) {
      if (
        gameImageResource[imageId].sprite !== undefined &&
        gameImageResource[imageId].sprite
      ) {
      } else {
        loader.add(
          imageId,
          this.staticUrl(gameInfo.url.image, imageId) + gameImageResource[imageId].url
        );
      }
    }
    gameSpines['Spine-PromotionIcon'] = {
      scale: mobile ? 0.42 : 0.65,
      zOrder: 10,
      x: mobile ? 25 : 35,
      y: mobile ? 27 : 35,
      verticalX: 238,
      verticalY: 90,
      url: '/PromotionIcon/logo.json',
      spineAnimations: []
    };
    for (let imageId in gameSpines) {
      loader.add(
        imageId,
        this.staticUrl(gameInfo.url.spine, imageId) + gameSpines[imageId].url
      );
    }
    for (let imageId in gameSpriteResource) {
      loader.add(
        imageId,
        this.staticUrl(gameInfo.url.sprite, imageId) + gameSpriteResource[imageId].url
      );
    }
    let preload = false;
    for (let name in gameSoundResource) {
      //preload = true;
      gameSounds[name] = PIXI.sound.Sound.from({
        url: this.staticUrl(gameInfo.url.sound) + gameSoundResource[name],
        preload: preload
      });
    }    /* FPS Info Start */
    let style = new PIXI.TextStyle({
      fontFamily: gameInfo.fps.style.fontFamily,
      fontSize: gameInfo.fps.style.fontSize,
      fill: gameInfo.fps.style.fill
    });
    gameInfo.fps.label = new PIXI.Text(gameInfo.fps.text, style);
    gameInfo.fps.label.x = gameInfo.fps.x;
    gameInfo.fps.label.y = gameInfo.fps.y;
    gameInfo.fps.label.zOrder = gameInfo.fps.zOrder;
    gameContainer.Popup.container.addChild(gameInfo.fps.label);
    gameInfo.fps.label.visible = false;
    /* FPS Info End */
    gameEvent.showLoader();
    loader.load(
      function (e, res) {
        let textures,
          texture,
          textureName,
          i,
          frames,
          spriteName,
          soundName;
        for (let key in e.resources) {
          if (key.indexOf('Spine-') >= 0) {
            if (e.resources[key].spineData !== undefined) {
              gameSpines[key].spineAnimations = e.resources[key].spineData;
            }
          } else if (key.indexOf('SpriteImage-') >= 0) {
            if (e.resources[key].extension === 'json') {
              frames = e.resources[key].spritesheet._frameKeys;
              for (i = 0; i < frames.length; i++) {
                texture = PIXI.Texture.from(frames[i]);
                textureName = frames[i];
                textureName = textureName.replace('/', '');
                if (gameImageResource[textureName] !== undefined) {
                  gameImageResource[textureName].Texture = texture;
                } else {
                  //console.log(textureName);
                }
              }
            }
          } else if (key.indexOf('Sprite-') >= 0) {
            if (e.resources[key].extension === 'json') {
              spriteName = gameSpriteResource[key].spriteName;
              textures = gameSprite[spriteName].textures;
              frames = e.resources[key].spritesheet._frameKeys;
              for (i = 0; i < frames.length; i++) {
                texture = PIXI.Texture.from(frames[i]);
                textures.push(texture)
              }
              textures.sort(
                function (a, b) {
                  let aSort = parseInt(a.textureCacheIds[0].replace(spriteName + '/', ''));
                  let bSort = parseInt(b.textureCacheIds[0].replace(spriteName + '/', ''));
                  return aSort - bSort
                }
              );
              gameSprite[spriteName].textures = textures;
            }
          } else if (key.indexOf('Sound-') >= 0) {
            soundName = key.replace('Sound-', '');
            gameSounds[soundName] = e.resources[key].sound;
          } else {
            gameImageResource[key].Texture = parent.loadTexture(e.resources[key].texture);
          }
        }
        $('.loader-text').css('display', 'none');
        //$('.loader-logo').css('display', 'block');
        gameEvent.hideLoader();
        setTimeout(
          function () {
            gameInfo.resourceLoaded = true;
            jetX.init();
            jetX.scale();
            gameEvent.gameReady();
            window.parent.postMessage({
              name: 'loaded',
              infoOnStart: board.showGameInfoOnStart
            }, '*');
          },
          1
        );
      }
    );
    game.ticker.add(
      function (delta) {
        gameInfo.fps.label.text = 'FPS: ' + parseInt(game.ticker.FPS);
        jetX.animations(delta);
      }
    );
  };
  this.createContainer = function () {
    for (let key in gameContainer) {
      let parentContainer = game.stage;
      if (gameContainer[key].parent !== null) {
        parentContainer = gameContainer[gameContainer[key].parent].container;
      }
      let container = new PIXI.Container();
      parentContainer.addChild(container);
      container.zOrder = gameContainer[key].zOrder;
      container.defaultX = gameContainer[key].x;
      container.x = container.defaultX + gameInfo.paddingLeft;
      container.y = gameContainer[key].y;
      gameContainer[key].container = container;
    }
    this.sortContainer();
  };
  this.drawText = function (TextId, params) {
    let defaultInfo = {
      text: '',
      x: - 500,
      y: - 500,
      zOrder: 1,
      style: {
        fontFamily: 'IntroBlackCaps',
        fontSize: 25,
        fill: [
          '#ffffff'
        ],
        align: 'center'
      }
    };
    if (gameText[TextId] === undefined) {
      gameText[TextId] = defaultInfo;
    }
    let style = new PIXI.TextStyle(gameText[TextId].style);
    let text = new PIXI.Text(gameText[TextId].text, style);
    text.x = gameText[TextId].x;
    text.y = gameText[TextId].y;
    text.zOrder = gameText[TextId].zOrder;
    if (
      gameText[TextId].style.align !== undefined &&
      gameText[TextId].style.align === 'center'
    ) {
      text.anchor.set(0.5, 0);
    } else if (
      gameText[TextId].style.align !== undefined &&
      gameText[TextId].style.align === 'right'
    ) {
      text.anchor.set(1, 0);
    }
    if (params !== undefined && params !== null) {
      for (let key in params) {
        if (key !== 'container') {
          if (key === 'scale') {
            text.scale.set(params[key]);
          } else {
            text[key] = params[key];
          }
        }
      }
    }
    if (style !== undefined && style !== null && style.rotation !== undefined) {
      text.rotation = style.rotation;
    }
    let container = game.stage;
    if (
      params !== undefined &&
      params !== null &&
      params.container !== undefined
    ) {
      if (typeof params.container === 'string') {
        container = gameContainer[params.container].container;
      } else {
        container = params.container;
      }
    }
    container.addChild(text);
    this.sortContainerChildren(container);
    gameText[TextId].label = text;
  };
  this.returnText = function (textId, params) {
    let defaultInfo = {
      text: '',
      x: - 500,
      y: - 500,
      zOrder: 1,
      style: {
        fontFamily: 'IntroBlackCaps',
        fontSize: 25,
        fill: [
          '#ffffff'
        ],
        align: 'center'
      }
    };
    if (gameText[textId] === undefined) {
      gameText[textId] = defaultInfo;
    }
    let style = new PIXI.TextStyle(gameText[textId].style);
    let text = new PIXI.Text(gameText[textId].text, style);
    text.x = gameText[textId].x;
    text.y = gameText[textId].y;
    text.zOrder = gameText[textId].zOrder;
    if (
      gameText[textId].style.align !== undefined &&
      gameText[textId].style.align === 'center'
    ) {
      text.anchor.set(0.5, 0);
    } else if (
      gameText[textId].style.align !== undefined &&
      gameText[textId].style.align === 'right'
    ) {
      text.anchor.set(1, 0);
    }
    if (params.align !== undefined && params.align === 'center') {
      text.anchor.set(0.5, 0);
    } else if (params.align !== undefined && params.align === 'right') {
      text.anchor.set(1, 0);
    }
    if (params !== undefined && params !== null) {
      for (let key in params) {
        if (key !== 'container') {
          if (key === 'scale') {
            text.scale.set(params[key]);
          } else {
            text[key] = params[key];
          }
        }
      }
    }
    if (style !== undefined && style !== null && style.rotation !== undefined) {
      text.rotation = style.rotation;
    }
    let container = game.stage;
    if (
      params !== undefined &&
      params !== null &&
      params.container !== undefined
    ) {
      if (typeof params.container === 'string') {
        container = gameContainer[params.container].container;
      } else {
        container = params.container;
      }
    }
    container.addChild(text);
    this.sortContainerChildren(container);
    return text;
  };
  this.loadTexture = function (texture) {
    return texture;
  };
  this.getParamContainer = function (params) {
    let container = game.stage;
    if (params.container !== undefined) {
      if (typeof params.container === 'string') {
        container = gameContainer[params.container].container;
      } else {
        container = params.container;
      }
    }
    return container;
  };
  this.drawImage = function (imageId, params) {
    let defaultInfo = {
      x: 0,
      y: 0,
      zOrder: 1,
      texture: 'StartDefault',
      Button: false,
      Image: null
    };
    if (gameImage[imageId] === undefined) {
      gameImage[imageId] = defaultInfo;
    }
    let imageInfo = gameImage[imageId];
    let texture = gameImageResource[imageInfo.texture].Texture;
    let image = new PIXI.Sprite(texture);
    image.x = imageInfo.x;
    image.y = imageInfo.y;
    image.zOrder = imageInfo.zOrder;
    let notSetParams = [
      'container',
      'hitArea'
    ];
    for (let key in params) {
      if (notSetParams.indexOf(key) === - 1) {
        if (key === 'scale') {
          image.scale.set(params[key]);
        } else {
          image[key] = params[key];
        }
      }
    }
    if (imageInfo.Button) {
      image.interactive = true;
      image.buttonMode = true;
      if (params.hitArea !== undefined) {
        let hitArea = params.hitArea;
        image.hitArea = new PIXI.Rectangle(hitArea.x, hitArea.y, hitArea.w, hitArea.h);
      } else if (imageInfo.hitArea !== undefined) {
        let hitArea = imageInfo.hitArea;
        image.hitArea = new PIXI.Rectangle(hitArea.x, hitArea.y, hitArea.w, hitArea.h);
      } else if (imageInfo.hitAreaPolygon !== undefined) {
        let hitArea = imageInfo.hitAreaPolygon;
        image.hitArea = new PIXI.Polygon(hitArea);
        /*
                let poly = new PIXI.Graphics()
                    .beginFill(0x00ffcc)
                    .drawPolygon(hitArea);
                poly.defaultX = imageInfo.x;
                poly.x = imageInfo.x;
                poly.y = imageInfo.y;
                poly.zOrder = imageInfo.zOrder + 1;
                gameContainer[params.container].container.addChild(poly);
                */
      }
      image.mouseover = function (mouseData) {
        Button['mouseOver'](this, imageId, mouseData);
      };
      image.mouseout = function (mouseData) {
        Button['mouseOut'](this, imageId, mouseData);
      };
      image.pointerdown = function (mouseData) {
        Button['pointerDown'](this, imageId, mouseData);
      };
      image.pointerup = function (mouseData) {
        Button['pointerUp'](this, imageId, mouseData);
      };
    }
    let container = this.getParamContainer(params);
    container.addChild(image);
    this.sortContainerChildren(container);
    gameImage[imageId].Image = image;
  };
  this.returnImage = function (imageId, params) {
    if (gameImageResource[imageId] === undefined) {
      imageId = 'StartDefault';
    }    //PIXI.utils.TextureCache['imageId']
    let image = new PIXI.Sprite(gameImageResource[imageId].Texture);
    if (params.align !== undefined && (params.align === 'center')) {
      image.anchor.set(0.5, 0.5);
    }
    let notSetParams = [
      'container'
    ];
    for (let key in params) {
      if (notSetParams.indexOf(key) === - 1) {
        if (key === 'scale') {
          image.scale.set(params[key]);
        } else {
          image[key] = params[key];
        }
      }
    }
    let container = this.getParamContainer(params);
    container.addChild(image);
    this.sortContainerChildren(container);
    return image;
  };
  this.drawSprite = function (spriteId, params) {
    let textures = gameSprite[spriteId].textures;
    let spriteObject = new PIXI.AnimatedSprite(textures);
    spriteObject.x = gameSprite[spriteId].x;
    spriteObject.y = gameSprite[spriteId].y;
    spriteObject.zOrder = gameSprite[spriteId].zOrder;
    //spriteObject.anchor.set(0.5);
    spriteObject.gotoAndPlay(0);
    //spriteObject.loop = false;
    let notSetParams = [
      'container'
    ];
    for (let key in params) {
      if (notSetParams.indexOf(key) === - 1) {
        if (key === 'scale') {
          spriteObject.scale.set(params[key]);
        } else {
          spriteObject[key] = params[key];
        }
      }
    }
    if (
      params === undefined ||
      params === null ||
      params.animationSpeed === undefined
    ) {
      spriteObject.animationSpeed = 0.4;
    }
    let container = this.getParamContainer(params);
    container.addChild(spriteObject);
    this.sortContainerChildren(container);
    gameSprite[spriteId].sprite = spriteObject;
  };
  this.returnSprite = function (spriteId, params) {
    let textures = gameSprite[spriteId].textures;
    let spriteObject = new PIXI.AnimatedSprite(textures);
    //spriteObject.anchor.set(0.5);
    let width = spriteObject.width;
    let height = spriteObject.height;
    spriteObject.loop = false;
    let x,
      y;
    let notSetParams = [
      'container'
    ];
    for (let key in params) {
      if (notSetParams.indexOf(key) === - 1) {
        if (key === 'x') {
          if (
            params !== undefined &&
            params !== null &&
            params.align !== undefined &&
            params.align === 'left'
          ) {
            x = params[key];
          } else {
            x = params[key] + width / 2;
          }
          spriteObject[key] = x;
        } else if (key === 'y') {
          if (
            params !== undefined &&
            params !== null &&
            params.verticalAlign !== undefined &&
            params.verticalAlign === 'top'
          ) {
            y = params[key];
          } else {
            y = params[key] + height / 2;
          }
          spriteObject[key] = y;
        } else if (key === 'scale') {
          spriteObject.scale.set(params[key]);
        } else if (key === 'scaleX') {
          spriteObject.scale.x = params[key];
        } else {
          spriteObject[key] = params[key];
        }
      }
    }
    if (params.animationSpeed === undefined) {
      spriteObject.animationSpeed = 0.4;
    }
    let container = this.getParamContainer(params);
    container.addChild(spriteObject);
    this.sortContainerChildren(container);
    return spriteObject;
  };
  this.drawAnimatedSpine = function (spineData, params) {
    let spineObject = new PIXI.spine.Spine(spineData);
    //spineObject.state.timeScale = 0.1;
    //spineObject.scale.set(1);
    let width = spineObject.spineData.width;
    let height = spineObject.spineData.height;
    let animationIndex = 0;
    if (
      params !== undefined &&
      params !== null &&
      params.animationIndex !== undefined
    ) {
      animationIndex = params.animationIndex;
    }
    let skinName = spineData.skins.length === 0 ? '' : spineData.skins[0].name;
    let animationName = spineData.animations[animationIndex].name;
    // set current skin
    if (skinName !== '') spineObject.skeleton.setSkinByName(skinName);
    spineObject.skeleton.setSlotsToSetupPose();
    //spineObject.skeleton.setToSetupPose();
    //spineObject.update(0);
    //spineObject.autoUpdate = false;
    let x,
      y;
    let notSetParams = [
      'container',
      'tempContainer',
      'animationIndex',
      'animate',
      'animateLoop',
      'align',
      'verticalAlign'
    ];
    for (let key in params) {
      if (notSetParams.indexOf(key) === - 1) {
        if (key === 'x') {
          if (
            params !== undefined &&
            params !== null &&
            params.align !== undefined &&
            params.align === 'left'
          ) {
            x = params[key];
          } else {
            x = params[key] + width / 2;
          }
          spineObject[key] = x;
        } else if (key === 'y') {
          if (
            params !== undefined &&
            params !== null &&
            params.verticalAlign !== undefined &&
            params.verticalAlign === 'top'
          ) {
            y = params[key];
          } else {
            y = params[key] + height / 2;
          }
          spineObject[key] = y;
        } else if (key === 'scale') {
          spineObject.scale.set(params[key]);
        } else if (key === 'scaleX') {
          spineObject.scale.x = params[key];
        } else if (key === 'scaleY') {
          spineObject.scale.y = params[key];
        } else {
          spineObject[key] = params[key];
        }
      }
    }
    let animateLoop = true;
    if (
      params !== undefined &&
      params !== null &&
      params.animateLoop !== undefined
    ) {
      animateLoop = params.animateLoop;
    }    // play animation
    if (
      params !== undefined &&
      params !== null &&
      params.animate !== undefined &&
      !params.animate
    ) {
    } else {
      spineObject.state.setAnimation(0, animationName, animateLoop);
    }
    let container = this.getParamContainer(params);
    container.addChild(spineObject);
    this.sortContainerChildren(container);
    return spineObject;
    //return game.stage.getChildIndex(spineObject);
  };
  this.removeSpine = function (containerId, spine) {
    if (spine !== null) {
      spine.destroy();
    }
  };
  this.hideSpine = function (containerId, spine) {
    if (spine !== null) {
      spine.visible = false;
    }
  };
  this.sortContainerChildren = function (container) {
    container.children.sort(
      function (a, b) {
        a.zOrder = a.zOrder ||
          0;
        b.zOrder = b.zOrder ||
          0;
        return a.zOrder - b.zOrder
      }
    );
  };
  this.sortContainer = function () {
    //game.stage
    gameContainer.Layer.container.children.sort(
      function (a, b) {
        a.zOrder = a.zOrder ||
          0;
        b.zOrder = b.zOrder ||
          0;
        return a.zOrder - b.zOrder
      }
    );
  };
  this.defaultMarginLeft = gameInfo.marginLeft;
  this.vertical = false;
  this.windowWidthMax = gameInfo.width;
  this.canvasHeight = 0;
  this.responsiveY = 0;
  this.scale = function () {
    if (!gameInfo.resourceLoaded) return false;
    let windowWidth = $('.GameParent').width();
    let windowHeight = $('.GameParent').height();
    let canvasDivHeight = windowHeight;
    if (this.canvasHeight !== 0) {
      //windowHeight = this.canvasHeight;
    }
    let containerY = 0;
    let scale = Math.min(windowWidth / gameInfo.width, windowHeight / gameInfo.height);
    if (mobile) {
      if (!vertical) {
        scale = windowWidth / gameInfo.width;
        let marginTop = windowHeight - gameInfo.height * scale;
        $('.canvas canvas').css('margin-top', marginTop);
        this.responsiveY = - marginTop / (2 * scale);
      } else {
        this.responsiveY = 0;
        $('.canvas canvas').css('margin-top', '0px');
      }
      if (this.loader.container !== null) {
        this.maxMultiplier.container.y = this.responsiveY;
        this.connectionLost.container.y = this.responsiveY;
        this.loader.container.y = this.responsiveY;
        this.graphic.container.y = this.responsiveY;
      }
    }
    game.renderer.resize(gameInfo.width, gameInfo.height);
    game.view.style.width = gameInfo.width * scale + 'px';
    game.view.style.height = gameInfo.height * scale + 'px';
    $('.GameParent').css({
      width: gameInfo.width * scale,
      'margin-left': (windowWidth - gameInfo.width * scale) / 2
    });
    window.parent.postMessage({
      name: 'jetx-main-width',
      jetxScale: scale,
      jetxPosition: $('.GameParent').offset()
    }, '*');
    /*
        let scale = Math.min(gameInfo.width / windowWidth, gameInfo.height / windowHeight);

        game.renderer.resize(windowWidth * scale, windowHeight * scale);
        game.view.style.width = windowWidth + "px";
        //game.view.style.height = windowHeight + "px";
        game.view.style.height = canvasDivHeight + "px";

        console.log(scale);
        */
  };
  this.getRandom = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  this.stringToPoly = function (string) {
    let s = (string + '').split(',');
    let points = [];
    for (let i = 0; i < s.length - 1; i += 2) {
      points.push({
        x: parseInt(s[i]),
        y: parseInt(s[i + 1])
      });
    }
    points.push({
      x: parseInt(s[0]),
      y: parseInt(s[1])
    });
    return points;
  };
  this.isPointInPoly = function (poly, ptx, pty) {
    for (let c = false, i = - 1, l = poly.length, j = l - 1; ++i < l; j = i) (
      (poly[i].y <= pty && pty < poly[j].y) ||
      (poly[j].y <= pty && pty < poly[i].y)
    ) &&
      (
        ptx < (poly[j].x - poly[i].x) * (pty - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x
      ) &&
      (c = !c);
    return c;
  };
  /*
    ფონი 0
    ღილაკები 1
    დაბლინგი - 2
    Multiplier - 3
    Boxes Bonus Wait - [8-9]
    Boxes - 10
    Start View Items [20, 30]
    ბონუსი / სუპერ ბონუსი - [31, 40]

    AutoPlay - [41, 42]
    BuyBonus - 43
    Warning - [44, 45]

    Win Lines - 50
    Win Lines Object - 80
    */
  this.stopSound = function (soundIndex) {
    if (this.sounds[soundIndex] !== null) {
      try {
        this.sounds[soundIndex].stop();
        this.sounds[soundIndex] = null;
      } catch (e) {
        console.log(soundIndex, name, e);
      }
    }
  };
  this.playSound = function (soundIndex, name, params) {
    this.stopSound(soundIndex);
    let loop = false;
    if (params !== undefined && params !== null && params.loop !== undefined) {
      loop = params.loop;
    }
    let volume = 1;
    if (params !== undefined && params !== null && params.volume !== undefined) {
      volume = params.volume;
    }
    let start = 0;
    if (params !== undefined && params !== null && params.start !== undefined) {
      start = params.start;
    }    /*
        let startTime = null;
        if(params !== undefined && params !== null && params.startTime !== undefined) {
            startTime = params.startTime;
        }
        let endTime = null;
        if(params !== undefined && params !== null && params.endTime !== undefined) {
            endTime = params.endTime;
        }
        */
    if (gameSounds[name] === undefined) return false;
    if (gameInfo.name === 'SweetCubes') {
      if (name === 'Background') {
        volume *= 0.6;
      }
    }
    this.sounds[soundIndex] = gameSounds[name];
    //this.sounds[soundIndex] = this.resources['Sound-' + name].sound;
    this.soundsVolume[soundIndex] = volume;
    let instance = this.sounds[soundIndex].play({
      volume: volume,
      loop: loop,
      start: start
    });
    if (!gameInfo.sound) {
      this.sounds[soundIndex].volume = 0;
    } else {
      this.sounds[soundIndex].volume = volume;
    }
  };
  this.capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  };
  this.createGradTexture = function () {
    // adjust it if somehow you need better quality for very very big images
    const quality = 256;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = quality;
    const ctx = canvas.getContext('2d');
    // use canvas2d API to create gradient
    const grd = ctx.createLinearGradient(0, 0, 0, quality);
    grd.addColorStop(0, '#0d1019');
    grd.addColorStop((9416 - 5610 - 1500) / 9416, '#0d1019');
    grd.addColorStop((9416 - 1500) / 9416, '#617cb8');
    grd.addColorStop(1, '#e99a8f');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 1, quality);
    return PIXI.Texture.from(canvas);
  };
}
window.addEventListener(
  'load',
  function () {
    setTimeout(function () {
      window.scrollTo(0, 1);
    }, 0);
  }
);
document.addEventListener(
  'touchmove',
  e => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  },
  {
    passive: false
  }
)
window.addEventListener(
  'message',
  function () {
    let message = event.data;
    if (message.name !== undefined) {
      if (message.name === 'prize-drop-jackpot-start') {
        for (
          let buttonIndex = 0;
          buttonIndex < player.bets.length;
          buttonIndex++
        ) {
          if ($('#bet-' + buttonIndex).hasClass('cancel-bet')) {
            PostCustomEvent(token, 'jetx.undo.bet', buttonIndex)
          }
        }
        for (let autoBetIndex = 0; autoBetIndex < 2; autoBetIndex++) {
          $('#auto-bet-' + autoBetIndex).prop('checked', false);
        }
      }
    }
  }
);
window.addEventListener(
  'scroll',
  function () {
    promoPrizeIcon(true);
    if (scrollElement.scrollTop() < 2) {
      $('.scroll-top').fadeOut(100);
    } else {
      $('.scroll-top').fadeIn(100);
    }
  }
);
function promoPrizeIcon(show = false, timeout = 1) {
  setTimeout(
    function () {
      let visible = scrollElement.scrollTop() < 2;
      if (
        $('#info-on-start').is(':visible') ||
        $('.help-popup').is(':visible') ||
        $('.hash-popup').is(':visible') ||
        $('.gift-popup').is(':visible') ||
        $('.sound-popup').is(':visible') ||
        (mobile && $('.chat').is(':visible')) ||
        $('.history-list').hasClass('active')
      ) {
        visible = false;
      }
      if (!show) visible = show;
      window.parent.postMessage({
        name: visible ? 'prize-drop-show-icon' : 'prize-drop-hide-icon'
      }, '*');
    },
    timeout + (show ? 50 : 0)
  );
}
let playersCurrent = [];
let playersActive = [];
let playersCashOut = [];
function getRowHeight() {
  return mobile ? (vertical ? 27 : 23) : 31;
}
function getRowCount() {
  let height = $('.info-content.bets').height();
  return Math.ceil(height / rowHeight);
}
function playersFinish() {
  playersCurrent = [];
  playersActive = [];
  playersCashOut = [];
}
$(document).ready(function () {
  playersScroll();
});
function playersInsert(type, item, data, sort = true) {
  let inserted = false;
  if (sort) {
    for (let i = 0; i < data.length; i++) {
      if (type === 'current') {
        if (item.playerId === data[i].playerId) {
          data.splice(i, 1);
        }
      } else {
        if (item.bet >= data[i].bet) {
          inserted = true;
          data.splice(i, 0, item);
          break;
        }
      }
    }
  }
  if (type === 'cashOut') {
    data.splice(0, 0, item);
  } else {
    if (!inserted) {
      data.push(item);
    }
  }
  playersDraw(type);
}
function playersDelete(type, playerId, data) {
  for (let i = 0; i < data.length; i++) {
    if (playerId === data[i].playerId) {
      data.splice(i, 1);
      break;
    }
  }
  playersDraw(type);
}
function playersScroll() {
  $('.info-content.bets').on('scroll', function () {
    playersDraw('');
  });
}
function playersDraw(type) {
  if (type === 'current') {
    window.jetXReact.setCurrent(playersCurrent);
  } else {
    let currentHeight = $('#playersCurrent').height();
    let activeHeight = playersActive.length * rowHeight;
    let cashOutHeight = playersCashOut.length * rowHeight;
    let scrollTop = 0;
    if (mobile) {
      scrollTop = $('.info-content.bets .list').scrollTop() - currentHeight;
    } else {
      scrollTop = $('.info-content.bets').scrollTop() - currentHeight;
    }
    let activeStart = Math.floor(scrollTop / rowHeight) - 2;
    activeStart = activeStart < 0 ? 0 : activeStart;
    activeStart = Math.min(activeStart, playersActive.length - 1);
    let activeEnd = activeStart + rowCount + 2;
    activeEnd = Math.min(activeEnd, playersActive.length);
    let list = [];
    if (playersActive.length > 0) {
      for (let i = activeStart; i < activeEnd; i++) {
        list.push(playersActive[i]);
      }
    }
    window.jetXReact.setActive(list, activeHeight, activeStart * rowHeight);
    scrollTop -= activeHeight;
    let cashOutStart = Math.floor(scrollTop / rowHeight) - 2;
    cashOutStart = cashOutStart < 0 ? 0 : cashOutStart;
    cashOutStart = Math.min(cashOutStart, playersCashOut.length - 1);
    let cashOutEnd = cashOutStart + rowCount + 2;
    cashOutEnd = Math.min(cashOutEnd, playersCashOut.length);
    list = [];
    if (playersCashOut.length > 0) {
      for (let i = cashOutStart; i < cashOutEnd; i++) {
        list.push(playersCashOut[i]);
      }
    }
    if (jetX.game.loader) {
      playersCashOut = [];
      list = [];
      cashOutHeight = 0;
      cashOutStart = 0;
      document.getElementById('playersCashOut').innerHTML = '';
      document.getElementById('playersCashOut').style.height = '0';
      document.getElementById('playersCashOut').style.paddingTop = '0';
    }
    window.jetXReact.setCashOut(list, cashOutHeight, cashOutStart * rowHeight);
  }
}
function playersClear() {
  if (window.jetXReact !== undefined) {
    window.jetXReact.setCurrent([]);
    window.jetXReact.setActive([], 0, 0);
    window.jetXReact.setCashOut([], 0, 0);
  }
  if (document.getElementById('playersCurrent')) {
    document.getElementById('playersCurrent').innerHTML = '';
    document.getElementById('playersActive').innerHTML = '';
    document.getElementById('playersActive').style.height = '0';
    document.getElementById('playersActive').style.paddingTop = '0';
    document.getElementById('playersCashOut').innerHTML = '';
    document.getElementById('playersCashOut').style.height = '0';
    document.getElementById('playersCashOut').style.paddingTop = '0';
  }
}
function playersInfo(playersInfo, load = true) {
  playersClear();
  if (load) {
    for (let i = 0; i < playersInfo.length; i++) {
      playersInfoItem(playersInfo[i]);
    }
  }
}
function playersInfoItem(spin, small = false, cashouted = false) {
  let currency,
    currencyCode,
    fractionDigit;
  let counterId,
    betPlace,
    current,
    displayName,
    betAmount,
    cashout,
    winAmount,
    portalName;
  if (small) {
    currency = spin.currency;
    currencyCode = currency.currencyCode;
    fractionDigit = currency.fractionDigit;
    counterId = spin.counterId;
    betPlace = spin.betPlace;
    current = counterId === player.counterId;
    displayName = formatClientName(spin.displayName, current);
    betAmount = spin.betAmount;
    cashout = spin.cashout;
    winAmount = spin.winAmount;
    portalName = spin.portalName;
  } else {
    currency = spin.Currency;
    currencyCode = currency.CurrencyCode;
    fractionDigit = currency.FractionDigit;
    counterId = spin.CounterId;
    betPlace = spin.BetPlace;
    current = counterId === player.counterId;
    displayName = formatClientName(spin.DisplayName, current);
    betAmount = spin.BetAmount;
    cashout = spin.Cashout;
    winAmount = spin.WinAmount;
    portalName = spin.PortalName;
  }
  if (board.isPortalFilterOn && player.portalName !== portalName) {
    return false;
  }
  let status = (winAmount > 0 ? ' win' : '');
  status += current ? ' current' : '';
  if (board.convertToPlayerCurrency) {
    betAmount = parseFloat(
      (betAmount * board.exchangeRate).toFixed(player.currency.fractionDigit)
    );
    winAmount = parseFloat(
      (winAmount * board.exchangeRate).toFixed(player.currency.fractionDigit)
    );
    if (currencyCode !== player.currency.currencyCode) {
      if (betAmount < board.minBet) {
        betAmount = board.minBet;
      } else if (betAmount > board.maxBet) {
        betAmount = board.maxBet;
      }
      betAmount = parseFloat(betAmount);
      if (betAmount > 1) {
        let pr = betAmount * 0.1;
        betAmount -= pr;
        pr = parseInt(pr);
        if (pr !== 0) {
          pr += '';
          pr = pr.length;
        }
        pr = Math.pow(10, pr);
        betAmount = Math.floor(betAmount / pr) * pr;
      }
      if (betAmount === 0) betAmount = board.minBet;
      betAmount = betAmount.toFixed(
        player.currency.fractionDigit - 1 < 0 ? 0 : player.currency.fractionDigit - 1
      );
      winAmount = betAmount * cashout;
    }
    currencyCode = player.currency.currencyCode;
    fractionDigit = player.currency.fractionDigit;
  }
  let bet = betAmount;
  let betAmountFormated = formatAmount(betAmount, {
    currencyCode,
    fractionDigit
  });
  let cashoutFormated = cashout === 0 ? '--' : cashout;
  let winAmountFormated = winAmount === 0 ? '--' : formatAmount(winAmount, {
    currencyCode,
    fractionDigit
  });
  let playerId = counterId + '-' + betPlace;
  if (cashouted) playerId += '-c';
  bet = parseFloat(bet);
  let item = {
    playerId: playerId,
    bet: bet,
    status: status,
    displayName: displayName,
    betAmount: betAmount,
    cashoutFormated: cashoutFormated,
    winAmount: winAmount,
    currency: {
      currencyCode,
      fractionDigit
    },
  };
  if (current) {
    if (cashouted) {
      PlaySound(10, 'Win');
      buttonMessage(
        betPlace,
        {
          winAmount: winAmountFormated,
          cashout: cashoutFormated
        },
        3000,
        'cashout'
      );
    }
    playersInsert('current', item, playersCurrent);
  } else if (winAmount > 0) {
    playersInsert('cashOut', item, playersCashOut, false);
  } else {
    playersInsert('active', item, playersActive);
  }
  return true;
}
function playerCashOut(spin) {
  let current = spin.counterId === player.counterId;
  let cashout = spin.cashout;
  playerUndo(spin);
  let cashOutAnimate = playersInfoItem(spin, true, true);
  if (cashOutAnimate) {
    jetX.cashOut(cashout, current);
  }
}
function playerUndo(spin) {
  let playerId = `${spin.counterId}-${spin.betPlace}`;
  let current = spin.counterId === player.counterId;
  playersDelete(
    current ? 'current' : 'active',
    playerId,
    current ? playersCurrent : playersActive
  );
}
function playerBet(spin) {
  playersInfoItem(spin, true);
}
function formatClientName(name, current = false) {
  //return current ? player.displayName : name[0] + '*****' + name[1];
  return name;
}
function GameEvents() {
  this.onAppFrameReady = function () {
    this.sendMessage('onAppFrameReady');
  };
  this.quit = function () {
    this.sendMessage('quit');
  };
  this.gameReady = function () {
    this.sendMessage('gameReady');
  };
  this.cashier = function () {
    this.sendMessage('cashier');
  };
  this.gameDataLoaded = function () {
    this.sendMessage('gameDataLoaded');
  };
  this.roundStart = function () {
    this.sendMessage('roundStart');
  };
  this.roundStarted = function () {
    this.sendMessage('roundStarted');
  };
  this.autoPlayStarted = function () {
    this.sendMessage('autoPlayStarted');
  };
  this.autoPlayStoped = function () {
    this.sendMessage('autoPlayStoped');
  };
  this.balance = function () {
    this.sendMessage('balance');
  };
  this.ticketReceived = function () {
    this.sendMessage('ticketReceived');
  };
  this.roundEnded = function () {
    this.sendMessage('roundEnded');
  };
  this.showLoader = function () {
    this.sendMessage('showLoader');
  };
  this.hideLoader = function () {
    this.sendMessage('hideLoader');
  };
  this.betAction = function () {
    this.sendMessage('betAction');
  };
  this.updateBet = function () {
    this.sendMessage('updateBet');
  };
  this.errorMessage = function (errorObject) {
    this.sendMessage('errorMessage', errorObject);
  };
  this.sendMessage = function (type, errorObj) {
    let messageObject = {
      name: 'integration',
      sender: 'JetX',
      lang: localeCode,
      type: type,
      errorObject: errorObj
    };
    messageObject.data = {
      playerTokenId: player.key,
      clientToken: player.counterId,
      currencyCode: player.currency.currencyCode,
      balance: player.availableAmount,
      winAmount: player.win,
      totalBet: player.totalBet,
      activeBet: player.activeBet,
    };
    window.parent.postMessage(messageObject, '*');
  };
  this.receiveMessage = function () {
    window.addEventListener('message', EventHandler, false);
    function EventHandler(eventData) {
      switch (eventData.data.type) {
        case 'integrationStopAutobet':
          if ($('#auto-bet-0').is(':checked')) {
            $('#auto-bet-0').click();
          }
          if ($('#auto-bet-1').is(':checked')) {
            $('#auto-bet-1').click();
          }
          if ($('#auto-bet-2').is(':checked')) {
            $('#auto-bet-2').click();
          }
          if ($('#auto-bet-3').is(':checked')) {
            $('#auto-bet-3').click();
          }
          break;
        case 'integrationDisableSpin':
          for (let i = 0; i < player.bets.length; i++) {
            $('#bet-' + i).addClass('disabled');
          }
          break;
        case 'integrationEnableSpin':
          for (let i = 0; i < player.bets.length; i++) {
            $('#bet-' + i).removeClass('disabled');
          }
          break;
        case 'integrationRefreshBalance':
          updateBalanceRepost = true;
          PostCustomEvent(token, 'update.balance');
          break;
        case 'integrationFailedCommunication':
          //enableSpin();
          break;
        case 'integrationConnectionEstablished':
          //enableSpin();
          break;
        case 'integrationResizeGame':
          //enableSpin();
          break;
      }
    }
  };
}
let gameEvent = new GameEvents();
gameEvent.receiveMessage();
gameEvent.onAppFrameReady();
