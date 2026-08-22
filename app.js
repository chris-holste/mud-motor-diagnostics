/* ==========================================================================
   Mud Motor Doc — app shell / router
   Plain JS, no build step, no network dependency once cached.
   ========================================================================== */

(function () {
  "use strict";

  const appEl = document.getElementById("app");
  const headerTitle = document.getElementById("headerTitle");
  const backBtn = document.getElementById("backBtn");
  const textSizeBtn = document.getElementById("textSizeBtn");
  const offlineBanner = document.getElementById("offlineBanner");

  // ---- persisted prefs ------------------------------------------------
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
    },
  };

  // theme
  function applyTheme() {
    const t = store.get("mm_theme", "auto");
    if (t === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
  }
  applyTheme();

  // text size
  function applyFontScale() {
    const s = store.get("mm_fontscale", 1);
    document.documentElement.style.setProperty("--font-scale", s);
  }
  applyFontScale();
  textSizeBtn.addEventListener("click", () => {
    let s = store.get("mm_fontscale", 1);
    s = s >= 1.3 ? 1 : Math.round((s + 0.15) * 100) / 100;
    store.set("mm_fontscale", s);
    applyFontScale();
  });

  // ---- tiny helpers -----------------------------------------------------
  function esc(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function priorityBadge(p) {
    if (!p) return "";
    return `<span class="badge ${p}">${p}</span>`;
  }
  function sourceBadge(s) {
    if (s === "manual") return `<span class="badge manual">OEM engine manual</span>`;
    if (s === "rig") return `<span class="badge rig">Mud Buddy owner's manual</span>`;
    if (s === "field") return `<span class="badge field">field-reported</span>`;
    return "";
  }

  // Renders a list of {file, caption, callouts?} into detail-block(s) and
  // appends them to root. Used anywhere content has reference images.
  function renderImages(root, images) {
    if (!images) return;
    images.forEach((img) => {
      const block = el(`
        <div class="detail-block">
          <div class="diagram-caption">${esc(img.caption)}</div>
          <img class="diagram-img" src="${img.file}" alt="${esc(img.caption)}" loading="lazy" />
        </div>
      `);
      if (img.callouts) {
        const ul = el(`<ul></ul>`);
        img.callouts.forEach((c) => ul.appendChild(el(`<li>${esc(c)}</li>`)));
        block.appendChild(ul);
      }
      root.appendChild(block);
    });
  }

  // ---- router (simple stack-based, no hash needed) -----------------------
  const stack = [];

  function push(view) {
    stack.push(view);
    render();
  }
  function replaceTop(view) {
    stack[stack.length - 1] = view;
    render();
  }
  function goBack() {
    if (stack.length > 1) {
      stack.pop();
      render();
    }
  }
  function goHome() {
    stack.length = 0;
    stack.push({ title: "Mud Motor Doc", draw: drawHome });
    render();
  }

  backBtn.addEventListener("click", goBack);

  function render() {
    const top = stack[stack.length - 1];
    headerTitle.textContent = top.title;
    backBtn.hidden = stack.length <= 1;
    appEl.innerHTML = "";
    appEl.scrollTop = 0;
    window.scrollTo(0, 0);
    top.draw(appEl);
  }

  // ==========================================================================
  // HOME
  // ==========================================================================
  function drawHome(root) {
    root.appendChild(el(`
      <div>
        <p class="home-lead">${esc(CONTENT.meta.motor)} &middot; ${esc(CONTENT.meta.engine)}<br>Also covers Gator Tail 40 EFI motors — same powerhead.</p>
        <div class="caution-box"><b>Use at your own risk:</b> ${esc(CONTENT.disclaimer.replace(/^Use this app at your own risk\.\s*/, ""))}</div>

        <div class="section-label">Start here — most faults are electrical</div>
        <div class="card-grid single" id="triageGrid"></div>

        <div class="section-label">Diagnose a problem</div>
        <div class="card-grid" id="symptomGrid"></div>

        <div class="section-label">Reference</div>
        <div class="card-grid" id="refGrid"></div>

        <div class="section-label">On-the-water tools</div>
        <div class="card-grid single" id="toolsGrid"></div>

        <p class="footer-note">
          Engine content sourced from the official Briggs &amp; Stratton Vanguard 810 EFI service manual (bundled offline in Full Manuals).
          Field notes are community-reported, not OEM-verified — always use judgment.
        </p>
      </div>
    `));

    const triageGrid = root.querySelector("#triageGrid");
    triageGrid.appendChild(cardBtn("🔋", "How to Use a Multimeter", "Start here if you've never held one before", drawMultimeterBasics));
    triageGrid.appendChild(cardBtn("⚡", "5-Minute Electrical Triage", "Fuses → relay → grounds → connectors, fastest path first", drawElectricalTriage));
    triageGrid.appendChild(cardBtn("📍", "Component Locations & Power Path", "Where the fuse block, ECM, and grounding lug actually are", drawComponentLocations));

    const symptomGrid = root.querySelector("#symptomGrid");
    const trees = [
      ["no-crank", "🔌", "Won't Crank"],
      ["cranks-no-start", "🚫", "Cranks, No Start"],
      ["hard-start", "⏱️", "Hard to Start"],
      ["low-power", "📉", "Low Power"],
      ["hunts-surges", "〰️", "Hunts / Surges"],
    ];
    trees.forEach(([id, icon, label]) => {
      symptomGrid.appendChild(cardBtn(icon, label, "", () => openTree(id), true));
    });
    symptomGrid.appendChild(cardBtn("🧩", "Drivetrain / Prop", "Gear-down, clutch, thrust", drawDrivetrain));
    symptomGrid.appendChild(cardBtn("⚙️", "Won't Shift / Trim Issues", "No forward/reverse, drops out of gear — Mud Buddy's own guide", drawRigTroubleshootingList));

    const refGrid = root.querySelector("#refGrid");
    refGrid.appendChild(cardBtn("💡", "Read Codes (MIL)", "No scan tool needed", drawMil));
    refGrid.appendChild(cardBtn("🔢", "DTC Lookup", CONTENT.dtcCodes.length + " codes", drawDtcList));
    refGrid.appendChild(cardBtn("🧪", "Field Tests", "Fuel pressure, spark, ECM", drawFieldTestList));
    refGrid.appendChild(cardBtn("🔌", "Wiring Reference", "ECM J1/J2 pinouts", drawWiring));
    refGrid.appendChild(cardBtn("⚠️", "Known Issues", "Field-reported failures", drawFieldNotesList));
    refGrid.appendChild(cardBtn("📐", "Specs Cheat Sheet", "Voltage, pressure, etc.", drawSpecs));
    refGrid.appendChild(cardBtn("📓", "My Notes", "Your own field notes", drawMyNotes));
    refGrid.appendChild(cardBtn("📖", "Full Manuals (PDF)", "Bundled, works offline", drawManuals));

    const toolsGrid = root.querySelector("#toolsGrid");
    toolsGrid.appendChild(cardBtn("🧰", "Tools Checklist", "What to keep in the boat", drawTools));
    toolsGrid.appendChild(cardBtn("🛠️", "DIY Test Tools", "Build a fused jumper, test a relay, use a test light", drawDiyToolsList));
    toolsGrid.appendChild(cardBtn("🔗", "Field Wiring Repair", "Splice a wire, fix a ground, reseat a pin — properly", drawWireRepair));
  }

  // `action` is either a draw(root) function (pushes a new view titled
  // `title`) or an already-bound click handler (e.g. () => openTree(id))
  // — pass isHandler:true for the latter.
  function cardBtn(icon, title, sub, action, isHandler) {
    const b = el(`
      <button class="card-btn" type="button">
        <span class="card-icon">${icon}</span>
        <span class="card-title">${esc(title)}</span>
        ${sub ? `<span class="card-sub">${esc(sub)}</span>` : ""}
      </button>
    `);
    b.addEventListener("click", () => {
      if (isHandler) action();
      else push({ title, draw: action });
    });
    return b;
  }

  // ==========================================================================
  // SYMPTOM DECISION TREES
  // ==========================================================================
  function openTree(treeId) {
    const tree = CONTENT.decisionTrees[treeId];
    push({
      title: tree.title,
      draw: (root) => drawTreeStep(root, treeId, tree.start, []),
    });
  }

  function drawTreeStep(root, treeId, stepId, path) {
    const tree = CONTENT.decisionTrees[treeId];
    const step = tree.steps[stepId];

    const wrap = el(`<div></div>`);

    if (path.length === 0) {
      wrap.appendChild(el(`
        <div class="tree-header">
          <h2>${esc(tree.title)}</h2>
          <p>${esc(tree.subtitle)} ${sourceBadge(tree.source)}</p>
        </div>
      `));
    } else {
      wrap.appendChild(el(`<div class="breadcrumb">Step ${path.length + 1} of this check-list &middot; ${sourceBadge(tree.source)}</div>`));
    }

    wrap.appendChild(el(`<div class="question-card">${linkify(step.text)}</div>`));

    if (step.linkTest) {
      const test = CONTENT.fieldTests.find((t) => t.id === step.linkTest);
      if (test) {
        const howBtn = el(`<button class="pill-btn" type="button" style="margin-bottom:10px">❓ How do I do this? →</button>`);
        howBtn.addEventListener("click", () => push({ title: test.title, draw: (r) => drawFieldTestDetail(r, test) }));
        wrap.appendChild(howBtn);
      }
    }

    const row = el(`<div class="yesno-row"></div>`);
    const yesBtn = el(`<button class="big-btn yes" type="button">Yes</button>`);
    const noBtn = el(`<button class="big-btn no" type="button">No</button>`);
    row.appendChild(yesBtn);
    row.appendChild(noBtn);
    wrap.appendChild(row);

    if (path.length > 0) {
      const back = el(`<button class="text-btn" type="button">&larr; Previous question</button>`);
      back.addEventListener("click", () => {
        const prev = path[path.length - 1];
        replaceTop({ title: tree.title, draw: (r) => drawTreeStep(r, treeId, prev, path.slice(0, -1)) });
      });
      wrap.appendChild(back);
    }

    yesBtn.addEventListener("click", () => handleBranch(treeId, stepId, step.yes, path));
    noBtn.addEventListener("click", () => {
      if (step.no.action) {
        handleBranch(treeId, stepId, step.no, path);
      } else {
        replaceTop({ title: tree.title, draw: (r) => drawTreeStep(r, treeId, step.no.next, path.concat(stepId)) });
      }
    });

    root.appendChild(wrap);
  }

  function handleBranch(treeId, stepId, branch, path) {
    const tree = CONTENT.decisionTrees[treeId];
    if (branch.next) {
      replaceTop({ title: tree.title, draw: (r) => drawTreeStep(r, treeId, branch.next, path.concat(stepId)) });
      return;
    }
    // terminal action
    replaceTop({ title: tree.title, draw: (r) => drawTreeResult(r, treeId, stepId, branch, path) });
  }

  function drawTreeResult(root, treeId, stepId, branch, path) {
    const tree = CONTENT.decisionTrees[treeId];
    const wrap = el(`<div></div>`);
    wrap.appendChild(el(`<div class="breadcrumb">${esc(tree.title)}</div>`));

    if (branch.action === "dtc") {
      wrap.appendChild(el(`
        <div class="result-card">
          <h3>Go read the trouble codes</h3>
          <p>DTCs are stored. Use the MIL blink-code method (or a scan tool if you have one) to read them, then look each one up.</p>
        </div>
      `));
      const b1 = el(`<button class="pill-btn" type="button">Read codes (MIL method)</button>`);
      b1.addEventListener("click", () => push({ title: "Read Trouble Codes", draw: drawMil }));
      const b2 = el(`<button class="pill-btn" type="button">DTC lookup list</button>`);
      b2.addEventListener("click", () => push({ title: "DTC Lookup", draw: drawDtcList }));
      const row = el(`<div class="action-row"></div>`);
      row.appendChild(b1); row.appendChild(b2);
      wrap.appendChild(row);
    } else if (branch.action === "end-mfr") {
      wrap.appendChild(el(`
        <div class="result-card terminal">
          <h3>End of the guided checklist</h3>
          <p>You've worked through every step in this table with no problem found. The OEM manual's own next step at this point is: <b>contact the engine manufacturer / an authorized Briggs &amp; Stratton dealer</b> — this is beyond what can be diagnosed without shop equipment (scan tool live data, or further teardown).</p>
          <p>Before you call it: double check the <b>ECM Connector wiring reference</b> and <b>Known Issues</b> one more time — a lot of "no problem found" cases turn out to be a corroded connector pin that looks fine but isn't making contact.</p>
        </div>
      `));
      const b1 = el(`<button class="pill-btn" type="button">Wiring reference</button>`);
      b1.addEventListener("click", () => push({ title: "Wiring Reference", draw: drawWiring }));
      const b2 = el(`<button class="pill-btn" type="button">Known issues</button>`);
      b2.addEventListener("click", () => push({ title: "Known Issues", draw: drawFieldNotesList }));
      const row = el(`<div class="action-row"></div>`);
      row.appendChild(b1); row.appendChild(b2);
      wrap.appendChild(row);
    } else if (typeof branch.action === "string" && branch.action.startsWith("repair:")) {
      const text = branch.action.slice("repair:".length);
      wrap.appendChild(el(`
        <div class="result-card">
          <h3>Likely fix</h3>
          <p>${linkify(text)}</p>
        </div>
      `));
    }

    const restart = el(`<button class="text-btn" type="button">&larr; Start this check-list over</button>`);
    restart.addEventListener("click", () => openTree(treeId));
    wrap.appendChild(restart);

    const home = el(`<button class="text-btn" type="button">🏠 Home</button>`);
    home.addEventListener("click", goHome);
    wrap.appendChild(home);

    root.appendChild(wrap);
  }

  // turns spec numbers already inlined in text as-is; kept simple (no-op today,
  // hook point if we want auto-linking later)
  function linkify(text) { return esc(text); }

  // ==========================================================================
  // MIL BLINK PROCEDURE
  // ==========================================================================
  function drawMil(root) {
    const d = CONTENT.milBlinkProcedure;
    root.appendChild(el(`
      <div class="detail-block">
        <p>${sourceBadge(d.source)}</p>
        <p>${esc(d.intro)}</p>
        <div class="caution-box"><b>Quick version:</b> ${esc(d.quickVersion)}</div>
        <h3>Before you start</h3>
        <ul>${d.prereqs.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        <h3>Steps (detailed)</h3>
        <ol>${d.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
        <div class="caution-box"><b>Note:</b> ${esc(d.warning)}</div>
      </div>
    `));
    renderImages(root, d.images);
    const row = el(`<div class="action-row"></div>`);
    const btn = el(`<button class="pill-btn" type="button">Now look up your code(s) →</button>`);
    btn.addEventListener("click", () => push({ title: "DTC Lookup", draw: drawDtcList }));
    const btn2 = el(`<button class="pill-btn" type="button">Fixed it? Clear the codes →</button>`);
    btn2.addEventListener("click", () => push({ title: "Clear Codes", draw: drawClearCodes }));
    row.appendChild(btn); row.appendChild(btn2);
    root.appendChild(row);
  }

  function drawClearCodes(root) {
    const d = CONTENT.clearCodesProcedure;
    root.appendChild(el(`
      <div class="detail-block">
        <p>${sourceBadge(d.source)}</p>
        <p>${esc(d.intro)}</p>
        <h3>Steps</h3>
        <ol>${d.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
        <div class="caution-box"><b>Note:</b> ${esc(d.warning)}</div>
      </div>
    `));
  }

  // ==========================================================================
  // MULTIMETER BASICS
  // ==========================================================================
  function drawMultimeterBasics(root) {
    const d = CONTENT.multimeterBasics;
    root.appendChild(el(`
      <div class="detail-block">
        <p>${sourceBadge(d.source)}</p>
        <p>${esc(d.intro)}</p>
      </div>
    `));
    renderImages(root, d.images);
    root.appendChild(el(`
      <div class="detail-block">
        <h3>The three parts</h3>
        <ul>${d.parts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        <h3>Plugging in the probes</h3>
        <ul>${d.plugging.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
      </div>
    `));
    const settingsBlock = el(`<div class="detail-block"><h3>Dial settings you'll actually use</h3></div>`);
    d.dialSettings.forEach((s) => {
      settingsBlock.appendChild(el(`<p><b>${esc(s.setting)}</b><br>${esc(s.use)}</p>`));
    });
    root.appendChild(settingsBlock);
    root.appendChild(el(`
      <div class="detail-block">
        <h3>Taking a reading</h3>
        <ol>${d.takingReadings.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
        <h3>Reading the display</h3>
        <ul>${d.reading.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
      </div>
    `));
    d.cautions.forEach((c) => {
      root.appendChild(el(`<div class="caution-box"><b>Caution:</b> ${esc(c)}</div>`));
    });
  }

  // ==========================================================================
  // DTC LIST + DETAIL
  // ==========================================================================
  function drawDtcList(root) {
    root.appendChild(el(`<input type="text" class="search-box" placeholder="Search code or component (e.g. P0230, fuel pump)" id="dtcSearch" />`));
    const listWrap = el(`<div id="dtcListWrap"></div>`);
    root.appendChild(listWrap);

    function renderList(filter) {
      listWrap.innerHTML = "";
      const f = (filter || "").toLowerCase();
      const items = CONTENT.dtcCodes.filter((d) =>
        !f || d.code.toLowerCase().includes(f) || (d.altCode && d.altCode.toLowerCase().includes(f)) ||
        d.title.toLowerCase().includes(f) || d.note.toLowerCase().includes(f)
      );
      if (!items.length) {
        listWrap.appendChild(el(`<p class="home-lead">No matching codes.</p>`));
        return;
      }
      items.forEach((d) => {
        const item = el(`
          <button class="list-item" type="button">
            <div class="li-title">${esc(d.code)}${d.altCode ? " / " + esc(d.altCode.split(" ")[0]) : ""} — ${esc(d.title)} ${priorityBadge(d.priority)}</div>
            <div class="li-sub">${esc(d.note)}</div>
          </button>
        `);
        item.addEventListener("click", () => push({ title: d.code, draw: (r) => drawDtcDetail(r, d) }));
        listWrap.appendChild(item);
      });
    }
    renderList("");
    root.querySelector("#dtcSearch").addEventListener("input", (e) => renderList(e.target.value));
  }

  function drawDtcDetail(root, d) {
    root.appendChild(el(`
      <div class="detail-block">
        <h2>${esc(d.code)} ${priorityBadge(d.priority)}</h2>
        ${d.altCode ? `<p class="li-sub">Also listed as <b>${esc(d.altCode)}</b></p>` : ""}
        <h3>${esc(d.title)}</h3>
        <p>${esc(d.note)}</p>
      </div>
    `));
    const related = CONTENT.fieldNotes.filter((fn) => fn.relatedDtcs.includes(d.code));
    if (related.length) {
      const box = el(`<div class="detail-block"><h3>Related field notes</h3></div>`);
      related.forEach((fn) => {
        const b = el(`<button class="list-item" type="button"><div class="li-title">${esc(fn.title)}</div></button>`);
        b.addEventListener("click", () => push({ title: fn.title, draw: (r) => drawFieldNoteDetail(r, fn) }));
        box.appendChild(b);
      });
      root.appendChild(box);
    }
    root.appendChild(el(`
      <p class="footer-note">For full scan/non-scan diagnostic step tables per code (with live ECM data), see the bundled Full Manual PDF, Section 2.</p>
    `));
    const link = el(`<button class="pill-btn" type="button">Open full manual</button>`);
    link.addEventListener("click", () => push({ title: "Full Manuals", draw: drawManuals }));
    root.appendChild(link);
  }

  // ==========================================================================
  // FIELD TESTS
  // ==========================================================================
  function drawFieldTestList(root) {
    CONTENT.fieldTests.forEach((t) => {
      const item = el(`
        <button class="list-item" type="button">
          <div class="li-title">${esc(t.title)} ${sourceBadge(t.source)}</div>
          <div class="li-sub">${esc(t.why)}</div>
        </button>
      `);
      item.addEventListener("click", () => push({ title: t.title, draw: (r) => drawFieldTestDetail(r, t) }));
      root.appendChild(item);
    });
  }

  function drawFieldTestDetail(root, t) {
    root.appendChild(el(`
      <div class="detail-block">
        <p>${sourceBadge(t.source)}</p>
        <p>${esc(t.why)}</p>
        <p><b>Tools needed:</b> ${t.tools.map(esc).join(", ")}</p>
        ${t.gearNote ? `<ul>${t.gearNote.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>` : ""}
        ${t.vocab ? `<p><b>Quick vocabulary:</b> ${t.vocab.map(esc).join(" ")}</p>` : ""}
        ${t.caution ? `<div class="caution-box"><b>Caution:</b> ${esc(t.caution)}</div>` : ""}
        <h3>Steps</h3>
        <ol>${t.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
        ${t.interpret ? `<h3>Reading the result</h3><ul>${t.interpret.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
      </div>
    `));
    renderImages(root, t.images);
  }

  // ==========================================================================
  // 5-MINUTE ELECTRICAL TRIAGE
  // ==========================================================================
  function drawElectricalTriage(root) {
    const d = CONTENT.electricalTriage;
    root.appendChild(el(`<p class="home-lead">${esc(d.intro)} ${sourceBadge(d.source)}</p>`));
    d.order.forEach((item) => {
      const block = el(`
        <div class="detail-block">
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.detail)}</p>
        </div>
      `);
      if (item.relatedTest) {
        const t = CONTENT.fieldTests.find((x) => x.id === item.relatedTest);
        if (t) {
          const b = el(`<button class="pill-btn" type="button">Run: ${esc(t.title)}</button>`);
          b.addEventListener("click", () => push({ title: t.title, draw: (r) => drawFieldTestDetail(r, t) }));
          block.appendChild(b);
        }
      }
      if (item.relatedDiy) {
        const tool = CONTENT.diyTools.find((x) => x.id === item.relatedDiy);
        if (tool) {
          const b = el(`<button class="pill-btn" type="button">${tool.icon} ${esc(tool.title)}</button>`);
          b.addEventListener("click", () => push({ title: tool.title, draw: (r) => drawDiyToolDetail(r, tool) }));
          block.appendChild(b);
        }
      }
      root.appendChild(block);
    });
  }

  // ==========================================================================
  // DIY TEST TOOLS
  // ==========================================================================
  function drawDiyToolsList(root) {
    root.appendChild(el(`<p class="home-lead">Build these once, carry them always. Cheap, fast, and they answer "is it the part or the wiring?" without guessing.</p>`));
    CONTENT.diyTools.forEach((tool) => {
      const item = el(`
        <button class="list-item" type="button">
          <div class="li-title">${tool.icon} ${esc(tool.title)}</div>
          <div class="li-sub">${esc(tool.why)}</div>
        </button>
      `);
      item.addEventListener("click", () => push({ title: tool.title, draw: (r) => drawDiyToolDetail(r, tool) }));
      root.appendChild(item);
    });
  }

  function drawDiyToolDetail(root, tool) {
    root.appendChild(el(`
      <div class="detail-block">
        <p>${sourceBadge("field")}</p>
        <p>${esc(tool.why)}</p>
        <h3>Materials</h3>
        <ul>${tool.materials.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
        ${tool.build.length ? `<h3>Build it</h3><ol>${tool.build.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}
        <h3>How to use it</h3>
        <ol>${tool.use.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
        ${tool.cautions.map((c) => `<div class="caution-box"><b>Caution:</b> ${esc(c)}</div>`).join("")}
      </div>
    `));
  }

  // ==========================================================================
  // FIELD WIRING REPAIR
  // ==========================================================================
  function drawWireRepair(root) {
    const d = CONTENT.wireRepair;
    root.appendChild(el(`
      <div class="detail-block">
        <p>${sourceBadge(d.source)}</p>
        <p>${esc(d.intro)}</p>
        <h3>Materials</h3>
        <ul>${d.materials.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
      </div>
    `));
    root.appendChild(el(`<div class="caution-box"><b>Caution:</b> ${esc(d.caution)}</div>`));
    d.cases.forEach((c) => {
      const block = el(`<div class="detail-block"><h3>${esc(c.title)}</h3></div>`);
      const ol = el(`<ol></ol>`);
      c.steps.forEach((s) => ol.appendChild(el(`<li>${esc(s)}</li>`)));
      block.appendChild(ol);
      root.appendChild(block);
    });
  }

  // ==========================================================================
  // COMPONENT LOCATIONS
  // ==========================================================================
  function drawComponentLocations(root) {
    const d = CONTENT.componentLocations;
    root.appendChild(el(`<p class="home-lead">${esc(d.intro)} ${sourceBadge(d.source)}</p>`));
    renderImages(root, d.images);
    if (d.fallbackNote) {
      root.appendChild(el(`<p class="footer-note">${esc(d.fallbackNote)}</p>`));
    }
    const btn = el(`<button class="pill-btn" type="button">Walk the power path from the battery →</button>`);
    btn.addEventListener("click", () => push({ title: CONTENT.powerPath.title, draw: drawPowerPath }));
    root.appendChild(btn);
  }

  // ==========================================================================
  // POWER PATH ("walk from the battery")
  // ==========================================================================
  function drawPowerPath(root) {
    const d = CONTENT.powerPath;
    root.appendChild(el(`<p class="home-lead">${esc(d.intro)} ${sourceBadge(d.source)}</p>`));
    renderImages(root, d.images);
    d.hops.forEach((hop, i) => {
      root.appendChild(el(`
        <div class="detail-block hop-row">
          <div class="hop-num">${i + 1}</div>
          <div>
            <h3 style="margin:0 0 4px">${esc(hop.title.replace(/^\d+\.\s*/, ""))}</h3>
            <p style="margin:0">${esc(hop.detail)}</p>
          </div>
        </div>
      `));
    });
    const btn = el(`<button class="pill-btn" type="button">See component diagrams →</button>`);
    btn.addEventListener("click", () => push({ title: CONTENT.componentLocations.title, draw: drawComponentLocations }));
    root.appendChild(btn);
  }

  // ==========================================================================
  // RIG-SPECIFIC TROUBLESHOOTING (Mud Buddy owner's manual)
  // ==========================================================================
  function drawRigTroubleshootingList(root) {
    root.appendChild(el(`<p class="home-lead">Straight from Mud Buddy's own owner's manual — shift, trim, and drops-out-of-gear problems the engine manual doesn't cover. ${sourceBadge("rig")}</p>`));
    CONTENT.rigTroubleshooting.forEach((r) => {
      const item = el(`<button class="list-item" type="button"><div class="li-title">${esc(r.title)}</div></button>`);
      item.addEventListener("click", () => push({ title: r.title, draw: (root2) => drawRigTroubleshootingDetail(root2, r) }));
      root.appendChild(item);
    });
  }

  function drawRigTroubleshootingDetail(root, r) {
    root.appendChild(el(`
      <div class="detail-block">
        <p>${sourceBadge("rig")}</p>
        <ol>${r.checks.map((c) => `<li>${esc(c)}</li>`).join("")}</ol>
      </div>
    `));
    const btn = el(`<button class="pill-btn" type="button">Walk the power path from the battery →</button>`);
    btn.addEventListener("click", () => push({ title: CONTENT.powerPath.title, draw: drawPowerPath }));
    root.appendChild(btn);
  }

  // ==========================================================================
  // WIRING REFERENCE
  // ==========================================================================
  function drawWiring(root) {
    root.appendChild(el(`<p class="home-lead">${esc(CONTENT.wiring.intro)} ${sourceBadge("manual")}</p>`));
    CONTENT.wiring.connectors.forEach((c) => {
      const block = el(`<div class="detail-block"><h3>${esc(c.name)}</h3></div>`);
      const table = el(`
        <table class="wire-table">
          <thead><tr><th>Pin</th><th>Function</th><th>Wire</th><th>If faulty</th></tr></thead>
          <tbody></tbody>
        </table>
      `);
      const tbody = table.querySelector("tbody");
      c.pins.forEach((p) => {
        tbody.appendChild(el(`
          <tr>
            <td>${esc(p.pin)}</td>
            <td>${esc(p.func)}</td>
            <td>${esc(p.color)}</td>
            <td>${esc(p.symptom)}</td>
          </tr>
        `));
      });
      block.appendChild(table);
      root.appendChild(block);
    });
  }

  // ==========================================================================
  // FIELD NOTES (known issues)
  // ==========================================================================
  function drawFieldNotesList(root) {
    root.appendChild(el(`<p class="home-lead">Community/forum-reported failure patterns for this powerhead family — not from the OEM manual. Sorted by how often they show up.</p>`));
    const sorted = [...CONTENT.fieldNotes].sort((a, b) => rank(b.priority) - rank(a.priority));
    sorted.forEach((fn) => {
      const item = el(`
        <button class="list-item" type="button">
          <div class="li-title">${esc(fn.title)} ${priorityBadge(fn.priority)}</div>
        </button>
      `);
      item.addEventListener("click", () => push({ title: fn.title, draw: (r) => drawFieldNoteDetail(r, fn) }));
      root.appendChild(item);
    });
  }
  function rank(p) { return p === "high" ? 2 : p === "medium" ? 1 : 0; }

  function drawFieldNoteDetail(root, fn) {
    root.appendChild(el(`
      <div class="detail-block">
        <p>${sourceBadge("field")} ${priorityBadge(fn.priority)}</p>
        ${fn.body.map((p) => `<p>${esc(p)}</p>`).join("")}
      </div>
    `));
    if (fn.relatedTests && fn.relatedTests.length) {
      const box = el(`<div class="detail-block"><h3>Run this test</h3></div>`);
      fn.relatedTests.forEach((tid) => {
        const t = CONTENT.fieldTests.find((x) => x.id === tid);
        if (!t) return;
        const b = el(`<button class="list-item" type="button"><div class="li-title">${esc(t.title)}</div></button>`);
        b.addEventListener("click", () => push({ title: t.title, draw: (r) => drawFieldTestDetail(r, t) }));
        box.appendChild(b);
      });
      root.appendChild(box);
    }
  }

  // ==========================================================================
  // DRIVETRAIN
  // ==========================================================================
  function drawDrivetrain(root) {
    const d = CONTENT.drivetrain;
    root.appendChild(el(`<div class="caution-box">${esc(d.intro)}</div>`));
    d.topics.forEach((topic) => {
      const block = el(`<div class="detail-block"><h3>${esc(topic.title)}</h3></div>`);
      const ul = el(`<ul></ul>`);
      topic.checks.forEach((c) => ul.appendChild(el(`<li>${esc(c)}</li>`)));
      block.appendChild(ul);
      root.appendChild(block);
    });
    const btn = el(`<button class="pill-btn" type="button">Add my own drivetrain notes →</button>`);
    btn.addEventListener("click", () => push({ title: "My Notes", draw: drawMyNotes }));
    root.appendChild(btn);
  }

  // ==========================================================================
  // SPECS CHEAT SHEET
  // ==========================================================================
  function drawSpecs(root) {
    const m = CONTENT.meta;
    root.appendChild(el(`
      <div class="detail-block">
        <h3>Fuel pressure</h3>
        <p class="spec-line">${esc(m.fuelPressureSpec)}</p>
        <h3>Battery / system voltage</h3>
        <p class="spec-line">${esc(m.batteryVoltageSpec)}</p>
        <h3>Fuel pump prime</h3>
        <p class="spec-line">${esc(m.fuelPumpPrimeSpec)}</p>
        <h3>ECM ground resistance</h3>
        <p class="spec-line">${esc(m.ecmGroundSpec)}</p>
        <h3>On-plane RPM</h3>
        <p class="spec-line">${esc(m.onPlaneRpmSpec)}</p>
        <h3>Battery &amp; main wiring</h3>
        <p class="spec-line">${esc(m.batteryPhysicalSpec)}</p>
        <h3>Shift circuit current draw</h3>
        <p class="spec-line">${esc(m.shiftCurrentSpec)}</p>
      </div>
    `));
    root.appendChild(el(`<p class="footer-note">${esc(CONTENT.contextNote)}</p>`));
  }

  // ==========================================================================
  // TOOLS CHECKLIST (persisted)
  // ==========================================================================
  function drawTools(root) {
    const checked = store.get("mm_tools_checked", {});
    CONTENT.tools.forEach((tool, i) => {
      const row = el(`
        <label class="checklist-item">
          <input type="checkbox" ${checked[i] ? "checked" : ""} />
          <span>
            <div class="li-title">${esc(tool.name)} ${tool.required ? '<span class="ci-req">CARRY THIS</span>' : ""}</div>
            <div class="li-sub">${esc(tool.why)}</div>
          </span>
        </label>
      `);
      row.querySelector("input").addEventListener("change", (e) => {
        const c = store.get("mm_tools_checked", {});
        c[i] = e.target.checked;
        store.set("mm_tools_checked", c);
      });
      root.appendChild(row);
    });
  }

  // ==========================================================================
  // MY NOTES (persisted, freeform per topic)
  // ==========================================================================
  const NOTE_TOPICS = [
    ["general", "General / Anything"],
    ["fuel-system", "Fuel System"],
    ["electrical", "Electrical"],
    ["drivetrain", "Drivetrain / Gearbox / Prop"],
    ["maintenance-log", "Maintenance Log"],
  ];

  function drawMyNotes(root) {
    root.appendChild(el(`<p class="home-lead">Stored only on this phone (localStorage) — not uploaded anywhere. This is where your 2007-motor experience and anything you learn on the new one should live.</p>`));
    NOTE_TOPICS.forEach(([key, label]) => {
      const block = el(`
        <div class="detail-block">
          <h3>${esc(label)}</h3>
          <textarea class="notes-area" placeholder="Tap to add notes..."></textarea>
        </div>
      `);
      const ta = block.querySelector("textarea");
      ta.value = store.get("mm_note_" + key, "");
      let t;
      ta.addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(() => store.set("mm_note_" + key, ta.value), 250);
      });
      root.appendChild(block);
    });
  }

  // ==========================================================================
  // FULL MANUALS (bundled PDFs, cached by service worker)
  // ==========================================================================
  function drawManuals(root) {
    root.appendChild(el(`
      <div class="detail-block">
        <h3>Engine manuals (Briggs &amp; Stratton)</h3>
        <a class="manual-link" href="manuals/40-efi-diagnostics-and-repair-manual.pdf" target="_blank" rel="noopener">📖 Vanguard 810 EFI (40 HP / Big Block) — full repair manual</a>
        <a class="manual-link" href="manuals/vanguard-37-efi-repair-manual.pdf" target="_blank" rel="noopener">📖 Vanguard 37 EFI — full repair manual (related powerhead)</a>
      </div>
    `));
    root.appendChild(el(`
      <div class="detail-block">
        <h3>Rig manuals (Mud Buddy)</h3>
        <a class="manual-link" href="manuals/hdr-owners-manual-2024.pdf" target="_blank" rel="noopener">📖 HD/HDR Owner's Manual (2024/25) — battery, mounting, shift/trim troubleshooting</a>
        <a class="manual-link" href="manuals/hdr-efi-2019-harness.pdf" target="_blank" rel="noopener">📖 HDR EFI Harness Wiring Diagram (2019)</a>
      </div>
    `));
    root.appendChild(el(`<p class="footer-note">All bundled offline — they open even with zero signal once you've loaded this app at least once.</p>`));
  }

  // ==========================================================================
  // Offline indicator
  // ==========================================================================
  function updateOnlineStatus() {
    offlineBanner.hidden = navigator.onLine;
  }
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  updateOnlineStatus();

  // ==========================================================================
  // Service worker registration
  // ==========================================================================
  if ("serviceWorker" in navigator) {
    // When a new service worker takes over (an update finished installing),
    // reload once automatically so updates just show up — nobody troubleshoot-
    // ing a motor on the water should have to know DevTools tricks to see the
    // latest content. The `refreshing` guard stops this from looping.
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  // ==========================================================================
  // Boot
  // ==========================================================================
  goHome();
})();
