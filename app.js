const money = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 2,
});

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const getNumber = (form, name) => Number.parseFloat(new FormData(form).get(name)) || 0;

const showResult = (key, html) => {
  const output = document.querySelector(`[data-result="${key}"]`);
  if (output) output.innerHTML = html;
};

document.querySelector(".menu-button")?.addEventListener("click", (event) => {
  const button = event.currentTarget;
  const links = document.querySelector("#nav-links");
  const isOpen = links.classList.toggle("is-open");
  button.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.tab;

    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.tab === selected);
    });

    document.querySelectorAll(".tool").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.panel === selected);
    });
  });
});

const calculators = {
  prestaciones(form) {
    const salary = getNumber(form, "salary");
    const years = getNumber(form, "years");
    const months = getNumber(form, "months");
    const totalYears = years + months / 12;
    const dailySalary = salary / 23.83;
    const severanceDays = totalYears <= 5 ? totalYears * 21 : totalYears * 23;
    const noticeDays = totalYears < 0.25 ? 0 : totalYears < 0.5 ? 7 : totalYears < 1 ? 14 : 28;
    const severance = dailySalary * severanceDays;
    const notice = dailySalary * noticeDays;
    const total = severance + notice;

    showResult(
      "prestaciones",
      `Cesantia estimada: ${money.format(severance)}<br>Preaviso estimado: ${money.format(
        notice,
      )}<br>Total referencia: ${money.format(total)}`,
    );
  },

  prestamo(form) {
    const amount = getNumber(form, "amount");
    const annualRate = getNumber(form, "rate") / 100;
    const months = getNumber(form, "months");
    const monthlyRate = annualRate / 12;
    const payment =
      monthlyRate === 0
        ? amount / months
        : (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
    const total = payment * months;

    showResult(
      "prestamo",
      `Cuota mensual estimada: ${money.format(payment)}<br>Total pagado: ${money.format(
        total,
      )}<br>Intereses aproximados: ${money.format(total - amount)}`,
    );
  },

  sueldo(form) {
    const gross = getNumber(form, "gross");
    const afpRate = getNumber(form, "afp") / 100;
    const sfsRate = getNumber(form, "sfs") / 100;
    const afp = gross * afpRate;
    const sfs = gross * sfsRate;
    const net = gross - afp - sfs;

    showResult(
      "sueldo",
      `AFP estimado: ${money.format(afp)}<br>SFS estimado: ${money.format(
        sfs,
      )}<br>Sueldo neto antes de ISR: ${money.format(net)}`,
    );
  },

  itbis(form) {
    const amount = getNumber(form, "amount");
    const taxRate = getNumber(form, "tax") / 100;
    const mode = new FormData(form).get("mode");

    if (mode === "remove") {
      const base = amount / (1 + taxRate);
      const tax = amount - base;
      showResult(
        "itbis",
        `Base sin ITBIS: ${money.format(base)}<br>ITBIS incluido: ${money.format(
          tax,
        )}<br>Total: ${money.format(amount)}`,
      );
      return;
    }

    const tax = amount * taxRate;
    const total = amount + tax;
    showResult(
      "itbis",
      `ITBIS: ${money.format(tax)}<br>Total con ITBIS: ${money.format(total)}`,
    );
  },

  moneda(form) {
    const amount = getNumber(form, "amount");
    const rate = getNumber(form, "rate");
    const mode = new FormData(form).get("mode");
    const converted = mode === "usdToDop" ? amount * rate : amount / rate;
    const formatted = mode === "usdToDop" ? money.format(converted) : usd.format(converted);

    showResult("moneda", `Resultado estimado: ${formatted}`);
  },
};

document.querySelectorAll("[data-calculator]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculators[form.dataset.calculator]?.(form);
  });
});
