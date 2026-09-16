(()=>{
  'use strict';
  // The reference shell is now implemented directly by index.html + site.css.
  // Keep this file as a compatibility hook for existing deployment wiring; it must not
  // rebuild navigation or inject a second visual system over the master layout.
  document.documentElement.dataset.publicUi='reference-v4';
})();
