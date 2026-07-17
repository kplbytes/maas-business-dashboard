(function () {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const TENANTS = [
    { key: "tenant-001", name: "测试客户A" },
    { key: "tenant-002", name: "测试客户B" },
    { key: "tenant-003", name: "测试客户C" },
    { key: "tenant-004", name: "测试客户D" },
    { key: "tenant-005", name: "测试客户E" },
    { key: "tenant-006", name: "测试客户F" },
    { key: "tenant-007", name: "测试客户G" },
    { key: "tenant-008", name: "测试客户H" },
  ];
  const tname = (k) => (TENANTS.find((t) => t.key === k) || {}).name || k;
  const MY_TENANTS = ["tenant-001", "tenant-002", "tenant-003"];

  const USERS = [
    { id: 1, name: "张三", region: "区域A", role: "sales", assigned: ["tenant-001", "tenant-002", "tenant-003"] },
    { id: 2, name: "李四", region: "区域B", role: "sales", assigned: ["tenant-002", "tenant-004"] },
    { id: 3, name: "王五", region: "区域C", role: "sales", assigned: ["tenant-005", "tenant-006"] },
    { id: 4, name: "赵六", region: "区域A", role: "sales", assigned: [] },
    { id: 5, name: "管理员", region: "管理中心", role: "admin", assigned: [] },
  ];

  let state = {
    role: "sales",
    view: "dashboard",
    selectedTenants: [],
    dateRange: { preset: "7d", start: "", end: "" },
    selectedUser: 1,
  };
  let charts = {};

  const ACC = ["#F59E0B", "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F97316", "#84CC16", "#EF4444", "#6366F1"];

  const CARD9 = [
    { model_name: "Model-Z-5", svc_name: "default", token_billion: 3540.9 },
    { model_name: "Model-M-2.5", svc_name: "default", token_billion: 3377.5 },
    { model_name: "Model-D-Flash", svc_name: "default", token_billion: 874.9 },
    { model_name: "Model-Q-3.5", svc_name: "default", token_billion: 454.5 },
    { model_name: "Model-Z-5.1", svc_name: "default", token_billion: 510.9 },
    { model_name: "Model-D-Pro", svc_name: "default", token_billion: 319.8 },
    { model_name: "Model-D-3.2", svc_name: "default", token_billion: 305.0 },
    { model_name: "Model-G-Flash-Lite", svc_name: "default", token_billion: 200.7 },
    { model_name: "Model-Z-5.2", svc_name: "default", token_billion: 171.3 },
    { model_name: "Model-X-4.5", svc_name: "default", token_billion: 133.0 },
    { model_name: "Model-X-4.6", svc_name: "default", token_billion: 125.0 },
    { model_name: "Model-G-Pro-Preview", svc_name: "default", token_billion: 123.0 },
    { model_name: "Model-X-4.7", svc_name: "default", token_billion: 78.7 },
    { model_name: "Model-Q-3.5-Flash", svc_name: "default", token_billion: 68.0 },
    { model_name: "Model-E-V4", svc_name: "default", token_billion: 44.5 },
    { model_name: "Model-G-Flash", svc_name: "default", token_billion: 35.0 },
  ];

  const CARD138 = [
    ["tenant-002", "Model-X-7", "92.0%", "90.0%", "85.0%"],
    ["tenant-002", "Model-S-6", "90.0%", "88.0%", "82.0%"],
    ["tenant-002", "Model-G-Pro", "88.0%", "86.0%", "—"],
    ["tenant-002", "Model-G-Flash", "85.0%", "83.0%", "78.0%"],
    ["tenant-002", "Model-O-5.4", "91.0%", "89.0%", "84.0%"],
    ["tenant-002", "Model-O-5.5", "89.0%", "87.0%", "80.0%"],
    ["tenant-001", "Model-Z-5", "86.0%", "84.0%", "79.0%"],
    ["tenant-001", "Model-D-Pro", "82.0%", "80.0%", "75.0%"],
    ["tenant-001", "Model-D-Flash", "80.0%", "78.0%", "73.0%"],
    ["tenant-001", "Model-Z-5.2", "88.0%", "86.0%", "81.0%"],
    ["tenant-003", "Model-G-Pro", "85.0%", "83.0%", "78.0%"],
    ["tenant-003", "Model-X-8", "90.0%", "88.0%", "83.0%"],
    ["tenant-004", "Model-M-2.5", "83.0%", "81.0%", "76.0%"],
    ["tenant-005", "Model-Q-3.5", "84.0%", "82.0%", "77.0%"],
  ];

  const CARD121 = [
    ["tenant-001", "Model-G-Pro", "Vendor-A", 1337240, "86.44%", 46.53, 36.99, 1.68, 126535, "19.5%"],
    ["tenant-001", "Model-D-Pro", "Vendor-B", 3082219, "97.15%", 243.7, 154.12, 143.44, 76008, "11.7%"],
    ["tenant-002", "Model-G-Pro", "Vendor-A", 533764, "98.83%", 11.95, 12.01, 0.23, 74334, "11.5%"],
    ["tenant-001", "Model-O-5.5", "Vendor-C", 336475, "99.88%", 12.97, 1.82, 6.31, 53318, "8.2%"],
    ["tenant-003", "Model-G-Pro", "Vendor-A", 130468, "99.58%", 1.13, 4.64, 0, 40526, "6.3%"],
    ["tenant-002", "Model-X-7", "Vendor-D", 44453, "96.83%", 35.9, 0.4, 20.7, 34628, "5.3%"],
    ["tenant-001", "Model-D-Flash", "Vendor-B", 13252966, "87.81%", 566.88, 123.68, 138.14, 34554, "5.3%"],
    ["tenant-001", "Model-X-8", "Vendor-D", 33649, "99.4%", 28.72, 0.43, 21.1, 34405, "5.3%"],
    ["tenant-001", "Model-Z-5.2", "Vendor-E", 599935, "93.11%", 103.77, 2.29, 88.91, 34059, "5.3%"],
    ["tenant-001", "Model-Z-5", "Vendor-E", 8908631, "98.45%", 3507.39, 33.26, 3003.96, 18894, "2.9%"],
    ["tenant-004", "Model-M-2.5", "Vendor-F", 1500000, "99.0%", 200.0, 100.0, 50.0, 60000, "9.2%"],
    ["tenant-005", "Model-Q-3.5", "Vendor-G", 800000, "98.5%", 80.0, 40.0, 10.0, 35000, "5.4%"],
  ];

  const CARD161 = [
    ["3/1", 132799, 7929, 138620, 138620],
    ["3/6", 132799, 8051, 138499, 138499],
    ["3/11", 132799, 8134, 138416, 138416],
    ["3/16", 133819, 8146, 138409, 138409],
    ["3/21", 184499, 35804, 160798, 160798],
    ["3/26", 687469, 123288, 575505, 575505],
    ["3/31", 1188989, 447156, 752767, 752767],
    ["4/5", 1689789, 781118, 918817, 918817],
    ["4/10", 1690789, 1067076, 632878, 632878],
    ["4/15", 2194429, 1689134, 513442, 513442],
    ["4/20", 2697169, 2014523, 690079, 690079],
    ["4/25", 2708224, 2300881, 413917, 403917],
    ["4/30", 3209064, 2397486, 817459, 807459],
    ["5/5", 3209284, 2504672, 710277, 700277],
    ["5/10", 3210944, 2586039, 629101, 619101],
    ["5/15", 3212584, 2762560, 453275, 443275],
    ["5/20", 3218354, 2877541, 343859, 333859],
    ["5/25", 3229714, 3033927, 198114, 188114],
  ];

  function fmtNumber(n) {
    if (n >= 1e8) return (n / 1e8).toFixed(1) + "亿";
    if (n >= 1e4) return (n / 1e4).toFixed(1) + "万";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
    if (Number.isInteger(n)) return "" + n;
    return n.toFixed(n < 10 ? 2 : 0);
  }

  function fmtMoney(n) {
    return "¥" + n.toLocaleString();
  }

  function getAvailableTenants() {
    if (state.role === "admin") return TENANTS;
    return TENANTS.filter((t) => MY_TENANTS.includes(t.key));
  }

  $$(".role-btn").forEach((b) => {
    b.onclick = () => {
      $$(".role-btn").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      state.role = b.dataset.role;
      $("#loginUser").value = state.role === "admin" ? "admin" : "zhangsan";
    };
  });

  $("#loginBtn").onclick = () => {
    state.selectedTenants = [];
    $("#login").style.display = "none";
    $("#app").classList.add("active");
    setupUser();
    initFilters();
    renderAll();
  };

  $("#logoutBtn").onclick = () => location.reload();

  function setupUser() {
    if (state.role === "admin") {
      $("#userName").textContent = "管理员";
      $("#userAvatar").textContent = "管";
      $("#userRole").textContent = "管理员";
      $$(".admin-section").forEach((e) => e.style.display = "block");
    } else {
      $("#userName").textContent = "张三";
      $("#userAvatar").textContent = "张";
      $("#userRole").textContent = "商务 · 区域A";
      $$(".admin-section").forEach((e) => e.style.display = "none");
    }
  }

  $$(".nav-item").forEach((item) => {
    item.onclick = () => {
      if (item.style.display === "none") return;
      const v = item.dataset.view;
      state.view = v;
      $$(".nav-item").forEach((x) => x.classList.remove("active"));
      item.classList.add("active");
      $$(".view-panel").forEach((x) => x.classList.remove("active"));
      $("#view-" + v).classList.add("active");
      if (v === "admin") renderAdmin();
      if (v === "dashboard") renderDashboard();
    };
  });

  function initFilters() {
    initTenantFilter();
    initDateFilter();
  }

  function initTenantFilter() {
    const trigger = $("#tenantFilter .dropdown-trigger");
    const menu = $("#tenantDropdown");
    const search = $("#tenantSearch");
    const selectAll = $("#selectAllTenants");
    const list = $("#tenantList");

    function renderTenantList(filter = "") {
      list.innerHTML = "";
      const available = getAvailableTenants();
      const filtered = available.filter((t) => t.name.toLowerCase().includes(filter.toLowerCase()) || t.key.toLowerCase().includes(filter.toLowerCase()));
      filtered.forEach((t) => {
        const isSelected = state.selectedTenants.includes(t.key);
        const item = document.createElement("div");
        item.className = "dropdown-item" + (isSelected ? " active" : "");
        item.innerHTML = `<input type="checkbox" ${isSelected ? "checked" : ""} />
          <span>${t.name}</span>
          <span style="margin-left:auto;font-size:11px;color:#64748B;font-family:monospace">${t.key}</span>`;
        const checkbox = item.querySelector("input");
        checkbox.onclick = (e) => {
          e.stopPropagation();
          toggleTenant(t.key);
        };
        item.onclick = () => toggleTenant(t.key);
        list.appendChild(item);
      });
      updateSelectAll();
    }

    function toggleTenant(key) {
      const idx = state.selectedTenants.indexOf(key);
      if (idx >= 0) {
        state.selectedTenants.splice(idx, 1);
      } else {
        state.selectedTenants.push(key);
      }
      renderTenantList(search.value);
      const count = state.selectedTenants.length;
      const total = getAvailableTenants().length;
      if (count === 0) {
        toast(`已清除租户筛选 · 显示全部 ${total} 个租户`);
      } else if (count === total) {
        toast(`已选择全部 ${count} 个租户`);
      } else {
        toast(`已选择 ${count} 个租户 · 仅显示相关数据`);
      }
      refreshAll();
    }

    function updateSelectAll() {
      const available = getAvailableTenants();
      const allSelected = available.every((t) => state.selectedTenants.includes(t.key));
      const someSelected = available.some((t) => state.selectedTenants.includes(t.key));
      selectAll.checked = allSelected;
      selectAll.indeterminate = someSelected && !allSelected;
    }

    selectAll.onclick = () => {
      const available = getAvailableTenants();
      if (selectAll.checked) {
        state.selectedTenants = available.map((t) => t.key);
      } else {
        state.selectedTenants = [];
      }
      renderTenantList(search.value);
      refreshAll();
    };

    search.oninput = () => renderTenantList(search.value);
    search.onfocus = () => menu.classList.add("show");

    trigger.onclick = (e) => {
      e.stopPropagation();
      menu.classList.toggle("show");
    };

    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !trigger.contains(e.target)) {
        menu.classList.remove("show");
      }
    });

    renderTenantList();
  }

  function initDateFilter() {
    const start = $("#dateStart");
    const end = $("#dateEnd");
    const presets = $$(".date-preset");

    function setRange(days) {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      state.dateRange.start = formatDate(startDate);
      state.dateRange.end = formatDate(now);
      updateInputs();
      toast(`时间范围已更新：${state.dateRange.start} ~ ${state.dateRange.end}`);
      refreshAll();
    }

    function setMonthRange() {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      state.dateRange.start = formatDate(startDate);
      state.dateRange.end = formatDate(now);
      updateInputs();
      toast(`时间范围已更新：${state.dateRange.start} ~ ${state.dateRange.end}`);
      refreshAll();
    }

    function updateInputs() {
      start.value = state.dateRange.start;
      end.value = state.dateRange.end;
    }

    function formatDate(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    presets.forEach((btn) => {
      btn.onclick = () => {
        presets.forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        state.dateRange.preset = btn.dataset.range;
        if (btn.dataset.range === "7d") setRange(6);
        else if (btn.dataset.range === "30d") setRange(29);
        else if (btn.dataset.range === "90d") setRange(89);
        else if (btn.dataset.range === "month") setMonthRange();
      };
    });

    start.onchange = () => {
      state.dateRange.start = start.value;
      state.dateRange.preset = "custom";
      presets.forEach((p) => p.classList.remove("active"));
      if (state.dateRange.end) {
        toast(`时间范围已更新：${state.dateRange.start} ~ ${state.dateRange.end}`);
      }
      refreshAll();
    };

    end.onchange = () => {
      state.dateRange.end = end.value;
      state.dateRange.preset = "custom";
      presets.forEach((p) => p.classList.remove("active"));
      if (state.dateRange.start) {
        toast(`时间范围已更新：${state.dateRange.start} ~ ${state.dateRange.end}`);
      }
      refreshAll();
    };

    setRange(6);
  }

  const tenantHit = (k) => state.selectedTenants.length === 0 || state.selectedTenants.includes(k);

  function initCard9() {
    const dom = $("#card-9");
    if (!dom) return;
    if (charts.card9) charts.card9.dispose();
    charts.card9 = echarts.init(dom);

    let filtered = CARD9;

    const sorted = [...filtered].sort((a, b) => b.token_billion - a.token_billion);
    const total = sorted.reduce((sum, row) => sum + row.token_billion, 0);

    const top10 = sorted.slice(0, 10);
    const rest = sorted.slice(10);
    const restTotal = rest.reduce((sum, row) => sum + row.token_billion, 0);

    const data = top10.map((row, i) => ({
      name: row.model_name,
      value: row.token_billion,
      percent: ((row.token_billion / total) * 100).toFixed(1),
      itemStyle: { color: ACC[i % ACC.length] },
    }));

    if (restTotal > 0) {
      data.push({
        name: `${rest.length} 更多`,
        value: restTotal,
        percent: ((restTotal / total) * 100).toFixed(1),
        itemStyle: { color: "#64748B" },
      });
    }

    const option = {
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(30, 41, 59, 0.95)",
        borderColor: "#475569",
        borderWidth: 1,
        padding: [12, 16],
        textStyle: { color: "#F8FAFC", fontSize: 13 },
        formatter: (params) => {
          return `<div style="font-weight:600;margin-bottom:4px">${params.name}</div>
            <div>Token消耗: <span style="color:${params.color};font-weight:600">${params.value}</span> 亿</div>
            <div>占比: <span style="font-weight:600">${params.percent}%</span></div>`;
        },
      },
      legend: {
        orient: "vertical",
        left: 20,
        top: "center",
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 8,
        textStyle: { color: "#94A3B8", fontSize: 11 },
        formatter: (name) => {
          const item = data.find((x) => x.name === name);
          return `${name}  ${item.percent}%`;
        },
      },
      series: [
        {
          name: "Token消耗",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["65%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: "#0F172A",
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: false,
            },
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.6)",
            },
          },
          labelLine: {
            show: false,
          },
          data: data,
        },
        {
          name: "总计",
          type: "pie",
          radius: ["0%", "35%"],
          center: ["65%", "50%"],
          label: {
            show: true,
            position: "center",
            fontSize: 16,
            fontWeight: "bold",
            color: "#F8FAFC",
            formatter: () => {
              return `{a|${total.toLocaleString()}}\n{b|亿 · 总计}`;
            },
            rich: {
              a: { fontSize: 20, fontWeight: "bold", color: "#F8FAFC", lineHeight: 28 },
              b: { fontSize: 11, color: "#64748B" },
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            {
              value: 1,
              itemStyle: {
                color: "#0F172A",
                borderColor: "#0F172A",
              },
            },
          ],
        },
      ],
    };

    charts.card9.setOption(option);
  }

  function initCard161() {
    const dom = $("#card-161");
    if (!dom) return;
    if (charts.card161) charts.card161.dispose();
    charts.card161 = echarts.init(dom);
    const xLabels = CARD161.map((r) => r[0]);

    const option = {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(30, 41, 59, 0.95)",
        borderColor: "#475569",
        borderWidth: 1,
        padding: [12, 16],
        textStyle: { color: "#F8FAFC", fontSize: 13 },
        axisPointer: {
          type: "cross",
          crossStyle: { color: "#64748B" },
        },
      },
      legend: {
        data: ["充值+授信+代金券总额", "累计消费总额", "可用余额(含授信)", "真实余额"],
        bottom: 0,
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 20,
        textStyle: { color: "#94A3B8", fontSize: 12 },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        top: "8%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: xLabels,
        axisLine: { lineStyle: { color: "#475569" } },
        axisLabel: { color: "#94A3B8", fontSize: 11 },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisLabel: {
          color: "#94A3B8",
          fontSize: 11,
          formatter: (value) => {
            if (value >= 1e8) return (value / 1e8).toFixed(1) + "亿";
            if (value >= 1e4) return (value / 1e4).toFixed(1) + "万";
            return value;
          },
        },
        splitLine: { lineStyle: { color: "#334155", type: "dashed" } },
      },
      series: [
        {
          name: "充值+授信+代金券总额",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 3, color: ACC[0] },
          itemStyle: { color: ACC[0], borderWidth: 2, borderColor: "#1E293B" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(59, 130, 246, 0.3)" },
              { offset: 1, color: "rgba(59, 130, 246, 0)" },
            ]),
          },
          data: CARD161.map((r) => r[1]),
        },
        {
          name: "累计消费总额",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 3, color: ACC[1] },
          itemStyle: { color: ACC[1], borderWidth: 2, borderColor: "#1E293B" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
              { offset: 1, color: "rgba(16, 185, 129, 0)" },
            ]),
          },
          data: CARD161.map((r) => r[2]),
        },
        {
          name: "可用余额(含授信)",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 3, color: ACC[4] },
          itemStyle: { color: ACC[4], borderWidth: 2, borderColor: "#1E293B" },
          data: CARD161.map((r) => r[3]),
        },
        {
          name: "真实余额",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 3, color: ACC[2], type: "dashed" },
          itemStyle: { color: ACC[2], borderWidth: 2, borderColor: "#1E293B" },
          data: CARD161.map((r) => r[4]),
        },
      ],
    };
    charts.card161.setOption(option);
  }

  function renderCard138() {
    const rows = CARD138.filter((r) => tenantHit(r[0]));
    const html = rows.length
      ? `<table class="data-table">
        <thead><tr><th>租户</th><th>产品（模型）</th><th class="num">输入折扣</th><th class="num">输出折扣</th><th class="num">缓存折扣</th></tr></thead>
        <tbody>${rows.map((r) => `<tr><td>${tname(r[0])}</td><td>${r[1]}</td><td class="num">${r[2]}</td><td class="num">${r[3]}</td><td class="num">${r[4]}</td></tr>`).join("")}</tbody></table>`
      : `<div class="empty-state">该筛选下无折扣率数据</div>`;
    $("#card-138").innerHTML = html;
  }

  function renderCard121() {
    const rows = CARD121.filter((r) => tenantHit(r[0]));
    const html = rows.length
      ? `<table class="data-table">
        <thead><tr><th>租户</th><th>模型</th><th>供应商</th><th class="num">调用次数</th><th class="num">成功率</th><th class="num">输入(亿)</th><th class="num">输出(亿)</th><th class="num">缓存(亿)</th><th class="num">消费(元)</th><th class="num">占比</th></tr></thead>
        <tbody>${rows.map((r) => `<tr><td>${tname(r[0])}</td><td>${r[1]}</td><td>${r[2]}</td><td class="num">${r[3].toLocaleString()}</td><td class="num">${r[4]}</td><td class="num">${r[5]}</td><td class="num">${r[6]}</td><td class="num">${r[7]}</td><td class="num">${fmtMoney(r[8])}</td><td class="num">${r[9]}</td></tr>`).join("")}</tbody></table>`
      : `<div class="empty-state">该筛选下无明细数据</div>`;
    $("#card-121").innerHTML = html;
  }

  function renderKPIs() {
    const rows = CARD121.filter((r) => tenantHit(r[0]));
    const totalRevenue = rows.reduce((sum, r) => sum + r[8], 0);
    const totalTokens = rows.reduce((sum, r) => sum + r[5] + r[6] + r[7], 0);
    const totalCalls = rows.reduce((sum, r) => sum + r[3], 0);

    $("#kpi-revenue").textContent = fmtMoney(totalRevenue);
    $("#kpi-tokens").innerHTML = totalTokens.toLocaleString() + '<span class="kpi-unit">亿</span>';
    $("#kpi-calls").innerHTML = totalCalls.toLocaleString() + '<span class="kpi-unit">次</span>';
  }

  function renderTables() {
    renderCard138();
    renderCard121();
  }

  function renderDashboard() {
    if (state.view !== "dashboard") return;
    renderKPIs();
    renderCard138();
    renderCard121();
    setTimeout(() => {
      initCard9();
      initCard161();
    }, 100);
  }

  function refreshAll() {
    renderKPIs();
    renderTables();
    initCard9();
    initCard161();
  }

  $("#refreshBtn").onclick = () => {
    toast("数据已刷新 · 数据源：AnalyticDB for MySQL");
    refreshAll();
  };

  function renderAdmin() {
    const box = $("#adminUsers");
    box.innerHTML = "";
    USERS.filter((u) => u.role === "sales").forEach((u) => {
      const row = document.createElement("div");
      row.className = "user-row" + (u.id === state.selectedUser ? " active" : "");
      const av = ["#3B82F6", "#10B981", "#8B5CF6", "#F97316"];
      row.innerHTML = `<div class="avatar" style="background:${av[u.id % 4]}">${u.name[0]}</div>
        <div><div class="name">${u.name}</div><div class="meta">${u.region}</div></div>
        <div class="cnt">${u.assigned.length} 租户</div>`;
      row.onclick = () => {
        state.selectedUser = u.id;
        renderAdmin();
      };
      box.appendChild(row);
    });
    renderAssignment();
  }

  function renderAssignment() {
    const u = USERS.find((x) => x.id === state.selectedUser);
    if (!u) return;
    $("#assignTitle").textContent = `租户分配 · ${u.name}`;
    const pool = $("#tenantPool"),
      assigned = $("#assignedTenants");
    pool.innerHTML = "";
    assigned.innerHTML = "";
    TENANTS.forEach((t) => {
      const on = u.assigned.includes(t.key);
      const el = document.createElement("div");
      el.className = "tenant-chip" + (on ? " assigned" : "");
      el.innerHTML = `<div><div class="name">${t.name}</div><div class="key">${t.key}</div></div><span class="action">${on ? "×" : "+"}</span>`;
      el.onclick = () => {
        if (on) u.assigned = u.assigned.filter((k) => k !== t.key);
        else u.assigned.push(t.key);
        toast(`${on ? "已移除" : "已分配"} ${t.name} → ${u.name}`);
        renderAdmin();
      };
      (on ? assigned : pool).appendChild(el);
    });
    if (u.assigned.length === 0) assigned.innerHTML = '<div class="empty-state">暂无分配</div>';
  }

  $("#syncTenantBtn") && ($("#syncTenantBtn").onclick = () => toast("已从 ADB 同步租户主数据"));
  $("#newUserBtn") && ($("#newUserBtn").onclick = () => toast("新建商务：弹窗采集账号/姓名/区域 → 分配租户"));

  // Password modal
  const modalPassword = $("#modalPassword");
  const openPasswordModal = () => modalPassword.classList.add("show");
  const closePasswordModal = () => {
    modalPassword.classList.remove("show");
    $("#passwordForm").reset();
  };

  $("#changePasswordBtn").onclick = openPasswordModal;
  $("#closePasswordModal").onclick = closePasswordModal;
  $("#cancelPasswordBtn").onclick = closePasswordModal;

  modalPassword.onclick = (e) => {
    if (e.target === modalPassword) closePasswordModal();
  };

  $("#submitPasswordBtn").onclick = () => {
    const current = $("#currentPassword").value;
    const newPass = $("#newPassword").value;
    const confirm = $("#confirmPassword").value;

    if (!current || !newPass || !confirm) {
      toast("请填写完整信息");
      return;
    }

    if (newPass.length < 8 || newPass.length > 20) {
      toast("密码长度需为8-20位");
      return;
    }

    if (!/[a-zA-Z]/.test(newPass) || !/[0-9]/.test(newPass)) {
      toast("密码需包含字母和数字");
      return;
    }

    if (newPass !== confirm) {
      toast("两次输入的新密码不一致");
      return;
    }

    toast("密码修改成功");
    closePasswordModal();
  };

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function renderAll() {
    renderDashboard();
  }

  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (state.view === "dashboard") {
        if (charts.card9) charts.card9.resize();
        if (charts.card161) charts.card161.resize();
      }
    }, 200);
  });
})();