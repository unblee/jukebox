window.Util = {
  humanizeTimeFromSeconds(seconds) {
    const s = seconds % 60;
    const m = Math.floor(seconds / 60) % 60;
    const h = Math.floor(seconds / 3600);
    const padding = num => `00${num}`.slice(-2);
    return `${padding(h)}:${padding(m)}:${padding(s)}`;
  }
};
