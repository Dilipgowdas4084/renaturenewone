import Navbar from './Navbar';
import Footer from './Footer';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-stone-200">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}
