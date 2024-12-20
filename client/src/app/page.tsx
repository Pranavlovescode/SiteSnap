import LoginForm from "@/pages/Login";


export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-[url('https://images.unsplash.com/photo-1497294815431-9365093b7331?q=80&w=2070')] bg-cover bg-center">
        <div className="min-h-screen bg-black/30 flex items-center justify-center p-4">
          <LoginForm />
        </div>
      </main>
    </>
  );
}
