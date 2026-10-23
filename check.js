// Shows the query params this page received. On the variation it compares them
// with the params on the control URL (read from document.referrer) → PASS / FAIL.
(function () {
  var role = document.body.dataset.role;
  var CONTROL_PATH = "/campusus/health/diploma/medical-billing-and-coding-specialist";

  function params(search) {
    var out = [];
    new URLSearchParams(search).forEach(function (v, k) { out.push([k, v]); });
    return out;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function table(list) {
    if (!list.length) return "<p><i>none</i></p>";
    return "<table><tr><th>param</th><th>value</th></tr>" + list.map(function (p) {
      return "<tr><td>" + esc(p[0]) + "</td><td>" + esc(p[1]) + "</td></tr>";
    }).join("") + "</table>";
  }

  var here = params(location.search);
  var html = "";
  html += '<div class="banner">' + (role === "control" ? "CONTROL" : "VARIATION 1") + "</div>";
  html += "<h2>This URL</h2><code>" + esc(location.href) + "</code>";
  html += "<h2>Query params received (" + here.length + ")</h2>" + table(here);
  html += "<h2>Hash</h2><code>" + esc(location.hash || "(none)") + "</code>";

  if (role === "variation") {
    var ref = document.referrer, verdict;
    var refUrl = null;
    try { refUrl = ref ? new URL(ref) : null; } catch (e) {}
    if (!refUrl || refUrl.pathname.replace(/\/$/, "") !== CONTROL_PATH) {
      verdict = '<div class="verdict warn">NOT REDIRECTED FROM CONTROL — opened directly, or the referrer was stripped.<br>Referrer: ' + esc(ref || "(none)") + "</div>";
    } else {
      var sent = params(refUrl.search);
      var got = {};
      here.forEach(function (p) { (got[p[0]] = got[p[0]] || []).push(p[1]); });
      var missing = sent.filter(function (p) {
        var vals = got[p[0]] || [], i = vals.indexOf(p[1]);
        if (i === -1) return true;
        vals.splice(i, 1); return false;
      });
      var extra = [];
      Object.keys(got).forEach(function (k) { got[k].forEach(function (v) { extra.push([k, v]); }); });
      verdict = '<div class="verdict ' + (missing.length ? "fail" : "pass") + '">' +
        (missing.length ? "FAIL — " + missing.length + " param(s) lost in the redirect" : "PASS — all " + sent.length + " control param(s) arrived") + "</div>" +
        "<h2>Control URL (referrer)</h2><code>" + esc(ref) + "</code>" +
        "<h2>Sent by control (" + sent.length + ")</h2>" + table(sent) +
        (missing.length ? "<h2>Missing or changed</h2>" + table(missing) : "") +
        (extra.length ? "<h2>Extra on variation (not on control)</h2>" + table(extra) : "");
    }
    html = html.replace("</div>", "</div>" + verdict);
  } else {
    html += '<p class="note">You are seeing the control: VWO either bucketed you into Control or has not run. Press "New visitor" and reload until you get redirected.</p>';
  }

  var vwo = document.cookie.split("; ").filter(function (c) { return /^_vis_opt_exp_\d+_combi=|^_vwo_uuid/.test(c); });
  html += "<h2>VWO cookies</h2>" + (vwo.length ? "<code>" + esc(vwo.join("\n")) + "</code>" : "<p><i>none</i></p>");
  html += '<p><button id="reset">New visitor (clear VWO cookies)</button></p>';

  var style = document.createElement("style");
  style.textContent = "body{margin:0;font:15px/1.5 system-ui,sans-serif;color:#1f2328;background:#f7f7f8}" +
    "main{max-width:760px;margin:0 auto;padding:0 16px 40px}" +
    ".banner{background:var(--c);color:#fff;font-weight:700;font-size:22px;text-align:center;padding:14px;margin:0 -16px}" +
    "h2{font-size:14px;text-transform:uppercase;letter-spacing:.04em;color:#656d76;margin:22px 0 6px}" +
    "code{display:block;white-space:pre-wrap;word-break:break-all;background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:8px}" +
    "table{border-collapse:collapse;width:100%;background:#fff}td,th{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;word-break:break-all}" +
    ".verdict{margin:16px 0;padding:14px;border-radius:8px;font-weight:700;font-size:18px;color:#fff}" +
    ".pass{background:#16a34a}.fail{background:#dc2626}.warn{background:#d97706;font-size:15px}" +
    ".note{color:#656d76}button{font:inherit;padding:8px 14px;border-radius:6px;border:1px solid #d0d7de;background:#fff;cursor:pointer}";
  document.head.appendChild(style);
  var main = document.createElement("main");
  main.innerHTML = html;
  document.body.appendChild(main);

  document.getElementById("reset").onclick = function () {
    var parts = location.hostname.split(".");
    document.cookie.split("; ").forEach(function (c) {
      var name = c.split("=")[0];
      if (!/^(_vis_opt|_vwo)/.test(name)) return;
      for (var i = 0; i <= parts.length - 2; i++) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=." + parts.slice(i).join(".");
      }
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    });
    location.reload();
  };
})();
