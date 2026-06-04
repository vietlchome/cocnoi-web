import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import FloatingActions from "@/components/store/FloatingActions";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <CartDrawer />
      <FloatingActions />
      <Footer />
    </>
  );
}

