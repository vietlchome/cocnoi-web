import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Cửa hàng đối tác - Cốc Nối",
};

export default async function StockistsPage() {
  const stockists = await prisma.stockist.findMany({
    where: { isActive: true },
    orderBy: [{ city: "asc" }, { sortOrder: "asc" }],
  });

  if (stockists.length === 0) {
    return (
      <main className="w-full bg-canvas py-20 font-bvp text-primary">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="font-playfair text-4xl md:text-5xl mb-6">Cửa hàng đối tác</h1>
          <p className="text-secondary mb-8 leading-relaxed">
            Chúng tôi sẽ sớm hợp tác với các cửa hàng đối tác trên toàn quốc.
            Liên hệ để trở thành đối tác phân phối Cốc Nối.
          </p>
          <Link
            href="/partners/become-a-stockist"
            className="inline-flex items-center gap-2 font-bvp font-bold text-xs uppercase tracking-widest text-canvas px-6 py-3 rounded-pill"
            style={{ backgroundColor: "var(--color-terracotta)" }}
          >
            Trở thành đối tác
          </Link>
        </div>
      </main>
    );
  }

  const byCity = (stockists || []).reduce((acc: Record<string, any[]>, s: any) => {
    if (!acc[s.city]) acc[s.city] = [];
    acc[s.city].push(s);
    return acc;
  }, {});

  return (
    <main className="w-full bg-canvas py-20 font-bvp text-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h1 className="font-playfair text-4xl md:text-5xl mb-12">Cửa hàng đối tác</h1>
        {Object.entries(byCity).map(([city, list]) => (
          <section key={city} className="mb-14">
            <h2 className="font-playfair text-2xl mb-6" style={{ color: "var(--color-terracotta)" }}>{city}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(list as any[]).map((s: any) => (
                <article key={s.id} className="border border-border rounded-xl p-6 bg-white">
                  {s.imageUrl && (
                    <div className="relative aspect-[4/3] mb-4 rounded-lg overflow-hidden">
                      <Image src={s.imageUrl} alt={s.name} fill className="object-cover" />
                    </div>
                  )}
                  <h3 className="font-playfair text-lg font-bold">{s.name}</h3>
                  <p className="text-secondary text-sm mt-2">{s.address}</p>
                  {s.phone && <p className="text-sm mt-1">{s.phone}</p>}
                  {s.hours && <p className="text-sm text-secondary/70 mt-1">{s.hours}</p>}
                  {s.mapUrl && (
                    <a
                      href={s.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold mt-3 inline-block"
                      style={{ color: "var(--color-terracotta)" }}
                    >
                      Xem bản đồ →
                    </a>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
