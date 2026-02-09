export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-white/95">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-gray-600">
        <p>© {year} EasyCase. All rights reserved.</p>
      </div>
    </footer>
  );
}
