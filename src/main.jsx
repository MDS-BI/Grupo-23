import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import {
  cargarDemoPeluches,
  hayRegistrosManufactura,
} from './modules/manufactura/demo-peluches.js';
import './styles.css';

if (!hayRegistrosManufactura()) cargarDemoPeluches();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
