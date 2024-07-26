const THEMES= ['light', 'dark'];

const DISPLAYS = {
  NONE: 'none',
  FALSE: 'false',
  TRUE: 'true',
  AUTO: 'auto',
  ONCE: 'once'
};

const THRESHOLDS = [0, .01];

class Pictogram {
  constructor() {
    this._isAuto = false;
    this._display = DISPLAYS.NONE;
    this.doc = document.documentElement;
    this.frame = window.frameElement;
    this.mutation = new MutationObserver(this.mutate.bind(this));
    this.mutation.observe(this.frame, { attributes: true });
    this.mutate();
    this.paths = [...this.doc.querySelectorAll('path')];
    window.addEventListener('storage', this.update.bind(this));
    /*
    const title = this.doc.getElementsByTagName('title')[0].textContent;
    if (title) this.frame.setAttribute('title', title);
     */
    this.resizer = new ResizeObserver(this.resize.bind(this));
    this.resizer.observe(this.doc);
    this.resize();
  }

  mutate () {
    const accent = this.frame.getAttribute('data-fr-accent');
    if (accent) this.doc.setAttribute('data-fr-accent', accent);
    else this.doc.removeAttribute('data-fr-accent');
    this.display = this.frame.getAttribute('data-fr-display');
  }

  update () {
    this.doc.setAttribute('data-fr-theme', this.theme);
  }

  get theme () {
    const store = localStorage.getItem('dsfr');
    if (store) {
      const data = JSON.parse(store);
      if (THEMES.includes(data.theme)) return data.theme;
    }
    return THEMES[0];
  }

  get display () {
    return this._display;
  }

  set display (value) {
    if (!value) value = DISPLAYS.NONE;
    if (this._display === value) return;
    switch (value) {
      case DISPLAYS.NONE:
        this.isAuto = false;
        this.isDisplayed = null;
        break;
      case DISPLAYS.FALSE:
        this.isAuto = false;
        this.isDisplayed = false;
        break;
      case DISPLAYS.TRUE:
        this.isAuto = false;
        this.isDisplayed = true;
        break;
      case DISPLAYS.AUTO:
        this.isAuto = true;
        break;
      case DISPLAYS.ONCE:
        this.isAuto = true;
        break
    }

    this._display = value;
  }

  get isAuto () {
    return this._isAuto;
  }

  set isAuto (value) {
    if (this._isAuto === value) return;
    console.log('isAuto:', value);
    if (this._isAuto) this.unobserveIntersection();
    this._isAuto = value;
    if (this._isAuto) this.observeIntersection();
  }

  get isDisplayed () {
    return this._isDisplayed;
  }

  set isDisplayed (value) {
    if (this._isDisplayed === value) return;
    this._isDisplayed = value;
    switch (this._isDisplayed) {
      case null:
        this.doc.removeAttribute('data-fr-display');
      case true:
        this.doc.setAttribute('data-fr-display', 'true');
        break;
      case false:
        this.doc.setAttribute('data-fr-display', 'false');
        break;
    }
  }

  observeIntersection () {
    console.log('observeIntersection');
    this.intersection = new IntersectionObserver(this.intersect.bind(this),  { root: null, rootMargin: '0px', threshold: THRESHOLDS });
    this.intersection.observe(this.frame);
  }

  unobserveIntersection () {
    console.log('unobserveIntersection');
    this.intersection.unobserve(this.frame);
  }

  intersect (entries) {
    console.log(entries);
    const intersectionRatio = entries[0].intersectionRatio;
    switch (this.display) {
      case DISPLAYS.AUTO:
        switch (true) {
          case intersectionRatio <= THRESHOLDS[0] && this.isDisplayed === true:
            this.isDisplayed = false;
            break;

          case intersectionRatio >= THRESHOLDS[1] && this.isDisplayed !== true:
            this.isDisplayed = true;
            break;
        }
        break;
      case DISPLAYS.ONCE:
        if (intersectionRatio >= THRESHOLDS[1]) {
          this.isDisplayed = true;
          this.unobserveIntersection();
        }
        break;
    }
  }

  resize (entries) {
    const width = this.doc.getBoundingClientRect().width;
    this.doc.style.setProperty('--stroke-width', `${this.isAuto ? 1 + Math.pow(80 / width, .75) : 2}`);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.pictogram = new Pictogram();
});
