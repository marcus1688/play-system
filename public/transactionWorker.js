let interval = null;
let countdown = 15;

self.onmessage = function (e) {
  if (e.data === "start") {
    if (interval) {
      clearInterval(interval);
    }
    countdown = 15;
    self.postMessage({
      type: "countdown",
      value: countdown,
    });

    interval = setInterval(() => {
      countdown--;

      if (countdown <= 0) {
        self.postMessage({
          type: "fetch",
        });
        countdown = 15;
        self.postMessage({
          type: "countdown",
          value: countdown,
        });
      } else {
        self.postMessage({
          type: "countdown",
          value: countdown,
        });
      }
    }, 1000);
  } else if (e.data === "stop") {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  } else if (e.data === "reset") {
    countdown = 15;
    self.postMessage({
      type: "countdown",
      value: countdown,
    });
  }
};
