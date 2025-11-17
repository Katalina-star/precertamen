import { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

export const exportarPDF = (titulo, datos) => {
  const doc = new jsPDF();
  doc.text(titulo, 10, 10);
  autoTable(doc, { startY: 20, head: [Object.keys(datos[0])], body: datos.map((item) => Object.values(item)) });
  doc.save(`${titulo}.pdf`);
};

export const exportarExcel = (titulo, datos) => {
  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, `${titulo}.xlsx`);
};

export const exportarPNG = (titulo, idTabla) => {
  const tabla = document.getElementById(idTabla);
  html2canvas(tabla).then((canvas) => {
    const link = document.createElement("a");
    link.download = `${titulo}.png`;
    link.href = canvas.toDataURL();
    link.click();
  });
};


function App() {
  const [regalos, setRegalos] = useState([]);
  const [comida, setComida] = useState([]);
  const [adornos, setAdornos] = useState([]);

  const cargarRegalos = async () => {
    const snapshot = await getDocs(collection(db, "regalos"));
    const data = snapshot.docs.map((doc) => doc.data());
    data.sort((a, b) => a.prioridad - b.prioridad);
    setRegalos(data);
  };

  const cargarComida = async () => {
    const snapshot = await getDocs(collection(db, "comida"));
    const data = snapshot.docs.map((doc) => doc.data());
    data.sort((a, b) => {
      if (a.congelado === b.congelado) return 0;
      return a.congelado ? -1 : 1;
    });
    setComida(data);
  };

  const cargarAdornos = async () => {
    const snapshot = await getDocs(collection(db, "adornos"));
    const data = snapshot.docs.map((doc) => doc.data());
    data.sort((a, b) => a.cantidad - b.cantidad);
    setAdornos(data);
  };

  useEffect(() => {
    cargarRegalos();
    cargarComida();
    cargarAdornos();
  }, []);

  return (
    <div className="App" style={{ textAlign: "center" }}>
      <h1 className="titulo-principal"> Navidad 🎄</h1>

      <Tabla titulo="Regalos" datos={regalos} id="tablaRegalos" />
      <Tabla titulo="Comida" datos={comida} id="tablaComida" />
      <Tabla titulo="Adornos" datos={adornos} id="tablaAdornos" />
    </div>
  );
}

function Tabla({ titulo, datos, id }) {
  if (datos.length === 0) return <p>Cargando {titulo}...</p>;

  const nombresBonitos = { nombre_regalo: "Regalo", nombre_familiar: "Familiar", nivel_prioridad: "Prioridad", 
    nombre_comida: "Comida", congelado: "¿Congelado?",
    nombre_adorno: "Adorno", cantidad: "Cantidad" };

  let columnas = Object.keys(datos[0]);

  if (titulo === "Regalos") columnas = ["nombre_regalo", "nombre_familiar", "nivel_prioridad"];
  if (titulo === "Comida") columnas = ["nombre_comida", "congelado"];
  if (titulo === "Adornos") columnas = ["nombre_adorno", "cantidad"];

  return (
    <div className="tabla-container" style={{ marginBottom: "40px", paddingBottom: "20px" }} >
      <h2>{titulo}</h2>

      <div className="botones">
        <button onClick={() => exportarPDF(titulo, datos)}>PDF</button>
        <button onClick={() => exportarExcel(titulo, datos)}>Excel</button>
        <button onClick={() => exportarPNG(titulo, id)}>PNG</button>
      </div>

      <table id={id} className="tabla" style={{ margin: "0 auto", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col}>{nombresBonitos[col] || col}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {datos.map((item, index) => (
            <tr key={index}>
              {columnas.map((col) => (
                <td key={col}>{item[col]?.toString()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
