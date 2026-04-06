import { Header } from "./Header.jsx";

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-6">{children}</main>
    </div>
  );
}

export default Layout;
