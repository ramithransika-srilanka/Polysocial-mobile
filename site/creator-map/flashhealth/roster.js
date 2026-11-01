/*
 * Which creators are on the Flash Health creator map, shared by the map
 * (/creator-map/flashhealth) and the creator list (/creator-list).
 *
 * data.js decides the starting line-up: everyone in `creators` is on the map,
 * everyone in `parked` is off it. The Add / Remove buttons on the creator list
 * change that for this browser only: the changes are kept in localStorage,
 * which both pages share, so they never touch data.js or what other visitors
 * see. A creator is keyed by their Instagram handle (or name without one).
 */
(function () {
  var KEY = "polysocial.creatorMap.flashhealth.roster";
  var DATA = window.CREATOR_MAP || { creators: [] };

  function keyOf(c) { return String(c.handle || c.name || "").trim().replace(/^@/, "").toLowerCase(); }
  // { key: true (added) | false (removed) }, only for creators changed from data.js.
  function read() {
    try { var v = JSON.parse(localStorage.getItem(KEY)); return v && typeof v === "object" ? v : {}; }
    catch (e) { return {}; }
  }
  function write(v) {
    try { if (Object.keys(v).length) localStorage.setItem(KEY, JSON.stringify(v)); else localStorage.removeItem(KEY); }
    catch (e) {}
  }

  // Everyone in data.js, each with `onMapByDefault`.
  function all() {
    return (DATA.creators || []).map(function (c) { return Object.assign({ onMapByDefault: true }, c); })
      .concat((DATA.parked || []).map(function (c) { return Object.assign({ onMapByDefault: false }, c); }));
  }
  function onMap(c) {
    var o = read()[keyOf(c)];
    return typeof o === "boolean" ? o : c.onMapByDefault !== false;
  }
  function set(c, on) {
    var o = read(), k = keyOf(c);
    if (on === (c.onMapByDefault !== false)) delete o[k]; else o[k] = on;
    write(o);
  }

  window.CREATOR_ROSTER = {
    KEY: KEY,
    all: all,
    onMap: onMap,
    set: set,
    // The creators the map should show, in data.js order.
    mapCreators: function () { return all().filter(onMap); },
    // True once this browser's line-up differs from data.js.
    changed: function () { return all().some(function (c) { return onMap(c) !== (c.onMapByDefault !== false); }); },
    reset: function () { write({}); }
  };
})();
