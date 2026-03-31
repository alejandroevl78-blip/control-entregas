let entregas = JSON.parse(localStorage.getItem("entregas")) || [];

// 🔹 Normalizar datos antiguos
entregas.forEach(e => {
  if (!e.tipoRegistro) e.tipoRegistro = "cayo";
});

function obtenerFecha() {
  let input = document.getElementById("fechaRegistro").value;
  if (input) return new Date(input).toISOString();
  return new Date().toISOString();
}

// =====================
// 🟦 REGISTRO CAYO
// =====================
function calcular() {

  let millones = parseInt(document.getElementById("millones").value);

  if (isNaN(millones) || millones <= 0) {
    alert("Ingresa millones válidos");
    return;
  }

  let tipo = document.getElementById("tipo").value;
  let socio = tipo === "grupal" ? document.getElementById("socio").value : "";

  let total = millones * 20;
  let descuento = 0;

  if (millones >= 20 && millones <= 49) descuento = 0.10;
  else if (millones >= 50 && millones <= 99) descuento = 0.15;
  else if (millones >= 100) descuento = 0.20;

  if (tipo === "grupal") total = (total - total * descuento) / 3;
  if (tipo === "solitario") total = total / 2;

  total = parseFloat(total.toFixed(2));

  let nuevaEntrega = {
    tipoRegistro: "cayo",
    fecha: obtenerFecha(),
    millones,
    tipo,
    socio,
    ganancia: total
  };

  entregas.push(nuevaEntrega);
  localStorage.setItem("entregas", JSON.stringify(entregas));

  mostrarTodo();
}

// =====================
// 🟨 REGISTRO EXTRA
// =====================
function registrarExtra() {

  let monto = parseFloat(document.getElementById("montoExtra").value);
  let concepto = document.getElementById("conceptoExtra").value;

  if (isNaN(monto) || monto <= 0) {
    alert("Monto inválido");
    return;
  }

  let nuevaEntrega = {
    tipoRegistro: "extra",
    fecha: obtenerFecha(),
    monto,
    concepto
  };

  entregas.push(nuevaEntrega);
  localStorage.setItem("entregas", JSON.stringify(entregas));

  mostrarTodo();
}

// =====================
// 📊 HISTORIAL
// =====================
function mostrarHistorial(lista) {

  let cayoDiv = document.getElementById("historialCayo");
  let extraDiv = document.getElementById("historialExtra");

  cayoDiv.innerHTML = "";
  extraDiv.innerHTML = "";

  lista.forEach((e, index) => {

    let fecha = e.fecha.substring(0,10);

    if (e.tipoRegistro === "cayo") {
      cayoDiv.innerHTML += `
        <div>
          ${fecha} | ${e.millones}M | ${e.tipo} | ${e.socio || ""} | $${e.ganancia}
          <button onclick="eliminarEntrega(${index})">Eliminar</button>
        </div>
      `;
    }

    if (e.tipoRegistro === "extra") {
      extraDiv.innerHTML += `
        <div>
          ${fecha} | ${e.concepto} | $${e.monto}
          <button onclick="eliminarEntrega(${index})">Eliminar</button>
        </div>
      `;
    }

  });

  if (!lista.length) {
    cayoDiv.innerHTML = "<p>Sin registros</p>";
    extraDiv.innerHTML = "";
  }
}

// =====================
// 📊 TOTALES
// =====================
function actualizarTotales(lista) {

  let totalGeneral = 0;
  let totalExtras = 0;

  let millonesTotales = 0;
  let dineroMillones = 0;
  let millonesCornea = 0;
  let dineroCornea = 0;

  let totalEntregas = lista.length;
  let entregasCornea = 0;

  lista.forEach(e => {

    if (e.tipoRegistro === "cayo") {
      totalGeneral += e.ganancia;
      millonesTotales += e.millones;
      dineroMillones += e.ganancia;

      if (e.tipo === "grupal" && e.socio === "cornea") {
        millonesCornea += e.millones;
        dineroCornea += e.ganancia;
        entregasCornea++;
      }
    }

    if (e.tipoRegistro === "extra") {
      totalGeneral += e.monto;
      totalExtras += e.monto;
    }

  });

  document.getElementById("totalGeneral").innerText = totalGeneral.toFixed(2);
  document.getElementById("totalExtras").innerText = totalExtras.toFixed(2);

  document.getElementById("millonesTotales").innerText = millonesTotales;
  document.getElementById("millonesCornea").innerText = millonesCornea;

  document.getElementById("dineroMillones").innerText = "($" + dineroMillones.toFixed(2) + ")";
  document.getElementById("dineroCornea").innerText = "($" + dineroCornea.toFixed(2) + ")";

  document.getElementById("totalEntregas").innerText = totalEntregas;
  document.getElementById("entregasCornea").innerText = entregasCornea;
}

// =====================
// 🔍 FILTROS
// =====================
function aplicarFiltros() {

  let periodo = document.getElementById("filtroPeriodo").value;
  let tipoFiltro = document.getElementById("filtroTipo").value;

  let lista = [...entregas];

  // 🔹 TOTAL (no filtra fecha)
  if (periodo !== "total") {

    if (periodo === "mes") {
      let mes = document.getElementById("filtroMes").value;
      lista = lista.filter(e => e.fecha.substring(0,7) === mes);
    }

    if (periodo === "quincena") {
      let mes = document.getElementById("filtroMesQuincena").value;
      let q = document.getElementById("filtroNumeroQuincena").value;

      lista = lista.filter(e => {
        if (!e.fecha.startsWith(mes)) return false;
        let d = new Date(e.fecha).getDate();
        return q === "1" ? d <= 15 : d >= 16;
      });
    }

    if (periodo === "personalizado") {
      let i = document.getElementById("fechaInicio").value;
      let f = document.getElementById("fechaFin").value;

      lista = lista.filter(e => {
        let fecha = e.fecha.substring(0,10);
        return fecha >= i && fecha <= f;
      });
    }
  }

  // 🔹 Tipo (solo cayo)
  if (tipoFiltro !== "total") {
    lista = lista.filter(e => {
      if (e.tipoRegistro === "extra") return true;
      return e.tipo === tipoFiltro;
    });
  }

  mostrarHistorial(lista);
  actualizarTotales(lista);
}

// =====================
// ACTUALIZAR FILTRO POR PERIODO
// =====================
function actualizarFiltroPeriodo() {

  let periodo = document.getElementById("filtroPeriodo").value;

  document.getElementById("contenedorMes").style.display = "none";
  document.getElementById("contenedorQuincena").style.display = "none";
  document.getElementById("contenedorPersonalizado").style.display = "none";

  if (periodo === "mes") {
    document.getElementById("contenedorMes").style.display = "block";
  }

  if (periodo === "quincena") {
    document.getElementById("contenedorQuincena").style.display = "block";
  }

  if (periodo === "personalizado") {
    document.getElementById("contenedorPersonalizado").style.display = "block";
  }

}

// =====================
// ACTUALIZAR VISIBILIDAD DE SOCIO
// =====================
function actualizarVisibilidadSocio() {

  let tipo = document.getElementById("tipo").value;
  let contenedor = document.getElementById("contenedorSocio");

  if (tipo === "grupal") {
    contenedor.style.display = "block";
  } else {
    contenedor.style.display = "none";
  }

}

// =====================
// 🔄 RESET
// =====================
function resetFiltros() {
  mostrarQuincenaActual();
}

// =====================
// 📅 QUINCENA ACTUAL
// =====================
function mostrarQuincenaActual() {

  let hoy = new Date();
  let dia = hoy.getDate();
  let mes = hoy.toISOString().substring(0,7);

  let lista = entregas.filter(e => {
    if (!e.fecha.startsWith(mes)) return false;
    let d = new Date(e.fecha).getDate();
    return dia <= 15 ? d <= 15 : d >= 16;
  });

  mostrarHistorial(lista);
  actualizarTotales(lista);
}

// =====================
// 🗑 ELIMINAR
// =====================
function eliminarEntrega(index) {
  entregas.splice(index,1);
  localStorage.setItem("entregas", JSON.stringify(entregas));
  mostrarTodo();
}

// =====================
// 🔄 REFRESCO GENERAL
// =====================
function mostrarTodo() {
  mostrarQuincenaActual();
}

// =====================
// ⚙ INIT
// =====================
window.onload = function() {

  document.getElementById("tipo").addEventListener("change", actualizarVisibilidadSocio);
  document.getElementById("filtroPeriodo").addEventListener("change", actualizarFiltroPeriodo);

  actualizarVisibilidadSocio();
  actualizarFiltroPeriodo();

  mostrarQuincenaActual();
};
