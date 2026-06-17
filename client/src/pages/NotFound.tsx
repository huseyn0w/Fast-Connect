import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/Button";

export function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center px-4 text-center">
      <div className="animate-fade-up">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-aurora-soft">Error 404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
          This room drifted into deep space
        </h1>
        <p className="mx-auto mt-4 max-w-md text-slate-400">
          The page you are looking for does not exist or the conference has ended.
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button size="lg">Back to home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
