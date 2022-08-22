function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

export function convertMsToHM(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = seconds >= 30 ? minutes + 1 : minutes;

  minutes = minutes % 60;

  hours = hours % 24;
  if (hours == 0) {
    return `Active ${minutes}m ago.`;
  } else {
    return `Active ${hours}h ago.`;
  }

  //   return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}`;
}
