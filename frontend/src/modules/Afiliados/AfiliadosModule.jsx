// Este archivo ahora es una cáscara de ~10 líneas efectivas.
// Todo el peso se trasladó a:
//   pages/AfiliadosPage.jsx      — lista principal
//   pages/DetalleAfiliadoPage.jsx — detalle / vista individual
//   pages/EditarAfiliadoPage.jsx  — formulario de edición
//
// El enrutamiento entre páginas lo hace React Router (rutas definidas
// en NavegacionModule) — este componente solo monta la page de lista.
// Si el proyecto migra a rutas anidadas este archivo puede eliminarse.

import AfiliadosPage from './pages/AfiliadosPage';

const AfiliadosModule = () => <AfiliadosPage />;

export default AfiliadosModule;