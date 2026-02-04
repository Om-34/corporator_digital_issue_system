import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div style={{ padding: 20 }}>{children}</div>
    </>
  );
};

export default Layout;
