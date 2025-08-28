let deferredPrompt; // store the event
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault(); // prevent auto popup
  deferredPrompt = e;
  installBtn.style.display = "block"; // show install button
});

installBtn.addEventListener("click", async () => {
  installBtn.style.display = "none"; // hide button once clicked
  if (deferredPrompt) {
    deferredPrompt.prompt(); // show native install dialog
    const choiceResult = await deferredPrompt.userChoice;
    console.log("User response to install:", choiceResult.outcome);
    deferredPrompt = null; // reset
  }
});

// (Optional) re-show if user ignored
window.addEventListener("appinstalled", () => {
  console.log("PWA installed!");
});
