/* =========================================
   HANC // TELEGRAM INTEGRATION
   telegram.js
========================================= */

const tg = window.Telegram.WebApp;

/* INIT */

if (tg) {

  tg.ready();

  tg.expand();

  /* COLORS */

  tg.setHeaderColor("#000000");

  tg.setBackgroundColor("#000000");

}

/* DISABLE VERTICAL SWIPE */

if (tg && tg.disableVerticalSwipes) {

  tg.disableVerticalSwipes();

}

/* HAPTIC FEEDBACK */

function hapticLight() {

  if (!tg || !tg.HapticFeedback) return;

  tg.HapticFeedback.impactOccurred(
    "light"
  );

}

function hapticMedium() {

  if (!tg || !tg.HapticFeedback) return;

  tg.HapticFeedback.impactOccurred(
    "medium"
  );

}

function hapticHeavy() {

  if (!tg || !tg.HapticFeedback) return;

  tg.HapticFeedback.impactOccurred(
    "heavy"
  );

}

function hapticSuccess() {

  if (!tg || !tg.HapticFeedback) return;

  tg.HapticFeedback.notificationOccurred(
    "success"
  );

}

function hapticError() {

  if (!tg || !tg.HapticFeedback) return;

  tg.HapticFeedback.notificationOccurred(
    "error"
  );

}

/* TELEGRAM USER */

let telegramUser = null;

if (

  tg &&
  tg.initDataUnsafe &&
  tg.initDataUnsafe.user

) {

  telegramUser =
    tg.initDataUnsafe.user;

  console.log(
    "Telegram User:",
    telegramUser
  );

}

/* OPTIONAL:
   SHOW PLAYER NAME
*/

function getPlayerName() {

  if (
    telegramUser &&
    telegramUser.first_name
  ) {

    return telegramUser.first_name;

  }

  return "PLAYER";

}

/* SCORE SHARE */

function shareScore(score) {

  const text =

`I survived the HANC NEON VOID and scored ${score} points.

Can you beat me?`;

  if (tg && tg.openTelegramLink) {

    tg.openTelegramLink(

      `https://t.me/share/url?url=https://t.me/YOUR_BOT_USERNAME&text=${encodeURIComponent(text)}`

    );

  }

}

/* SAVE SCORE */

function saveScore(score) {

  localStorage.setItem(
    "hanc_last_score",
    score
  );

}

/* GET BEST SCORE */

function getBestScore() {

  return localStorage.getItem(
    "hanc_best"
  ) || 0;

}

/* CLOUD SAVE PLACEHOLDER */

async function saveCloudScore(score) {

  /*
    FUTURE:
    connect backend here
  */

  console.log(
    "Cloud save score:",
    score
  );

}

/* GAME EVENTS */

function onSignalCollected() {

  hapticLight();

}

function onCombo(combo) {

  if (combo % 5 === 0) {

    hapticMedium();

  }

  if (combo % 15 === 0) {

    hapticHeavy();

  }

}

function onGameOver(score) {

  hapticError();

  saveScore(score);

  saveCloudScore(score);

}

/* MAIN BUTTON */

function showMainButton() {

  if (!tg || !tg.MainButton) return;

  tg.MainButton.setText(
    "PLAY AGAIN"
  );

  tg.MainButton.show();

  tg.MainButton.onClick(() => {

    location.reload();

  });

}

function hideMainButton() {

  if (!tg || !tg.MainButton) return;

  tg.MainButton.hide();

}

/* BACK BUTTON */

if (tg && tg.BackButton) {

  tg.BackButton.hide();

}

/* PREVENT SCROLL */

document.body.addEventListener(

  "touchmove",

  function(e){

    e.preventDefault();

  },

  { passive:false }

);

/* FULLSCREEN FEEL */

document.body.style.overscrollBehavior =
  "none";

/* READY */

console.log(
  "HANC Telegram Integration Loaded"
);