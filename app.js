let entregas = JSON.parse(localStorage.getItem("entregas")) || [];

function calcular() {

  let millones = parseInt(document.getElementById("millones").value);

  if (isNaN(millones) || millones <= 0) {
    alert("Ingresa una cantidad válida de millones (número entero mayor a 0)");
    return;
  }

  let tipo = document.getElementById("tipo").value;

  let socio = "";

if (tipo === "grupal") {
  socio = document.getElementById("socio").value;
}

  let precioPorMillon = 20;
  let total = millones * precioPorMillon;

  let descuento = 0;

  if (millones >= 20 && millones <= 49) {
    descuento = 0.10;
  } else if (millones >= 50 && millones <= 99) {
    descuento = 0.15;
  } else if (millones >= 100) {
    descuento = 0.20;
  }

  if (tipo === "grupal") {
    total = total - (total * descuento);
    total = total / 3;
  }

  if (tipo === "solitario") {
    total = total / 2;
  }

  total = parseFloat(total.toFixed(2));

  let nuevaEntrega = {
    fecha: new Date().toISOString(),
    millones: millones,
    tipo: tipo,
    socio: socio,
    ganancia: total
  };

  entregas.push(nuevaEntrega);

  localStorage.setItem("entregas", JSON.stringify(entregas));

  document.getElementById("resultado").innerText = "Tu ganancia: $" + total.toFixed(2);

  mostrarHistorial();
  actualizarTotales();
}

function mostrarHistorial() {

  let contenedor = document.getElementById("historial");
  contenedor.innerHTML = "";

  entregas.forEach((entrega, index) => {

    contenedor.innerHTML += `
      <div style="margin-bottom:10px; border:1px solid #ccc; padding:5px;">
        ${entrega.fecha} | 
        ${entrega.millones}M | 
        ${entrega.tipo} | 
        ${entrega.socio} | 
        $${entrega.ganancia}
        <button onclick="eliminarEntrega(${index})">Eliminar</button>
      </div>
    `;

  });
}

function actualizarTotales() {

  let totalGeneral = 0;
  let totalCornea = 0;

  let millonesTotales = 0;
  let millonesCornea = 0;

  let totalEntregas = entregas.length;
  let entregasCornea = 0;

  entregas.forEach(entrega => {

    totalGeneral += entrega.ganancia;
    millonesTotales += entrega.millones;

    if (entrega.tipo === "grupal" && entrega.socio === "cornea") {
      totalCornea += entrega.ganancia;
      millonesCornea += entrega.millones;
      entregasCornea++;
    }

  });

  document.getElementById("totalGeneral").innerText = totalGeneral.toFixed(2);
  document.getElementById("totalCornea").innerText = totalCornea.toFixed(2);

  document.getElementById("millonesTotales").innerText = millonesTotales;
  document.getElementById("millonesCornea").innerText = millonesCornea;

  document.getElementById("totalEntregas").innerText = totalEntregas;
  document.getElementById("entregasCornea").innerText = entregasCornea;
}
function limpiarTodo() {
  if (confirm("¿Seguro que quieres borrar todo el historial?")) {
    localStorage.removeItem("entregas");
    entregas = [];
    mostrarHistorial();
    actualizarTotales();
  }
}

function eliminarEntrega(index) {
  entregas.splice(index, 1);
  localStorage.setItem("entregas", JSON.stringify(entregas));
  mostrarHistorial();
  actualizarTotales();
}

function actualizarVisibilidadSocio() {

  let tipo = document.getElementById("tipo").value;
  let contenedor = document.getElementById("contenedorSocio");

  if (tipo === "grupal") {
    contenedor.style.display = "block";
  } else {
    contenedor.style.display = "none";
  }

}

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

function aplicarFiltros() {

  let periodo = document.getElementById("filtroPeriodo").value;
  let tipoFiltro = document.getElementById("filtroTipo").value;

  let entregasFiltradas = [...entregas];

  // 🔹 FILTRO POR PERIODO

  if (periodo === "mes") {

  let mesSeleccionado = document.getElementById("filtroMes").value;

  if (mesSeleccionado !== "") {
    entregasFiltradas = entregasFiltradas.filter(entrega => {
      return entrega.fecha.substring(0, 7) === mesSeleccionado;
    });
  } else {
    entregasFiltradas = [];
  }

}

  if (periodo === "quincena") {

    let mesSeleccionado = document.getElementById("filtroMesQuincena").value;
    let numeroQuincena = document.getElementById("filtroNumeroQuincena").value;

    entregasFiltradas = entregasFiltradas.filter(entrega => {

      if (!entrega.fecha.startsWith(mesSeleccionado)) return false;

      let dia = new Date(entrega.fecha).getDate();

      if (numeroQuincena === "1") {
        return dia >= 1 && dia <= 15;
      } else {
        return dia >= 16;
      }

    });

  }

  if (periodo === "personalizado") {

    let inicio = document.getElementById("fechaInicio").value;
    let fin = document.getElementById("fechaFin").value;

    entregasFiltradas = entregasFiltradas.filter(entrega => {
      let fechaEntrega = entrega.fecha.substring(0, 10);
      return fechaEntrega >= inicio && fechaEntrega <= fin;
    });

  }

  // 🔹 FILTRO POR TIPO

  if (tipoFiltro !== "total") {
    entregasFiltradas = entregasFiltradas.filter(entrega => {
      return entrega.tipo === tipoFiltro;
    });
  }

  mostrarHistorialFiltrado(entregasFiltradas);
  actualizarTotalesFiltrados(entregasFiltradas);
}

function mostrarHistorialFiltrado(lista) {

  let contenedor = document.getElementById("historial");
  contenedor.innerHTML = "";

  lista.forEach((entrega) => {

    let indexReal = entregas.findIndex(e => 
      e.fecha === entrega.fecha &&
      e.millones === entrega.millones &&
      e.ganancia === entrega.ganancia
    );

    contenedor.innerHTML += `
      <div style="margin-bottom:10px; border:1px solid #ccc; padding:5px;">
        ${entrega.fecha} | 
        ${entrega.millones}M | 
        ${entrega.tipo} | 
        ${entrega.socio || ""} | 
        $${entrega.ganancia}
        <button onclick="eliminarEntrega(${indexReal})">Eliminar</button>
      </div>
    `;

  });

  if (lista.length === 0) {
    contenedor.innerHTML = "<p>No hay registros en este periodo.</p>";
  }
}

function actualizarTotalesFiltrados(lista) {

  let totalGeneral = 0;
  let totalCornea = 0;

  let millonesTotales = 0;
  let millonesCornea = 0;

  let totalEntregas = lista.length;
  let entregasCornea = 0;

  lista.forEach(entrega => {

    totalGeneral += entrega.ganancia;
    millonesTotales += entrega.millones;

    if (entrega.tipo === "grupal" && entrega.socio === "cornea") {
      totalCornea += entrega.ganancia;
      millonesCornea += entrega.millones;
      entregasCornea++;
    }

  });

  document.getElementById("totalGeneral").innerText = totalGeneral.toFixed(2);
  document.getElementById("totalCornea").innerText = totalCornea.toFixed(2);

  document.getElementById("millonesTotales").innerText = millonesTotales;
  document.getElementById("millonesCornea").innerText = millonesCornea;

  document.getElementById("totalEntregas").innerText = totalEntregas;
  document.getElementById("entregasCornea").innerText = entregasCornea;
}
function resetFiltros() {
  mostrarHistorial();
  actualizarTotales();
}

window.onload = function() {
  mostrarHistorial();
  actualizarTotales();
  actualizarVisibilidadSocio();
  actualizarFiltroPeriodo();

  document.getElementById("tipo").addEventListener("change", actualizarVisibilidadSocio);
  document.getElementById("filtroPeriodo").addEventListener("change", actualizarFiltroPeriodo);

};