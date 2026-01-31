import { BrowserRouter } from "react-router-dom";
import AdminApp from "./admin/AdminApp";

export default function App() {
  return (
    <BrowserRouter>
      <AdminApp />
    </BrowserRouter>
  );
}
