// import { Outlet } from 'react-router-dom';
// import Navbar from './Navbar';
// import Sidebar from './Sidebar';

// function Layout() {
//   return (
//     <div className="app-layout">
//       <Navbar />

//       <div className="app-body">
//         <Sidebar />

//         <main className="content-area">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

// export default Layout;

import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <Navbar />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
